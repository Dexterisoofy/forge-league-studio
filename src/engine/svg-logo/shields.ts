export interface ShieldDefinition {
  id: string;
  name: string;
  path: string;
  innerPath: string;
  centerY: number;
  iconScale: number;
}

function buildGearPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  teeth: number
): string {
  const pts: string[] = [];
  const totalSteps = teeth * 4;
  for (let i = 0; i < totalSteps; i++) {
    const angle = (i * Math.PI * 2) / totalSteps - Math.PI / 2;
    const isOuter = i % 4 === 0 || i % 4 === 1;
    const r = isOuter ? outerR : innerR;
    const x = (cx + Math.cos(angle) * r).toFixed(1);
    const y = (cy + Math.sin(angle) * r).toFixed(1);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  return pts.join(' ') + ' Z';
}

/**
 * 32 distinct scalable vector shield & crest silhouettes in a 200x220 viewBox.
 */
export const SHIELDS: ShieldDefinition[] = [
  {
    id: 'classic-heater',
    name: 'Classic Heater',
    path: 'M 28 24 L 172 24 L 172 108 C 172 158 100 198 100 198 C 100 198 28 158 28 108 Z',
    innerPath: 'M 36 32 L 164 32 L 164 106 C 164 150 100 187 100 187 C 100 187 36 150 36 106 Z',
    centerY: 98,
    iconScale: 0.92,
  },
  {
    id: 'modern-kite',
    name: 'Modern Kite',
    path: 'M 100 16 L 174 42 L 156 146 L 100 202 L 44 146 L 26 42 Z',
    innerPath: 'M 100 26 L 164 48 L 148 142 L 100 190 L 52 142 L 36 48 Z',
    centerY: 102,
    iconScale: 0.88,
  },
  {
    id: 'roundel-badge',
    name: 'Championship Roundel',
    path: 'M 100 22 A 84 84 0 1 1 99.9 22 Z',
    innerPath: 'M 100 32 A 74 74 0 1 1 99.9 32 Z',
    centerY: 106,
    iconScale: 0.92,
  },
  {
    id: 'hex-crest',
    name: 'Hexagon Armor',
    path: 'M 100 18 L 174 58 L 174 152 L 100 198 L 26 152 L 26 58 Z',
    innerPath: 'M 100 28 L 164 64 L 164 146 L 100 187 L 36 146 L 36 64 Z',
    centerY: 106,
    iconScale: 0.9,
  },
  {
    id: 'diamond-pennant',
    name: 'Apex Diamond',
    path: 'M 100 14 L 180 108 L 100 204 L 20 108 Z',
    innerPath: 'M 100 27 L 168 108 L 100 190 L 32 108 Z',
    centerY: 108,
    iconScale: 0.8,
  },
  {
    id: 'gothic-pointed',
    name: 'Gothic Arch',
    path: 'M 34 26 Q 100 10 166 26 L 166 116 Q 166 168 100 200 Q 34 168 34 116 Z',
    innerPath: 'M 42 34 Q 100 20 158 34 L 158 114 Q 158 160 100 189 Q 42 160 42 114 Z',
    centerY: 102,
    iconScale: 0.88,
  },
  {
    id: 'swiss-notched',
    name: 'Swiss Notched',
    path: 'M 32 22 L 70 22 Q 100 36 130 22 L 168 22 L 168 118 C 168 164 100 198 100 198 C 100 198 32 164 32 118 Z',
    innerPath: 'M 40 31 L 68 31 Q 100 45 132 31 L 160 31 L 160 116 C 160 156 100 187 100 187 C 100 187 40 156 40 116 Z',
    centerY: 105,
    iconScale: 0.86,
  },
  {
    id: 'oval-emblem',
    name: 'Heritage Oval',
    path: 'M 100 18 A 66 90 0 1 1 99.9 18 Z',
    innerPath: 'M 100 28 A 56 80 0 1 1 99.9 28 Z',
    centerY: 106,
    iconScale: 0.84,
  },
  {
    id: 'octagon-seal',
    name: 'Octagon Arena',
    path: 'M 64 22 L 136 22 L 178 64 L 178 148 L 136 190 L 64 190 L 22 148 L 22 64 Z',
    innerPath: 'M 68 31 L 132 31 L 169 68 L 169 144 L 132 181 L 68 181 L 31 144 L 31 68 Z',
    centerY: 104,
    iconScale: 0.9,
  },
  {
    id: 'winged-crest',
    name: 'Flared Bastion',
    path: 'M 20 30 L 64 20 L 100 32 L 136 20 L 180 30 L 162 126 C 154 166 100 198 100 198 C 100 198 46 166 38 126 Z',
    innerPath: 'M 31 38 L 65 29 L 100 40 L 135 29 L 169 38 L 154 123 C 146 158 100 187 100 187 C 100 187 54 158 46 123 Z',
    centerY: 104,
    iconScale: 0.86,
  },
  {
    id: 'chevron-badge',
    name: 'Vanguard Chevron',
    path: 'M 28 24 L 172 24 L 172 138 L 100 198 L 28 138 Z',
    innerPath: 'M 37 33 L 163 33 L 163 133 L 100 186 L 37 133 Z',
    centerY: 98,
    iconScale: 0.92,
  },
  {
    id: 'crown-top',
    name: 'Sovereign Crown-Top',
    path: 'M 30 42 L 62 24 L 100 38 L 138 24 L 170 42 L 164 128 C 156 168 100 198 100 198 C 100 198 44 168 36 128 Z',
    innerPath: 'M 39 48 L 65 34 L 100 47 L 135 34 L 161 48 L 155 125 C 148 160 100 187 100 187 C 100 187 52 160 45 125 Z',
    centerY: 108,
    iconScale: 0.85,
  },
  {
    id: 'tall-banner',
    name: 'Pennant Crest',
    path: 'M 38 20 L 162 20 L 162 162 L 100 202 L 38 162 Z',
    innerPath: 'M 47 29 L 153 29 L 153 157 L 100 191 L 47 157 Z',
    centerY: 100,
    iconScale: 0.86,
  },
  {
    id: 'tombstone-arch',
    name: 'Cathedral Arch',
    path: 'M 32 104 A 68 82 0 0 1 168 104 L 168 150 C 168 176 100 198 100 198 C 100 198 32 176 32 150 Z',
    innerPath: 'M 41 104 A 59 72 0 0 1 159 104 L 159 147 C 159 169 100 188 100 188 C 100 188 41 169 41 147 Z',
    centerY: 112,
    iconScale: 0.86,
  },
  {
    id: 'star-burst-seal',
    name: '12-Point Seal',
    path: 'M 100 16 L 122 32 L 148 26 L 158 50 L 184 58 L 178 84 L 192 108 L 176 130 L 182 156 L 156 164 L 146 188 L 120 182 L 100 198 L 80 182 L 54 188 L 44 164 L 18 156 L 24 130 L 8 108 L 22 84 L 16 58 L 42 50 L 52 26 L 78 32 Z',
    innerPath: 'M 100 32 A 74 74 0 1 1 99.9 32 Z',
    centerY: 106,
    iconScale: 0.86,
  },
  {
    id: 'angular-esports',
    name: 'Apex Angular',
    path: 'M 22 36 L 68 20 L 132 20 L 178 36 L 160 132 L 100 202 L 40 132 Z',
    innerPath: 'M 33 43 L 71 29 L 129 29 L 167 43 L 151 128 L 100 190 L 49 128 Z',
    centerY: 102,
    iconScale: 0.88,
  },
  // 16 NEW Shield & Crest Silhouettes (Total: 32)
  {
    id: 'spanish-crest',
    name: 'Spanish Iberian',
    path: 'M 32 24 L 168 24 L 168 128 A 68 68 0 0 1 32 128 Z',
    innerPath: 'M 41 33 L 159 33 L 159 126 A 59 59 0 0 1 41 126 Z',
    centerY: 102,
    iconScale: 0.88,
  },
  {
    id: 'swiss-heater',
    name: 'Swiss Escutcheon',
    path: 'M 28 32 Q 64 20 100 32 Q 136 20 172 32 L 162 122 C 154 164 100 198 100 198 C 100 198 46 164 38 122 Z',
    innerPath: 'M 37 40 Q 68 30 100 41 Q 132 30 163 40 L 154 120 C 147 156 100 187 100 187 C 100 187 53 156 46 120 Z',
    centerY: 106,
    iconScale: 0.86,
  },
  {
    id: 'gear-cog',
    name: 'Industrial Cog',
    path: buildGearPath(100, 108, 88, 74, 12),
    innerPath: 'M 100 40 A 68 68 0 1 1 99.9 40 Z',
    centerY: 108,
    iconScale: 0.84,
  },
  {
    id: 'esports-hex-wide',
    name: 'Esports Wide Hex',
    path: 'M 46 24 L 154 24 L 188 94 L 148 188 L 100 202 L 52 188 L 12 94 Z',
    innerPath: 'M 52 33 L 148 33 L 178 95 L 142 180 L 100 192 L 58 180 L 22 95 Z',
    centerY: 104,
    iconScale: 0.9,
  },
  {
    id: 'kite-spearhead',
    name: 'Spearhead Kite',
    path: 'M 100 14 L 170 64 L 146 146 L 100 206 L 54 146 L 30 64 Z',
    innerPath: 'M 100 26 L 160 68 L 138 142 L 100 193 L 62 142 L 40 68 Z',
    centerY: 106,
    iconScale: 0.82,
  },
  {
    id: 'tri-peak-shield',
    name: 'Tri-Peak Bastion',
    path: 'M 24 38 L 62 22 L 100 16 L 138 22 L 176 38 L 166 132 L 100 198 L 34 132 Z',
    innerPath: 'M 33 45 L 65 31 L 100 26 L 135 31 L 167 45 L 157 128 L 100 186 L 43 128 Z',
    centerY: 104,
    iconScale: 0.88,
  },
  {
    id: 'ribbon-crest',
    name: 'Notched Pennant',
    path: 'M 34 22 L 166 22 L 166 188 L 100 156 L 34 188 Z',
    innerPath: 'M 43 31 L 157 31 L 157 173 L 100 146 L 43 173 Z',
    centerY: 92,
    iconScale: 0.84,
  },
  {
    id: 'double-wing-badge',
    name: 'Aero Winged Shield',
    path: 'M 14 36 L 58 26 L 100 18 L 142 26 L 186 36 L 162 84 L 150 148 L 100 198 L 50 148 L 38 84 Z',
    innerPath: 'M 28 43 L 62 35 L 100 28 L 138 35 L 172 43 L 153 84 L 142 143 L 100 186 L 58 143 L 47 84 Z',
    centerY: 102,
    iconScale: 0.84,
  },
  {
    id: 'faceted-gem',
    name: 'Faceted Crystal',
    path: 'M 60 20 L 140 20 L 182 76 L 100 202 L 18 76 Z',
    innerPath: 'M 65 29 L 135 29 L 171 78 L 100 188 L 29 78 Z',
    centerY: 94,
    iconScale: 0.86,
  },
  {
    id: 'ornate-baroque',
    name: 'Baroque Escutcheon',
    path: 'M 36 24 Q 100 38 164 24 C 180 56 178 98 158 134 C 142 164 118 184 100 200 C 82 184 58 164 42 134 C 22 98 20 56 36 24 Z',
    innerPath: 'M 44 35 Q 100 47 156 35 C 169 62 167 98 150 130 C 136 156 116 174 100 188 C 84 174 64 156 50 130 C 33 98 31 62 44 35 Z',
    centerY: 106,
    iconScale: 0.84,
  },
  {
    id: 'beveled-square',
    name: 'Chamfered Plate',
    path: 'M 44 22 L 156 22 L 178 44 L 178 156 L 100 198 L 22 156 L 22 44 Z',
    innerPath: 'M 49 31 L 151 31 L 169 49 L 169 151 L 100 187 L 31 151 L 31 49 Z',
    centerY: 102,
    iconScale: 0.9,
  },
  {
    id: 'rounded-pentagon',
    name: 'Stadium Pentagon',
    path: 'M 100 18 L 176 74 L 148 184 L 52 184 L 24 74 Z',
    innerPath: 'M 100 29 L 166 78 L 141 175 L 59 175 L 34 78 Z',
    centerY: 110,
    iconScale: 0.88,
  },
  {
    id: 'laurel-medallion',
    name: 'Scalloped Medallion',
    path: 'M 100 20 Q 124 20 138 34 Q 158 34 166 54 Q 184 68 180 92 Q 190 114 176 134 Q 178 158 158 168 Q 144 188 122 184 Q 100 200 78 184 Q 56 188 42 168 Q 22 158 24 134 Q 10 114 20 92 Q 16 68 34 54 Q 42 34 62 34 Q 76 20 100 20 Z',
    innerPath: 'M 100 34 A 72 72 0 1 1 99.9 34 Z',
    centerY: 106,
    iconScale: 0.86,
  },
  {
    id: 'blade-chevron',
    name: 'Stealth Blade',
    path: 'M 20 26 L 100 44 L 180 26 L 164 132 L 100 202 L 36 132 Z',
    innerPath: 'M 31 36 L 100 52 L 169 36 L 155 128 L 100 189 L 45 128 Z',
    centerY: 112,
    iconScale: 0.84,
  },
  {
    id: 'scroll-escutcheon',
    name: 'Tudor Shield',
    path: 'M 28 24 L 172 24 L 172 96 Q 172 160 100 198 Q 28 160 28 96 Z',
    innerPath: 'M 37 33 L 163 33 L 163 95 Q 163 152 100 187 Q 37 152 37 95 Z',
    centerY: 100,
    iconScale: 0.9,
  },
  {
    id: 'fortress-battlement',
    name: 'Citadel Battlement',
    path: 'M 30 22 L 58 22 L 58 34 L 84 34 L 84 22 L 116 22 L 116 34 L 142 34 L 142 22 L 170 22 L 170 124 C 170 166 100 198 100 198 C 100 198 30 166 30 124 Z',
    innerPath: 'M 39 42 L 161 42 L 161 122 C 161 158 100 187 100 187 C 100 187 39 158 39 122 Z',
    centerY: 108,
    iconScale: 0.86,
  },
];

export function getShieldById(id: string): ShieldDefinition {
  return SHIELDS.find((s) => s.id === id) ?? SHIELDS[0];
}
