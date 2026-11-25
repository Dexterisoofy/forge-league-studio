import type {
  BreakWeeksConfig,
  CompetitionBranding,
  CompetitionRules,
  Match,
  ScheduleConfig,
  SportDefinition,
  Team,
} from '../../types';
import { BUILT_IN_SPORTS } from '../sports/builtInSports';

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildDefaultRulesForSport(
  sport: SportDefinition = BUILT_IN_SPORTS[0]
): CompetitionRules {
  return {
    winnerCriterion: sport.defaultRules.winnerCriterion,
    pointsWin: sport.defaultRules.pointsWin,
    pointsOtWin: sport.defaultRules.pointsOtWin,
    pointsDraw: sport.defaultRules.pointsDraw,
    pointsOtLoss: sport.defaultRules.pointsOtLoss,
    pointsLoss: sport.defaultRules.pointsLoss,
    tiebreakers: [...sport.defaultRules.tiebreakers],
    overtimeRule: sport.defaultRules.overtimeRule,
    homeFieldAdvantage: true,
  };
}

export const DEFAULT_COMPETITION_RULES: CompetitionRules = buildDefaultRulesForSport(
  BUILT_IN_SPORTS[0]
);

export const DEFAULT_BREAK_WEEKS_CONFIG: BreakWeeksConfig = {
  enabled: false,
  breaksPerTeam: 1,
  windowStartRound: 2,
  windowEndRound: 8,
  teamBreaks: {},
};

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  startDate: getTodayIsoDate(),
  endDateMode: 'auto',
  endDate: getTodayIsoDate(),
  allowedDays: [3, 6],
  pacingMode: 'min-rest-days',
  gamesPerWeek: 2,
  minRestDays: 3,
  breakWeeks: DEFAULT_BREAK_WEEKS_CONFIG,
};

export const DEFAULT_COMPETITION_BRANDING: CompetitionBranding = {
  tier: 'Premier',
  accentColor: '#f59e0b',
  trophyStyle: 'classic-cup',
};

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(Date.UTC(y, m - 1, d));
}

