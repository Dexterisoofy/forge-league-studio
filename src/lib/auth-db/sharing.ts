import type { Competition, ShareMetadata, SportDefinition } from '../../types';
import { getBackendConfig } from './envConfig';

const SLUG_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export function generateRandomSlug(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)];
  }
  return out;
}

export function sanitizeVanitySlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function createDefaultShareMetadata(customSlug?: string): ShareMetadata {
  const sanitized = customSlug ? sanitizeVanitySlug(customSlug) : '';
  return {
    slug: sanitized || generateRandomSlug(8),
    isCustomSlug: Boolean(sanitized),
    visibility: 'private',
    collaborators: [],
  };
}

export function isSlugAvailable(
  slug: string,
  competitions: Competition[],
  sports: SportDefinition[],
  excludeId?: string
): boolean {
  const clean = sanitizeVanitySlug(slug);
  if (!clean || clean.length < 3) return false;

  for (const c of competitions) {
    if (c.id === excludeId) continue;
    if (c.sharing?.slug.toLowerCase() === clean) return false;
  }
  for (const s of sports) {
    if (s.id === excludeId) continue;
    if (s.sharing?.slug.toLowerCase() === clean) return false;
  }
  return true;
}

export function buildShareUrl(kind: 'league' | 'sport', slug: string): string {
  const cfg = getBackendConfig();
  const prefix = kind === 'league' ? 'l' : 'sport';
  const base =
    cfg.appBaseUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://forgeleague.app/');
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}#/${prefix}/${slug}`;
}

export function parseShareHashRoute(
  hash: string
): { kind: 'league' | 'sport'; slug: string } | null {
  const cleaned = hash.replace(/^#\/?/, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  if (parts[0] === 'l') return { kind: 'league', slug: parts[1].toLowerCase() };
  if (parts[0] === 'sport') return { kind: 'sport', slug: parts[1].toLowerCase() };
  return null;
}
