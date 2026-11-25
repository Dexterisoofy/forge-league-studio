import type { LogoConfig, LogoPalette } from '../../types';

/**
 * 72 distinct athletic 3-color palettes, each with a unique colorSchemeKey
 * so even 64-team competitions can enforce unique primary color schemes.
 */
export const LOGO_PALETTES: LogoPalette[] = [
  { id: 'crimson-gold', name: 'Crimson & Gold', primary: '#991b1b', secondary: '#1e293b', trim: '#f59e0b', colorSchemeKey: 'crimson-dark' },
  { id: 'royal-cobalt', name: 'Royal Cobalt', primary: '#1d4ed8', secondary: '#0f172a', trim: '#f8fafc', colorSchemeKey: 'royal-blue' },
  { id: 'emerald-ivory', name: 'Emerald Crown', primary: '#047857', secondary: '#064e3b', trim: '#fde68a', colorSchemeKey: 'emerald-deep' },
  { id: 'obsidian-amber', name: 'Obsidian Ember', primary: '#111827', secondary: '#374151', trim: '#f59e0b', colorSchemeKey: 'obsidian-gold' },
  { id: 'violet-silver', name: 'Imperial Violet', primary: '#6d28d9', secondary: '#1e1b4b', trim: '#e2e8f0', colorSchemeKey: 'violet-royal' },
  { id: 'scarlet-slate', name: 'Scarlet Flash', primary: '#dc2626', secondary: '#18181b', trim: '#fca5a5', colorSchemeKey: 'scarlet-bright' },
  { id: 'teal-coral', name: 'Coastal Teal', primary: '#0f766e', secondary: '#134e4a', trim: '#fb7185', colorSchemeKey: 'teal-deep' },
  { id: 'amber-navy', name: 'Amber Forge', primary: '#d97706', secondary: '#172554', trim: '#fef3c7', colorSchemeKey: 'amber-warm' },
  { id: 'navy-sky', name: 'Midnight Sky', primary: '#0f172a', secondary: '#0284c7', trim: '#38bdf8', colorSchemeKey: 'navy-sky' },
  { id: 'forest-lime', name: 'Forest Volt', primary: '#14532d', secondary: '#052e16', trim: '#a3e635', colorSchemeKey: 'forest-dark' },
  { id: 'maroon-cream', name: 'Heritage Maroon', primary: '#7f1d1d', secondary: '#450a0a', trim: '#fef08a', colorSchemeKey: 'maroon-classic' },
  { id: 'cyan-carbon', name: 'Cyber Cyan', primary: '#0891b2', secondary: '#090d16', trim: '#67e8f9', colorSchemeKey: 'cyan-electric' },
  { id: 'orange-charcoal', name: 'Blaze Orange', primary: '#ea580c', secondary: '#1f2937', trim: '#ffffff', colorSchemeKey: 'orange-blaze' },
  { id: 'indigo-mint', name: 'Indigo Mint', primary: '#3730a3', secondary: '#1e1b4b', trim: '#5eead4', colorSchemeKey: 'indigo-deep' },
  { id: 'rose-onyx', name: 'Rose Strike', primary: '#be123c', secondary: '#18181b', trim: '#fda4af', colorSchemeKey: 'rose-crimson' },
  { id: 'gold-ebony', name: 'Sovereign Gold', primary: '#ca8a04', secondary: '#1c1917', trim: '#fef9c3', colorSchemeKey: 'gold-rich' },
  { id: 'cobalt-crimson', name: 'Union Blue', primary: '#1e40af', secondary: '#991b1b', trim: '#f8fafc', colorSchemeKey: 'cobalt-union' },
  { id: 'plum-copper', name: 'Plum Copper', primary: '#701a75', secondary: '#2e1065', trim: '#fdba74', colorSchemeKey: 'plum-magenta' },
  { id: 'steel-ice', name: 'Glacier Steel', primary: '#334155', secondary: '#0f172a', trim: '#7dd3fc', colorSchemeKey: 'steel-slate' },
  { id: 'jade-gold', name: 'Jade Dynasty', primary: '#059669', secondary: '#064e3b', trim: '#fbbf24', colorSchemeKey: 'jade-vibrant' },
  { id: 'ruby-champagne', name: 'Ruby Reserve', primary: '#9f1239', secondary: '#4c0519', trim: '#fde047', colorSchemeKey: 'ruby-wine' },
  { id: 'sapphire-orange', name: 'Metro Sapphire', primary: '#0369a1', secondary: '#0c4a6e', trim: '#fb923c', colorSchemeKey: 'sapphire-ocean' },
  { id: 'olive-sand', name: 'Vanguard Olive', primary: '#3f6212', secondary: '#1a2e05', trim: '#fde68a', colorSchemeKey: 'olive-tactical' },
  { id: 'charcoal-crimson', name: 'Iron Crimson', primary: '#27272a', secondary: '#09090b', trim: '#ef4444', colorSchemeKey: 'charcoal-red' },
  { id: 'cerulean-gold', name: 'Cerulean Crest', primary: '#0284c7', secondary: '#1e3a8a', trim: '#facc15', colorSchemeKey: 'cerulean-bright' },
  { id: 'terracotta-navy', name: 'Desert Terra', primary: '#c2410c', secondary: '#1e293b', trim: '#fed7aa', colorSchemeKey: 'terracotta-rust' },
  { id: 'amethyst-pink', name: 'Neon Amethyst', primary: '#9333ea', secondary: '#3b0764', trim: '#f472b6', colorSchemeKey: 'amethyst-vivid' },
  { id: 'pine-silver', name: 'Cascadia Pine', primary: '#166534', secondary: '#0f172a', trim: '#cbd5e1', colorSchemeKey: 'pine-nordic' },
  { id: 'bronze-obsidian', name: 'Spartan Bronze', primary: '#92400e', secondary: '#1c1917', trim: '#fcd34d', colorSchemeKey: 'bronze-antique' },
  { id: 'azure-coral', name: 'Tropic Azure', primary: '#2563eb', secondary: '#0f172a', trim: '#fb7185', colorSchemeKey: 'azure-vivid' },
  { id: 'magenta-midnight', name: 'Pulse Magenta', primary: '#be185d', secondary: '#0f172a', trim: '#38bdf8', colorSchemeKey: 'magenta-neon' },
  { id: 'slate-emerald', name: 'Summit Slate', primary: '#475569', secondary: '#1e293b', trim: '#34d399', colorSchemeKey: 'slate-cool' },
  { id: 'ochre-espresso', name: 'Harvest Ochre', primary: '#b45309', secondary: '#292524', trim: '#fef08a', colorSchemeKey: 'ochre-earth' },
  { id: 'turquoise-navy', name: 'Lagoon Surge', primary: '#0d9488', secondary: '#1e1b4b', trim: '#f8fafc', colorSchemeKey: 'turquoise-bright' },
  { id: 'burgundy-sky', name: 'Claret & Blue', primary: '#881337', secondary: '#0284c7', trim: '#f8fafc', colorSchemeKey: 'claret-sky' },
  { id: 'platinum-cobalt', name: 'Arctic Platinum', primary: '#e2e8f0', secondary: '#1e3a8a', trim: '#f59e0b', colorSchemeKey: 'platinum-light' },
  // 36 additional palettes for 64+ team headroom
  { id: 'blood-orange-navy', name: 'Solaris Flame', primary: '#f97316', secondary: '#0f172a', trim: '#fef08a', colorSchemeKey: 'solaris-orange' },
  { id: 'midnight-violet', name: 'Phantom Dusk', primary: '#312e81', secondary: '#090d16', trim: '#a78bfa', colorSchemeKey: 'phantom-indigo' },
  { id: 'volt-obsidian', name: 'Volt Strike', primary: '#65a30d', secondary: '#111827', trim: '#bef264', colorSchemeKey: 'volt-lime' },
  { id: 'garnet-gold', name: 'Garnet Crown', primary: '#6b0f1a', secondary: '#1c1917', trim: '#fbbf24', colorSchemeKey: 'garnet-deep' },
  { id: 'glacier-blue', name: 'Glacier Frost', primary: '#38bdf8', secondary: '#0c4a6e', trim: '#ffffff', colorSchemeKey: 'glacier-light' },
  { id: 'mahogany-amber', name: 'Mahogany Forge', primary: '#5c1a1b', secondary: '#27272a', trim: '#f59e0b', colorSchemeKey: 'mahogany-dark' },
  { id: 'orchid-onyx', name: 'Orchid Pulse', primary: '#a21caf', secondary: '#18181b', trim: '#f0abfc', colorSchemeKey: 'orchid-vivid' },
  { id: 'mint-slate', name: 'Apex Mint', primary: '#10b981', secondary: '#0f172a', trim: '#ecfdf5', colorSchemeKey: 'mint-bright' },
  { id: 'brass-charcoal', name: 'Brass Legion', primary: '#a16207', secondary: '#18181b', trim: '#fde047', colorSchemeKey: 'brass-metal' },
  { id: 'pacific-coral', name: 'Pacific Reef', primary: '#0284c7', secondary: '#082f49', trim: '#fda4af', colorSchemeKey: 'pacific-reef' },
  { id: 'bordeaux-silver', name: 'Bordeaux Crest', primary: '#581c87', secondary: '#1e1b4b', trim: '#cbd5e1', colorSchemeKey: 'bordeaux-plum' },
  { id: 'cinnabar-dark', name: 'Cinnabar Ember', primary: '#b91c1c', secondary: '#09090b', trim: '#fed7aa', colorSchemeKey: 'cinnabar-red' },
  { id: 'verdigris-navy', name: 'Verdigris Bay', primary: '#115e59', secondary: '#0f172a', trim: '#5eead4', colorSchemeKey: 'verdigris-teal' },
  { id: 'saffron-onyx', name: 'Saffron Royals', primary: '#eab308', secondary: '#0f172a', trim: '#ffffff', colorSchemeKey: 'saffron-gold' },
  { id: 'cobalt-lime', name: 'Electric Cobalt', primary: '#1d4ed8', secondary: '#0f172a', trim: '#a3e635', colorSchemeKey: 'cobalt-volt' },
  { id: 'gunmetal-orange', name: 'Gunmetal Blast', primary: '#3f3f46', secondary: '#09090b', trim: '#fb923c', colorSchemeKey: 'gunmetal-dark' },
  { id: 'cerise-obsidian', name: 'Cerise Neon', primary: '#db2777', secondary: '#111827', trim: '#fbcfe8', colorSchemeKey: 'cerise-pink' },
  { id: 'seafoam-forest', name: 'Seafoam Crest', primary: '#047857', secondary: '#022c22', trim: '#6ee7b7', colorSchemeKey: 'seafoam-green' },
  { id: 'rust-iron', name: 'Rust & Iron', primary: '#9a3412', secondary: '#1c1917', trim: '#fdba74', colorSchemeKey: 'rust-oxide' },
  { id: 'storm-blue', name: 'Tempest Blue', primary: '#1e3a8a', secondary: '#0f172a', trim: '#60a5fa', colorSchemeKey: 'tempest-navy' },
  { id: 'lavender-midnight', name: 'Starlight Dusk', primary: '#4f46e5', secondary: '#0f172a', trim: '#c7d2fe', colorSchemeKey: 'starlight-indigo' },
  { id: 'moss-gold', name: 'Highland Moss', primary: '#365314', secondary: '#14532d', trim: '#fde047', colorSchemeKey: 'moss-highland' },
  { id: 'crimson-ice', name: 'Crimson Ice', primary: '#e11d48', secondary: '#1e293b', trim: '#e0f2fe', colorSchemeKey: 'crimson-ice' },
  { id: 'copper-teal', name: 'Copper Harbor', primary: '#b45309', secondary: '#134e4a', trim: '#fef3c7', colorSchemeKey: 'copper-harbor' },
  { id: 'obsidian-cyan', name: 'Shadow Matrix', primary: '#090d16', secondary: '#1e293b', trim: '#22d3ee', colorSchemeKey: 'shadow-cyan' },
  { id: 'ivory-crimson', name: 'Ivory Guard', primary: '#f1f5f9', secondary: '#991b1b', trim: '#f59e0b', colorSchemeKey: 'ivory-crimson' },
  { id: 'amber-emerald', name: 'Celtic Amber', primary: '#d97706', secondary: '#064e3b', trim: '#ffffff', colorSchemeKey: 'celtic-amber' },
  { id: 'royal-magenta', name: 'Crown Magenta', primary: '#86198f', secondary: '#1e1b4b', trim: '#f472b6', colorSchemeKey: 'crown-magenta' },
  { id: 'steel-crimson', name: 'Forged Steel', primary: '#64748b', secondary: '#0f172a', trim: '#f87171', colorSchemeKey: 'forged-steel' },
  { id: 'sunburst-indigo', name: 'Sunburst Crest', primary: '#f59e0b', secondary: '#1e1b4b', trim: '#fef9c3', colorSchemeKey: 'sunburst-amber' },
  { id: 'aqua-charcoal', name: 'Aqua Surge', primary: '#06b6d4', secondary: '#18181b', trim: '#cffafe', colorSchemeKey: 'aqua-bright' },
  { id: 'wine-bronze', name: 'Imperial Wine', primary: '#701a2e', secondary: '#1c1917', trim: '#fbbf24', colorSchemeKey: 'imperial-wine' },
  { id: 'clover-navy', name: 'Shamrock Pride', primary: '#15803d', secondary: '#0f172a', trim: '#bbf7d0', colorSchemeKey: 'clover-green' },
  { id: 'slate-gold', name: 'Titan Slate', primary: '#1e293b', secondary: '#090d16', trim: '#eab308', colorSchemeKey: 'titan-slate' },
  { id: 'coral-navy', name: 'Harbor Coral', primary: '#f43f5e', secondary: '#0f172a', trim: '#ffe4e6', colorSchemeKey: 'harbor-coral' },
  { id: 'silver-emerald', name: 'Silver Emerald', primary: '#cbd5e1', secondary: '#064e3b', trim: '#34d399', colorSchemeKey: 'silver-emerald' },
];

