import type {
  AdvantageRule,
  AppliedAdvantage,
  Competition,
  CompetitionBranding,
  CompetitionFormat,
  CompetitionRules,
  Match,
  PreseasonConfig,
  ScheduleConfig,
  SportDefinition,
  StandingRow,
  Team,
} from '../../types';
import { createUuid } from '../prng';
import { BUILT_IN_SPORTS } from '../sports/builtInSports';
import {
  accumulatePlayerMatchStats,
  evaluateMatchModifiers,
  evaluatePostMatchAdvantages,
  evaluatePreseasonCarryover,
  simulateSportScore,
} from './advantageEngine';
import { DEFAULT_PRESEASON_CONFIG, generatePreseasonMatches } from './preseasonEngine';
import {
  applyTeamBreakWeeks,
  assignMatchDates,
  DEFAULT_COMPETITION_BRANDING,
  DEFAULT_COMPETITION_RULES,
  DEFAULT_SCHEDULE_CONFIG,
} from './scheduler';

/**
 * Generates a complete round-robin schedule using the circle algorithm
 * for ANY team count >= 3 (odd counts automatically use a rotating BYE).
 */
export function generateRoundRobinMatches(
  teams: Team[],
  doubleRoundRobin = false,
  bracket: Match['bracket'] = 'league',
  groupName?: string
): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  const ids = teams.map((t) => t.id);
  if (ids.length % 2 !== 0) {
    ids.push('__BYE__');
  }

  const total = ids.length;
  const roundsPerLeg = total - 1;
  const half = total / 2;
  const matches: Match[] = [];

  const rotating = ids.slice(1);
  const fixed = ids[0];
  const legs = doubleRoundRobin ? 2 : 1;

  for (let leg = 0; leg < legs; leg++) {
    const current = [...rotating];

    for (let r = 0; r < roundsPerLeg; r++) {
      const roundNumber = leg * roundsPerLeg + r + 1;
      const roundName = groupName
        ? `${groupName} · MD ${roundNumber}`
        : `Matchday ${roundNumber}`;
      const roundIds = [fixed, ...current];

      for (let i = 0; i < half; i++) {
        const a = roundIds[i];
        const b = roundIds[total - 1 - i];
        if (a === '__BYE__' || b === '__BYE__') continue;

        const swapHome = (r + i + leg) % 2 === 1;
        const homeTeamId = swapHome ? b : a;
        const awayTeamId = swapHome ? a : b;

        matches.push({
          id: createUuid(),
          round: roundNumber,
          roundName,
          slotIndex: i,
          bracket,
          groupName,
          homeTeamId,
          awayTeamId,
          homeScore: null,
          awayScore: null,
          penaltyWinnerId: null,
          played: false,
          winnerId: null,
        });
      }

      const last = current.pop()!;
      current.unshift(last);
    }
  }

  return matches;
}

