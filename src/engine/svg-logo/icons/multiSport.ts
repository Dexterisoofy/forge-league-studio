import { mirrorX, type IconDefinition } from './helpers';

export const MULTI_SPORT_ICONS: IconDefinition[] = [
  {
    id: 'soccer-ball',
    name: 'Match Football',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <circle cx="50" cy="50" r="34" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3.5"/>
      <polygon points="50,36 63,45 58,60 42,60 37,45" fill="${c.stroke}"/>
      <polygon points="50,16 58,24 42,24" fill="${c.stroke}"/>
      ${mirrorX(`<polygon points="18,40 28,36 26,48" fill="${c.stroke}"/><polygon points="32,76 42,72 38,82" fill="${c.stroke}"/>`)}
      <path d="M50 36 L50 24 M63 45 L72 40 M37 45 L28 40 M58 60 L62 72 M42 60 L38 72" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'basketball',
    name: 'Hardwood Ball',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <circle cx="50" cy="50" r="34" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3.5"/>
      <line x1="16" y1="50" x2="84" y2="50" stroke="${c.stroke}" stroke-width="3"/>
      <line x1="50" y1="16" x2="50" y2="84" stroke="${c.stroke}" stroke-width="3"/>
      <path d="M26 24 Q44 50 26 76" fill="none" stroke="${c.stroke}" stroke-width="3"/>
      <path d="M74 24 Q56 50 74 76" fill="none" stroke="${c.stroke}" stroke-width="3"/>
    `,
  },
  {
    id: 'football',
    name: 'Gridiron Pigskin',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <g transform="rotate(-30 50 50)">
        <ellipse cx="50" cy="50" rx="36" ry="22" fill="${c.fill}" stroke="${c.stroke}" stroke-width="3.5"/>
        <path d="M22 36 Q30 50 22 64 M78 36 Q70 50 78 64" fill="none" stroke="${c.accent}" stroke-width="4"/>
        <line x1="34" y1="50" x2="66" y2="50" stroke="${c.contrast}" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="40" y1="43" x2="40" y2="57" stroke="${c.contrast}" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="43" x2="50" y2="57" stroke="${c.contrast}" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="43" x2="60" y2="57" stroke="${c.contrast}" stroke-width="3" stroke-linecap="round"/>
      </g>
    `,
  },
  {
    id: 'hockey-sticks',
    name: 'Crossed Sticks',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 18 L68 74 L84 74" fill="none" stroke="${c.accent}" stroke-width="7"/>
        <path d="M78 18 L32 74 L16 74" fill="none" stroke="${c.contrast}" stroke-width="7"/>
        <ellipse cx="50" cy="80" rx="14" ry="6" fill="${c.stroke}" stroke="${c.accent}" stroke-width="2"/>
      </g>
    `,
  },
  {
    id: 'baseball-diamond',
    name: 'Diamond Slugger',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <polygon points="50,16 84,50 50,84 16,50" fill="${c.fill}" stroke="${c.accent}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="46" y="72" width="8" height="8" fill="${c.contrast}"/>
      <rect x="72" y="46" width="8" height="8" fill="${c.contrast}"/>
      <rect x="20" y="46" width="8" height="8" fill="${c.contrast}"/>
      <rect x="46" y="20" width="8" height="8" fill="${c.contrast}"/>
      <circle cx="50" cy="50" r="10" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'volleyball',
    name: 'Volley Spike',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <circle cx="50" cy="50" r="34" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3.5"/>
      <path d="M50 50 Q48 28 66 19 M50 50 Q28 40 21 62 M50 50 Q70 58 76 74" fill="none" stroke="${c.stroke}" stroke-width="3"/>
      <path d="M28 24 Q48 34 50 50 M18 46 Q34 52 44 68 M60 82 Q60 64 50 50" fill="none" stroke="${c.accent}" stroke-width="3.5"/>
    `,
  },
  {
    id: 'crossed-bats',
    name: 'Crossed Bats',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      ${mirrorX(`<path d="M20 76 L72 16 L80 24 L26 82 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`)}
      <circle cx="50" cy="24" r="10" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'hockey-puck',
    name: 'Slapshot Puck',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <ellipse cx="50" cy="60" rx="30" ry="12" fill="${c.stroke}" stroke="${c.accent}" stroke-width="3"/>
      <path d="M20 48 L20 60 A30 12 0 0 0 80 60 L80 48 Z" fill="${c.stroke}" stroke="${c.accent}" stroke-width="2.5"/>
      <ellipse cx="50" cy="48" rx="30" ry="12" fill="${c.fill}" stroke="${c.contrast}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'checkered-flag',
    name: 'Grand Prix Flag',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <line x1="22" y1="16" x2="22" y2="86" stroke="${c.accent}" stroke-width="5" stroke-linecap="round"/>
      <rect x="26" y="18" width="56" height="38" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
      <rect x="26" y="18" width="14" height="12.5" fill="${c.stroke}"/>
      <rect x="54" y="18" width="14" height="12.5" fill="${c.stroke}"/>
      <rect x="40" y="30.5" width="14" height="12.5" fill="${c.stroke}"/>
      <rect x="68" y="30.5" width="14" height="12.5" fill="${c.stroke}"/>
      <rect x="26" y="43" width="14" height="13" fill="${c.stroke}"/>
      <rect x="54" y="43" width="14" height="13" fill="${c.stroke}"/>
    `,
  },
  {
    id: 'barbell',
    name: 'Iron Barbell',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <line x1="12" y1="50" x2="88" y2="50" stroke="${c.contrast}" stroke-width="6" stroke-linecap="round"/>
      ${mirrorX(`<rect x="16" y="34" width="8" height="32" rx="2" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/><rect x="25" y="28" width="9" height="44" rx="2" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>`)}
    `,
  },
  {
    id: 'boxing-glove',
    name: 'Knockout Glove',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <path d="M26 40 C22 22 40 14 58 18 C74 22 80 38 74 56 L66 66 L34 66 L26 52 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 44 C18 46 18 58 28 58 L36 58" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
      <rect x="34" y="66" width="32" height="16" rx="3" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'tennis-racket',
    name: 'Ace Racquet',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <g transform="rotate(35 50 50)">
        <ellipse cx="50" cy="36" rx="20" ry="25" fill="none" stroke="${c.accent}" stroke-width="5"/>
        <line x1="36" y1="24" x2="64" y2="24" stroke="${c.contrast}" stroke-width="1.5"/>
        <line x1="32" y1="36" x2="68" y2="36" stroke="${c.contrast}" stroke-width="1.5"/>
        <line x1="36" y1="48" x2="64" y2="48" stroke="${c.contrast}" stroke-width="1.5"/>
        <line x1="43" y1="14" x2="43" y2="58" stroke="${c.contrast}" stroke-width="1.5"/>
        <line x1="57" y1="14" x2="57" y2="58" stroke="${c.contrast}" stroke-width="1.5"/>
        <line x1="50" y1="61" x2="50" y2="88" stroke="${c.fill}" stroke-width="7" stroke-linecap="round"/>
      </g>
    `,
  },
  {
    id: 'golf-flag',
    name: 'Fairway Pin',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <ellipse cx="50" cy="76" rx="28" ry="10" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2.5"/>
      <ellipse cx="50" cy="76" rx="7" ry="3" fill="${c.stroke}"/>
      <line x1="50" y1="16" x2="50" y2="76" stroke="${c.contrast}" stroke-width="4" stroke-linecap="round"/>
      <polygon points="50,16 82,28 50,40" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'bowling-pins',
    name: 'Kingpin Strike',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      ${mirrorX(`<path d="M26 24 C26 18 34 18 34 24 L36 44 L40 76 H20 L24 44 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>`)}
      <path d="M44 20 C44 12 56 12 56 20 L58 46 L62 82 H38 L42 46 Z" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.5"/>
      <rect x="43" y="32" width="14" height="5" fill="${c.accent}"/>
    `,
  },
  {
    id: 'rugby-ball',
    name: 'Scrum Rugby',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <g transform="rotate(-35 50 50)">
        <ellipse cx="50" cy="50" rx="36" ry="20" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3.5"/>
        <path d="M24 38 V62 M76 38 V62" stroke="${c.accent}" stroke-width="5"/>
        <line x1="36" y1="50" x2="64" y2="50" stroke="${c.stroke}" stroke-width="3"/>
      </g>
    `,
  },
  {
    id: 'lacrosse-sticks',
    name: 'Lacrosse Sticks',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      ${mirrorX(`<line x1="22" y1="84" x2="68" y2="26" stroke="${c.accent}" stroke-width="5" stroke-linecap="round"/><ellipse cx="72" cy="22" rx="9" ry="13" transform="rotate(38 72 22)" fill="none" stroke="${c.contrast}" stroke-width="3.5"/>`)}
      <circle cx="50" cy="70" r="8" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'cricket-bat',
    name: 'Wicket Bat',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <g transform="rotate(35 50 50)">
        <rect x="46" y="14" width="8" height="22" rx="3" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
        <rect x="40" y="36" width="20" height="48" rx="3" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3"/>
      </g>
      <circle cx="30" cy="30" r="9" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2.5"/>
    `,
  },
  {
    id: 'shuttlecock',
    name: 'Smash Shuttle',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <polygon points="38,62 62,62 78,20 22,20" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3" stroke-linejoin="round"/>
      <line x1="36" y1="20" x2="44" y2="62" stroke="${c.stroke}" stroke-width="2"/>
      <line x1="50" y1="20" x2="50" y2="62" stroke="${c.stroke}" stroke-width="2"/>
      <line x1="64" y1="20" x2="56" y2="62" stroke="${c.stroke}" stroke-width="2"/>
      <path d="M38 62 H62 V72 A12 12 0 0 1 38 72 Z" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3"/>
    `,
  },
  {
    id: 'cycling-wheel',
    name: 'Peloton Wheel',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <circle cx="50" cy="50" r="32" fill="none" stroke="${c.contrast}" stroke-width="5"/>
      <circle cx="50" cy="50" r="24" fill="none" stroke="${c.accent}" stroke-width="2.5"/>
      <g stroke="${c.contrast}" stroke-width="2">
        <line x1="50" y1="20" x2="50" y2="80"/>
        <line x1="20" y1="50" x2="80" y2="50"/>
        <line x1="29" y1="29" x2="71" y2="71"/>
        <line x1="71" y1="29" x2="29" y2="71"/>
      </g>
      <circle cx="50" cy="50" r="6" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
    `,
  },
  {
    id: 'rowing-oars',
    name: 'Regatta Oars',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      ${mirrorX(`<line x1="22" y1="20" x2="76" y2="78" stroke="${c.accent}" stroke-width="5" stroke-linecap="round"/><polygon points="66,68 78,64 86,84 74,88" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2.2" stroke-linejoin="round"/>`)}
    `,
  },
  {
    id: 'fencing-foils',
    name: 'Fencing Foils',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      ${mirrorX(`<line x1="24" y1="78" x2="82" y2="18" stroke="${c.contrast}" stroke-width="3.5" stroke-linecap="round"/><path d="M22 64 A12 12 0 0 1 36 78" fill="none" stroke="${c.accent}" stroke-width="5" stroke-linecap="round"/>`)}
    `,
  },
  {
    id: 'archery-target',
    name: 'Bullseye Target',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <circle cx="50" cy="50" r="32" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3"/>
      <circle cx="50" cy="50" r="21" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="50" cy="50" r="10" fill="${c.accent}"/>
      <line x1="50" y1="50" x2="82" y2="18" stroke="${c.stroke}" stroke-width="4" stroke-linecap="round"/>
      <polygon points="74,18 84,16 82,26" fill="${c.accent}"/>
    `,
  },
  {
    id: 'medal-ribbon',
    name: 'Gold Medal',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <polygon points="30,14 44,14 50,42 38,42" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
      <polygon points="70,14 56,14 50,42 62,42" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="50" cy="60" r="22" fill="${c.accent}" stroke="${c.stroke}" stroke-width="3"/>
      <polygon points="50,47 54,56 63,57 56,63 58,72 50,67 42,72 44,63 37,57 46,56" fill="${c.contrast}"/>
    `,
  },
  {
    id: 'whistle',
    name: 'Coach Whistle',
    category: 'Multi-Sport Equipment',
    render: (c) => `
      <circle cx="38" cy="54" r="20" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3"/>
      <rect x="38" y="34" width="44" height="14" rx="4" fill="${c.contrast}" stroke="${c.stroke}" stroke-width="3"/>
      <circle cx="38" cy="54" r="8" fill="${c.accent}" stroke="${c.stroke}" stroke-width="2"/>
      <circle cx="16" cy="54" r="5" fill="none" stroke="${c.accent}" stroke-width="3"/>
    `,
  },
];
