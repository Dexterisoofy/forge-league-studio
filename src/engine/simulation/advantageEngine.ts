import type {
  AdvantageRule,
  AppliedAdvantage,
  Competition,
  Match,
  PlayerSeasonStats,
  SportDefinition,
  Team,
} from '../../types';
import { createUuid } from '../prng';
import { BUILT_IN_SPORTS } from '../sports/builtInSports';

export const PRESET_ADVANTAGE_RULES: AdvantageRule[] = [
  {
    id: 'preset-preseason-carryover-pts',
    name: 'Preseason Contender Bonus',
    enabled: false,
    trigger: 'preseason-wins',
    threshold: 2,
    reward: 'bonus-standings-points',
    rewardValue: 3,
    description: 'Win 2+ preseason games to start the regular season with +3 Standings Points.',
  },
  {
    id: 'preset-preseason-undefeated-boost',
    name: 'Undefeated Preseason Surge',
    enabled: false,
    trigger: 'preseason-undefeated',
    threshold: 1,
    reward: 'post-game-score-boost',
    rewardValue: 10,
    description: 'Undefeated in preseason grants a +10% score boost in Regular Season opener.',
  },
  {
    id: 'preset-blowout-bonus',
    name: 'Dominant Margin Bonus',
    enabled: false,
    trigger: 'margin-of-victory',
    threshold: 3,
    reward: 'bonus-standings-points',
    rewardValue: 1,
    description: 'Winning by 3+ (or threshold margin) awards +1 bonus standings point.',
  },
  {
    id: 'preset-win-streak-boost',
    name: 'Hot Streak Momentum',
    enabled: false,
    trigger: 'win-streak',
    threshold: 3,
    reward: 'next-match-rating-boost',
    rewardValue: 5,
    description: '3-game win streak grants +5% team rating boost in the next match.',
  },
  {
    id: 'preset-top-seed-home',
    name: 'Top Seed Home Edge',
    enabled: false,
    trigger: 'top-seed',
    threshold: 1,
    reward: 'home-score-bonus',
    rewardValue: 1,
    description: 'Highest-rated / #1 seed gets +1 home score bonus in knockout matches.',
  },
];

export function createCustomAdvantageRule(
  partial: Partial<AdvantageRule>
): AdvantageRule {
  return {
    id: partial.id ?? createUuid(),
    name: partial.name ?? 'Custom Advantage Rule',
    enabled: partial.enabled ?? true,
    trigger: partial.trigger ?? 'margin-of-victory',
    threshold: partial.threshold ?? 3,
    reward: partial.reward ?? 'bonus-standings-points',
    rewardValue: partial.rewardValue ?? 1,
    description:
      partial.description ??
      'Custom conditional rule applied automatically during competition.',
  };
}

/**
 * Computes each team's current consecutive win streak across non-preseason played matches.
 */
export function getTeamWinStreak(teamId: string, matches: Match[]): number {
  const teamMatches = matches
    .filter(
      (m) =>
        m.played &&
        !m.isBye &&
        m.bracket !== 'preseason' &&
        (m.homeTeamId === teamId || m.awayTeamId === teamId)
    )
    .sort((a, b) => a.round - b.round);

  let streak = 0;
  for (let i = teamMatches.length - 1; i >= 0; i--) {
    if (teamMatches[i].winnerId === teamId) streak++;
    else break;
  }
  return streak;
}

/**
 * Evaluates preseason carryover rules once all preseason matches are finished
 * (or on demand), returning AppliedAdvantage records for qualifying teams.
 */
export function evaluatePreseasonCarryover(
  competition: Competition
): AppliedAdvantage[] {
  const preseasonMatches = competition.matches.filter(
    (m) => m.bracket === 'preseason' && m.played && !m.isBye
  );
  if (preseasonMatches.length === 0) return [];

  const activeRules = (competition.advantageRules ?? []).filter((r) => r.enabled);
  const results: AppliedAdvantage[] = [];

  for (const team of competition.teams) {
    const teamPre = preseasonMatches.filter(
      (m) => m.homeTeamId === team.id || m.awayTeamId === team.id
    );
    if (teamPre.length === 0) continue;

    const wins = teamPre.filter((m) => m.winnerId === team.id).length;
    const losses = teamPre.filter(
      (m) => m.winnerId !== null && m.winnerId !== team.id
    ).length;

    for (const rule of activeRules) {
      if (rule.trigger === 'preseason-wins' && wins >= rule.threshold) {
        const unit =
          rule.reward === 'bonus-win'
            ? `+${rule.rewardValue} Bonus Win`
            : rule.reward === 'bonus-standings-points'
              ? `+${rule.rewardValue} Bonus Pts`
              : `+${rule.rewardValue}% Match Boost`;
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          teamId: team.id,
          detail: `${unit} (Preseason ${wins}W)`,
          phase: 'preseason',
        });
      }
      if (rule.trigger === 'preseason-undefeated' && wins > 0 && losses === 0) {
        const unit =
          rule.reward === 'post-game-score-boost' || rule.reward === 'next-match-rating-boost'
            ? `+${rule.rewardValue}% Opener Boost`
            : `+${rule.rewardValue} Bonus Pts`;
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          teamId: team.id,
          detail: `${unit} (Undefeated Preseason ${wins}-${losses})`,
          phase: 'preseason',
        });
      }
    }
  }

  return results;
}

