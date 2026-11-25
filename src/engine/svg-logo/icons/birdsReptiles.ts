import { mirrorX, type IconDefinition } from './helpers';

export const BIRDS_REPTILES_ICONS: IconDefinition[] = [
  {
    id: 'eagle',
    name: 'Bald Eagle',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M12 36 L38 24 L50 14 L62 24 L88 36 L74 54 L58 50 L50 86 L42 50 L26 54 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 28 L60 28 L56 48 L50 56 L44 48 Z" fill="${c.contrast}"/>
      <polygon points="44,44 56,44 50,62" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      ${mirrorX(`<circle cx="44" cy="36" r="2.8" fill="${c.stroke}"/>`)}
    `,
  },
  {
    id: 'falcon',
    name: 'Strike Falcon',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M16 18 L50 38 L84 18 L72 52 L50 88 L28 52 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="50,38 66,48 50,76 34,48" fill="${c.accent}"/>
      <polygon points="44,46 56,46 50,62" fill="${c.contrast}"/>
      ${mirrorX(`<line x1="28" y1="36" x2="40" y2="42" stroke="${c.contrast}" stroke-width="3"/>`)}
    `,
  },
  {
    id: 'owl',
    name: 'Night Owl',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M22 18 L40 30 L60 30 L78 18 L76 62 L50 86 L24 62 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="38" cy="46" r="11" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/><circle cx="38" cy="46" r="4.5" fill="${c.contrast}"/>`)}
      <polygon points="45,54 55,54 50,66" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="1.8"/>
    `,
  },
  {
    id: 'raven',
    name: 'Shadow Raven',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M20 44 Q32 14 58 20 L88 32 L64 44 L76 72 L50 86 L26 72 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="58,24 88,32 62,40" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="48" cy="34" r="4" fill="${c.contrast}"/>
      <path d="M30 56 L46 66 L32 72 Z" fill="${c.accent}"/>
    `,
  },
  {
    id: 'phoenix',
    name: 'Solar Phoenix',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M50 10 L58 28 L86 22 L72 46 L88 60 L60 66 L50 90 L40 66 L12 60 L28 46 L14 22 L42 28 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M50 24 L62 48 L50 76 L38 48 Z" fill="${c.accent}"/>
      <circle cx="50" cy="42" r="5" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'cobra',
    name: 'King Cobra',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M50 12 C74 12 84 34 74 56 L62 72 L68 88 L32 88 L38 72 L26 56 C16 34 26 12 50 12 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 30 L60 30 L56 64 L44 64 Z" fill="${c.accent}"/>
      ${mirrorX(`<circle cx="42" cy="26" r="3.5" fill="${c.contrast}"/>`)}
      <path d="M50 38 L50 52 L45 58 M50 52 L55 58" fill="none" stroke="${c.contrast}" stroke-width="2.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'scorpion',
    name: 'Desert Scorpion',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M50 86 L50 36 C50 20 68 14 76 24 C80 30 74 36 68 32" fill="none" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>
      <polygon points="68,32 76,22 82,30" fill="${c.contrast}"/>
      <ellipse cx="50" cy="60" rx="14" ry="20" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      ${mirrorX(`<path d="M36 52 L16 36 L22 24 L30 34" fill="none" stroke="${c.fill}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 64 L18 72 M38 72 L22 84" stroke="${c.stroke}" stroke-width="3" stroke-linecap="round"/>`)}
    `,
  },
  {
    id: 'dragon',
    name: 'Wyvern Dragon',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M18 18 L38 28 L50 14 L62 28 L82 18 L76 48 L88 58 L64 70 L50 88 L36 70 L12 58 L24 48 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="50,30 62,56 50,76 38,56" fill="${c.accent}"/>
      ${mirrorX(`<polygon points="32,44 43,50 34,54" fill="${c.contrast}"/>`)}
      <path d="M40 72 L50 84 L60 72" fill="none" stroke="${c.contrast}" stroke-width="3"/>
    `,
  },
  {
    id: 'griffin',
    name: 'Royal Griffin',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M22 20 L40 32 L54 18 L78 30 L68 50 L82 64 L54 84 L28 74 L16 54 L28 40 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M54 42 L84 48 L66 64 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="48" cy="40" r="4" fill="${c.contrast}"/>
      <path d="M18 22 L34 36 M22 34 L34 42" stroke="${c.accent}" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'hawk',
    name: 'War Hawk',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M14 26 L44 34 L50 16 L56 34 L86 26 L76 58 L50 86 L24 58 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="24,42 42,46 30,54" fill="${c.accent}"/>`)}
      <polygon points="44,48 56,48 50,66" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'osprey',
    name: 'Sea Osprey',
    category: 'Birds & Reptiles',
    render: (c) => `
      ${mirrorX(`<path d="M46 42 L10 24 L18 48 L36 52 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.8" stroke-linejoin="round"/>`)}
      <path d="M42 26 Q50 16 58 26 L58 64 L50 86 L42 64 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.8"/>
      <polygon points="46,42 54,42 50,56" fill="${c.accent}"/>
    `,
  },
  {
    id: 'condor',
    name: 'Andean Condor',
    category: 'Birds & Reptiles',
    render: (c) => `
      ${mirrorX(`<path d="M44 40 L10 18 L14 40 L26 48 L38 56 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.8" stroke-linejoin="round"/>`)}
      <ellipse cx="50" cy="48" rx="12" ry="26" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.8"/>
      <circle cx="50" cy="24" r="7" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      <polygon points="46,28 54,28 50,38" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'vulture',
    name: 'Desert Vulture',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M22 44 Q28 16 52 16 Q72 16 84 36 L68 42 L74 78 L50 88 L26 74 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M62 24 L86 34 L66 42 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <ellipse cx="48" cy="54" rx="16" ry="8" fill="${c.contrast}"/>
      <circle cx="54" cy="30" r="3.5" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'pelican',
    name: 'Bay Pelican',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M22 50 Q26 20 50 20 L88 38 Q74 58 54 54 L64 82 L32 82 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M52 30 L88 38 Q76 54 52 46 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="46" cy="30" r="3.5" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'swan',
    name: 'Royal Swan',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M22 68 Q34 52 54 54 C66 54 68 38 56 32 C46 28 48 16 60 16 C72 16 74 34 68 54 C64 72 48 80 26 78 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="48,22 36,26 48,29" fill="${c.accent}" stroke="${c.stroke}" stroke-width="1.8"/>
      <path d="M26 78 Q50 88 78 78" fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: 'rooster',
    name: 'Fighting Rooster',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M36 24 C36 12 46 10 50 18 C54 10 64 12 62 24 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <path d="M32 30 Q50 20 68 32 L78 68 L50 86 L22 68 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="48,40 68,46 50,54" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="44" cy="38" r="3.5" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'viper',
    name: 'Fang Viper',
    category: 'Birds & Reptiles',
    render: (c) => `
      <polygon points="20,28 50,14 80,28 72,62 50,86 28,62" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="30,38 44,44 34,50" fill="${c.accent}"/><polygon points="38,62 42,84 46,62" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="1.8"/>`)}
    `,
  },
  {
    id: 'gator',
    name: 'Swamp Gator',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M26 20 L74 20 L66 84 L50 90 L34 84 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<rect x="34" y="28" width="10" height="12" rx="4" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/><polygon points="34,64 28,70 36,74" fill="${c.contrast}"/><polygon points="36,74 30,80 38,82" fill="${c.contrast}"/>`)}
      <line x1="50" y1="36" x2="50" y2="84" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'komodo',
    name: 'Komodo Drake',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M30 16 L70 16 L78 52 L60 86 L40 86 L22 52 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="40,30 60,30 54,70 46,70" fill="${c.accent}"/>
      ${mirrorX(`<circle cx="34" cy="38" r="3.5" fill="${c.contrast}"/>`)}
      <path d="M50 78 L50 92 L44 96 M50 92 L56 96" fill="none" stroke="${c.accent}" stroke-width="2.8" stroke-linecap="round"/>
    `,
  },
  {
    id: 'hornet',
    name: 'Stinger Hornet',
    category: 'Birds & Reptiles',
    render: (c) => `
      ${mirrorX(`<path d="M46 42 L14 22 L20 46 L42 52 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`)}
      <ellipse cx="50" cy="30" rx="12" ry="10" fill="${c.stroke}"/>
      <ellipse cx="50" cy="60" rx="14" ry="22" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3"/>
      <line x1="38" y1="54" x2="62" y2="54" stroke="${c.stroke}" stroke-width="4"/>
      <line x1="38" y1="66" x2="62" y2="66" stroke="${c.stroke}" stroke-width="4"/>
      <polygon points="46,82 54,82 50,94" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'wasp',
    name: 'Yellowjacket Wasp',
    category: 'Birds & Reptiles',
    render: (c) => `
      ${mirrorX(`<ellipse cx="30" cy="36" rx="18" ry="8" transform="rotate(-25 30 36)" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/><path d="M42 20 L30 10" stroke="${c.accent}" stroke-width="3" stroke-linecap="round"/>`)}
      <polygon points="50,18 62,38 54,54 64,74 50,92 36,74 46,54 38,38" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.8" stroke-linejoin="round"/>
      <line x1="40" y1="68" x2="60" y2="68" stroke="${c.stroke}" stroke-width="4"/>
    `,
  },
  {
    id: 'mantis',
    name: 'Blade Mantis',
    category: 'Birds & Reptiles',
    render: (c) => `
      <polygon points="28,24 72,24 56,56 44,56" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="32" cy="28" r="7" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/><path d="M44 52 L22 72 L30 86" fill="none" stroke="${c.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><line x1="46" y1="24" x2="36" y2="10" stroke="${c.contrast}" stroke-width="2.5" stroke-linecap="round"/>`)}
    `,
  },
  {
    id: 'tarantula',
    name: 'Black Widow',
    category: 'Birds & Reptiles',
    render: (c) => `
      ${mirrorX(`<path d="M42 42 L20 20 L14 34 M40 48 L14 42 L12 56 M40 54 L16 62 L18 76 M44 60 L26 78 L32 90" fill="none" stroke="${c.stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`)}
      <circle cx="50" cy="40" r="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
      <ellipse cx="50" cy="64" rx="14" ry="18" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      <polygon points="44,56 56,56 50,64 56,72 44,72 50,64" fill="${c.accent}"/>
    `,
  },
  {
    id: 'chameleon',
    name: 'Prism Chameleon',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M18 52 C24 28 46 20 68 28 L86 38 L76 54 L60 52 C56 72 34 80 26 68 C22 62 28 56 34 58" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="68" cy="38" r="7" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      <circle cx="68" cy="38" r="2.5" fill="${c.contrast}"/>
      <polygon points="44,24 52,14 58,24" fill="${c.accent}"/>
    `,
  },
  {
    id: 'rattlesnake',
    name: 'Diamondback Rattler',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M24 72 C16 54 36 48 54 52 C70 56 80 44 74 30 L56 20 L42 30" fill="none" stroke="${c.fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="34,26 52,16 64,26 50,38" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      <circle cx="24" cy="78" r="6" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="20" cy="86" r="4.5" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'thunderbird',
    name: 'Sky Thunderbird',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M10 30 L42 30 L50 14 L58 30 L90 30 L76 48 L64 48 L50 86 L36 48 L24 48 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="50,26 42,50 50,50 46,72 58,46 50,46" fill="${c.accent}"/>
      ${mirrorX(`<line x1="18" y1="38" x2="36" y2="38" stroke="${c.contrast}" stroke-width="3"/>`)}
    `,
  },
  {
    id: 'pterodactyl',
    name: 'Apex Raptor',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M10 26 L44 38 L38 14 L56 34 L90 26 L70 54 L50 84 L30 54 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="44,44 74,48 50,62" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="48" cy="40" r="3" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'kraken',
    name: 'Abyssal Kraken',
    category: 'Birds & Reptiles',
    render: (c) => `
      <path d="M32 48 C28 24 40 12 50 12 C60 12 72 24 68 48 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>
      ${mirrorX(`<path d="M40 50 Q22 64 16 84 M46 52 Q36 72 34 88" fill="none" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/><circle cx="42" cy="38" r="3.5" fill="${c.contrast}"/>`)}
    `,
  },
];
