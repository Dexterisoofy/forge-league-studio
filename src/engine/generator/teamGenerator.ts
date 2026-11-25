import type {
  CompetitionConstraints,
  GlobalRegistryState,
  LogoConfig,
  RegistryEntry,
  SportDefinition,
  Team,
  TeamLocks,
} from '../../types';
import {
  createRng,
  createUuid,
  deriveCompactSeed,
  generateRandomSeedCode,
  normalizeSeedCode,
} from '../prng';
import {
  hasLogoDna,
  hasTeamName,
  registerTeam,
} from '../registry/globalRegistry';
import { BUILT_IN_SPORTS } from '../sports/builtInSports';
import { ACCENTS } from '../svg-logo/accents';
import { BANNERS } from '../svg-logo/banners';
import { ICONS } from '../svg-logo/icons';
import { computeLogoDna } from '../svg-logo/logoDna';
import { getPrimaryColorSchemeKey, LOGO_PALETTES } from '../svg-logo/palettes';
import { PATTERNS } from '../svg-logo/patterns';
import { SHIELDS } from '../svg-logo/shields';
import {
  BUDGET_TIERS,
  CITIES,
  EXTRA_MASCOTS,
  MASCOTS_BY_ICON,
  STADIUM_PREFIXES,
} from './pools';
import { computeTeamOverall, generateRoster } from './rosterGenerator';

export function deriveAbbreviation(city: string, mascot: string): string {
  const c = city.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const m = mascot.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (c.length >= 2 && m.length >= 1) {
    return `${c.slice(0, 2)}${m[0]}`;
  }
  return (c + m).slice(0, 3) || 'FLC';
}

export interface GenerateTeamOptions {
  locks?: Partial<TeamLocks>;
  baseTeam?: Team;
  constraints?: CompetitionConstraints;
  sport?: SportDefinition;
}

/**
 * Deterministically builds a complete sport-aware Team from a compact <= 10-char Base36 seed code.
 */
export function generateTeamFromSeed(
  rawSeedCode: string,
  options: GenerateTeamOptions = {}
): Team {
  const seedCode = normalizeSeedCode(rawSeedCode);
  const rng = createRng(seedCode);
  const { locks, baseTeam, constraints } = options;
  const sport = options.sport ?? BUILT_IN_SPORTS[0];

  const availableIcons = constraints
    ? ICONS.filter((icon) => !constraints.usedIcons.has(icon.id))
    : ICONS;
  const iconPool = availableIcons.length > 0 ? availableIcons : ICONS;

  const availablePalettes = constraints
    ? LOGO_PALETTES.filter((p) => !constraints.usedColorSchemes.has(p.colorSchemeKey))
    : LOGO_PALETTES;
  const palettePool = availablePalettes.length > 0 ? availablePalettes : LOGO_PALETTES;

  const availableCities = constraints
    ? CITIES.filter((c) => !constraints.usedCities.has(c.toLowerCase()))
    : CITIES;
  const cityPool = availableCities.length > 0 ? availableCities : CITIES;

  const shieldId =
    locks?.shield && baseTeam ? baseTeam.logo.shieldId : rng.pick(SHIELDS).id;
  const patternId =
    locks?.pattern && baseTeam ? baseTeam.logo.patternId : rng.pick(PATTERNS).id;

  // 15% chance to pick sport's signature equipment icon if unconstrained/available
  let pickedIconId = rng.pick(iconPool).id;
  if (sport.equipmentIconIds.length > 0 && rng.chance(0.15)) {
    const eqMatches = iconPool.filter((i) => sport.equipmentIconIds.includes(i.id));
    if (eqMatches.length > 0) {
      pickedIconId = rng.pick(eqMatches).id;
    }
  }
  const iconId =
    locks?.icon && baseTeam ? baseTeam.logo.iconId : pickedIconId;

  const accentId =
    locks?.accent && baseTeam ? baseTeam.logo.accentId : rng.pick(ACCENTS).id;
  const bannerId =
    locks?.banner && baseTeam ? baseTeam.logo.bannerId : rng.pick(BANNERS).id;

  const pickedPalette = rng.pick(palettePool);
  const paletteId =
    locks?.palette && baseTeam ? baseTeam.logo.paletteId : pickedPalette.id;
  const primary =
    locks?.palette && baseTeam ? baseTeam.logo.primary : pickedPalette.primary;
  const secondary =
    locks?.palette && baseTeam ? baseTeam.logo.secondary : pickedPalette.secondary;
  const trim =
    locks?.palette && baseTeam ? baseTeam.logo.trim : pickedPalette.trim;

  const city = locks?.city && baseTeam ? baseTeam.city : rng.pick(cityPool);
  const iconMascots = MASCOTS_BY_ICON[iconId] ?? EXTRA_MASCOTS;
  const mascotPool = [...iconMascots, ...EXTRA_MASCOTS];
  const mascot =
    locks?.mascot && baseTeam ? baseTeam.mascot : rng.pick(mascotPool);
  const name = `${city} ${mascot}`;
  const abbreviation = deriveAbbreviation(city, mascot);

  const venueSuffixes =
    sport.venueTemplates.length > 0
      ? sport.venueTemplates
      : [sport.terminology.venueNoun || 'Arena'];
  const stadium =
    locks?.stadium && baseTeam
      ? baseTeam.stadium
      : `${city} ${rng.pick(STADIUM_PREFIXES)} ${rng.pick(venueSuffixes)}`;

  const foundedYear = rng.int(1904, 2024);
  const playstyles =
    sport.playstyles.length > 0
      ? sport.playstyles
      : BUILT_IN_SPORTS[0].playstyles;
  const playstyle =
    locks?.playstyle && baseTeam ? baseTeam.playstyle : rng.pick(playstyles);
  const budgetTier =
    locks?.budgetTier && baseTeam ? baseTeam.budgetTier : rng.pick(BUDGET_TIERS);

  const tierStarBase: Record<string, [number, number]> = {
    Grassroots: [1.5, 2.5],
    Challenger: [2.5, 3.5],
    Contender: [3.0, 4.0],
    Powerhouse: [3.5, 4.5],
    Titan: [4.0, 5.0],
  };
  const [minStar, maxStar] = tierStarBase[budgetTier] ?? [2.5, 4.0];
  const rawStar = rng.float(minStar, maxStar);
  const starRating =
    locks?.starRating && baseTeam
      ? baseTeam.starRating
      : Math.round(rawStar * 2) / 2;

  const roster =
    locks?.roster && baseTeam
      ? baseTeam.roster
      : generateRoster(rng, starRating, sport);
  const overallRating = computeTeamOverall(roster, sport.activeLineupSize);

  const wins = rng.int(40, 420);
  const losses = rng.int(40, 380);
  const draws = sport.defaultRules.drawsAllowed ? rng.int(15, 160) : 0;
  const championships = starRating >= 4 ? rng.int(1, 9) : rng.int(0, 3);

  const partialLogo = {
    shieldId,
    patternId,
    iconId,
    accentId,
    bannerId,
    paletteId,
    primary,
    secondary,
    trim,
    monogramText: abbreviation,
  };

  const logo: LogoConfig = {
    ...partialLogo,
    dna: computeLogoDna(partialLogo),
  };

  return {
    id: createUuid(),
    seedCode,
    sportId: sport.id,
    city,
    mascot,
    name,
    abbreviation,
    stadium,
    foundedYear,
    playstyle,
    budgetTier,
    starRating,
    overallRating,
    historicalRecord: { wins, losses, draws, championships },
    logo,
    roster,
    createdAt: new Date().toISOString(),
    isCustom: false,
  };
}