/**
 * Computes pre-match rating modifiers and post-match score/standings modifiers
 * for a single match based on active AdvantageRules.
 */
export function evaluateMatchModifiers(
  competition: Competition,
  match: Match,
  homeTeam: Team,
  awayTeam: Team
): {
  homeRatingMultiplier: number;
  awayRatingMultiplier: number;
  homePostScoreMultiplier: number;
  awayPostScoreMultiplier: number;
  homeFlatScoreBonus: number;
  awayFlatScoreBonus: number;
  preApplied: AppliedAdvantage[];
} {
  const activeRules = (competition.advantageRules ?? []).filter((r) => r.enabled);
  let homeRatingMultiplier = 1;
  let awayRatingMultiplier = 1;
  let homePostScoreMultiplier = 1;
  let awayPostScoreMultiplier = 1;
  let homeFlatScoreBonus = 0;
  const awayFlatScoreBonus = 0;
  const preApplied: AppliedAdvantage[] = [];

  if (match.bracket === 'preseason') {
    return {
      homeRatingMultiplier,
      awayRatingMultiplier,
      homePostScoreMultiplier,
      awayPostScoreMultiplier,
      homeFlatScoreBonus,
      awayFlatScoreBonus,
      preApplied,
    };
  }

  const topRatedTeamId = [...competition.teams].sort(
    (a, b) => b.overallRating - a.overallRating
  )[0]?.id;

  // Count prior regular matches for opener boost check
  const homePriorPlayed = competition.matches.filter(
    (m) =>
      m.played &&
      m.bracket !== 'preseason' &&
      (m.homeTeamId === homeTeam.id || m.awayTeamId === homeTeam.id)
  ).length;
  const awayPriorPlayed = competition.matches.filter(
    (m) =>
      m.played &&
      m.bracket !== 'preseason' &&
      (m.homeTeamId === awayTeam.id || m.awayTeamId === awayTeam.id)
  ).length;

  for (const rule of activeRules) {
    if (rule.trigger === 'win-streak' && rule.reward === 'next-match-rating-boost') {
      const homeStreak = getTeamWinStreak(homeTeam.id, competition.matches);
      const awayStreak = getTeamWinStreak(awayTeam.id, competition.matches);
      if (homeStreak >= rule.threshold) {
        homeRatingMultiplier += rule.rewardValue / 100;
        preApplied.push({
          ruleId: rule.id,
          ruleName: rule.name,
          teamId: homeTeam.id,
          detail: `+${rule.rewardValue}% OVR (${homeStreak}W streak)`,
          phase: 'regular',
        });
      }
      if (awayStreak >= rule.threshold) {
        awayRatingMultiplier += rule.rewardValue / 100;
        preApplied.push({
          ruleId: rule.id,
          ruleName: rule.name,
          teamId: awayTeam.id,
          detail: `+${rule.rewardValue}% OVR (${awayStreak}W streak)`,
          phase: 'regular',
        });
      }
    }

    if (
      rule.trigger === 'preseason-undefeated' &&
      rule.reward === 'post-game-score-boost'
    ) {
      const carryover = competition.appliedAdvantages ?? [];
      if (
        homePriorPlayed === 0 &&
        carryover.some((a) => a.ruleId === rule.id && a.teamId === homeTeam.id)
      ) {
        homePostScoreMultiplier += rule.rewardValue / 100;
        preApplied.push({
          ruleId: rule.id,
          ruleName: rule.name,
          teamId: homeTeam.id,
          detail: `+${rule.rewardValue}% Opener Score Boost`,
          phase: 'regular',
        });
      }
      if (
        awayPriorPlayed === 0 &&
        carryover.some((a) => a.ruleId === rule.id && a.teamId === awayTeam.id)
      ) {
        awayPostScoreMultiplier += rule.rewardValue / 100;
        preApplied.push({
          ruleId: rule.id,
          ruleName: rule.name,
          teamId: awayTeam.id,
          detail: `+${rule.rewardValue}% Opener Score Boost`,
          phase: 'regular',
        });
      }
    }

    if (rule.trigger === 'top-seed' && rule.reward === 'home-score-bonus') {
      if (homeTeam.id === topRatedTeamId) {
        homeFlatScoreBonus += rule.rewardValue;
        preApplied.push({
          ruleId: rule.id,
          ruleName: rule.name,
          teamId: homeTeam.id,
          detail: `+${rule.rewardValue} Top-Seed Home Bonus`,
          phase: 'knockout',
        });
      }
    }
  }

  return {
    homeRatingMultiplier,
    awayRatingMultiplier,
    homePostScoreMultiplier,
    awayPostScoreMultiplier,
    homeFlatScoreBonus,
    awayFlatScoreBonus,
    preApplied,
  };
}

