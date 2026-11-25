import type { JerseySilhouette } from '../../types';

/**
 * Renders a crisp pure-SVG jersey / uniform silhouette colored in the team's 3-color palette.
 */
export function buildJerseySvgString(
  silhouette: JerseySilhouette,
  primary: string,
  secondary: string,
  trim: string,
  numberText = '10'
): string {
  const num = numberText.slice(0, 2) || '10';
  const textFill = trim;

  switch (silhouette) {
    case 'basketball-tank':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M26 14 L38 14 Q50 28 62 14 L74 14 L78 36 Q72 44 74 52 L76 88 L24 88 L26 52 Q28 44 22 36 Z" fill="${primary}" stroke="${trim}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M38 14 Q50 28 62 14" fill="none" stroke="${secondary}" stroke-width="4"/>
        <rect x="25" y="78" width="50" height="5" fill="${secondary}"/>
        <text x="50" y="61" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="26" fill="${textFill}">${num}</text>
      </svg>`;
    case 'football-pads':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M10 34 L28 16 L40 16 Q50 26 60 16 L72 16 L90 34 L82 52 L72 46 L72 88 L28 88 L28 46 L18 52 Z" fill="${primary}" stroke="${trim}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M16 32 L26 44 M84 32 L74 44" stroke="${secondary}" stroke-width="5"/>
        <text x="50" y="64" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="26" fill="${textFill}">${num}</text>
      </svg>`;
    case 'hockey-sweater':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M8 44 L26 18 L40 16 Q50 24 60 16 L74 18 L92 44 L82 56 L72 46 L72 88 L28 88 L28 46 L18 56 Z" fill="${primary}" stroke="${trim}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="28" y="72" width="44" height="8" fill="${secondary}"/>
        <rect x="28" y="81" width="44" height="4" fill="${trim}"/>
        <text x="50" y="60" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="25" fill="${textFill}">${num}</text>
      </svg>`;
    case 'baseball-button':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M14 34 L28 18 L42 16 Q50 26 58 16 L72 18 L86 34 L76 48 L70 42 L70 88 L30 88 L30 42 L24 48 Z" fill="${primary}" stroke="${trim}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="50" y1="22" x2="50" y2="88" stroke="${secondary}" stroke-width="2.5"/>
        <text x="50" y="62" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="24" fill="${textFill}">${num}</text>
      </svg>`;
    case 'esports-hoodie':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M12 42 L28 20 L38 12 Q50 8 62 12 L72 20 L88 42 L78 52 L70 42 L70 88 L30 88 L30 42 L22 52 Z" fill="${primary}" stroke="${trim}" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="30,42 50,56 70,42 70,60 50,72 30,60" fill="${secondary}" opacity="0.85"/>
        <text x="50" y="62" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="22" fill="${textFill}">${num}</text>
      </svg>`;
    case 'rugby-collar':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M14 34 L28 18 L72 18 L86 34 L76 48 L70 42 L70 88 L30 88 L30 42 L24 48 Z" fill="${primary}" stroke="${trim}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="30" y="42" width="40" height="14" fill="${secondary}"/>
        <polygon points="38,16 50,26 62,16 58,22 50,28 42,22" fill="${trim}"/>
        <text x="50" y="76" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="22" fill="${textFill}">${num}</text>
      </svg>`;
    case 'volleyball-jersey':
    case 'soccer-kit':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M14 34 L28 18 L40 16 Q50 26 60 16 L72 18 L86 34 L76 48 L70 42 L70 88 L30 88 L30 42 L24 48 Z" fill="${primary}" stroke="${trim}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M30 18 L42 18 L30 88 Z" fill="${secondary}" opacity="0.45"/>
        <text x="50" y="62" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="24" fill="${textFill}">${num}</text>
      </svg>`;
  }
}
