import { gearPath, mirrorX, starPolygon, type IconDefinition } from './helpers';

export const OBJECTS_ELEMENTS_ICONS: IconDefinition[] = [
  {
    id: 'crown',
    name: 'Sovereign Crown',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M16 32 L34 52 L50 22 L66 52 L84 32 L76 74 L24 74 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="22" y="72" width="56" height="12" rx="3" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
      <circle cx="16" cy="28" r="4.5" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="50" cy="18" r="5" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="84" cy="28" r="4.5" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      <polygon points="50,48 56,58 50,66 44,58" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'crossed-swords',
    name: 'Crossed Blades',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <g stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round">
        ${mirrorX(`<polygon points="20,16 30,16 74,60 66,68 22,24" fill="${c.contrast}"/><line x1="16" y1="68" x2="36" y2="88" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/><line x1="20" y1="78" x2="32" y2="66" stroke="${c.fill}" stroke-width="5" stroke-linecap="round"/>`)}
      </g>
    `,
  },
  {
    id: 'trident',
    name: 'Poseidon Trident',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <line x1="50" y1="14" x2="50" y2="88" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>
      <path d="M24 22 L24 46 Q24 58 50 58 Q76 58 76 46 L76 22" fill="none" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>
      <polygon points="50,10 57,26 43,26" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      ${mirrorX(`<polygon points="24,14 30,28 18,28" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>`)}
    `,
  },
  {
    id: 'anchor',
    name: 'Harbor Anchor',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <circle cx="50" cy="22" r="8" fill="none" stroke="${c.accent}" stroke-width="5"/>
      <line x1="50" y1="30" x2="50" y2="82" stroke="${c.fill}" stroke-width="7" stroke-linecap="round"/>
      <line x1="32" y1="40" x2="68" y2="40" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>
      <path d="M20 58 C22 82 50 86 50 86 C50 86 78 82 80 58" fill="none" stroke="${c.fill}" stroke-width="7" stroke-linecap="round"/>
      ${mirrorX(`<polygon points="16,60 26,52 26,64" fill="${c.contrast}"/>`)}
    `,
  },
  {
    id: 'lightning',
    name: 'Volt Bolt',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <polygon points="58,10 24,54 46,54 38,90 76,44 54,44" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="55,18 32,50 48,50 44,76 68,48 52,48" fill="${c.contrast}" opacity="0.45"/>
    `,
  },
  {
    id: 'flame',
    name: 'Inferno Flame',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M52 12 C68 30 82 44 76 68 C72 82 60 88 50 88 C36 88 24 78 24 62 C24 44 38 36 40 24 C44 30 48 34 50 38 C50 26 52 18 52 12 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 42 C60 54 64 64 60 76 C56 82 50 84 50 84 C42 84 38 76 38 68 C38 58 46 52 50 42 Z" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'comet-star',
    name: 'Nova Comet',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M14 22 L48 44 L40 52 L12 34 Z M20 14 L56 36 L50 42 L14 24 Z" fill="${c.accent}"/>
      <polygon points="${starPolygon(62, 54, 5, 26, 11)}" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'mountain-peak',
    name: 'Alpine Summit',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <polygon points="10,78 40,24 64,78" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="44,78 68,32 90,78" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="40,24 30,42 38,38 44,44 50,38" fill="${c.contrast}"/>
      <polygon points="68,32 60,48 66,44 72,49 77,44" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'tornado',
    name: 'Cyclone Vortex',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <g fill="none" stroke-linecap="round">
        <ellipse cx="50" cy="22" rx="34" ry="8" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3"/>
        <path d="M22 36 Q50 44 78 36" stroke="${c.contrast}" stroke-width="7"/>
        <path d="M28 50 Q50 58 70 50" stroke="${c.accent}" stroke-width="6.5"/>
        <path d="M36 64 Q50 70 62 64" stroke="${c.contrast}" stroke-width="6"/>
        <path d="M44 78 L54 88" stroke="${c.accent}" stroke-width="5.5"/>
      </g>
    `,
  },
  {
    id: 'anvil',
    name: 'Forge Anvil',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M12 32 L78 32 L88 44 L66 50 L66 72 L78 82 L24 82 L36 72 L36 52 L16 42 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="34" y="34" width="38" height="8" fill="${c.accent}"/>
      <polygon points="50,14 54,24 46,24" fill="${c.contrast}"/>
      ${mirrorX(`<polygon points="38,18 44,26 36,28" fill="${c.accent}"/>`)}
    `,
  },
  {
    id: 'battle-axe',
    name: 'Battle Axe',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <line x1="50" y1="14" x2="50" y2="88" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>
      ${mirrorX(`<path d="M48 22 C28 16 14 26 16 42 C18 54 30 58 48 50 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`)}
    `,
  },
  {
    id: 'war-hammer',
    name: 'Forge Hammer',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <line x1="50" y1="16" x2="50" y2="88" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>
      <rect x="18" y="22" width="64" height="28" rx="4" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      <rect x="44" y="20" width="12" height="32" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'shield-emblem',
    name: 'Aegis Shield',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M22 18 L78 18 L78 52 C78 74 50 88 50 88 C50 88 22 74 22 52 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      <path d="M32 28 L68 28 L68 50 C68 66 50 77 50 77 C50 77 32 66 32 50 Z" fill="${c.accent}"/>
      <polygon points="${starPolygon(50, 48, 5, 13, 5.5)}" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'gear-wheel',
    name: 'Iron Cog',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="${gearPath(50, 50, 38, 29, 8)}" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="16" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      <circle cx="50" cy="50" r="7" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'compass-rose',
    name: 'North Compass',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <circle cx="50" cy="50" r="32" fill="none" stroke="${c.accent}" stroke-width="3.5"/>
      <polygon points="50,10 58,42 90,50 58,58 50,90 42,58 10,50 42,42" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="6" fill="${c.accent}"/>
    `,
  },
  {
    id: 'crescent-moon',
    name: 'Lunar Crescent',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M62 16 A 34 34 0 1 0 82 72 A 26 26 0 1 1 62 16 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.8" stroke-linejoin="round"/>
      <polygon points="${starPolygon(64, 42, 5, 11, 4.5)}" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'solar-flare',
    name: 'Helios Sun',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <polygon points="${starPolygon(50, 50, 12, 40, 26)}" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="18" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'snowflake',
    name: 'Arctic Frost',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <g stroke="${c.contrast}" stroke-width="4.5" stroke-linecap="round">
        <line x1="50" y1="12" x2="50" y2="88"/>
        <line x1="17" y1="31" x2="83" y2="69"/>
        <line x1="83" y1="31" x2="17" y2="69"/>
      </g>
      <circle cx="50" cy="50" r="10" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'tsunami-wave',
    name: 'Tidal Wave',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M12 72 C14 36 42 18 66 24 C78 27 80 40 68 42 C56 44 54 34 60 32 C42 32 36 52 54 58 C68 62 78 56 88 54 L88 78 L12 78 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M14 78 Q50 68 86 78" fill="none" stroke="${c.contrast}" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: 'diamond-cut',
    name: 'Apex Diamond',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <polygon points="30,22 70,22 86,44 50,86 14,44" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polyline points="14,44 86,44" stroke="${c.contrast}" stroke-width="2.5"/>
      <polygon points="36,44 64,44 50,86" fill="${c.contrast}" opacity="0.5"/>
      <polygon points="30,22 50,44 70,22" fill="${c.contrast}" opacity="0.35"/>
    `,
  },
  {
    id: 'torch',
    name: 'Olympic Torch',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M50 10 C64 22 66 36 50 44 C34 36 36 22 50 10 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      <polygon points="34,44 66,44 56,56 44,56" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
      <polygon points="44,56 56,56 53,88 47,88" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'cannon',
    name: 'Artillery Cannon',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <polygon points="18,48 78,24 84,38 26,64" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="42" cy="64" r="16" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3"/>
      <circle cx="42" cy="64" r="6" fill="${c.contrast}"/>
      <circle cx="84" cy="22" r="5" fill="${c.accent}"/>
    `,
  },
  {
    id: 'ship-wheel',
    name: 'Helm Wheel',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <g stroke="${c.accent}" stroke-width="5" stroke-linecap="round">
        <line x1="50" y1="12" x2="50" y2="88"/>
        <line x1="12" y1="50" x2="88" y2="50"/>
        <line x1="23" y1="23" x2="77" y2="77"/>
        <line x1="77" y1="23" x2="23" y2="77"/>
      </g>
      <circle cx="50" cy="50" r="24" fill="none" stroke="${c.contrast}" stroke-width="6"/>
      <circle cx="50" cy="50" r="9" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'tower-rook',
    name: 'Citadel Rook',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <path d="M28 18 H38 V26 H45 V18 H55 V26 H62 V18 H72 V34 L66 40 V74 L74 84 H26 L34 74 V40 L28 34 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="44" y="48" width="12" height="18" rx="6" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'meteor',
    name: 'Blazing Meteor',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <polygon points="14,16 58,42 42,58" fill="${c.accent}"/>
      <polygon points="28,12 66,38 56,48" fill="${c.contrast}" opacity="0.7"/>
      <circle cx="60" cy="60" r="18" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      <circle cx="55" cy="56" r="4" fill="${c.accent}"/>
      <circle cx="66" cy="64" r="3" fill="${c.accent}"/>
    `,
  },
  {
    id: 'atom-core',
    name: 'Reactor Atom',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(30 50 50)" fill="none" stroke="${c.accent}" stroke-width="4"/>
      <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(-30 50 50)" fill="none" stroke="${c.contrast}" stroke-width="4"/>
      <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(90 50 50)" fill="none" stroke="${c.accent}" stroke-width="4"/>
      <circle cx="50" cy="50" r="8" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'key-crest',
    name: 'Vault Key',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <circle cx="34" cy="36" r="16" fill="none" stroke="${c.accent}" stroke-width="7"/>
      <circle cx="34" cy="36" r="7" fill="${c.contrast}"/>
      <line x1="46" y1="48" x2="80" y2="82" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>
      <line x1="66" y1="68" x2="76" y2="58" stroke="${c.contrast}" stroke-width="6" stroke-linecap="round"/>
      <line x1="74" y1="76" x2="84" y2="66" stroke="${c.contrast}" stroke-width="6" stroke-linecap="round"/>
    `,
  },
  {
    id: 'hourglass',
    name: 'Tempo Hourglass',
    category: 'Objects, Elements & Weapons',
    render: (c) => `
      <rect x="26" y="14" width="48" height="7" rx="3" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <rect x="26" y="79" width="48" height="7" rx="3" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <polygon points="32,21 68,21 50,50" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
      <polygon points="32,79 68,79 50,50" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
      <polygon points="38,79 62,79 50,62" fill="${c.accent}"/>
    `,
  },
];
