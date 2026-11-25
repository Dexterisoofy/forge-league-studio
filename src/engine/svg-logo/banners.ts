import { getContrastColor } from './palettes';

export interface BannerDefinition {
  id: string;
  name: string;
  render: (text: string, primary: string, secondary: string, trim: string) => string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 6 monogram & ribbon banner styles with automatic WCAG contrast text coloring.
 */
export const BANNERS: BannerDefinition[] = [
  {
    id: 'ribbon-bottom',
    name: 'Lower Scroll Ribbon',
    render: (rawText, _primary, secondary, trim) => {
      const text = escapeXml(rawText.slice(0, 4).toUpperCase() || 'FL');
      const textColor = getContrastColor(secondary);
      return `
        <g>
          <polygon points="24,162 42,156 42,182 24,176 31,169" fill="${trim}" />
          <polygon points="176,162 158,156 158,182 176,176 169,169" fill="${trim}" />
          <path d="M 38 153 Q 100 163 162 153 L 162 183 Q 100 193 38 183 Z" fill="${secondary}" stroke="${trim}" stroke-width="2.5" stroke-linejoin="round" />
          <text x="100" y="176" text-anchor="middle" font-family="'Barlow Condensed', Impact, Arial, sans-serif" font-weight="800" font-size="22" letter-spacing="3" fill="${textColor}">${text}</text>
        </g>
      `;
    },
  },
  {
    id: 'ribbon-top',
    name: 'Header Crest Banner',
    render: (rawText, _primary, secondary, trim) => {
      const text = escapeXml(rawText.slice(0, 4).toUpperCase() || 'FL');
      const textColor = getContrastColor(secondary);
      return `
        <g>
          <path d="M 42 26 Q 100 18 158 26 L 154 52 Q 100 44 46 52 Z" fill="${secondary}" stroke="${trim}" stroke-width="2.4" stroke-linejoin="round" />
          <text x="100" y="43" text-anchor="middle" font-family="'Barlow Condensed', Impact, Arial, sans-serif" font-weight="800" font-size="18" letter-spacing="3" fill="${textColor}">${text}</text>
        </g>
      `;
    },
  },
  {
    id: 'center-monogram',
    name: 'Bold Monogram Stamp',
    render: (rawText, primary, secondary, trim) => {
      const text = escapeXml(rawText.slice(0, 3).toUpperCase() || 'FL');
      const textColor = getContrastColor(primary);
      return `
        <g>
          <rect x="64" y="142" width="72" height="28" rx="6" fill="${primary}" stroke="${trim}" stroke-width="2.2" />
          <rect x="67" y="145" width="66" height="22" rx="4" fill="none" stroke="${secondary}" stroke-width="1" opacity="0.6" />
          <text x="100" y="162" text-anchor="middle" font-family="'Barlow Condensed', Impact, Arial, sans-serif" font-weight="800" font-size="19" letter-spacing="2.5" fill="${textColor}">${text}</text>
        </g>
      `;
    },
  },
  {
    id: 'shield-header',
    name: 'Arc Header Plate',
    render: (rawText, _primary, secondary, trim) => {
      const text = escapeXml(rawText.slice(0, 4).toUpperCase() || 'FL');
      const textColor = getContrastColor(trim);
      return `
        <g>
          <rect x="56" y="34" width="88" height="22" rx="11" fill="${trim}" stroke="${secondary}" stroke-width="2" />
          <text x="100" y="50" text-anchor="middle" font-family="'Barlow Condensed', Impact, Arial, sans-serif" font-weight="800" font-size="15" letter-spacing="2.5" fill="${textColor}">${text}</text>
        </g>
      `;
    },
  },
  {
    id: 'bottom-pill',
    name: 'Bottom Championship Pill',
    render: (rawText, _primary, secondary, trim) => {
      const text = escapeXml(rawText.slice(0, 4).toUpperCase() || 'FL');
      const textColor = getContrastColor(trim);
      return `
        <g>
          <rect x="52" y="158" width="96" height="26" rx="13" fill="${trim}" stroke="${secondary}" stroke-width="2.4" />
          <text x="100" y="177" text-anchor="middle" font-family="'Barlow Condensed', Impact, Arial, sans-serif" font-weight="800" font-size="18" letter-spacing="2.8" fill="${textColor}">${text}</text>
        </g>
      `;
    },
  },
  {
    id: 'corner-stamp',
    name: 'Compact Seal Tag',
    render: (rawText, _primary, secondary, trim) => {
      const text = escapeXml(rawText.slice(0, 3).toUpperCase() || 'FL');
      const textColor = getContrastColor(secondary);
      return `
        <g>
          <polygon points="74,158 126,158 118,184 82,184" fill="${secondary}" stroke="${trim}" stroke-width="2.2" stroke-linejoin="round" />
          <text x="100" y="176" text-anchor="middle" font-family="'Barlow Condensed', Impact, Arial, sans-serif" font-weight="800" font-size="16" letter-spacing="2" fill="${textColor}">${text}</text>
        </g>
      `;
    },
  },
];

export function getBannerById(id: string): BannerDefinition {
  return BANNERS.find((b) => b.id === id) ?? BANNERS[0];
}