function formatIsoDate(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dt: Date, days: number): Date {
  const next = new Date(dt.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateRoundDates(
  roundCount: number,
  config: ScheduleConfig
): { dates: string[]; computedEndDate: string } {
  const start = parseIsoDate(config.startDate || getTodayIsoDate());
  if (roundCount <= 0) {
    const iso = formatIsoDate(start);
    return { dates: [], computedEndDate: iso };
  }

  const allowedSet = new Set(
    config.allowedDays && config.allowedDays.length > 0 ? config.allowedDays : [6]
  );

  if (config.endDateMode === 'fixed' && config.endDate) {
    const end = parseIsoDate(config.endDate);
    if (end.getTime() >= start.getTime()) {
      const candidates: string[] = [];
      let cursor = new Date(start.getTime());
      const maxSpanDays = 365 * 4;
      let guard = 0;
      while (cursor.getTime() <= end.getTime() && guard < maxSpanDays) {
        if (allowedSet.has(cursor.getUTCDay())) {
          candidates.push(formatIsoDate(cursor));
        }
        cursor = addDays(cursor, 1);
        guard++;
      }

      if (candidates.length >= roundCount) {
        const dates: string[] = [];
        for (let r = 0; r < roundCount; r++) {
          const idx =
            roundCount === 1
              ? 0
              : Math.round((r * (candidates.length - 1)) / (roundCount - 1));
          dates.push(candidates[idx]);
        }
        return { dates, computedEndDate: dates[dates.length - 1] };
      }

      const allDaysInWindow: string[] = [];
      cursor = new Date(start.getTime());
      guard = 0;
      while (cursor.getTime() <= end.getTime() && guard < maxSpanDays) {
        allDaysInWindow.push(formatIsoDate(cursor));
        cursor = addDays(cursor, 1);
        guard++;
      }
      if (allDaysInWindow.length >= roundCount) {
        const dates: string[] = [];
        for (let r = 0; r < roundCount; r++) {
          const idx =
            roundCount === 1
              ? 0
              : Math.round((r * (allDaysInWindow.length - 1)) / (roundCount - 1));
          dates.push(allDaysInWindow[idx]);
        }
        return { dates, computedEndDate: dates[dates.length - 1] };
      }
    }
  }

  const dates: string[] = [];
  let cursor = new Date(start.getTime());

  if (config.pacingMode === 'games-per-week') {
    const targetPerWeek = Math.max(1, Math.min(7, config.gamesPerWeek || 1));
    let weekStart = new Date(start.getTime());
    let usedThisWeek = 0;
    let safety = 0;

    while (dates.length < roundCount && safety < 365 * 5) {
      safety++;
      if (diffDays(weekStart, cursor) >= 7) {
        weekStart = new Date(cursor.getTime());
        usedThisWeek = 0;
      }
      if (allowedSet.has(cursor.getUTCDay()) && usedThisWeek < targetPerWeek) {
        dates.push(formatIsoDate(cursor));
        usedThisWeek++;
      }
      cursor = addDays(cursor, 1);
    }
  } else {
    const minStep = Math.max(1, (config.minRestDays ?? 2) + 1);
    let lastPicked: Date | null = null;
    let safety = 0;

    while (dates.length < roundCount && safety < 365 * 5) {
      safety++;
      const restOk = lastPicked === null || diffDays(lastPicked, cursor) >= minStep;
      if (restOk && allowedSet.has(cursor.getUTCDay())) {
        dates.push(formatIsoDate(cursor));
        lastPicked = new Date(cursor.getTime());
      }
      cursor = addDays(cursor, 1);
    }
  }

  while (dates.length < roundCount) {
    const prev = dates.length > 0 ? parseIsoDate(dates[dates.length - 1]) : start;
    dates.push(formatIsoDate(addDays(prev, 3)));
  }

  return {
    dates,
    computedEndDate: dates[dates.length - 1] ?? formatIsoDate(start),
  };
}

export function assignMatchDates(
  matches: Match[],
  schedule: ScheduleConfig
): { matches: Match[]; computedEndDate: string } {
  const phaseOrder: Record<string, number> = {
    league: 0,
    group: 0,
    winners: 1,
    losers: 1,
    knockout: 2,
    'grand-final': 3,
  };

  // Preseason matches already keep their own dates; assign calendar dates to main competition
  const mainMatches = matches.filter((m) => m.bracket !== 'preseason');
  const keyFor = (m: Match) => {
    const b = m.bracket ?? 'league';
    const phase = b === 'losers' ? 1 : phaseOrder[b] ?? 0;
    return `${phase}:${String(m.round).padStart(4, '0')}:${b === 'grand-final' ? '1' : '0'}`;
  };

  const uniqueKeys = Array.from(new Set(mainMatches.map(keyFor))).sort();
  const { dates, computedEndDate } = generateRoundDates(uniqueKeys.length, schedule);
  const keyToDate = new Map<string, string>();
  uniqueKeys.forEach((k, idx) => keyToDate.set(k, dates[idx]));

  const datedMatches = matches.map((m) => {
    if (m.bracket === 'preseason') return m;
    return {
      ...m,
      scheduledDate: keyToDate.get(keyFor(m)) ?? schedule.startDate,
    };
  });

  return { matches: datedMatches, computedEndDate };
}

/**
 * Applies optional custom break / bye weeks for specific teams (or auto-staggered
 * across all teams) by rescheduling conflicting matches into open rounds so:
 * 1. No team ever plays during its break week(s).
 * 2. No team plays more than once in the same round.
 * 3. Every original match pairing is preserved.
 */
export function applyTeamBreakWeeks(
  teams: Team[],
  matches: Match[],
  breakConfig?: BreakWeeksConfig
): { matches: Match[]; resolvedBreakWeeks: Record<number, string[]> } {
  if (!breakConfig || !breakConfig.enabled || teams.length < 2) {
    return { matches, resolvedBreakWeeks: {} };
  }

  const leagueMatches = matches.filter((m) => m.bracket !== 'preseason');
  if (leagueMatches.length === 0) {
    return { matches, resolvedBreakWeeks: {} };
  }

  const maxOriginalRound = Math.max(...leagueMatches.map((m) => m.round));
  const winStart = Math.max(1, breakConfig.windowStartRound || 2);
  const winEnd = Math.max(
    winStart,
    Math.min(
      maxOriginalRound + Math.max(1, breakConfig.breaksPerTeam || 1),
      breakConfig.windowEndRound || maxOriginalRound
    )
  );

  const teamBreakSet = new Map<string, Set<number>>();
  const hasExplicitEntries = Object.values(breakConfig.teamBreaks ?? {}).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );

  teams.forEach((team, idx) => {
    const explicitById = breakConfig.teamBreaks?.[team.id];
    const explicitBySlot = breakConfig.teamBreaks?.[`slot-${idx}`];
    const explicit = explicitById ?? explicitBySlot;

    if (explicit && explicit.length > 0) {
      teamBreakSet.set(
        team.id,
        new Set(explicit.filter((r) => Number.isInteger(r) && r >= 1))
      );
    } else if (!hasExplicitEntries && breakConfig.breaksPerTeam > 0) {
      const span = Math.max(1, winEnd - winStart + 1);
      const count = Math.min(3, Math.max(1, breakConfig.breaksPerTeam));
      const assigned = new Set<number>();
      for (let b = 0; b < count; b++) {
        const offset = (idx + b * Math.max(1, Math.floor(span / count))) % span;
        assigned.add(winStart + offset);
      }
      teamBreakSet.set(team.id, assigned);
    } else {
      teamBreakSet.set(team.id, new Set<number>());
    }
  });

  const busyInRound = new Map<number, Set<string>>();
  const ensureRoundSet = (r: number) => {
    if (!busyInRound.has(r)) busyInRound.set(r, new Set<string>());
    return busyInRound.get(r)!;
  };

  const canPlaceInRound = (r: number, homeId: string, awayId: string): boolean => {
    if (teamBreakSet.get(homeId)?.has(r)) return false;
    if (teamBreakSet.get(awayId)?.has(r)) return false;
    const busy = ensureRoundSet(r);
    return !busy.has(homeId) && !busy.has(awayId);
  };

  const kept: Match[] = [];
  const displaced: Match[] = [];

  for (const m of matches) {
    if (m.bracket === 'preseason' || !m.homeTeamId || !m.awayTeamId) {
      kept.push(m);
      continue;
    }

    if (canPlaceInRound(m.round, m.homeTeamId, m.awayTeamId)) {
      ensureRoundSet(m.round).add(m.homeTeamId);
      ensureRoundSet(m.round).add(m.awayTeamId);
      kept.push(m);
    } else {
      displaced.push(m);
    }
  }

  for (const m of displaced) {
    let targetRound = m.round + 1;
    let guard = 0;
    while (
      !canPlaceInRound(targetRound, m.homeTeamId!, m.awayTeamId!) &&
      guard < 200
    ) {
      targetRound++;
      guard++;
    }
    ensureRoundSet(targetRound).add(m.homeTeamId!);
    ensureRoundSet(targetRound).add(m.awayTeamId!);
    kept.push({
      ...m,
      round: targetRound,
      roundName: m.groupName
        ? `${m.groupName} · MD ${targetRound}`
        : `Matchday ${targetRound}`,
    });
  }

  const resolvedBreakWeeks: Record<number, string[]> = {};
  for (const [teamId, roundsSet] of teamBreakSet.entries()) {
    for (const r of roundsSet) {
      if (!resolvedBreakWeeks[r]) resolvedBreakWeeks[r] = [];
      resolvedBreakWeeks[r].push(teamId);
    }
  }

  kept.sort((a, b) => {
    const aPre = a.bracket === 'preseason' ? 0 : 1;
    const bPre = b.bracket === 'preseason' ? 0 : 1;
    if (aPre !== bPre) return aPre - bPre;
    return a.round - b.round || a.slotIndex - b.slotIndex;
  });

  return { matches: kept, resolvedBreakWeeks };
}
