import type { GlobalRegistryState, RegistryEntry, Team } from '../../types';
import { createUuid } from '../prng';

const REGISTRY_STORAGE_KEY = 'forge_league_global_registry_v1';

export function normalizeTeamName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function createEmptyRegistry(): GlobalRegistryState {
  return {
    version: 1,
    logoDnas: [],
    teamNames: [],
    totalTeamsGenerated: 0,
    totalLogosGenerated: 0,
    entries: [],
  };
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function loadRegistry(): GlobalRegistryState {
  const storage = getStorage();
  if (!storage) return createEmptyRegistry();
  try {
    const raw = storage.getItem(REGISTRY_STORAGE_KEY);
    if (!raw) return createEmptyRegistry();
    const parsed = JSON.parse(raw) as Partial<GlobalRegistryState>;
    const logoDnas = Array.isArray(parsed.logoDnas) ? parsed.logoDnas : [];
    const teamNames = Array.isArray(parsed.teamNames) ? parsed.teamNames : [];
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    return {
      version: 1,
      logoDnas,
      teamNames,
      totalTeamsGenerated:
        typeof parsed.totalTeamsGenerated === 'number'
          ? parsed.totalTeamsGenerated
          : teamNames.length,
      totalLogosGenerated:
        typeof parsed.totalLogosGenerated === 'number'
          ? parsed.totalLogosGenerated
          : logoDnas.length,
      entries,
    };
  } catch {
    return createEmptyRegistry();
  }
}

export function saveRegistry(state: GlobalRegistryState): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function hasLogoDna(state: GlobalRegistryState, dna: string): boolean {
  return state.logoDnas.includes(dna);
}

export function hasTeamName(state: GlobalRegistryState, name: string): boolean {
  const norm = normalizeTeamName(name);
  return state.teamNames.includes(norm);
}

export function registerTeam(
  state: GlobalRegistryState,
  team: Team,
  source: RegistryEntry['source'] = 'studio'
): GlobalRegistryState {
  const normName = normalizeTeamName(team.name);
  const hasDna = state.logoDnas.includes(team.logo.dna);
  const hasName = state.teamNames.includes(normName);

  const nextLogoDnas = hasDna ? state.logoDnas : [...state.logoDnas, team.logo.dna];
  const nextTeamNames = hasName ? state.teamNames : [...state.teamNames, normName];

  const entry: RegistryEntry = {
    id: createUuid(),
    teamName: team.name,
    logoDna: team.logo.dna,
    seedCode: team.seedCode,
    source,
    createdAt: new Date().toISOString(),
  };

  const nextState: GlobalRegistryState = {
    version: 1,
    logoDnas: nextLogoDnas,
    teamNames: nextTeamNames,
    totalTeamsGenerated: nextTeamNames.length,
    totalLogosGenerated: nextLogoDnas.length,
    entries: [entry, ...state.entries].slice(0, 500),
  };

  saveRegistry(nextState);
  return nextState;
}

export function registerMany(
  state: GlobalRegistryState,
  teams: Team[],
  source: RegistryEntry['source']
): GlobalRegistryState {
  let current = state;
  for (const team of teams) {
    current = registerTeam(current, team, source);
  }
  return current;
}

export function resetRegistry(): GlobalRegistryState {
  const empty = createEmptyRegistry();
  saveRegistry(empty);
  return empty;
}

export function getRegistryStats(state: GlobalRegistryState): {
  uniqueTeams: number;
  uniqueLogos: number;
  recentCount: number;
} {
  return {
    uniqueTeams: state.totalTeamsGenerated,
    uniqueLogos: state.totalLogosGenerated,
    recentCount: state.entries.length,
  };
}
