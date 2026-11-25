import type { Match, PreseasonConfig, Team } from '../../types';
import { createUuid } from '../prng';
import { getTodayIsoDate } from './scheduler';

export const DEFAULT_PRESEASON_CONFIG: PreseasonConfig = {
  enabled: false,
  mode: 'game-count',
  gamesPerTeam: 3,
  startDate: getTodayIsoDate(),
  endDate: getTodayIsoDate(),
  frequencyDays: 3,
  matchmaking: 'random',
  customMatchups: [],
  carryOverStats: false,
};

function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function diffDaysIso(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  const ta = Date.UTC(ya, ma - 1, da);
  const tb = Date.UTC(yb, mb - 1, db);
  return Math.max(1, Math.round((tb - ta) / (1000 * 60 * 60 * 24)));
}

/**
 * Generates Preseason / Exhibition matches for any team count according to
 * game-count or date-range, with random, regional rivals, or custom matchups.
 */
export function generatePreseasonMatches(
  teams: Team[],
  config: PreseasonConfig,
  regularStartDate: string
): Match[] {
  if (!config.enabled || teams.length < 2) return [];

  const freq = Math.max(1, config.frequencyDays || 3);
  let targetGamesPerTeam = Math.max(1, Math.min(8, config.gamesPerTeam || 3));

  let start = config.startDate || addDaysIso(regularStartDate, -targetGamesPerTeam * freq - 2);
  if (config.mode === 'date-range' && config.startDate && config.endDate) {
    start = config.startDate;
    const span = diffDaysIso(config.startDate, config.endDate);
    targetGamesPerTeam = Math.max(1, Math.min(8, Math.floor(span / freq) + 1));
  } else if (start >= regularStartDate) {
    start = addDaysIso(regularStartDate, -(targetGamesPerTeam * freq + 2));
  }

  // Custom matchups mode
  if (
    config.matchmaking === 'custom' &&
    config.customMatchups &&
    config.customMatchups.length > 0
  ) {
    return config.customMatchups.map((pair, idx) => ({
      id: createUuid(),
      round: idx + 1,
      roundName: `Preseason Ex ${idx + 1}`,
      slotIndex: 0,
      scheduledDate: addDaysIso(start, idx * freq),
      bracket: 'preseason',
      homeTeamId: pair.homeTeamId,
      awayTeamId: pair.awayTeamId,
      homeScore: null,
      awayScore: null,
      penaltyWinnerId: null,
      played: false,
      winnerId: null,
    }));
  }

  // Order teams: rivals pairs geographically/alphabetically adjacent cities; random shuffles
  const ordered =
    config.matchmaking === 'rivals'
      ? [...teams].sort((a, b) => a.city.localeCompare(b.city))
      : [...teams].sort(() => Math.random() - 0.5);

  const ids = ordered.map((t) => t.id);
  if (ids.length % 2 !== 0) {
    ids.push('__BYE__');
  }

  const total = ids.length;
  const half = total / 2;
  const fixed = ids[0];
  const rotating = ids.slice(1);
  const matches: Match[] = [];

  for (let r = 0; r < targetGamesPerTeam; r++) {
    const roundIds = [fixed, ...rotating];
    const roundDate = addDaysIso(start, r * freq);

    for (let i = 0; i < half; i++) {
      // In rivals mode, pair adjacent entries in round 0, then rotate
      const a = r === 0 && config.matchmaking === 'rivals' ? roundIds[i * 2] : roundIds[i];
      const b =
        r === 0 && config.matchmaking === 'rivals'
          ? roundIds[i * 2 + 1]
          : roundIds[total - 1 - i];
      if (!a || !b || a === '__BYE__' || b === '__BYE__') continue;

      const swap = (r + i) % 2 === 1;
      matches.push({
        id: createUuid(),
        round: r + 1,
        roundName: `Preseason Wk ${r + 1}`,
        slotIndex: i,
        scheduledDate: roundDate,
        bracket: 'preseason',
        homeTeamId: swap ? b : a,
        awayTeamId: swap ? a : b,
        homeScore: null,
        awayScore: null,
        penaltyWinnerId: null,
        played: false,
        winnerId: null,
      });
    }

    const last = rotating.pop()!;
    rotating.unshift(last);
  }

  return matches;
}
