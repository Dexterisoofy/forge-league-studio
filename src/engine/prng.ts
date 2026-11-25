/**
 * Deterministic 128-bit hash (cyrb128) + Mulberry32 PRNG for reproducible seeds.
 */
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeededRng {
  seed: string;
  next: () => number;
  int: (min: number, max: number) => number;
  float: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
  chance: (probability: number) => boolean;
}

export function createRng(seed: string): SeededRng {
  const [h1] = cyrb128(seed.trim().toUpperCase());
  const rand = mulberry32(h1);

  const next = () => rand();

  const int = (min: number, max: number): number => {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(next() * (hi - lo + 1)) + lo;
  };

  const float = (min: number, max: number): number => min + next() * (max - min);

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return items[Math.floor(next() * items.length)];
  };

  const shuffle = <T>(items: readonly T[]): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const chance = (probability: number): boolean => next() < probability;

  return { seed, next, int, float, pick, shuffle, chance };
}

const BASE36_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generates a compact 10-character uppercase Base36 seed code (e.g. "K9X4M2P8Q1").
 */
export function generateRandomSeedCode(): string {
  let out = '';
  for (let i = 0; i < 10; i++) {
    out += BASE36_ALPHABET[Math.floor(Math.random() * 36)];
  }
  return out;
}

/**
 * Deterministically hashes an arbitrary string into a 10-character uppercase Base36 seed.
 */
export function deriveCompactSeed(input: string): string {
  const [h1, h2, h3, h4] = cyrb128(input);
  const p1 = h1.toString(36).toUpperCase().padStart(7, '0');
  const p2 = ((h2 ^ h3 ^ h4) >>> 0).toString(36).toUpperCase().padStart(7, '0');
  return (p1 + p2).slice(0, 10);
}

/**
 * Normalizes a user-entered seed code to uppercase alphanumeric <= 10 chars.
 */
export function normalizeSeedCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (!cleaned) return generateRandomSeedCode();
  return cleaned.slice(0, 10);
}

export function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
