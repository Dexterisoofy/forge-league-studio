export type TrophyStyle = 'classic-cup' | 'shield-plate' | 'crown-chalice' | 'star-obelisk';

export const TROPHY_STYLES: { id: TrophyStyle; name: string }[] = [
  { id: 'classic-cup', name: 'Champions Cup' },
  { id: 'shield-plate', name: 'League Shield' },
  { id: 'crown-chalice', name: 'Sovereign Chalice' },
  { id: 'star-obelisk', name: 'Apex Obelisk' },
];

export function buildTrophySvgString(
  style: TrophyStyle,
  accentColor = '#f59e0b'
): string {
  const base = `<rect x="20" y="52" width="24" height="6" rx="2" fill="#334155" stroke="${accentColor}" stroke-width="1.5"/>
    <rect x="16" y="57" width="32" height="4" rx="1.5" fill="#1e293b" stroke="${accentColor}" stroke-width="1.2"/>`;

  switch (style) {
    case 'shield-plate':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
        <circle cx="32" cy="30" r="22" fill="#1e293b" stroke="${accentColor}" stroke-width="3"/>
        <circle cx="32" cy="30" r="15" fill="${accentColor}" opacity="0.22" stroke="${accentColor}" stroke-width="1.5"/>
        <polygon points="32,16 36,26 46,27 38,34 40,44 32,39 24,44 26,34 18,27 28,26" fill="${accentColor}"/>
        ${base}
      </svg>`;
    case 'crown-chalice':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
        <path d="M16 14 L24 26 L32 10 L40 26 L48 14 L44 38 Q32 46 20 38 Z" fill="${accentColor}" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
        <rect x="29" y="40" width="6" height="12" fill="${accentColor}"/>
        <circle cx="32" cy="27" r="4" fill="#ffffff" opacity="0.85"/>
        ${base}
      </svg>`;
    case 'star-obelisk':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
        <polygon points="32,6 42,22 39,52 25,52 22,22" fill="${accentColor}" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="32,14 35,23 43,23 36,28 39,36 32,31 25,36 28,28 21,23 29,23" fill="#0f172a" opacity="0.75"/>
        ${base}
      </svg>`;
    case 'classic-cup':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
        <path d="M18 14 H10 C10 26 15 32 22 32 M46 14 H54 C54 26 49 32 42 32" fill="none" stroke="${accentColor}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M18 10 H46 L43 30 Q32 42 21 30 Z" fill="${accentColor}" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
        <rect x="29" y="36" width="6" height="16" fill="${accentColor}"/>
        <polygon points="32,16 34.5,22 40,22.5 35.8,26 37,31.5 32,28.5 27,31.5 28.2,26 24,22.5 29.5,22" fill="#0f172a" opacity="0.65"/>
        ${base}
      </svg>`;
  }
}
