import React, { useState } from 'react';
import { Lock, Search, Unlock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENTS } from '../../engine/svg-logo/accents';
import { BANNERS } from '../../engine/svg-logo/banners';
import { ICON_CATEGORIES, ICONS } from '../../engine/svg-logo/icons';
import { LOGO_PALETTES, normalizeHex } from '../../engine/svg-logo/palettes';
import { PATTERNS } from '../../engine/svg-logo/patterns';
import { SHIELDS } from '../../engine/svg-logo/shields';
import type { TeamLocks } from '../../types';
import { LogoSvg } from '../common/LogoSvg';

const LockButton: React.FC<{
  locked: boolean;
  onClick: () => void;
  label: string;
}> = ({ locked, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    title={locked ? `Unlock ${label}` : `Lock ${label} during randomization`}
    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition cursor-pointer ${
      locked
        ? 'border border-amber-500/50 bg-amber-500/15 text-amber-300'
        : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
    }`}
  >
    {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
    <span>{locked ? 'Locked' : 'Lock'}</span>
  </button>
);

export const LogoBuilderPanel: React.FC = () => {
  const { activeTeam, updateActiveLogo, locks, toggleLock } = useApp();
  const { logo } = activeTeam;
  const [iconCategory, setIconCategory] = useState<string>('All');
  const [iconQuery, setIconQuery] = useState<string>('');

  const categories = ['All', ...ICON_CATEGORIES];
  const filteredIcons = ICONS.filter((i) => {
    const matchesCat = iconCategory === 'All' || i.category === iconCategory;
    const q = iconQuery.trim().toLowerCase();
    const matchesSearch =
      !q || i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const lockHeader = (title: string, lockKey: keyof TeamLocks, subtitle?: string) => (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <LockButton
        locked={locks[lockKey]}
        onClick={() => toggleLock(lockKey)}
        label={title}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Shield / Crest Shape (32 options) */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        {lockHeader('Shield & Crest Silhouette', 'shield', `${SHIELDS.length} vector crest shapes`)}
        <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
          {SHIELDS.map((s) => {
            const selected = logo.shieldId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => updateActiveLogo({ shieldId: s.id })}
                title={s.name}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition cursor-pointer ${
                  selected
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <svg viewBox="0 0 200 220" className="h-9 w-9">
                  <path
                    d={s.path}
                    fill={selected ? '#f59e0b' : '#334155'}
                    fillOpacity={selected ? 0.35 : 0.45}
                    stroke={selected ? '#fbbf24' : '#64748b'}
                    strokeWidth="8"
                  />
                </svg>
                <span className="w-full truncate text-center text-[10px] font-medium">
                  {s.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Background Pattern (24 options) */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        {lockHeader('Field Pattern', 'pattern', `${PATTERNS.length} clipped background patterns`)}
        <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
          {PATTERNS.map((p) => {
            const selected = logo.patternId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateActiveLogo({ patternId: p.id })}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition cursor-pointer ${
                  selected
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <LogoSvg
                  config={{ ...logo, patternId: p.id }}
                  size={24}
                />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Centerpiece Vector Icon (136 options) */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        {lockHeader(
          'Centerpiece Mascot / Sport Icon',
          'icon',
          `${ICONS.length} multi-path vector icons across ${ICON_CATEGORIES.length} categories`
        )}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setIconCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  iconCategory === cat
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${ICONS.length} icons...`}
              value={iconQuery}
              onChange={(e) => setIconQuery(e.target.value)}
              className="w-44 rounded-lg border border-slate-700 bg-slate-950 py-1 pr-2.5 pl-8 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
          {filteredIcons.map((ic) => {
            const selected = logo.iconId === ic.id;
            const previewMarkup = ic.render({
              fill: selected ? '#fef3c7' : '#cbd5e1',
              accent: selected ? '#f59e0b' : '#38bdf8',
              stroke: '#0f172a',
              contrast: '#ffffff',
            });
            return (
              <button
                key={ic.id}
                type="button"
                onClick={() => updateActiveLogo({ iconId: ic.id })}
                title={`${ic.name} (${ic.category})`}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition cursor-pointer ${
                  selected
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-9 w-9"
                  dangerouslySetInnerHTML={{ __html: previewMarkup }}
                />
                <span className="w-full truncate text-center text-[10px] font-medium">
                  {ic.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Framing Accents & Monogram Banners */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          {lockHeader('Framing Accents', 'accent')}
          <div className="grid grid-cols-2 gap-2">
            {ACCENTS.map((ac) => {
              const selected = logo.accentId === ac.id;
              return (
                <button
                  key={ac.id}
                  type="button"
                  onClick={() => updateActiveLogo({ accentId: ac.id })}
                  className={`rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition cursor-pointer ${
                    selected
                      ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {ac.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          {lockHeader('Monogram & Banner Style', 'banner')}
          <div className="mb-3">
            <label className="mb-1 block text-xs text-slate-400">
              Monogram Text (1–4 chars)
            </label>
            <input
              type="text"
              maxLength={4}
              value={logo.monogramText}
              onChange={(e) =>
                updateActiveLogo({ monogramText: e.target.value.toUpperCase() })
              }
              className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-bold tracking-widest text-white uppercase focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BANNERS.map((bn) => {
              const selected = logo.bannerId === bn.id;
              return (
                <button
                  key={bn.id}
                  type="button"
                  onClick={() => updateActiveLogo({ bannerId: bn.id })}
                  className={`rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition cursor-pointer ${
                    selected
                      ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {bn.name}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 5. Coordinated 3-Color Palettes (72 presets) & Custom Color Pickers */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        {lockHeader(
          'Coordinated 3-Color Palette',
          'palette',
          `${LOGO_PALETTES.length} preset schemes + automatic WCAG contrast`
        )}
        <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Primary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={normalizeHex(logo.primary)}
                onChange={(e) =>
                  updateActiveLogo({ paletteId: 'custom', primary: e.target.value })
                }
                className="h-8 w-10 cursor-pointer rounded border border-slate-700 bg-transparent"
              />
              <span className="font-mono-code text-xs text-slate-300 uppercase">
                {logo.primary}
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Secondary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={normalizeHex(logo.secondary)}
                onChange={(e) =>
                  updateActiveLogo({ paletteId: 'custom', secondary: e.target.value })
                }
                className="h-8 w-10 cursor-pointer rounded border border-slate-700 bg-transparent"
              />
              <span className="font-mono-code text-xs text-slate-300 uppercase">
                {logo.secondary}
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Trim</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={normalizeHex(logo.trim)}
                onChange={(e) =>
                  updateActiveLogo({ paletteId: 'custom', trim: e.target.value })
                }
                className="h-8 w-10 cursor-pointer rounded border border-slate-700 bg-transparent"
              />
              <span className="font-mono-code text-xs text-slate-300 uppercase">
                {logo.trim}
              </span>
            </div>
          </div>
        </div>

        <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
          {LOGO_PALETTES.map((pal) => {
            const selected =
              logo.paletteId === pal.id &&
              normalizeHex(logo.primary) === normalizeHex(pal.primary);
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() =>
                  updateActiveLogo({
                    paletteId: pal.id,
                    primary: pal.primary,
                    secondary: pal.secondary,
                    trim: pal.trim,
                  })
                }
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition cursor-pointer ${
                  selected
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="flex shrink-0 overflow-hidden rounded border border-slate-700">
                  <span className="h-4 w-2.5" style={{ backgroundColor: pal.primary }} />
                  <span className="h-4 w-2.5" style={{ backgroundColor: pal.secondary }} />
                  <span className="h-4 w-2.5" style={{ backgroundColor: pal.trim }} />
                </span>
                <span className="truncate text-xs font-medium">{pal.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