/**
 * Evaluates post-match conditional rules (such as Margin of Victory bonuses).
 */
export function evaluatePostMatchAdvantages(
  competition: Competition,
  match: Match,
  homeScore: number,
  awayScore: number
): AppliedAdvantage[] {
  if (match.bracket === 'preseason' || !match.homeTeamId || !match.awayTeamId) {
    return [];
  }
  const margin = Math.abs(homeScore - awayScore);
  if (margin === 0) return [];
  const winnerId = homeScore > awayScore ? match.homeTeamId : match.awayTeamId;
  const activeRules = (competition.advantageRules ?? []).filter((r) => r.enabled);
  const out: AppliedAdvantage[] = [];

  for (const rule of activeRules) {
    if (rule.trigger === 'margin-of-victory' && margin >= rule.threshold) {
      const detail =
        rule.reward === 'bonus-win'
          ? `+${rule.rewardValue} Bonus Win (${margin} margin)`
          : `+${rule.rewardValue} Bonus Pts (${margin} margin)`;
      out.push({
        ruleId: rule.id,
        ruleName: rule.name,
        teamId: winnerId,
        detail,
        phase: 'regular',
      });
    }
  }
  return out;
}

/**
 * Simulates sport-specific match scores using the sport's scoringEvents, startingScore,
 * expected volume, and win-direction semantics (supports negative penalties & zero-play sports).
 */