export function normalizeHex(hex: string): string {
  const cleaned = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    return (
      '#' +
      cleaned
        .split('')
        .map((c) => c + c)
        .join('')
        .toLowerCase()
    );
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return '#' + cleaned.toLowerCase();
  }
  return '#1e293b';
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const norm = normalizeHex(hex).slice(1);
  return {
    r: parseInt(norm.slice(0, 2), 16),
    g: parseInt(norm.slice(2, 4), 16),
    b: parseInt(norm.slice(4, 6), 16),
  };
}

/**
 * Computes WCAG relative luminance and returns crisp accessible text/stroke contrast color.
 */
export function getContrastColor(hex: string): '#ffffff' | '#0f172a' {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return lum > 0.36 ? '#0f172a' : '#ffffff';
}

export function getPaletteById(id: string): LogoPalette | undefined {
  return LOGO_PALETTES.find((p) => p.id === id);
}

/**
 * Returns a competition-level primary color scheme key so no two teams in one
 * league/cup share an identical primary color scheme.
 */
export function getPrimaryColorSchemeKey(logo: Pick<LogoConfig, 'paletteId' | 'primary'>): string {
  const preset = getPaletteById(logo.paletteId);
  if (preset && normalizeHex(preset.primary) === normalizeHex(logo.primary)) {
    return preset.colorSchemeKey;
  }
  const { r, g, b } = hexToRgb(logo.primary);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  if (d !== 0) {
    if (max === r / 255) h = ((g / 255 - b / 255) / d) % 6;
    else if (max === g / 255) h = (b / 255 - r / 255) / d + 2;
    else h = (r / 255 - g / 255) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (s < 0.14) {
    return l < 0.3 ? 'custom-dark-neutral' : l > 0.75 ? 'custom-light-neutral' : 'custom-mid-neutral';
  }
  const hueBucket = Math.floor(h / 24);
  const lumBucket = l < 0.35 ? 'dark' : l > 0.65 ? 'light' : 'mid';
  return `custom-h${hueBucket}-${lumBucket}`;
}
