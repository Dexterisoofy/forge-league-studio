import type {
  AdvantageRule,
  AppliedAdvantage,
  Competition,
  CompetitionBranding,
  CompetitionFormat,
  CompetitionGroup,
  CompetitionRules,
  CupRound,
  Match,
  PreseasonConfig,
  ScheduleConfig,
  SportDefinition,
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
import { computeStandings, generateRoundRobinMatches } from './leagueEngine';
import { DEFAULT_PRESEASON_CONFIG, generatePreseasonMatches } from './preseasonEngine';
import {
  assignMatchDates,
  DEFAULT_COMPETITION_BRANDING,
  DEFAULT_COMPETITION_RULES,
  DEFAULT_SCHEDULE_CONFIG,
} from './scheduler';

export function getCupRoundName(teamsInRound: number, prefix = ''): string {
  let base: string;
  switch (teamsInRound) {
    case 2:
      base = 'Final';
      break;
    case 4:
      base = 'Semifinals';
      break;
    case 8:
      base = 'Quarterfinals';
      break;
    case 16:
      base = 'Round of 16';
      break;
    case 32:
      base = 'Round of 32';
      break;
    case 64:
      base = 'Round of 64';
      break;
    default:
      base = `Round of ${teamsInRound}`;
  }
  return prefix ? `${prefix} ${base}` : base;
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function buildBracketSeedOrder(pow2: number): number[] {
  let order = [0, 1];
  while (order.length < pow2) {
    const nextSize = order.length * 2;
    const expanded: number[] = [];
    for (const s of order) {
      expanded.push(s, nextSize - 1 - s);
    }
    order = expanded;
  }
  return order;
}

function autoResolveByes(matches: Match[], deadSlots: Set<string>): void {
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of matches) {
      if (m.played || m.bracket === 'preseason') continue;

      const homeDead = deadSlots.has(`${m.id}:home`);
      const awayDead = deadSlots.has(`${m.id}:away`);

      if (homeDead && awayDead) {
        m.isBye = true;
        m.played = true;
        m.winnerId = null;
        if (m.nextMatchId && m.nextMatchSlot) {
          deadSlots.add(`${m.nextMatchId}:${m.nextMatchSlot}`);
        }
        if (m.loserNextMatchId && m.loserNextMatchSlot) {
          deadSlots.add(`${m.loserNextMatchId}:${m.loserNextMatchSlot}`);
        }
        changed = true;
        continue;
      }

      if (m.homeTeamId && awayDead) {
        m.isBye = true;
        m.played = true;
        m.winnerId = m.homeTeamId;
        if (m.nextMatchId && m.nextMatchSlot) {
          const next = matches.find((nm) => nm.id === m.nextMatchId);
          if (next) {
            if (m.nextMatchSlot === 'home') next.homeTeamId = m.homeTeamId;
            else next.awayTeamId = m.homeTeamId;
          }
        }
        if (m.loserNextMatchId && m.loserNextMatchSlot) {
          deadSlots.add(`${m.loserNextMatchId}:${m.loserNextMatchSlot}`);
        }
        changed = true;
      } else if (m.awayTeamId && homeDead) {
        m.isBye = true;
        m.played = true;
        m.winnerId = m.awayTeamId;
        if (m.nextMatchId && m.nextMatchSlot) {
          const next = matches.find((nm) => nm.id === m.nextMatchId);
          if (next) {
            if (m.nextMatchSlot === 'home') next.homeTeamId = m.awayTeamId;
            else next.awayTeamId = m.awayTeamId;
          }
        }
        if (m.loserNextMatchId && m.loserNextMatchSlot) {
          deadSlots.add(`${m.loserNextMatchId}:${m.loserNextMatchSlot}`);
        }
        changed = true;
      }
    }
  }
}