export function simulateSportScore(
  homeTeam: Team,
  awayTeam: Team,
  sport: SportDefinition = BUILT_IN_SPORTS[0],
  homeFieldAdvantage = true,
  homeRatingMultiplier = 1,
  awayRatingMultiplier = 1
): { homeScore: number; awayScore: number; scoringSummary: string[] } {
  const homeEff = homeTeam.overallRating * homeRatingMultiplier;
  const awayEff = awayTeam.overallRating * awayRatingMultiplier;
  const ratingDiff = (homeEff - awayEff) / 14;

  const startingScore = sport.startingScore ?? 0;
  const lowestScoreWins = Boolean(sport.lowestScoreWins);
  const rawEvents = sport.scoringEvents ?? [];
  const rawExpected = sport.expectedScoringEventsPerTeam;

  // Zero-play / no-regulation-scoring sport (starts both teams at startingScore)
  if (rawEvents.length === 0 || (rawExpected !== undefined && rawExpected <= 0)) {
    return {
      homeScore: startingScore,
      awayScore: startingScore,
      scoringSummary: [
        `${homeTeam.abbreviation}: ${startingScore} (no reg. plays)`,
        `${awayTeam.abbreviation}: ${startingScore} (no reg. plays)`,
      ],
    };
  }

  const baseEvents = Math.max(0.25, rawExpected ?? 1.4);

  const sampleCount = (lambda: number): number => {
    if (lambda <= 0) return 0;
    if (lambda > 20) {
      // Normal approximation for high-event sports like Basketball
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return Math.max(1, Math.round(lambda + Math.sqrt(lambda) * z));
    }
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L && k < 35);
    return Math.max(0, k - 1);
  };

  const pickFromPool = (pool: SportDefinition['scoringEvents']) => {
    const totalW = pool.reduce((acc, e) => acc + Math.max(1, e.weight), 0);
    let r = Math.random() * totalW;
    for (const ev of pool) {
      r -= Math.max(1, ev.weight);
      if (r <= 0) return ev;
    }
    return pool[0];
  };

  const positiveEvents = rawEvents.filter((e) => e.points > 0);
  const penaltyEvents = rawEvents.filter((e) => e.points <= 0);

  const tallyPool = (
    eventCount: number,
    pool: SportDefinition['scoringEvents'],
    counts: Map<string, number>
  ): number => {
    let delta = 0;
    for (let i = 0; i < eventCount; i++) {
      const ev = pickFromPool(pool);
      delta += ev.points;
      counts.set(ev.name, (counts.get(ev.name) ?? 0) + 1);
    }
    return delta;
  };

  const homeCounts = new Map<string, number>();
  const awayCounts = new Map<string, number>();
  let homeDelta = 0;
  let awayDelta = 0;

  if (lowestScoreWins || positiveEvents.length === 0) {
    // Lower score / fewer negative penalties is better -> stronger/home teams incur fewer events
    const homePenEdge = homeFieldAdvantage ? 0.94 : 1.0;
    const awayPenEdge = homeFieldAdvantage ? 1.07 : 1.0;
    const homeLambda = Math.max(0.2, baseEvents * homePenEdge * (1 - ratingDiff * 0.14));
    const awayLambda = Math.max(0.2, baseEvents * awayPenEdge * (1 + ratingDiff * 0.14));
    homeDelta += tallyPool(sampleCount(homeLambda), rawEvents, homeCounts);
    awayDelta += tallyPool(sampleCount(awayLambda), rawEvents, awayCounts);
  } else if (penaltyEvents.length > 0) {
    // Mixed positive scoring plays + negative/zero penalty plays
    const posWeight = positiveEvents.reduce((s, e) => s + Math.max(1, e.weight), 0);
    const penWeight = penaltyEvents.reduce((s, e) => s + Math.max(1, e.weight), 0);
    const sumW = posWeight + penWeight;
    const posShare = posWeight / sumW;
    const penShare = penWeight / sumW;

    const homePosEdge = homeFieldAdvantage ? 1.07 : 1.0;
    const awayPosEdge = homeFieldAdvantage ? 0.94 : 1.0;
    const homePenEdge = homeFieldAdvantage ? 0.94 : 1.0;
    const awayPenEdge = homeFieldAdvantage ? 1.07 : 1.0;

    homeDelta += tallyPool(
      sampleCount(Math.max(0.1, baseEvents * posShare * homePosEdge * (1 + ratingDiff * 0.14))),
      positiveEvents,
      homeCounts
    );
    awayDelta += tallyPool(
      sampleCount(Math.max(0.1, baseEvents * posShare * awayPosEdge * (1 - ratingDiff * 0.14))),
      positiveEvents,
      awayCounts
    );
    homeDelta += tallyPool(
      sampleCount(Math.max(0.1, baseEvents * penShare * homePenEdge * (1 - ratingDiff * 0.14))),
      penaltyEvents,
      homeCounts
    );
    awayDelta += tallyPool(
      sampleCount(Math.max(0.1, baseEvents * penShare * awayPenEdge * (1 + ratingDiff * 0.14))),
      penaltyEvents,
      awayCounts
    );
  } else {
    const homeEdge = homeFieldAdvantage ? 1.07 : 1.0;
    const awayEdge = homeFieldAdvantage ? 0.94 : 1.0;
    const homeLambda = Math.max(0.35, baseEvents * homeEdge * (1 + ratingDiff * 0.14));
    const awayLambda = Math.max(0.3, baseEvents * awayEdge * (1 - ratingDiff * 0.14));
    homeDelta += tallyPool(sampleCount(homeLambda), rawEvents, homeCounts);
    awayDelta += tallyPool(sampleCount(awayLambda), rawEvents, awayCounts);
  }

  const formatSummary = (label: string, counts: Map<string, number>, total: number) => {
    const parts = Array.from(counts.entries())
      .map(([n, c]) => `${c}× ${n}`)
      .join(', ');
    if (!parts) return `${label}: ${total}`;
    return startingScore !== 0 ? `${label}: ${parts} (from ${startingScore})` : `${label}: ${parts}`;
  };

  const homeScore = startingScore + homeDelta;
  const awayScore = startingScore + awayDelta;

  return {
    homeScore,
    awayScore,
    scoringSummary: [
      formatSummary(homeTeam.abbreviation, homeCounts, homeScore),
      formatSummary(awayTeam.abbreviation, awayCounts, awayScore),
    ],
  };
}

/**
 * Updates separated Preseason vs Regular Season player stats after a match.
 */