export function createLeague(
  name: string,
  teams: Team[],
  format: Extract<CompetitionFormat, 'single-rr' | 'double-rr'> = 'single-rr',
  rules: CompetitionRules = DEFAULT_COMPETITION_RULES,
  schedule: ScheduleConfig = DEFAULT_SCHEDULE_CONFIG,
  branding: CompetitionBranding = DEFAULT_COMPETITION_BRANDING,
  sportId = 'soccer',
  preseason: PreseasonConfig = DEFAULT_PRESEASON_CONFIG,
  advantageRules: AdvantageRule[] = []
): Competition {
  const now = new Date().toISOString();
  const doubleRoundRobin = format === 'double-rr';
  const preMatches = generatePreseasonMatches(teams, preseason, schedule.startDate);
  const rawMain = generateRoundRobinMatches(teams, doubleRoundRobin, 'league');
  const { matches: breakAdjusted, resolvedBreakWeeks } = applyTeamBreakWeeks(
    teams,
    [...preMatches, ...rawMain],
    schedule.breakWeeks
  );
  const { matches, computedEndDate } = assignMatchDates(
    breakAdjusted,
    schedule
  );

  return {
    id: createUuid(),
    name: name.trim() || 'Forge Premier League',
    sportId,
    type: 'league',
    format,
    size: teams.length,
    doubleRoundRobin,
    rules,
    schedule: {
      ...schedule,
      endDate: schedule.endDateMode === 'auto' ? computedEndDate : schedule.endDate,
    },
    branding,
    preseason,
    advantageRules,
    appliedAdvantages: [],
    preseasonProcessed: false,
    preseasonPlayerStats: {},
    regularPlayerStats: {},
    resolvedBreakWeeks,
    teams,
    matches,
    championId: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Simulates a league/group/preseason match score using sport scoring events & advantage rules.
 */
export function simulateLeagueScore(
  homeTeam: Team,
  awayTeam: Team,
  homeFieldAdvantage = true,
  sport: SportDefinition = BUILT_IN_SPORTS[0],
  competition?: Competition,
  match?: Match
): {
  homeScore: number;
  awayScore: number;
  isOvertime: boolean;
  resolutionNote: string | null;
  scoringSummary: string[];
  preApplied: AppliedAdvantage[];
} {
  const mods =
    competition && match
      ? evaluateMatchModifiers(competition, match, homeTeam, awayTeam)
      : {
          homeRatingMultiplier: 1,
          awayRatingMultiplier: 1,
          homePostScoreMultiplier: 1,
          awayPostScoreMultiplier: 1,
          homeFlatScoreBonus: 0,
          awayFlatScoreBonus: 0,
          preApplied: [],
        };

  const sim = simulateSportScore(
    homeTeam,
    awayTeam,
    sport,
    homeFieldAdvantage,
    mods.homeRatingMultiplier,
    mods.awayRatingMultiplier
  );
  const scoringSummary = sim.scoringSummary;
  let homeScore = Math.round(sim.homeScore * mods.homePostScoreMultiplier) + mods.homeFlatScoreBonus;
  let awayScore = Math.round(sim.awayScore * mods.awayPostScoreMultiplier) + mods.awayFlatScoreBonus;

  let isOvertime = false;
  let resolutionNote: string | null = null;
  const drawsAllowed =
    competition?.rules?.overtimeRule === 'draws-allowed'
      ? true
      : sport.defaultRules.drawsAllowed &&
        competition?.rules?.overtimeRule !== 'overtime-periods';

  if (homeScore === awayScore && !drawsAllowed) {
    isOvertime = true;
    const homeBias = 0.5 + Math.max(-0.12, Math.min(0.12, (homeTeam.overallRating - awayTeam.overallRating) / 100));
    const bump = sport.scoringEvents[0]?.points ?? 1;
    if (Math.random() < homeBias) {
      homeScore += bump;
    } else {
      awayScore += bump;
    }
    resolutionNote = 'OT';
  }

  return {
    homeScore,
    awayScore,
    isOvertime,
    resolutionNote,
    scoringSummary,
    preApplied: mods.preApplied,
  };
}

function computeHeadToHeadPoints(
  teamA: string,
  teamB: string,
  playedMatches: Match[],
  rules: CompetitionRules
): { ptsA: number; ptsB: number; gdA: number; gdB: number } {
  let ptsA = 0;
  let ptsB = 0;
  let gdA = 0;
  let gdB = 0;

  for (const m of playedMatches) {
    if (
      (m.homeTeamId === teamA && m.awayTeamId === teamB) ||
      (m.homeTeamId === teamB && m.awayTeamId === teamA)
    ) {
      const hs = m.homeScore!;
      const as = m.awayScore!;
      const aIsHome = m.homeTeamId === teamA;
      const aGoals = aIsHome ? hs : as;
      const bGoals = aIsHome ? as : hs;
      gdA += aGoals - bGoals;
      gdB += bGoals - aGoals;
      if (aGoals > bGoals) {
        ptsA += m.isOvertime ? rules.pointsOtWin : rules.pointsWin;
        ptsB += m.isOvertime ? rules.pointsOtLoss : rules.pointsLoss;
      } else if (bGoals > aGoals) {
        ptsB += m.isOvertime ? rules.pointsOtWin : rules.pointsWin;
        ptsA += m.isOvertime ? rules.pointsOtLoss : rules.pointsLoss;
      } else {
        ptsA += rules.pointsDraw;
        ptsB += rules.pointsDraw;
      }
    }
  }
  return { ptsA, ptsB, gdA, gdB };
}

/**
 * Computes standings separately for either regular/group season or preseason,
 * incorporating custom WinnerCriterion, OT Win/Loss points, and Advantage modifiers.
 */
export function computeStandings(
  teams: Team[],
  matches: Match[],
  rules: CompetitionRules = DEFAULT_COMPETITION_RULES,
  appliedAdvantages: AppliedAdvantage[] = [],
  phase: 'regular' | 'preseason' = 'regular',
  advantageRules: AdvantageRule[] = []
): StandingRow[] {
  const map = new Map<string, StandingRow>();
  for (const team of teams) {
    map.set(team.id, {
      teamId: team.id,
      played: 0,
      won: 0,
      otWon: 0,
      drawn: 0,
      otLost: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      winPct: 0,
      points: 0,
      bonusPoints: 0,
      bonusWins: 0,
      activeAdvantages: [],
      form: [],
    });
  }

  const playedMatches = matches
    .filter(
      (m) =>
        m.played &&
        !m.isBye &&
        (phase === 'preseason' ? m.bracket === 'preseason' : m.bracket !== 'preseason') &&
        m.homeTeamId &&
        m.awayTeamId &&
        m.homeScore !== null &&
        m.awayScore !== null
    )
    .sort((a, b) => a.round - b.round);

  for (const m of playedMatches) {
    const home = map.get(m.homeTeamId!);
    const away = map.get(m.awayTeamId!);
    if (!home || !away) continue;

    const hs = m.homeScore!;
    const as = m.awayScore!;
    const isOt = Boolean(m.isOvertime);

    home.played += 1;
    away.played += 1;
    home.gf += hs;
    home.ga += as;
    away.gf += as;
    away.ga += hs;

    if (hs > as) {
      if (isOt) {
        home.otWon += 1;
        away.otLost += 1;
        home.points += rules.pointsOtWin ?? rules.pointsWin;
        away.points += rules.pointsOtLoss ?? rules.pointsLoss;
      } else {
        home.won += 1;
        away.lost += 1;
        home.points += rules.pointsWin;
        away.points += rules.pointsLoss;
      }
      home.form.push('W');
      away.form.push('L');
    } else if (as > hs) {
      if (isOt) {
        away.otWon += 1;
        home.otLost += 1;
        away.points += rules.pointsOtWin ?? rules.pointsWin;
        home.points += rules.pointsOtLoss ?? rules.pointsLoss;
      } else {
        away.won += 1;
        home.lost += 1;
        away.points += rules.pointsWin;
        home.points += rules.pointsLoss;
      }
      home.form.push('L');
      away.form.push('W');
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += rules.pointsDraw;
      away.points += rules.pointsDraw;
      home.form.push('D');
      away.form.push('D');
    }
  }

  // Apply bonus points / bonus wins from active advantages in regular season
  if (phase === 'regular') {
    const ruleMap = new Map(advantageRules.map((r) => [r.id, r]));
    const allAdv = [
      ...appliedAdvantages,
      ...playedMatches.flatMap((m) => m.appliedAdvantages ?? []),
    ];
    for (const adv of allAdv) {
      const row = map.get(adv.teamId);
      if (!row) continue;
      if (!row.activeAdvantages.includes(adv.detail)) {
        row.activeAdvantages.push(adv.detail);
      }
      const rule = ruleMap.get(adv.ruleId);
      if (!rule) continue;
      if (rule.reward === 'bonus-standings-points') {
        row.bonusPoints += rule.rewardValue;
        row.points += rule.rewardValue;
      } else if (rule.reward === 'bonus-win') {
        row.bonusWins += rule.rewardValue;
        row.won += rule.rewardValue;
        row.points += rule.rewardValue * rules.pointsWin;
      }
    }
  }

  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]));

  const rows = Array.from(map.values()).map((r) => {
    const totalWins = r.won + r.otWon;
    const totalGames = r.played + r.bonusWins;
    return {
      ...r,
      gd: r.gf - r.ga,
      winPct: totalGames > 0 ? (totalWins + r.drawn * 0.5) / totalGames : 0,
      form: r.form.slice(-5),
    };
  });

  const winnerCriterion = rules.winnerCriterion ?? 'standings-points';

  rows.sort((a, b) => {
    if (winnerCriterion === 'win-pct') {
      if (Math.abs(b.winPct - a.winPct) > 0.0001) return b.winPct - a.winPct;
    } else if (winnerCriterion === 'goal-diff') {
      if (b.gd !== a.gd) return b.gd - a.gd;
    } else if (winnerCriterion === 'goals-for') {
      if (b.gf !== a.gf) return b.gf - a.gf;
    } else if (winnerCriterion === 'head-to-head') {
      const h2h = computeHeadToHeadPoints(a.teamId, b.teamId, playedMatches, rules);
      if (h2h.ptsB !== h2h.ptsA) return h2h.ptsB - h2h.ptsA;
    } else {
      if (b.points !== a.points) return b.points - a.points;
    }

    if (b.points !== a.points) return b.points - a.points;

    for (const criterion of rules.tiebreakers) {
      if (criterion === 'goal-diff') {
        if (b.gd !== a.gd) return b.gd - a.gd;
      } else if (criterion === 'goals-for') {
        if (b.gf !== a.gf) return b.gf - a.gf;
      } else if (criterion === 'win-pct') {
        if (Math.abs(b.winPct - a.winPct) > 0.0001) return b.winPct - a.winPct;
      } else if (criterion === 'head-to-head') {
        const h2h = computeHeadToHeadPoints(a.teamId, b.teamId, playedMatches, rules);
        if (h2h.ptsB !== h2h.ptsA) return h2h.ptsB - h2h.ptsA;
        if (h2h.gdB !== h2h.gdA) return h2h.gdB - h2h.gdA;
      }
    }

    return (teamNameMap.get(a.teamId) ?? '').localeCompare(teamNameMap.get(b.teamId) ?? '');
  });

  return rows;
}

