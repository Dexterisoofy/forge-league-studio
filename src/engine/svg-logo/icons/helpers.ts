export interface IconColors {
  fill: string;
  accent: string;
  stroke: string;
  contrast: string;
}

export type IconCategory =
  | 'Predators & Mammals'
  | 'Birds & Reptiles'
  | 'Mythic, Sci-Fi & Power'
  | 'Objects, Elements & Weapons'
  | 'Multi-Sport Equipment';

export interface IconDefinition {
  id: string;
  name: string;
  category: IconCategory;
  render: (c: IconColors) => string;
}

export const ICON_CATEGORIES: IconCategory[] = [
  'Predators & Mammals',
  'Birds & Reptiles',
  'Mythic, Sci-Fi & Power',
  'Objects, Elements & Weapons',
  'Multi-Sport Equipment',
];

/**
 * Symmetric horizontal mirroring helper around x = 50 inside a 100x100 viewBox.
 */
export function mirrorX(fragment: string): string {
  return `${fragment}<g transform="translate(100 0) scale(-1 1)">${fragment}</g>`;
}

/**
 * Generates an N-pointed star polygon centered at (cx, cy).
 */
export function starPolygon(
  cx: number,
  cy: number,
  points: number,
  outerR: number,
  innerR: number
): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    coords.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
  }
  return coords.join(' ');
}

/**
 * Generates a crisp gear/cog SVG path centered at (cx, cy).
 */
export function gearPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  teeth: number
): string {
  const pts: string[] = [];
  const steps = teeth * 4;
  for (let i = 0; i < steps; i++) {
    const a = (i * Math.PI * 2) / steps - Math.PI / 2;
    const r = i % 4 === 0 || i % 4 === 1 ? outerR : innerR;
    pts.push(`${i === 0 ? 'M' : 'L'} ${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ') + ' Z';
}