export function accumulatePlayerMatchStats(
  competition: Competition,
  sport: SportDefinition,
  homeTeam: Team,
  awayTeam: Team,
  homeScore: number,
  awayScore: number,
  isPreseason: boolean
): {
  preseasonPlayerStats: Record<string, PlayerSeasonStats>;
  regularPlayerStats: Record<string, PlayerSeasonStats>;
} {
  const preMap: Record<string, PlayerSeasonStats> = {
    ...(competition.preseasonPlayerStats ?? {}),
  };
  const regMap: Record<string, PlayerSeasonStats> = {
    ...(competition.regularPlayerStats ?? {}),
  };

  const updateMap = (
    targetMap: Record<string, PlayerSeasonStats>,
    team: Team,
    teamScore: number,
    oppScore: number
  ) => {
    const starters = [...team.roster]
      .sort((a, b) => b.overall - a.overall)
      .slice(0, Math.max(1, Math.min(sport.activeLineupSize, team.roster.length)));

    for (const player of starters) {
      const prev = targetMap[player.id] ?? {
        playerId: player.id,
        teamId: team.id,
        gamesPlayed: 0,
        stats: {},
      };
      const gp = prev.gamesPlayed + 1;
      const nextStats = { ...prev.stats };
      const offShare = (player.offense / 100) * (1 / starters.length);

      for (const col of sport.statColumns) {
        const k = col.key;
        if (col.format === 'dec1') {
          const sample =
            k === 'ppg'
              ? Math.max(2, Math.round(teamScore * offShare * (0.8 + Math.random() * 0.7)))
              : k === 'rpg'
                ? Math.round((player.defense / 12) * (0.6 + Math.random() * 0.8))
                : k === 'apg'
                  ? Math.round((player.iq / 18) * (0.5 + Math.random() * 0.9))
                  : k === 'era'
                    ? Number((Math.max(1.2, 5.5 - player.defense / 25) + (Math.random() - 0.5)).toFixed(1))
                    : Number(((player.offense / 25) * (0.7 + Math.random() * 0.6)).toFixed(1));
          const oldVal = nextStats[k] ?? 0;
          nextStats[k] = Number((((oldVal * prev.gamesPlayed) + sample) / gp).toFixed(1));
        } else if (col.format === 'pct') {
          const sample = Math.min(99, Math.max(35, Math.round(player.overall * 0.65 + (Math.random() * 14 - 7))));
          const oldVal = nextStats[k] ?? sample;
          nextStats[k] = Math.round(((oldVal * prev.gamesPlayed) + sample) / gp);
        } else if (col.format === 'avg3') {
          const sample = Number((0.2 + (player.offense / 450) + (Math.random() * 0.08 - 0.04)).toFixed(3));
          const oldVal = nextStats[k] ?? sample;
          nextStats[k] = Number((((oldVal * prev.gamesPlayed) + sample) / gp).toFixed(3));
        } else {
          // integer cumulative stat
          let inc = 0;
          if (k === 'cleanSheets') {
            inc = oppScore === 0 && (player.position === 'GK' || player.position === 'G' || player.position === 'DEF') ? 1 : 0;
          } else if (k === 'saves') {
            inc = player.position === 'GK' || player.position === 'G' ? Math.max(1, Math.round(2 + Math.random() * 5)) : 0;
          } else if (k === 'goals' || k === 'tries' || k === 'tds') {
            inc = Math.random() < Math.min(0.75, teamScore * offShare * 0.45) ? 1 : 0;
          } else {
            inc = Math.max(0, Math.round((player.overall / 45) * (0.5 + Math.random())));
          }
          nextStats[k] = (nextStats[k] ?? 0) + inc;
        }
      }

      targetMap[player.id] = {
        playerId: player.id,
        teamId: team.id,
        gamesPlayed: gp,
        stats: nextStats,
      };
    }
  };

  if (isPreseason) {
    updateMap(preMap, homeTeam, homeScore, awayScore);
    updateMap(preMap, awayTeam, awayScore, homeScore);
    if (competition.preseason?.carryOverStats) {
      updateMap(regMap, homeTeam, homeScore, awayScore);
      updateMap(regMap, awayTeam, awayScore, homeScore);
    }
  } else {
    updateMap(regMap, homeTeam, homeScore, awayScore);
    updateMap(regMap, awayTeam, awayScore, homeScore);
  }

  return {
    preseasonPlayerStats: preMap,
    regularPlayerStats: regMap,
  };
}