export function applyLeagueMatchResult(
  competition: Competition,
  matchId: string,
  homeScore: number,
  awayScore: number,
  sport: SportDefinition = BUILT_IN_SPORTS[0],
  meta: {
    isOvertime?: boolean;
    resolutionNote?: string | null;
    scoringSummary?: string[];
    preApplied?: AppliedAdvantage[];
  } = {}
): Competition {
  const targetMatch = competition.matches.find((m) => m.id === matchId);
  if (!targetMatch) return competition;

  const postApplied = evaluatePostMatchAdvantages(
    competition,
    targetMatch,
    homeScore,
    awayScore
  );
  const combinedMatchAdv = [...(meta.preApplied ?? []), ...postApplied];

  const matches = competition.matches.map((m) => {
    if (m.id !== matchId) return m;
    const winnerId =
      homeScore > awayScore
        ? m.homeTeamId
        : awayScore > homeScore
          ? m.awayTeamId
          : null;
    return {
      ...m,
      homeScore,
      awayScore,
      isOvertime: meta.isOvertime ?? m.isOvertime ?? false,
      resolutionNote: meta.resolutionNote ?? m.resolutionNote ?? null,
      scoringSummary: meta.scoringSummary ?? m.scoringSummary,
      appliedAdvantages:
        combinedMatchAdv.length > 0 ? combinedMatchAdv : m.appliedAdvantages,
      played: true,
      winnerId,
    };
  });

  // Update player stats (separated for preseason vs regular season)
  let preseasonPlayerStats = competition.preseasonPlayerStats;
  let regularPlayerStats = competition.regularPlayerStats;
  const homeTeam = competition.teams.find((t) => t.id === targetMatch.homeTeamId);
  const awayTeam = competition.teams.find((t) => t.id === targetMatch.awayTeamId);
  if (homeTeam && awayTeam && !targetMatch.played) {
    const statUpdate = accumulatePlayerMatchStats(
      competition,
      sport,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      targetMatch.bracket === 'preseason'
    );
    preseasonPlayerStats = statUpdate.preseasonPlayerStats;
    regularPlayerStats = statUpdate.regularPlayerStats;
  }

  let updated: Competition = {
    ...competition,
    matches,
    preseasonPlayerStats,
    regularPlayerStats,
    updatedAt: new Date().toISOString(),
  };

  // Evaluate preseason carryover rules once all preseason matches finish
  const preMatches = matches.filter((m) => m.bracket === 'preseason');
  if (
    preMatches.length > 0 &&
    !updated.preseasonProcessed &&
    preMatches.every((m) => m.played)
  ) {
    const carryover = evaluatePreseasonCarryover(updated);
    updated = {
      ...updated,
      preseasonProcessed: true,
      appliedAdvantages: [...(updated.appliedAdvantages ?? []), ...carryover],
    };
  }

  const mainMatches = updated.matches.filter((m) => m.bracket !== 'preseason');
  const allMainPlayed = mainMatches.length > 0 && mainMatches.every((m) => m.played);
  const standings = computeStandings(
    updated.teams,
    updated.matches,
    updated.rules,
    updated.appliedAdvantages,
    'regular',
    updated.advantageRules
  );

  return {
    ...updated,
    championId:
      updated.type === 'league' && allMainPlayed && standings.length > 0
        ? standings[0].teamId
        : updated.championId,
  };
}