export interface UniqueTeamResult {
  team: Team;
  registry: GlobalRegistryState;
  collisionsAvoided: number;
}

export function generateUniqueTeam(
  registry: GlobalRegistryState,
  options: GenerateTeamOptions & {
    source?: RegistryEntry['source'];
    maxAttempts?: number;
    seedPrefix?: string;
  } = {}
): UniqueTeamResult {
  const maxAttempts = options.maxAttempts ?? 140;
  const source = options.source ?? 'studio';
  let collisionsAvoided = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const baseSeed = options.seedPrefix
      ? attempt === 0
        ? normalizeSeedCode(options.seedPrefix)
        : deriveCompactSeed(`${options.seedPrefix}:${attempt}`)
      : generateRandomSeedCode();

    const candidate = generateTeamFromSeed(baseSeed, options);

    const dnaExists = hasLogoDna(registry, candidate.logo.dna);
    const nameExists = hasTeamName(registry, candidate.name);

    const allLogoLocked =
      Boolean(options.locks?.shield) &&
      Boolean(options.locks?.pattern) &&
      Boolean(options.locks?.icon) &&
      Boolean(options.locks?.accent) &&
      Boolean(options.locks?.banner) &&
      Boolean(options.locks?.palette);

    const logoCollision = !allLogoLocked && dnaExists;
    const nameCollision = !(options.locks?.city && options.locks?.mascot) && nameExists;

    const compCollision = options.constraints
      ? options.constraints.usedIcons.has(candidate.logo.iconId) ||
        options.constraints.usedCities.has(candidate.city.toLowerCase()) ||
        options.constraints.usedColorSchemes.has(getPrimaryColorSchemeKey(candidate.logo))
      : false;

    if (!logoCollision && !nameCollision && !compCollision) {
      if (options.constraints) {
        options.constraints.usedIcons.add(candidate.logo.iconId);
        options.constraints.usedCities.add(candidate.city.toLowerCase());
        options.constraints.usedColorSchemes.add(getPrimaryColorSchemeKey(candidate.logo));
      }
      const nextRegistry = registerTeam(registry, candidate, source);
      return {
        team: candidate,
        registry: nextRegistry,
        collisionsAvoided,
      };
    }

    collisionsAvoided++;
  }

  const fallbackSeed = deriveCompactSeed(`FB:${Date.now()}:${Math.random()}`);
  const fallback = generateTeamFromSeed(fallbackSeed, options);
  fallback.mascot = `${fallback.mascot} ${Math.floor(10 + Math.random() * 89)}`;
  fallback.name = `${fallback.city} ${fallback.mascot}`;
  fallback.logo.dna = computeLogoDna(fallback.logo);

  const nextRegistry = registerTeam(registry, fallback, source);
  return {
    team: fallback,
    registry: nextRegistry,
    collisionsAvoided,
  };
}

export function createCompetitionConstraints(existingTeams: Team[] = []): CompetitionConstraints {
  const usedIcons = new Set<string>();
  const usedCities = new Set<string>();
  const usedColorSchemes = new Set<string>();

  for (const t of existingTeams) {
    usedIcons.add(t.logo.iconId);
    usedCities.add(t.city.toLowerCase());
    usedColorSchemes.add(getPrimaryColorSchemeKey(t.logo));
  }

  return { usedIcons, usedCities, usedColorSchemes };
}