export function generateSingleElimMatches(
  teams: Team[],
  bracket: Match['bracket'] = 'knockout',
  prefix = ''
): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  const pow2 = nextPowerOf2(n);
  const totalRounds = Math.round(Math.log2(pow2));
  const seedOrder = buildBracketSeedOrder(pow2);
  const rounds: Match[][] = [];
  const deadSlots = new Set<string>();

  for (let r = 1; r <= totalRounds; r++) {
    const matchCount = pow2 / Math.pow(2, r);
    const teamsInRound = matchCount * 2;
    const roundName = getCupRoundName(teamsInRound, prefix);
    const roundMatches: Match[] = [];

    for (let i = 0; i < matchCount; i++) {
      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;
      const id = createUuid();

      if (r === 1) {
        const homeSeed = seedOrder[i * 2];
        const awaySeed = seedOrder[i * 2 + 1];
        homeTeamId = homeSeed < n ? teams[homeSeed].id : null;
        awayTeamId = awaySeed < n ? teams[awaySeed].id : null;
        if (!homeTeamId) deadSlots.add(`${id}:home`);
        if (!awayTeamId) deadSlots.add(`${id}:away`);
      }

      roundMatches.push({
        id,
        round: r,
        roundName,
        slotIndex: i,
        bracket,
        homeTeamId,
        awayTeamId,
        homeScore: null,
        awayScore: null,
        penaltyWinnerId: null,
        resolutionNote: null,
        played: false,
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
      });
    }
    rounds.push(roundMatches);
  }

  for (let r = 0; r < rounds.length - 1; r++) {
    const currentRound = rounds[r];
    const nextRound = rounds[r + 1];
    for (let i = 0; i < currentRound.length; i++) {
      const parent = nextRound[Math.floor(i / 2)];
      currentRound[i].nextMatchId = parent.id;
      currentRound[i].nextMatchSlot = i % 2 === 0 ? 'home' : 'away';
    }
  }

  const allMatches = rounds.flat();
  autoResolveByes(allMatches, deadSlots);
  return allMatches;
}

export function generateDoubleElimMatches(teams: Team[]): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  const pow2 = Math.max(4, nextPowerOf2(n));
  const wRoundsCount = Math.round(Math.log2(pow2));
  const seedOrder = buildBracketSeedOrder(pow2);
  const deadSlots = new Set<string>();

  const wRounds: Match[][] = [];
  for (let r = 1; r <= wRoundsCount; r++) {
    const count = pow2 / Math.pow(2, r);
    const roundName =
      r === wRoundsCount ? 'Winners Final' : getCupRoundName(count * 2, 'Winners');
    const roundMatches: Match[] = [];

    for (let i = 0; i < count; i++) {
      const id = createUuid();
      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;
      if (r === 1) {
        const hs = seedOrder[i * 2];
        const as = seedOrder[i * 2 + 1];
        homeTeamId = hs < n ? teams[hs].id : null;
        awayTeamId = as < n ? teams[as].id : null;
        if (!homeTeamId) deadSlots.add(`${id}:home`);
        if (!awayTeamId) deadSlots.add(`${id}:away`);
      }

      roundMatches.push({
        id,
        round: r,
        roundName,
        slotIndex: i,
        bracket: 'winners',
        homeTeamId,
        awayTeamId,
        homeScore: null,
        awayScore: null,
        penaltyWinnerId: null,
        resolutionNote: null,
        played: false,
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        loserNextMatchId: null,
        loserNextMatchSlot: null,
      });
    }
    wRounds.push(roundMatches);
  }

  for (let r = 0; r < wRounds.length - 1; r++) {
    for (let i = 0; i < wRounds[r].length; i++) {
      const parent = wRounds[r + 1][Math.floor(i / 2)];
      wRounds[r][i].nextMatchId = parent.id;
      wRounds[r][i].nextMatchSlot = i % 2 === 0 ? 'home' : 'away';
    }
  }

  const lRoundsCount = 2 * (wRoundsCount - 1);
  const lRounds: Match[][] = [];

  for (let lr = 1; lr <= lRoundsCount; lr++) {
    const step = Math.floor((lr - 1) / 2);
    const count = Math.max(1, pow2 / Math.pow(2, step + 2));
    const roundName = lr === lRoundsCount ? 'Losers Final' : `Losers Round ${lr}`;
    const roundMatches: Match[] = [];

    for (let i = 0; i < count; i++) {
      roundMatches.push({
        id: createUuid(),
        round: lr,
        roundName,
        slotIndex: i,
        bracket: 'losers',
        homeTeamId: null,
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        penaltyWinnerId: null,
        resolutionNote: null,
        played: false,
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
      });
    }
    lRounds.push(roundMatches);
  }

  for (let lr = 0; lr < lRounds.length - 1; lr++) {
    const curr = lRounds[lr];
    const next = lRounds[lr + 1];
    if (curr.length === next.length) {
      for (let i = 0; i < curr.length; i++) {
        curr[i].nextMatchId = next[i].id;
        curr[i].nextMatchSlot = 'home';
      }
    } else {
      for (let i = 0; i < curr.length; i++) {
        const parent = next[Math.floor(i / 2)];
        curr[i].nextMatchId = parent.id;
        curr[i].nextMatchSlot = i % 2 === 0 ? 'home' : 'away';
      }
    }
  }

  for (let i = 0; i < wRounds[0].length; i++) {
    const lrTarget = lRounds[0][Math.floor(i / 2)];
    wRounds[0][i].loserNextMatchId = lrTarget.id;
    wRounds[0][i].loserNextMatchSlot = i % 2 === 0 ? 'home' : 'away';
  }
  for (let r = 1; r < wRounds.length; r++) {
    const targetLr = lRounds[2 * r - 1];
    const wMatches = wRounds[r];
    for (let i = 0; i < wMatches.length; i++) {
      const targetIdx = wMatches.length - 1 - i;
      const lrMatch = targetLr[targetIdx] ?? targetLr[0];
      wMatches[i].loserNextMatchId = lrMatch.id;
      wMatches[i].loserNextMatchSlot = 'away';
    }
  }

  const grandFinal: Match = {
    id: createUuid(),
    round: wRoundsCount + 1,
    roundName: 'Grand Final',
    slotIndex: 0,
    bracket: 'grand-final',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    penaltyWinnerId: null,
    resolutionNote: null,
    played: false,
    winnerId: null,
    nextMatchId: null,
    nextMatchSlot: null,
  };

  const winnersFinal = wRounds[wRounds.length - 1][0];
  winnersFinal.nextMatchId = grandFinal.id;
  winnersFinal.nextMatchSlot = 'home';

  const losersFinal = lRounds[lRounds.length - 1][0];
  losersFinal.nextMatchId = grandFinal.id;
  losersFinal.nextMatchSlot = 'away';

  const allMatches = [...wRounds.flat(), ...lRounds.flat(), grandFinal];
  autoResolveByes(allMatches, deadSlots);
  return allMatches;
}

