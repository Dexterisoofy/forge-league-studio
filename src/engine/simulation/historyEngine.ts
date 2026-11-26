import type { Competition, SimulationSnapshot } from '../../types';
import { createUuid } from '../prng';

const MAX_SNAPSHOTS = 20;

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Captures a deep snapshot of competition matches, standings-affecting advantages,
 * bracket state, and player stats before a simulation runs (rolling cap: 20).
 */
export function pushCompetitionSnapshot(
  competition: Competition,
  label: string,
  maxHistory = MAX_SNAPSHOTS
): Competition {
  const snapshot: SimulationSnapshot = {
    id: createUuid(),
    label,
    timestamp: new Date().toISOString(),
    teams: cloneData(competition.teams),
    matches: cloneData(competition.matches),
    championId: competition.championId,
    appliedAdvantages: cloneData(competition.appliedAdvantages ?? []),
    preseasonProcessed: competition.preseasonProcessed,
    preseasonPlayerStats: cloneData(competition.preseasonPlayerStats ?? {}),
    regularPlayerStats: cloneData(competition.regularPlayerStats ?? {}),
    knockoutSeeded: competition.knockoutSeeded,
  };

  const prevHistory = competition.history ?? [];
  const nextHistory = [...prevHistory, snapshot].slice(-maxHistory);

  return {
    ...competition,
    history: nextHistory,
  };
}

/**
 * Restores the most recent snapshot and pops it from the rolling history stack.
 */
export function undoLastSimulation(competition: Competition): Competition {
  const history = competition.history ?? [];
  if (history.length === 0) return competition;

  const latest = history[history.length - 1];
  return {
    ...competition,
    teams: latest.teams ? cloneData(latest.teams) : competition.teams,
    matches: cloneData(latest.matches),
    championId: latest.championId,
    appliedAdvantages: cloneData(latest.appliedAdvantages),
    preseasonProcessed: latest.preseasonProcessed,
    preseasonPlayerStats: cloneData(latest.preseasonPlayerStats ?? {}),
    regularPlayerStats: cloneData(latest.regularPlayerStats ?? {}),
    knockoutSeeded: latest.knockoutSeeded,
    history: history.slice(0, -1),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Restores a specific checkpoint by snapshot ID and drops snapshots recorded after it.
 */
export function restoreSnapshotById(
  competition: Competition,
  snapshotId: string
): Competition {
  const history = competition.history ?? [];
  const idx = history.findIndex((s) => s.id === snapshotId);
  if (idx < 0) return competition;

  const target = history[idx];
  return {
    ...competition,
    teams: target.teams ? cloneData(target.teams) : competition.teams,
    matches: cloneData(target.matches),
    championId: target.championId,
    appliedAdvantages: cloneData(target.appliedAdvantages),
    preseasonProcessed: target.preseasonProcessed,
    preseasonPlayerStats: cloneData(target.preseasonPlayerStats ?? {}),
    regularPlayerStats: cloneData(target.regularPlayerStats ?? {}),
    knockoutSeeded: target.knockoutSeeded,
    history: history.slice(0, idx),
    updatedAt: new Date().toISOString(),
  };
}
