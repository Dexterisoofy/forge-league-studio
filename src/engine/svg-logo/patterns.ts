export interface PatternDefinition {
  id: string;
  name: string;
  render: (primary: string, secondary: string, trim: string) => string;
}

/**
 * 24 crisp background patterns rendered inside the shield's clipPath (0..200 x 0..220).
 */
export const PATTERNS: PatternDefinition[] = [
  {
    id: 'solid',
    name: 'Solid Field',
    render: (primary) => `<rect x="0" y="0" width="200" height="220" fill="${primary}" />`,
  },
  {
    id: 'vertical-split',
    name: 'Vertical Split',
    render: (primary, secondary) => `
      <rect x="0" y="0" width="100" height="220" fill="${primary}" />
      <rect x="100" y="0" width="100" height="220" fill="${secondary}" />
    `,
  },
  {
    id: 'horizontal-split',
    name: 'Horizontal Split',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="106" fill="${primary}" />
      <rect x="0" y="106" width="200" height="114" fill="${secondary}" />
      <rect x="0" y="103" width="200" height="6" fill="${trim}" opacity="0.85" />
    `,
  },
  {
    id: 'diagonal-sash',
    name: 'Diagonal Sash',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <polygon points="-20,175 180,-25 220,15 20,215" fill="${secondary}" />
      <polygon points="-20,175 180,-25 186,-19 -14,181" fill="${trim}" opacity="0.9" />
      <polygon points="14,209 214,9 220,15 20,215" fill="${trim}" opacity="0.9" />
    `,
  },
  {
    id: 'vertical-stripes',
    name: 'Vertical Stripes',
    render: (primary, secondary) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <rect x="20" y="0" width="24" height="220" fill="${secondary}" />
      <rect x="68" y="0" width="24" height="220" fill="${secondary}" />
      <rect x="116" y="0" width="24" height="220" fill="${secondary}" />
      <rect x="164" y="0" width="24" height="220" fill="${secondary}" />
    `,
  },
  {
    id: 'horizontal-hoops',
    name: 'Horizontal Hoops',
    render: (primary, secondary) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <rect x="0" y="34" width="200" height="26" fill="${secondary}" />
      <rect x="0" y="88" width="200" height="26" fill="${secondary}" />
      <rect x="0" y="142" width="200" height="26" fill="${secondary}" />
    `,
  },
  {
    id: 'quarters',
    name: 'Quartered Crest',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="100" height="106" fill="${primary}" />
      <rect x="100" y="0" width="100" height="106" fill="${secondary}" />
      <rect x="0" y="106" width="100" height="114" fill="${secondary}" />
      <rect x="100" y="106" width="100" height="114" fill="${primary}" />
      <rect x="98" y="0" width="4" height="220" fill="${trim}" opacity="0.55" />
      <rect x="0" y="104" width="200" height="4" fill="${trim}" opacity="0.55" />
    `,
  },
  {
    id: 'chevron-band',
    name: 'V-Chevron',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <polygon points="0,42 100,124 200,42 200,88 100,170 0,88" fill="${secondary}" />
      <polyline points="0,42 100,124 200,42" fill="none" stroke="${trim}" stroke-width="5" />
      <polyline points="0,88 100,170 200,88" fill="none" stroke="${trim}" stroke-width="5" />
    `,
  },
  // 16 NEW Patterns (Total: 24)
  {
    id: 'pinstripes',
    name: 'Tailored Pinstripes',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      ${[16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192]
        .map(
          (x, i) =>
            `<rect x="${x}" y="0" width="2.5" height="220" fill="${i % 2 === 0 ? trim : secondary}" opacity="0.55" />`
        )
        .join('')}
    `,
  },
  {
    id: 'diagonal-stripes',
    name: 'Diagonal Candy Stripes',
    render: (primary, secondary) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <g fill="${secondary}" opacity="0.88">
        <polygon points="-40,60 60,-40 82,-18 -18,82" />
        <polygon points="-40,120 120,-40 142,-18 -18,142" />
        <polygon points="-40,180 180,-40 202,-18 -18,202" />
        <polygon points="-20,220 220,-20 242,2 2,242" />
        <polygon points="40,220 220,40 242,62 62,242" />
        <polygon points="100,220 220,100 242,122 122,242" />
      </g>
    `,
  },
  {
    id: 'reverse-sash',
    name: 'Reverse Sash',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <polygon points="20,-25 220,175 180,215 -20,15" fill="${secondary}" />
      <line x1="20" y1="-25" x2="220" y2="175" stroke="${trim}" stroke-width="5" opacity="0.9" />
      <line x1="-20" y1="15" x2="180" y2="215" stroke="${trim}" stroke-width="5" opacity="0.9" />
    `,
  },
  {
    id: 'sunburst-rays',
    name: 'Sunburst Rays',
    render: (primary, secondary, trim) => {
      const rays: string[] = [];
      for (let i = 0; i < 12; i++) {
        const a1 = (i * 30 * Math.PI) / 180;
        const a2 = ((i * 30 + 15) * Math.PI) / 180;
        const x1 = (100 + Math.cos(a1) * 160).toFixed(1);
        const y1 = (106 + Math.sin(a1) * 160).toFixed(1);
        const x2 = (100 + Math.cos(a2) * 160).toFixed(1);
        const y2 = (106 + Math.sin(a2) * 160).toFixed(1);
        rays.push(`<polygon points="100,106 ${x1},${y1} ${x2},${y2}" fill="${secondary}" opacity="0.85" />`);
      }
      return `
        <rect x="0" y="0" width="200" height="220" fill="${primary}" />
        ${rays.join('')}
        <circle cx="100" cy="106" r="24" fill="${trim}" opacity="0.22" />
      `;
    },
  },
  {
    id: 'concentric-rings',
    name: 'Concentric Target',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <circle cx="100" cy="106" r="88" fill="none" stroke="${secondary}" stroke-width="18" />
      <circle cx="100" cy="106" r="56" fill="none" stroke="${secondary}" stroke-width="14" />
      <circle cx="100" cy="106" r="28" fill="${secondary}" />
      <circle cx="100" cy="106" r="71" fill="none" stroke="${trim}" stroke-width="2" opacity="0.65" />
    `,
  },
  {
    id: 'nordic-cross',
    name: 'Cross Crest',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <rect x="82" y="0" width="36" height="220" fill="${trim}" />
      <rect x="0" y="88" width="200" height="36" fill="${trim}" />
      <rect x="88" y="0" width="24" height="220" fill="${secondary}" />
      <rect x="0" y="94" width="200" height="24" fill="${secondary}" />
    `,
  },
  {
    id: 'saltire-x',
    name: 'Saltire Cross',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <line x1="-10" y1="0" x2="210" y2="220" stroke="${trim}" stroke-width="34" />
      <line x1="210" y1="0" x2="-10" y2="220" stroke="${trim}" stroke-width="34" />
      <line x1="-10" y1="0" x2="210" y2="220" stroke="${secondary}" stroke-width="22" />
      <line x1="210" y1="0" x2="-10" y2="220" stroke="${secondary}" stroke-width="22" />
    `,
  },
  {
    id: 'zigzag-bolt',
    name: 'Zig-Zag Electric',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <polygon points="0,60 40,95 80,60 120,95 160,60 200,95 200,150 160,115 120,150 80,115 40,150 0,115" fill="${secondary}" />
      <polyline points="0,60 40,95 80,60 120,95 160,60 200,95" fill="none" stroke="${trim}" stroke-width="4" />
      <polyline points="0,115 40,150 80,115 120,150 160,115 200,150" fill="none" stroke="${trim}" stroke-width="4" />
    `,
  },
  {
    id: 'diamond-grid',
    name: 'Argyle Diamonds',
    render: (primary, secondary, trim) => {
      const cells: string[] = [];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cx = col * 48 + (row % 2 === 0 ? 4 : 28);
          const cy = row * 48 + 14;
          cells.push(
            `<polygon points="${cx},${cy - 18} ${cx + 18},${cy} ${cx},${cy + 18} ${cx - 18},${cy}" fill="${secondary}" opacity="0.72" />`
          );
        }
      }
      return `
        <rect x="0" y="0" width="200" height="220" fill="${primary}" />
        ${cells.join('')}
        <line x1="0" y1="106" x2="200" y2="106" stroke="${trim}" stroke-width="2" opacity="0.4" />
      `;
    },
  },
  {
    id: 'checkered-flag',
    name: 'Checkered Grid',
    render: (primary, secondary) => {
      const rects: string[] = [];
      const size = 25;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 8; c++) {
          if ((r + c) % 2 === 1) {
            rects.push(
              `<rect x="${c * size}" y="${r * size}" width="${size}" height="${size}" fill="${secondary}" />`
            );
          }
        }
      }
      return `<rect x="0" y="0" width="200" height="220" fill="${primary}" />${rects.join('')}`;
    },
  },
  {
    id: 'tri-vertical',
    name: 'Tri-Color Vertical',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="68" height="220" fill="${primary}" />
      <rect x="68" y="0" width="64" height="220" fill="${trim}" opacity="0.88" />
      <rect x="132" y="0" width="68" height="220" fill="${secondary}" />
    `,
  },
  {
    id: 'tri-horizontal',
    name: 'Tri-Color Horizontal',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="74" fill="${primary}" />
      <rect x="0" y="74" width="200" height="68" fill="${trim}" opacity="0.88" />
      <rect x="0" y="142" width="200" height="78" fill="${secondary}" />
    `,
  },
  {
    id: 'halftone-dots',
    name: 'Halftone Matrix',
    render: (primary, secondary, trim) => {
      const dots: string[] = [];
      for (let row = 0; row < 10; row++) {
        const radius = (1.6 + row * 0.45).toFixed(1);
        for (let col = 0; col < 9; col++) {
          const cx = col * 24 + (row % 2 === 0 ? 10 : 22);
          const cy = row * 22 + 12;
          dots.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${secondary}" opacity="0.65" />`);
        }
      }
      return `
        <rect x="0" y="0" width="200" height="220" fill="${primary}" />
        ${dots.join('')}
        <rect x="0" y="0" width="200" height="220" fill="${trim}" opacity="0.06" />
      `;
    },
  },
  {
    id: 'split-diagonal',
    name: 'Half Diagonal Split',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <polygon points="0,220 200,0 200,220" fill="${secondary}" />
      <line x1="0" y1="220" x2="200" y2="0" stroke="${trim}" stroke-width="6" />
    `,
  },
  {
    id: 'double-chevron',
    name: 'Twin Chevrons',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${primary}" />
      <polygon points="0,24 100,90 200,24 200,56 100,122 0,56" fill="${secondary}" />
      <polygon points="0,84 100,150 200,84 200,116 100,182 0,116" fill="${secondary}" />
      <polyline points="0,56 100,122 200,56" fill="none" stroke="${trim}" stroke-width="3" />
      <polyline points="0,116 100,182 200,116" fill="none" stroke="${trim}" stroke-width="3" />
    `,
  },
  {
    id: 'spotlight-radial',
    name: 'Center Spotlight',
    render: (primary, secondary, trim) => `
      <rect x="0" y="0" width="200" height="220" fill="${secondary}" />
      <circle cx="100" cy="106" r="78" fill="${primary}" />
      <circle cx="100" cy="106" r="54" fill="none" stroke="${trim}" stroke-width="3" stroke-dasharray="8 5" opacity="0.65" />
    `,
  },
];

export function getPatternById(id: string): PatternDefinition {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
}
