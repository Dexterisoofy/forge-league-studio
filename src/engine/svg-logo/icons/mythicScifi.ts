import { mirrorX, starPolygon, type IconDefinition } from './helpers';

export const MYTHIC_SCIFI_ICONS: IconDefinition[] = [
  {
    id: 'knight-helm',
    name: 'Iron Knight',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M30 28 Q50 12 70 28 L76 66 L50 88 L24 66 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 18 L50 86" stroke="${c.accent}" stroke-width="4"/>
      <polygon points="30,44 70,44 66,52 34,52" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      ${mirrorX(`<line x1="36" y1="62" x2="44" y2="62" stroke="${c.accent}" stroke-width="3"/><line x1="38" y1="70" x2="44" y2="70" stroke="${c.accent}" stroke-width="3"/>`)}
    `,
  },
  {
    id: 'spartan',
    name: 'Spartan Crest',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M26 30 Q50 6 74 30 L78 44 L64 40 Q50 22 36 40 L22 44 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      <path d="M32 34 L68 34 L72 64 L50 88 L28 64 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="38,48 62,48 62,56 54,56 54,78 46,78 46,56 38,56" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'viking',
    name: 'Norse Viking',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<path d="M28 40 C12 36 10 18 22 12 C20 24 24 30 34 32" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>`)}
      <path d="M30 34 Q50 18 70 34 L72 64 L50 86 L28 64 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="30" y="44" width="40" height="8" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <path d="M34 58 L50 82 L66 58 Z" fill="${c.accent}"/>
    `,
  },
  {
    id: 'titan',
    name: 'Colossus Titan',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <polygon points="24,22 76,22 82,58 64,86 36,86 18,58" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="30,34 70,34 66,46 34,46" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      ${mirrorX(`<rect x="36" y="38" width="10" height="5" fill="${c.contrast}"/>`)}
      <rect x="38" y="60" width="24" height="16" rx="2" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'wizard',
    name: 'Arcane Wizard',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <polygon points="50,10 68,46 32,46" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.8" stroke-linejoin="round"/>
      <ellipse cx="50" cy="46" rx="34" ry="8" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.8"/>
      <polygon points="32,52 68,52 50,88" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="${starPolygon(50, 28, 5, 6, 2.5)}" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'reaper',
    name: 'Grim Reaper',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M22 44 C22 18 78 18 78 44 L84 82 L50 72 L16 82 Z" fill="${c.stroke}" stroke="${c.accent}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="50" cy="46" rx="16" ry="20" fill="${c.contrast}"/>
      ${mirrorX(`<polygon points="40,42 47,46 41,50" fill="${c.accent}"/>`)}
      <path d="M18 76 C28 24 72 16 88 22" fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: 'robot',
    name: 'Apex Bot',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <line x1="50" y1="10" x2="50" y2="24" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="10" r="4" fill="${c.contrast}"/>
      <rect x="24" y="24" width="52" height="54" rx="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      <rect x="32" y="38" width="36" height="14" rx="5" fill="${c.stroke}"/>
      ${mirrorX(`<circle cx="40" cy="45" r="4" fill="${c.accent}"/>`)}
      <rect x="36" y="60" width="28" height="8" rx="3" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'rocket',
    name: 'Orbital Rocket',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<polygon points="36,56 20,76 36,72" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`)}
      <path d="M50 12 C64 26 68 48 64 72 L36 72 C32 48 36 26 50 12 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="50" cy="42" r="8" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      <polygon points="42,74 58,74 50,92" fill="${c.accent}"/>
    `,
  },
  {
    id: 'ufo',
    name: 'Cosmic Saucer',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <polygon points="38,58 62,58 76,88 24,88" fill="${c.accent}" opacity="0.45"/>
      <path d="M32 44 C32 24 68 24 68 44 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.8"/>
      <ellipse cx="50" cy="48" rx="38" ry="12" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      <circle cx="30" cy="48" r="3" fill="${c.accent}"/>
      <circle cx="50" cy="50" r="3.5" fill="${c.accent}"/>
      <circle cx="70" cy="48" r="3" fill="${c.accent}"/>
    `,
  },
  {
    id: 'skull',
    name: 'Outlaw Skull',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M24 44 C24 20 76 20 76 44 C76 58 66 64 64 76 L36 76 C34 64 24 58 24 44 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="38" cy="46" r="7" fill="${c.stroke}"/>`)}
      <polygon points="46,58 54,58 50,50" fill="${c.stroke}"/>
      <line x1="42" y1="68" x2="42" y2="76" stroke="${c.stroke}" stroke-width="2.5"/>
      <line x1="50" y1="68" x2="50" y2="76" stroke="${c.stroke}" stroke-width="2.5"/>
      <line x1="58" y1="68" x2="58" y2="76" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'valkyrie',
    name: 'Winged Valkyrie',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<path d="M34 38 L10 18 L16 42 L28 50 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`)}
      <path d="M34 34 Q50 16 66 34 L66 68 L50 86 L34 68 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="38,48 62,48 50,72" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'samurai',
    name: 'Shogun Samurai',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<path d="M46 28 L22 10 L34 32 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>`)}
      <path d="M22 46 Q50 22 78 46 L82 60 L18 60 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="32,60 68,60 60,84 40,84" fill="${c.stroke}"/>
      ${mirrorX(`<line x1="38" y1="68" x2="46" y2="68" stroke="${c.accent}" stroke-width="2.5"/>`)}
    `,
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <circle cx="50" cy="50" r="30" fill="${c.stroke}" stroke="${c.accent}" stroke-width="3"/>
      <rect x="24" y="38" width="52" height="14" rx="4" fill="${c.contrast}"/>
      ${mirrorX(`<polygon points="32,42 45,45 35,48" fill="${c.stroke}"/>`)}
      <path d="M74 34 L88 26 L84 40 Z" fill="${c.accent}"/>
    `,
  },
  {
    id: 'centurion',
    name: 'Roman Centurion',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M20 26 Q50 4 80 26 L74 36 Q50 20 26 36 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      <path d="M32 34 L68 34 L72 64 L50 86 L28 64 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<rect x="28" y="48" width="12" height="22" rx="3" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>`)}
    `,
  },
  {
    id: 'minotaur',
    name: 'Iron Minotaur',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<path d="M32 36 C12 30 12 10 28 12 C24 22 28 28 36 30" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>`)}
      <polygon points="32,32 68,32 74,60 58,84 42,84 26,60" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="36,46 46,50 38,54" fill="${c.accent}"/>`)}
      <circle cx="50" cy="80" r="7" fill="none" stroke="${c.accent}" stroke-width="3.5"/>
    `,
  },
  {
    id: 'pegasus',
    name: 'Winged Pegasus',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M16 48 L48 22 L38 44 L14 60 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M36 82 L42 48 L34 32 L54 18 L72 28 L84 52 L70 60 L54 50 L56 82 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="60" cy="30" r="3" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'cerberus',
    name: 'Tri-Head Cerberus',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<polygon points="24,26 36,36 36,62 20,58" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`)}
      <polygon points="36,24 64,24 68,64 50,86 32,64" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="42" cy="44" r="3" fill="${c.contrast}"/>`)}
      <polygon points="44,62 56,62 50,72" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'golem',
    name: 'Stone Golem',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <polygon points="26,20 74,20 84,50 70,84 30,84 16,50" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <polyline points="28,36 44,44 38,62" fill="none" stroke="${c.stroke}" stroke-width="3"/>
      ${mirrorX(`<polygon points="32,46 44,48 40,54 32,52" fill="${c.accent}"/>`)}
      <rect x="38" y="68" width="24" height="8" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'cyborg',
    name: 'Cyber Visor',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M28 24 Q50 14 72 24 L76 62 L50 86 L24 62 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="24,40 76,40 70,56 30,56" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="34" y1="48" x2="66" y2="48" stroke="${c.contrast}" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'astronaut',
    name: 'Star Voyager',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <circle cx="50" cy="48" r="30" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3.5"/>
      <ellipse cx="50" cy="48" rx="20" ry="16" fill="${c.stroke}" stroke="${c.accent}" stroke-width="2.5"/>
      <path d="M36 42 Q44 36 56 40" fill="none" stroke="${c.accent}" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'mech-head',
    name: 'Vanguard Mech',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<polygon points="34,36 16,14 26,44" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.2" stroke-linejoin="round"/>`)}
      <polygon points="30,28 70,28 74,64 50,86 26,64" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="34,48 46,52 36,56" fill="${c.accent}"/>`)}
      <polygon points="46,18 54,18 50,36" fill="${c.accent}"/>
    `,
  },
  {
    id: 'alien',
    name: 'Xenon Invader',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M22 36 C22 14 78 14 78 36 C78 60 60 86 50 86 C40 86 22 60 22 36 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      ${mirrorX(`<ellipse cx="37" cy="48" rx="8" ry="12" transform="rotate(-24 37 48)" fill="${c.stroke}" stroke="${c.accent}" stroke-width="2"/>`)}
    `,
  },
  {
    id: 'phantom',
    name: 'Shadow Phantom',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M26 48 C26 20 74 20 74 48 L76 84 L62 74 L50 86 L38 74 L24 84 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="40" cy="46" r="5" fill="${c.accent}"/>`)}
      <ellipse cx="50" cy="62" rx="6" ry="8" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'gladiator',
    name: 'Arena Gladiator',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M26 42 Q50 14 74 42 L76 74 L50 88 L24 74 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="46" y="14" width="8" height="22" rx="3" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      ${mirrorX(`<circle cx="39" cy="54" r="3" fill="${c.contrast}"/><circle cx="39" cy="64" r="3" fill="${c.contrast}"/>`)}
    `,
  },
  {
    id: 'jester',
    name: 'Wildcard Jester',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      <path d="M16 24 Q34 18 42 42 L50 14 L58 42 Q66 18 84 24 L74 52 L26 52 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="30,52 70,52 50,86" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="16" cy="24" r="4.5" fill="${c.contrast}"/>
      <circle cx="50" cy="14" r="4.5" fill="${c.contrast}"/>
      <circle cx="84" cy="24" r="4.5" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'oni-mask',
    name: 'Oni Guardian',
    category: 'Mythic, Sci-Fi & Power',
    render: (c) => `
      ${mirrorX(`<polygon points="32,30 22,12 40,24" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.2" stroke-linejoin="round"/>`)}
      <path d="M24 30 L76 30 L80 62 L62 84 L38 84 L20 62 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="32,44 44,48 34,54" fill="${c.accent}"/><polygon points="36,72 40,60 44,72" fill="${c.contrast}"/>`)}
    `,
  },
];
