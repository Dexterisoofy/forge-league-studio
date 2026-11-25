import { mirrorX, type IconDefinition } from './helpers';

export const PREDATORS_MAMMALS_ICONS: IconDefinition[] = [
  {
    id: 'wolf',
    name: 'Timber Wolf',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M50 16 L66 32 L78 14 L82 44 L88 60 L66 76 L50 88 L34 76 L12 60 L18 44 L22 14 L34 32 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="50,36 68,54 50,82 32,54" fill="${c.accent}"/>
      ${mirrorX(`<polygon points="32,44 43,49 35,54" fill="${c.contrast}"/>`)}
      <polygon points="44,64 56,64 50,74" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'lion',
    name: 'Apex Lion',
    category: 'Predators & Mammals',
    render: (c) => `
      <polygon points="50,8 62,18 78,16 80,32 92,44 82,58 86,74 70,78 58,90 50,84 42,90 30,78 14,74 18,58 8,44 20,32 22,16 38,18" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M30 34 L70 34 L74 56 L50 78 L26 56 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="40" cy="48" r="3.5" fill="${c.contrast}"/>`)}
      <polygon points="43,58 57,58 50,68" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'bear',
    name: 'Grizzly Bear',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<circle cx="26" cy="28" r="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3"/>`)}
      <path d="M22 36 Q50 18 78 36 L84 64 L66 84 L34 84 L16 64 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="36,54 64,54 58,76 42,76" fill="${c.accent}"/>
      ${mirrorX(`<circle cx="38" cy="46" r="3.5" fill="${c.contrast}"/>`)}
      <polygon points="44,58 56,58 50,67" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'tiger',
    name: 'Saber Tiger',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M20 22 L38 30 L62 30 L80 22 L84 52 L72 76 L50 88 L28 76 L16 52 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<path d="M22 44 L36 48 L24 56 Z" fill="${c.stroke}"/>`)}
      <polygon points="50,30 45,46 55,46" fill="${c.stroke}"/>
      <polygon points="36,56 64,56 50,80" fill="${c.accent}"/>
      ${mirrorX(`<polygon points="34,44 44,48 36,52" fill="${c.contrast}"/><polygon points="40,70 44,82 47,70" fill="${c.contrast}"/>`)}
    `,
  },
  {
    id: 'panther',
    name: 'Shadow Panther',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M18 18 L38 30 L62 30 L82 18 L86 48 L70 76 L50 88 L30 76 L14 48 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="28,44 44,50 32,54" fill="${c.accent}"/><line x1="20" y1="64" x2="36" y2="62" stroke="${c.contrast}" stroke-width="2.5"/>`)}
      <path d="M36 62 L50 56 L64 62 L58 76 L42 76 Z" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'bull',
    name: 'Charging Bull',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<path d="M12 20 Q10 46 32 42 L34 32 Q22 30 22 14 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>`)}
      <polygon points="30,32 70,32 76,58 60,82 40,82 24,58" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="36,44 45,49 38,53" fill="${c.contrast}"/>`)}
      <circle cx="50" cy="80" r="8" fill="none" stroke="${c.accent}" stroke-width="3.5"/>
    `,
  },
  {
    id: 'ram',
    name: 'Bighorn Ram',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<path d="M36 30 C14 14 6 42 18 56 C24 62 32 58 30 48" fill="none" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>`)}
      <polygon points="34,28 66,28 64,66 50,86 36,66" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="40,48 47,52 40,56" fill="${c.contrast}"/>`)}
      <line x1="50" y1="30" x2="50" y2="76" stroke="${c.accent}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'shark',
    name: 'Mako Shark',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M50 10 L66 36 L88 58 L70 62 L58 88 L50 74 L42 88 L30 62 L12 58 L34 36 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M38 56 Q50 44 62 56 L58 70 L42 70 Z" fill="${c.contrast}"/>
      ${mirrorX(`<polygon points="36,40 45,44 38,48" fill="${c.accent}"/>`)}
      <line x1="42" y1="62" x2="58" y2="62" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'rhino',
    name: 'Armored Rhino',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M18 46 L34 26 L66 26 L84 44 L80 74 L56 84 L28 76 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="46,48 56,14 64,48" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="34,54 42,36 46,56" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      ${mirrorX(`<circle cx="34" cy="46" r="3" fill="${c.contrast}"/>`)}
      <rect x="34" y="68" width="32" height="8" rx="3" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'gorilla',
    name: 'Silverback Gorilla',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M24 38 Q50 10 76 38 L84 62 L68 86 L32 86 L16 62 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M28 46 Q50 38 72 46 L68 78 L32 78 Z" fill="${c.accent}"/>
      ${mirrorX(`<polygon points="34,44 46,48 36,52" fill="${c.contrast}"/><circle cx="44" cy="62" r="2.5" fill="${c.stroke}"/>`)}
      <path d="M36 70 Q50 76 64 70" fill="none" stroke="${c.stroke}" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'fox',
    name: 'Red Fox',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M16 18 L40 32 L60 32 L84 18 L82 54 L50 86 L18 54 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="18,54 44,58 50,86" fill="${c.contrast}"/>
      <polygon points="82,54 56,58 50,86" fill="${c.contrast}"/>
      ${mirrorX(`<polygon points="24,24 36,34 26,38" fill="${c.stroke}"/><circle cx="38" cy="48" r="3.2" fill="${c.stroke}"/>`)}
      <polygon points="45,74 55,74 50,82" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'coyote',
    name: 'Desert Coyote',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M24 12 L42 32 L58 32 L76 12 L78 48 L66 72 L50 88 L34 72 L22 48 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="38,52 62,52 50,82" fill="${c.accent}"/>
      ${mirrorX(`<polygon points="29,22 39,34 28,36" fill="${c.accent}"/><polygon points="33,44 43,48 35,51" fill="${c.contrast}"/>`)}
      <polygon points="45,68 55,68 50,76" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'wild-boar',
    name: 'Razor Boar',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M22 30 Q50 14 78 30 L84 60 L64 82 L36 82 L16 60 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<path d="M28 66 C14 62 12 42 24 38 C20 50 24 58 32 60 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/><circle cx="36" cy="44" r="3.5" fill="${c.accent}"/>`)}
      <ellipse cx="50" cy="64" rx="14" ry="10" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      ${mirrorX(`<circle cx="45" cy="64" r="2.2" fill="${c.stroke}"/>`)}
    `,
  },
  {
    id: 'mustang',
    name: 'Wild Mustang',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M28 84 L32 50 L20 34 L36 18 L54 14 L68 24 L84 52 L72 64 L54 54 L58 84 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 34 L36 18 L50 16 L36 42 Z" fill="${c.accent}"/>
      <polygon points="56,30 64,34 58,38" fill="${c.contrast}"/>
      <path d="M68 26 L78 44 L72 48" fill="none" stroke="${c.accent}" stroke-width="3"/>
    `,
  },
  {
    id: 'stag',
    name: 'Royal Stag',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<path d="M40 32 L26 14 M32 22 L16 24 M36 27 L24 38 M34 18 L34 8" fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/>`)}
      <polygon points="36,34 64,34 62,66 50,88 38,66" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="42" cy="48" r="3" fill="${c.contrast}"/>`)}
      <polygon points="45,74 55,74 50,83" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'honey-badger',
    name: 'Honey Badger',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M20 34 Q50 18 80 34 L82 64 L62 84 L38 84 L18 64 Z" fill="${c.stroke}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 32 Q50 20 76 32 L70 50 L30 50 Z" fill="${c.contrast}"/>
      ${mirrorX(`<polygon points="32,52 44,56 36,60" fill="${c.accent}"/>`)}
      <polygon points="42,66 58,66 50,78" fill="${c.fill}"/>
    `,
  },
  {
    id: 'wolverine',
    name: 'Feral Wolverine',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M16 26 L36 32 L64 32 L84 26 L86 58 L64 84 L36 84 L14 58 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="20,40 42,50 24,58" fill="${c.accent}"/><polygon points="32,45 41,49 34,53" fill="${c.contrast}"/>`)}
      <polygon points="40,68 60,68 50,80" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'cheetah',
    name: 'Sprint Cheetah',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M22 22 L38 30 L62 30 L78 22 L80 54 L64 80 L50 86 L36 80 L20 54 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<path d="M36 46 L42 72" stroke="${c.stroke}" stroke-width="4" stroke-linecap="round"/><circle cx="35" cy="44" r="3.5" fill="${c.contrast}"/><circle cx="28" cy="56" r="2.2" fill="${c.stroke}"/>`)}
      <polygon points="44,64 56,64 50,72" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'jaguar',
    name: 'Jungle Jaguar',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M20 26 Q50 16 80 26 L84 56 L66 82 L50 88 L34 82 L16 56 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="32" cy="36" r="3.5" fill="none" stroke="${c.stroke}" stroke-width="2"/><polygon points="34,48 45,52 36,56" fill="${c.contrast}"/>`)}
      <polygon points="40,64 60,64 50,78" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'bison',
    name: 'Plains Bison',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M18 32 Q50 12 82 32 L86 58 L68 84 L32 84 L14 58 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<path d="M22 36 Q12 24 22 14 Q26 24 30 30 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/><circle cx="36" cy="48" r="3.2" fill="${c.accent}"/>`)}
      <polygon points="38,58 62,58 50,82" fill="${c.accent}"/>
    `,
  },
  {
    id: 'mammoth',
    name: 'Woolly Mammoth',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M24 30 Q50 10 76 30 L80 62 L58 76 L42 76 L20 62 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="44" y="52" width="12" height="36" rx="5" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      ${mirrorX(`<path d="M36 60 C16 66 10 44 20 30" fill="none" stroke="${c.contrast}" stroke-width="6" stroke-linecap="round"/><circle cx="34" cy="42" r="3" fill="${c.contrast}"/>`)}
    `,
  },
  {
    id: 'orca',
    name: 'Apex Orca',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M16 64 Q36 22 68 24 L56 12 L48 24 Q74 28 86 56 Q62 78 34 78 L14 86 L24 70 Z" fill="${c.stroke}" stroke="${c.accent}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="64" cy="44" rx="9" ry="5" transform="rotate(-15 64 44)" fill="${c.contrast}"/>
      <path d="M36 74 Q58 74 78 60 Q60 64 42 66 Z" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'polar-bear',
    name: 'Arctic Bear',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<circle cx="28" cy="26" r="8" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.8"/>`)}
      <path d="M26 32 Q50 18 74 32 L80 62 L62 84 L38 84 L20 62 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="40,54 60,54 56,74 44,74" fill="${c.accent}"/>
      ${mirrorX(`<circle cx="38" cy="44" r="3.2" fill="${c.stroke}"/>`)}
      <polygon points="45,58 55,58 50,66" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'hyena',
    name: 'Spotted Hyena',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<ellipse cx="26" cy="24" rx="8" ry="12" transform="rotate(-15 26 24)" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>`)}
      <path d="M26 32 L74 32 L78 58 L50 86 L22 58 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="36,56 64,56 50,82" fill="${c.accent}"/>
      ${mirrorX(`<circle cx="38" cy="44" r="3.5" fill="${c.contrast}"/><circle cx="30" cy="38" r="2" fill="${c.stroke}"/>`)}
      <polygon points="45,66 55,66 50,74" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'lynx',
    name: 'Tufted Lynx',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M22 10 L40 30 L60 30 L78 10 L76 42 L84 60 L50 84 L16 60 L24 42 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<line x1="22" y1="10" x2="16" y2="4" stroke="${c.accent}" stroke-width="3.5" stroke-linecap="round"/><polygon points="32,44 44,48 36,54" fill="${c.contrast}"/><polygon points="18,60 32,56 26,70" fill="${c.accent}"/>`)}
      <polygon points="44,62 56,62 50,70" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'elk',
    name: 'Timber Elk',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<path d="M40 36 L18 14 M28 24 L12 28 M34 30 L20 40 M24 20 L26 8" fill="none" stroke="${c.contrast}" stroke-width="3.8" stroke-linecap="round"/>`)}
      <path d="M36 34 L64 34 L66 64 L50 88 L34 64 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="42,56 58,56 50,84" fill="${c.accent}"/>
      ${mirrorX(`<circle cx="42" cy="46" r="3" fill="${c.contrast}"/>`)}
    `,
  },
  {
    id: 'cougar',
    name: 'Mountain Cougar',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M20 24 Q34 18 40 30 L60 30 Q66 18 80 24 L82 54 L66 78 L50 86 L34 78 L18 54 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="38,56 62,56 50,78" fill="${c.contrast}"/>
      ${mirrorX(`<polygon points="32,44 43,48 35,52" fill="${c.accent}"/>`)}
      <polygon points="45,62 55,62 50,69" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'hound',
    name: 'Iron Hound',
    category: 'Predators & Mammals',
    render: (c) => `
      ${mirrorX(`<polygon points="22,24 34,30 28,62 14,52" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`)}
      <path d="M32 24 L68 24 L72 60 L50 86 L28 60 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="40" cy="44" r="3.5" fill="${c.contrast}"/>`)}
      <polygon points="42,58 58,58 50,70" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'leopard',
    name: 'Snow Leopard',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M20 26 L38 30 L62 30 L80 26 L82 56 L64 80 L50 86 L36 80 L18 56 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<circle cx="30" cy="40" r="3" fill="${c.accent}"/><circle cx="38" cy="48" r="3.2" fill="${c.stroke}"/>`)}
      <polygon points="42,62 58,62 50,76" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'walrus',
    name: 'Tusker Walrus',
    category: 'Predators & Mammals',
    render: (c) => `
      <path d="M24 30 Q50 14 76 30 L80 62 L50 74 L20 62 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${mirrorX(`<polygon points="34,62 42,62 36,90" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="36" cy="40" r="3.2" fill="${c.accent}"/>`)}
      <ellipse cx="50" cy="56" rx="18" ry="10" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
];