export function createCup(
  name: string,
  teams: Team[],
  format: Extract<CompetitionFormat, 'single-elim' | 'double-elim'> = 'single-elim',
  rules: CompetitionRules = DEFAULT_COMPETITION_RULES,
  schedule: ScheduleConfig = DEFAULT_SCHEDULE_CONFIG,
  branding: CompetitionBranding = DEFAULT_COMPETITION_BRANDING,
  sportId = 'soccer',
  preseason: PreseasonConfig = DEFAULT_PRESEASON_CONFIG,
  advantageRules: AdvantageRule[] = []
): Competition {
  const now = new Date().toISOString();
  const sorted = [...teams].sort((a, b) => b.overallRating - a.overallRating);

  const preMatches = generatePreseasonMatches(sorted, preseason, schedule.startDate);
  const rawMain =
    format === 'double-elim'
      ? generateDoubleElimMatches(sorted)
      : generateSingleElimMatches(sorted, 'knockout');

  const { matches, computedEndDate } = assignMatchDates(
    [...preMatches, ...rawMain],
    schedule
  );

  return {
    id: createUuid(),
    name: name.trim() || 'Forge Champions Cup',
    sportId,
    type: 'cup',
    format,
    size: teams.length,
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
    teams: sorted,
    matches,
    championId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createGroupKnockout(
  name: string,
  teams: Team[],
  groupCount = 2,
  rules: CompetitionRules = DEFAULT_COMPETITION_RULES,
  schedule: ScheduleConfig = DEFAULT_SCHEDULE_CONFIG,
  branding: CompetitionBranding = DEFAULT_COMPETITION_BRANDING,
  sportId = 'soccer',
  preseason: PreseasonConfig = DEFAULT_PRESEASON_CONFIG,
  advantageRules: AdvantageRule[] = []
): Competition {
  const now = new Date().toISOString();
  const safeGroupCount = Math.max(2, Math.min(Math.floor(teams.length / 2), groupCount));
  const sorted = [...teams].sort((a, b) => b.overallRating - a.overallRating);

  const groups: CompetitionGroup[] = Array.from({ length: safeGroupCount }, (_, idx) => ({
    name: `Group ${String.fromCharCode(65 + idx)}`,
    teamIds: [],
  }));

  sorted.forEach((team, idx) => {
    const cycle = Math.floor(idx / safeGroupCount);
    const pos = idx % safeGroupCount;
    const groupIdx = cycle % 2 === 0 ? pos : safeGroupCount - 1 - pos;
    groups[groupIdx].teamIds.push(team.id);
  });

  const teamMap = new Map(sorted.map((t) => [t.id, t]));
  const groupMatches: Match[] = [];

  for (const grp of groups) {
    const grpTeams = grp.teamIds.map((id) => teamMap.get(id)!).filter(Boolean);
    const matches = generateRoundRobinMatches(grpTeams, false, 'group', grp.name);
    groupMatches.push(...matches);
  }

  const qualifierCount = safeGroupCount * 2;
  const placeholderTeams: Team[] = Array.from({ length: qualifierCount }, (_, idx) => ({
    ...sorted[0],
    id: `__TBD_QUALIFIER_${idx}__`,
  }));
  const knockoutRaw = generateSingleElimMatches(placeholderTeams, 'knockout');
  const knockoutMatches = knockoutRaw.map((m) => ({
    ...m,
    homeTeamId:
      m.homeTeamId && !m.homeTeamId.startsWith('__TBD_QUALIFIER_')
        ? m.homeTeamId
        : null,
    awayTeamId:
      m.awayTeamId && !m.awayTeamId.startsWith('__TBD_QUALIFIER_')
        ? m.awayTeamId
        : null,
    played: false,
    winnerId: null,
    isBye: m.isBye,
  }));

  const preMatches = generatePreseasonMatches(sorted, preseason, schedule.startDate);

  const { matches, computedEndDate } = assignMatchDates(
    [...preMatches, ...groupMatches, ...knockoutMatches],
    schedule
  );

  return {
    id: createUuid(),
    name: name.trim() || 'Forge Continental Trophy',
    sportId,
    type: 'cup',
    format: 'group-knockout',
    size: teams.length,
    groupCount: safeGroupCount,
    groups,
    knockoutSeeded: false,
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
    teams: sorted,
    matches,
    championId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function seedGroupKnockoutPlayoffs(competition: Competition): Competition {
  if (competition.format !== 'group-knockout' || !competition.groups) {
    return competition;
  }

  const teamMap = new Map(competition.teams.map((t) => [t.id, t]));
  const qualifiers: Team[] = [];
  const winners: Team[] = [];
  const runnersUp: Team[] = [];

  for (const grp of competition.groups) {
    const grpTeams = grp.teamIds.map((id) => teamMap.get(id)!).filter(Boolean);
    const grpMatches = competition.matches.filter(
      (m) => m.bracket === 'group' && m.groupName === grp.name
    );
    const standings = computeStandings(
      grpTeams,
      grpMatches,
      competition.rules,
      competition.appliedAdvantages,
      'regular',
      competition.advantageRules
    );
    if (standings[0]) {
      const w = teamMap.get(standings[0].teamId);
      if (w) winners.push(w);
    }
    if (standings[1]) {
      const r = teamMap.get(standings[1].teamId);
      if (r) runnersUp.push(r);
    }
  }

  const reversedRunners = [...runnersUp].reverse();
  for (let i = 0; i < Math.max(winners.length, reversedRunners.length); i++) {
    if (winners[i]) qualifiers.push(winners[i]);
    if (reversedRunners[i]) qualifiers.push(reversedRunners[i]);
  }

  const freshKnockout = generateSingleElimMatches(qualifiers, 'knockout');
  const existingPreAndGroup = competition.matches.filter(
    (m) => m.bracket === 'preseason' || m.bracket === 'group'
  );
  const { matches, computedEndDate } = assignMatchDates(
    [...existingPreAndGroup, ...freshKnockout],
    competition.schedule
  );

  return {
    ...competition,
    knockoutSeeded: true,
    matches,
    championId: null,
    schedule: {
      ...competition.schedule,
      endDate:
        competition.schedule.endDateMode === 'auto'
          ? computedEndDate
          : competition.schedule.endDate,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function simulateCupScore(
  homeTeam: Team,
  awayTeam: Team,
  rules: CompetitionRules = DEFAULT_COMPETITION_RULES,
  sport: SportDefinition = BUILT_IN_SPORTS[0],
  competition?: Competition,
  match?: Match
): {
  homeScore: number;
  awayScore: number;
  penaltyWinnerId: string | null;
  resolutionNote: string | null;
  isOvertime: boolean;
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
    rules.homeFieldAdvantage,
    mods.homeRatingMultiplier,
    mods.awayRatingMultiplier
  );
  const scoringSummary = sim.scoringSummary;
  const homeScore = Math.round(sim.homeScore * mods.homePostScoreMultiplier) + mods.homeFlatScoreBonus;
  const awayScore = Math.round(sim.awayScore * mods.awayPostScoreMultiplier) + mods.awayFlatScoreBonus;

  if (homeScore !== awayScore) {
    return {
      homeScore,
      awayScore,
      penaltyWinnerId: null,
      resolutionNote: null,
      isOvertime: false,
      scoringSummary,
      preApplied: mods.preApplied,
    };
  }

  const homeProb =
    0.5 +
    Math.max(
      -0.15,
      Math.min(0.15, (homeTeam.overallRating - awayTeam.overallRating) / 100)
    );
  const bump = sport.scoringEvents[0]?.points ?? 1;

  if (rules.overtimeRule === 'golden-goal') {
    const homeWins = Math.random() < homeProb;
    return {
      homeScore: homeWins ? homeScore + bump : homeScore,
      awayScore: homeWins ? awayScore : awayScore + bump,
      penaltyWinnerId: null,
      resolutionNote: 'GG',
      isOvertime: true,
      scoringSummary,
      preApplied: mods.preApplied,
    };
  }

  if (
    rules.overtimeRule === 'overtime-periods' ||
    (rules.overtimeRule === 'extra-time-penalties' && Math.random() < 0.45)
  ) {
    const homeWins = Math.random() < homeProb;
    return {
      homeScore: homeWins ? homeScore + bump : homeScore,
      awayScore: homeWins ? awayScore : awayScore + bump,
      penaltyWinnerId: null,
      resolutionNote: rules.overtimeRule === 'overtime-periods' ? 'OT' : 'AET',
      isOvertime: true,
      scoringSummary,
      preApplied: mods.preApplied,
    };
  }

  const penaltyWinnerId = Math.random() < homeProb ? homeTeam.id : awayTeam.id;
  return {
    homeScore,
    awayScore,
    penaltyWinnerId,
    resolutionNote: 'PENS',
    isOvertime: true,
    scoringSummary,
    preApplied: mods.preApplied,
  };
}

export function groupCupRounds(matches: Match[]): CupRound[] {
  const map = new Map<number, CupRound>();
  for (const m of matches) {
    if (!map.has(m.round)) {
      map.set(m.round, { round: m.round, name: m.roundName, matches: [] });
    }
    map.get(m.round)!.matches.push(m);
  }
  return Array.from(map.values())
    .sort((a, b) => a.round - b.round)
    .map((r) => ({
      ...r,
      matches: [...r.matches].sort((a, b) => a.slotIndex - b.slotIndex),
    }));
}

export function advanceCupWinner(
  competition: Competition,
  matchId: string,
  homeScore: number,
  awayScore: number,
  penaltyWinnerId: string | null = null,
  resolutionNote: string | null = null,
  sport: SportDefinition = BUILT_IN_SPORTS[0],
  meta: {
    isOvertime?: boolean;
    scoringSummary?: string[];
    preApplied?: AppliedAdvantage[];
  } = {}
): Competition {
  const matches = competition.matches.map((m) => ({ ...m }));
  const target = matches.find((m) => m.id === matchId);
  if (!target || !target.homeTeamId || !target.awayTeamId) return competition;

  let winnerId: string;
  let loserId: string;
  if (homeScore > awayScore) {
    winnerId = target.homeTeamId;
    loserId = target.awayTeamId;
  } else if (awayScore > homeScore) {
    winnerId = target.awayTeamId;
    loserId = target.homeTeamId;
  } else if (
    penaltyWinnerId &&
    (penaltyWinnerId === target.homeTeamId || penaltyWinnerId === target.awayTeamId)
  ) {
    winnerId = penaltyWinnerId;
    loserId =
      penaltyWinnerId === target.homeTeamId ? target.awayTeamId : target.homeTeamId;
  } else {
    winnerId = target.homeTeamId;
    loserId = target.awayTeamId;
  }

  const postApplied = evaluatePostMatchAdvantages(
    competition,
    target,
    homeScore,
    awayScore
  );
  const combinedAdv = [...(meta.preApplied ?? []), ...postApplied];

  const wasPlayed = target.played;
  target.homeScore = homeScore;
  target.awayScore = awayScore;
  target.penaltyWinnerId = homeScore === awayScore ? winnerId : null;
  target.resolutionNote =
    resolutionNote ?? (homeScore === awayScore ? 'PENS' : null);
  target.isOvertime = meta.isOvertime ?? target.isOvertime ?? homeScore === awayScore;
  target.scoringSummary = meta.scoringSummary ?? target.scoringSummary;
  target.appliedAdvantages =
    combinedAdv.length > 0 ? combinedAdv : target.appliedAdvantages;
  target.played = true;
  target.winnerId = winnerId;

  if (target.nextMatchId) {
    const next = matches.find((m) => m.id === target.nextMatchId);
    if (next) {
      if (target.nextMatchSlot === 'home') next.homeTeamId = winnerId;
      if (target.nextMatchSlot === 'away') next.awayTeamId = winnerId;
    }
  }

  if (target.loserNextMatchId) {
    const loserNext = matches.find((m) => m.id === target.loserNextMatchId);
    if (loserNext) {
      if (target.loserNextMatchSlot === 'home') loserNext.homeTeamId = loserId;
      if (target.loserNextMatchSlot === 'away') loserNext.awayTeamId = loserId;
    }
  }

  const deadSlots = new Set<string>();
  for (const m of matches) {
    if (m.isBye && !m.homeTeamId) deadSlots.add(`${m.id}:home`);
    if (m.isBye && !m.awayTeamId) deadSlots.add(`${m.id}:away`);
    if (m.isBye && m.played && !m.winnerId) {
      if (m.nextMatchId && m.nextMatchSlot) {
        deadSlots.add(`${m.nextMatchId}:${m.nextMatchSlot}`);
      }
      if (m.loserNextMatchId && m.loserNextMatchSlot) {
        deadSlots.add(`${m.loserNextMatchId}:${m.loserNextMatchSlot}`);
      }
    } else if (m.isBye && m.played && m.winnerId && m.loserNextMatchId && m.loserNextMatchSlot) {
      deadSlots.add(`${m.loserNextMatchId}:${m.loserNextMatchSlot}`);
    }
  }
  autoResolveByes(matches, deadSlots);

  let preseasonPlayerStats = competition.preseasonPlayerStats;
  let regularPlayerStats = competition.regularPlayerStats;
  const homeTeam = competition.teams.find((t) => t.id === target.homeTeamId);
  const awayTeam = competition.teams.find((t) => t.id === target.awayTeamId);
  if (homeTeam && awayTeam && !wasPlayed) {
    const statUpdate = accumulatePlayerMatchStats(
      competition,
      sport,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      target.bracket === 'preseason'
    );
    preseasonPlayerStats = statUpdate.preseasonPlayerStats;
    regularPlayerStats = statUpdate.regularPlayerStats;
  }

  let championId: string | null = null;
  if (competition.format === 'double-elim') {
    const gf = matches.find((m) => m.bracket === 'grand-final');
    championId = gf?.played ? gf.winnerId : null;
  } else {
    const koMatches = matches.filter((m) => m.bracket === 'knockout' || !m.bracket);
    if (koMatches.length > 0) {
      const maxRound = Math.max(...koMatches.map((m) => m.round));
      const finalMatch = koMatches.find((m) => m.round === maxRound);
      championId = finalMatch?.played ? finalMatch.winnerId : null;
    }
  }

  let updated: Competition = {
    ...competition,
    matches,
    preseasonPlayerStats,
    regularPlayerStats,
    championId,
    updatedAt: new Date().toISOString(),
  };

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

  return updated;
}
