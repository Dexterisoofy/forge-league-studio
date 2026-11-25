import type { Player, SportDefinition, SportPositionSpec } from '../../types';
import { createRng, createUuid, type SeededRng } from '../prng';
import { BUILT_IN_SPORTS } from '../sports/builtInSports';
import { FIRST_NAMES, LAST_NAMES } from './pools';

function clampRating(val: number): number {
  return Math.max(40, Math.min(99, Math.round(val)));
}

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${feet}'${rem}"`;
}

function capitalize(str: string): string {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

export function starRatingToBaseOverall(starRating: number): number {
  const clamped = Math.max(1, Math.min(5, starRating));
  return Math.round(48 + clamped * 8);
}

export function createSinglePlayer(
  rng: SeededRng,
  spec: SportPositionSpec,
  jerseyNumber: number,
  targetOverall: number
): Player {
  const firstName = capitalize(rng.pick(FIRST_NAMES));
  const lastName = capitalize(rng.pick(LAST_NAMES));
  const age = rng.int(18, 35);
  const heightIn = rng.int(spec.heightInRange[0], spec.heightInRange[1]);
  const weight = rng.int(spec.weightLbsRange[0], spec.weightLbsRange[1]);
  const archetype = rng.pick(
    spec.archetypes.length > 0 ? spec.archetypes : [spec.name]
  );

  const offense = clampRating(targetOverall * spec.statWeights.offense + rng.int(-6, 6));
  const defense = clampRating(targetOverall * spec.statWeights.defense + rng.int(-6, 6));
  const speed = clampRating(targetOverall * spec.statWeights.speed + rng.int(-7, 7));
  const stamina = clampRating(targetOverall * spec.statWeights.stamina + rng.int(-6, 6));
  const iq = clampRating(targetOverall * spec.statWeights.iq + rng.int(-6, 6));

  const weightSum =
    spec.statWeights.offense +
    spec.statWeights.defense +
    spec.statWeights.speed +
    spec.statWeights.stamina +
    spec.statWeights.iq;

  const overall = clampRating(
    (offense * spec.statWeights.offense +
      defense * spec.statWeights.defense +
      speed * spec.statWeights.speed +
      stamina * spec.statWeights.stamina +
      iq * spec.statWeights.iq) /
      Math.max(0.1, weightSum)
  );

  return {
    id: createUuid(),
    firstName,
    lastName,
    jerseyNumber,
    position: spec.code,
    age,
    height: formatHeight(heightIn),
    weight,
    archetype,
    overall,
    offense,
    defense,
    speed,
    stamina,
    iq,
  };
}

/**
 * Generates a realistic sport-specific roster respecting sport.rosterSize,
 * sport.positions, and strictly unique jersey numbers (1..99).
 */
export function generateRoster(
  rng: SeededRng,
  starRating: number,
  sport: SportDefinition = BUILT_IN_SPORTS[0]
): Player[] {
  const minSize = Math.max(5, sport.rosterSize.min);
  const maxSize = Math.max(minSize, Math.min(40, sport.rosterSize.max));
  const targetSize = rng.int(minSize, maxSize);
  const baseMean = starRatingToBaseOverall(starRating);

  const positions =
    sport.positions.length > 0 ? sport.positions : BUILT_IN_SPORTS[0].positions;

  const slots: SportPositionSpec[] = [];
  for (const spec of positions) {
    const count = rng.int(spec.countRange[0], spec.countRange[1]);
    for (let i = 0; i < count; i++) {
      slots.push(spec);
    }
  }

  while (slots.length > targetSize && slots.length > minSize) {
    const idx = rng.int(1, slots.length - 1);
    slots.splice(idx, 1);
  }
  while (slots.length < targetSize) {
    slots.push(rng.pick(positions));
  }

  const allNumbers = rng.shuffle(
    Array.from({ length: 99 }, (_, i) => i + 1)
  );
  const usedNumbers = new Set<number>();
  let numCursor = 0;

  const pickJersey = (posCode: string, idx: number): number => {
    if (idx === 0 && (posCode === 'GK' || posCode === 'G') && !usedNumbers.has(1)) {
      usedNumbers.add(1);
      return 1;
    }
    while (numCursor < allNumbers.length) {
      const candidate = allNumbers[numCursor++];
      if (!usedNumbers.has(candidate)) {
        usedNumbers.add(candidate);
        return candidate;
      }
    }
    return idx + 1;
  };

  const starterCount = Math.min(sport.activeLineupSize || 11, targetSize);
  const players = slots.map((spec, idx) => {
    const tierOffset = idx < starterCount ? rng.int(0, 6) : rng.int(-7, 2);
    const targetOverall = clampRating(baseMean + tierOffset);
    const jersey = pickJersey(spec.code, idx);
    return createSinglePlayer(rng, spec, jersey, targetOverall);
  });

  const order = new Map(positions.map((p, idx) => [p.code, idx]));
  return players.sort(
    (a, b) =>
      (order.get(a.position) ?? 99) - (order.get(b.position) ?? 99) ||
      a.jerseyNumber - b.jerseyNumber
  );
}

export function computeTeamOverall(roster: Player[], activeLineupSize = 11): number {
  if (roster.length === 0) return 65;
  const sorted = [...roster].sort((a, b) => b.overall - a.overall);
  const starters = sorted.slice(0, Math.min(activeLineupSize, sorted.length));
  const sum = starters.reduce((acc, p) => acc + p.overall, 0);
  return Math.round(sum / starters.length);
}

export function rebalanceRosterToStarRating(
  roster: Player[],
  starRating: number,
  seed = 'rebalance',
  activeLineupSize = 11
): Player[] {
  const rng = createRng(`${seed}-${starRating}`);
  const targetMean = starRatingToBaseOverall(starRating);
  const currentMean = computeTeamOverall(roster, activeLineupSize);
  const delta = targetMean - currentMean;

  return roster.map((player) => {
    const jitter = rng.int(-1, 1);
    const shift = delta + jitter;
    const offense = clampRating(player.offense + shift);
    const defense = clampRating(player.defense + shift);
    const speed = clampRating(player.speed + shift);
    const stamina = clampRating(player.stamina + shift);
    const iq = clampRating(player.iq + shift);
    const overall = clampRating((offense + defense + speed + stamina + iq) / 5);
    return { ...player, offense, defense, speed, stamina, iq, overall };
  });
}
