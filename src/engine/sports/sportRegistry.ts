import type { SportDefinition } from '../../types';
import { BUILT_IN_SPORTS } from './builtInSports';

const CUSTOM_SPORTS_STORAGE_KEY = 'forge_league_custom_sports_v1';

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

export function loadCustomSports(): SportDefinition[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(CUSTOM_SPORTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomSports(sports: SportDefinition[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(CUSTOM_SPORTS_STORAGE_KEY, JSON.stringify(sports));
  } catch {
    // ignore storage quota errors
  }
}

export function getAllSports(customSports: SportDefinition[] = []): SportDefinition[] {
  return [...BUILT_IN_SPORTS, ...customSports];
}

export function getSportById(
  sportId: string,
  customSports: SportDefinition[] = []
): SportDefinition {
  const custom = customSports.find((s) => s.id === sportId);
  if (custom) return custom;
  const builtIn = BUILT_IN_SPORTS.find((s) => s.id === sportId);
  return builtIn ?? BUILT_IN_SPORTS[0];
}
