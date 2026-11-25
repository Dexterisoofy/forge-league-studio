import type {
  Competition,
  GlobalRegistryState,
  SportDefinition,
  Team,
} from '../../types';
import { createDefaultShareMetadata } from '../../lib/auth-db/sharing';
import { DEFAULT_PRESEASON_CONFIG } from '../simulation/preseasonEngine';
import {
  DEFAULT_COMPETITION_BRANDING,
  DEFAULT_COMPETITION_RULES,
  DEFAULT_SCHEDULE_CONFIG,
} from '../simulation/scheduler';
import { computeLogoDna } from '../svg-logo/logoDna';

const VAULT_STORAGE_KEY = 'forge_league_vault_v1';
const COMPETITIONS_STORAGE_KEY = 'forge_league_competitions_v1';

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

export function normalizeTeam(team: Team): Team {
  return {
    ...team,
    sportId: team.sportId ?? 'soccer',
    logo: { ...team.logo, dna: computeLogoDna(team.logo) },
  };
}

export function loadVault(): Team[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTeam) : [];
  } catch {
    return [];
  }
}

export function saveVault(teams: Team[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(VAULT_STORAGE_KEY, JSON.stringify(teams));
  } catch {
    // Ignore quota error
  }
}

export function normalizeCompetition(raw: Competition): Competition {
  const format =
    raw.format ??
    (raw.type === 'league'
      ? raw.doubleRoundRobin
        ? 'double-rr'
        : 'single-rr'
      : 'single-elim');

  return {
    ...raw,
    sportId: raw.sportId ?? 'soccer',
    format,
    rules: { ...DEFAULT_COMPETITION_RULES, ...(raw.rules ?? {}) },
    schedule: { ...DEFAULT_SCHEDULE_CONFIG, ...(raw.schedule ?? {}) },
    branding: { ...DEFAULT_COMPETITION_BRANDING, ...(raw.branding ?? {}) },
    preseason: { ...DEFAULT_PRESEASON_CONFIG, ...(raw.preseason ?? {}) },
    advantageRules: Array.isArray(raw.advantageRules) ? raw.advantageRules : [],
    appliedAdvantages: Array.isArray(raw.appliedAdvantages) ? raw.appliedAdvantages : [],
    history: Array.isArray(raw.history) ? raw.history : [],
    sharing: raw.sharing ?? createDefaultShareMetadata(),
    teams: Array.isArray(raw.teams) ? raw.teams.map(normalizeTeam) : [],
  };
}

export function loadCompetitions(): Competition[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(COMPETITIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeCompetition) : [];
  } catch {
    return [];
  }
}

export function saveCompetitions(competitions: Competition[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(COMPETITIONS_STORAGE_KEY, JSON.stringify(competitions));
  } catch {
    // Ignore quota error
  }
}

export interface ExportBundle {
  schema: 'forge-league-bundle-v1';
  exportedAt: string;
  teams?: Team[];
  competitions?: Competition[];
  customSports?: SportDefinition[];
  registry?: GlobalRegistryState;
}

export function downloadJsonFile(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isValidTeam(obj: unknown): obj is Team {
  if (!obj || typeof obj !== 'object') return false;
  const t = obj as Partial<Team>;
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.city === 'string' &&
    typeof t.mascot === 'string' &&
    Boolean(t.logo) &&
    typeof t.logo?.shieldId === 'string' &&
    typeof t.logo?.iconId === 'string' &&
    Array.isArray(t.roster)
  );
}

function isValidCompetition(obj: unknown): obj is Competition {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Partial<Competition>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    (c.type === 'league' || c.type === 'cup') &&
    Array.isArray(c.teams) &&
    Array.isArray(c.matches)
  );
}

function isValidSport(obj: unknown): obj is SportDefinition {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Partial<SportDefinition>;
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    Array.isArray(s.positions) &&
    Array.isArray(s.scoringEvents)
  );
}

export interface ParsedImportPayload {
  teams: Team[];
  competitions: Competition[];
  customSports: SportDefinition[];
}

export function parseImportedJson(rawJson: string): ParsedImportPayload {
  const parsed: unknown = JSON.parse(rawJson);

  if (Array.isArray(parsed)) {
    const teams = parsed.filter(isValidTeam).map(normalizeTeam);
    const competitions = parsed.filter(isValidCompetition).map(normalizeCompetition);
    const customSports = parsed.filter(isValidSport);
    return { teams, competitions, customSports };
  }

  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (obj.schema === 'forge-league-bundle-v1') {
      const teams = Array.isArray(obj.teams)
        ? obj.teams.filter(isValidTeam).map(normalizeTeam)
        : [];
      const competitions = Array.isArray(obj.competitions)
        ? obj.competitions.filter(isValidCompetition).map(normalizeCompetition)
        : [];
      const customSports = Array.isArray(obj.customSports)
        ? obj.customSports.filter(isValidSport)
        : [];
      return { teams, competitions, customSports };
    }
    if (isValidTeam(parsed)) {
      return { teams: [normalizeTeam(parsed)], competitions: [], customSports: [] };
    }
    if (isValidCompetition(parsed)) {
      return { teams: [], competitions: [normalizeCompetition(parsed)], customSports: [] };
    }
    if (isValidSport(parsed)) {
      return {
        teams: [],
        competitions: [],
        customSports: [{ ...parsed, isBuiltIn: false }],
      };
    }
  }

  throw new Error('Unrecognized JSON format. Expected a Team, Competition, Sport, or ForgeLeague Bundle.');
}
