export interface AccentDefinition {
  id: string;
  name: string;
  renderBehind: (trim: string, secondary: string) => string;
  renderFront: (trim: string, secondary: string, innerPath: string) => string;
}

const STAR_PATH = 'M 0,-9 L 2.6,-3 L 9,-2.2 L 4.2,2.2 L 5.6,8.6 L 0,5.2 L -5.6,8.6 L -4.2,2.2 L -9,-2.2 L -2.6,-3 Z';

/**
 * 8 framing accents rendered around/inside the shield.
 */
export const ACCENTS: AccentDefinition[] = [
  {
    id: 'none',
    name: 'Clean Border',
    renderBehind: () => '',
    renderFront: () => '',
  },
  {
    id: 'double-border',
    name: 'Double Trim',
    renderBehind: () => '',
    renderFront: (trim, _secondary, innerPath) =>
      `<path d="${innerPath}" fill="none" stroke="${trim}" stroke-width="2.6" stroke-dasharray="6 3" opacity="0.9" />`,
  },
  {
    id: 'laurel-wreath',
    name: 'Victory Laurels',
    renderBehind: (trim) => `
      <g fill="${trim}" opacity="0.95">
        <ellipse cx="22" cy="140" rx="10" ry="4.5" transform="rotate(-38 22 140)" />
        <ellipse cx="16" cy="120" rx="10" ry="4.5" transform="rotate(-24 16 120)" />
        <ellipse cx="14" cy="98" rx="10" ry="4.5" transform="rotate(-8 14 98)" />
        <ellipse cx="17" cy="76" rx="10" ry="4.5" transform="rotate(10 17 76)" />
        <ellipse cx="24" cy="56" rx="9.5" ry="4.2" transform="rotate(26 24 56)" />
        <ellipse cx="36" cy="158" rx="9.5" ry="4.2" transform="rotate(-52 36 158)" />

        <ellipse cx="178" cy="140" rx="10" ry="4.5" transform="rotate(38 178 140)" />
        <ellipse cx="184" cy="120" rx="10" ry="4.5" transform="rotate(24 184 120)" />
        <ellipse cx="186" cy="98" rx="10" ry="4.5" transform="rotate(8 186 98)" />
        <ellipse cx="183" cy="76" rx="10" ry="4.5" transform="rotate(-10 183 76)" />
        <ellipse cx="176" cy="56" rx="9.5" ry="4.2" transform="rotate(-26 176 56)" />
        <ellipse cx="164" cy="158" rx="9.5" ry="4.2" transform="rotate(52 164 158)" />
      </g>
    `,
    renderFront: () => '',
  },
  {
    id: 'three-stars-top',
    name: 'Three Championship Stars',
    renderBehind: (trim, secondary) => `
      <g>
        <g transform="translate(72 13) scale(0.9)">
          <path d="${STAR_PATH}" fill="${trim}" stroke="${secondary}" stroke-width="1.4" />
        </g>
        <g transform="translate(100 10) scale(1.15)">
          <path d="${STAR_PATH}" fill="${trim}" stroke="${secondary}" stroke-width="1.4" />
        </g>
        <g transform="translate(128 13) scale(0.9)">
          <path d="${STAR_PATH}" fill="${trim}" stroke="${secondary}" stroke-width="1.4" />
        </g>
      </g>
    `,
    renderFront: () => '',
  },
  {
    id: 'single-star-crown',
    name: 'Apex Star',
    renderBehind: (trim, secondary) => `
      <g transform="translate(100 12) scale(1.3)">
        <path d="${STAR_PATH}" fill="${trim}" stroke="${secondary}" stroke-width="1.5" />
      </g>
    `,
    renderFront: (trim, _secondary, innerPath) =>
      `<path d="${innerPath}" fill="none" stroke="${trim}" stroke-width="2" opacity="0.7" />`,
  },
  {
    id: 'winged-flanks',
    name: 'Winged Flanks',
    renderBehind: (trim, secondary) => `
      <g stroke="${secondary}" stroke-width="1.5" stroke-linejoin="round">
        <path d="M 32 66 L 6 52 L 16 74 L 8 82 L 24 94 L 14 104 L 30 112 Z" fill="${trim}" />
        <path d="M 168 66 L 194 52 L 184 74 L 192 82 L 176 94 L 186 104 L 170 112 Z" fill="${trim}" />
      </g>
    `,
    renderFront: () => '',
  },
  {
    id: 'riveted-frame',
    name: 'Armored Rivets',
    renderBehind: () => '',
    renderFront: (trim, secondary, innerPath) => `
      <path d="${innerPath}" fill="none" stroke="${trim}" stroke-width="2.2" opacity="0.75" />
      <g fill="${trim}" stroke="${secondary}" stroke-width="1">
        <circle cx="48" cy="40" r="3.2" />
        <circle cx="152" cy="40" r="3.2" />
        <circle cx="48" cy="112" r="3.2" />
        <circle cx="152" cy="112" r="3.2" />
        <circle cx="100" cy="178" r="3.4" />
      </g>
    `,
  },
  {
    id: 'rays-halo',
    name: 'Sunburst Halo',
    renderBehind: (trim) => `
      <g stroke="${trim}" stroke-width="3" stroke-linecap="round" opacity="0.8">
        <line x1="100" y1="4" x2="100" y2="18" />
        <line x1="68" y1="9" x2="74" y2="21" />
        <line x1="132" y1="9" x2="126" y2="21" />
        <line x1="12" y1="86" x2="24" y2="90" />
        <line x1="188" y1="86" x2="176" y2="90" />
        <line x1="14" y1="122" x2="26" y2="118" />
        <line x1="186" y1="122" x2="174" y2="118" />
      </g>
    `,
    renderFront: () => '',
  },
];

export function getAccentById(id: string): AccentDefinition {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}
