import React, { useState } from 'react';
import {
  BookmarkPlus,
  Check,
  Copy,
  Download,
  FileCode2,
  FileJson,
  Fingerprint,
  ImageDown,
  LockOpen,
  ShieldCheck,
  Shuffle,
  Sliders,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildJerseySvgString } from '../../engine/sports/jerseySvg';
import { downloadJsonFile } from '../../engine/storage/persistence';
import { downloadLogoAsPng, downloadLogoAsSvg } from '../../engine/svg-logo/renderLogoSvg';
import { LogoSvg } from '../common/LogoSvg';
import { IdentityEditorPanel } from './IdentityEditorPanel';
import { LogoBuilderPanel } from './LogoBuilderPanel';
import { RosterEditorPanel } from './RosterEditorPanel';

type StudioSubTab = 'logo' | 'identity' | 'roster';

export const TeamStudio: React.FC = () => {
  const {
    activeTeam,
    activeSport,
    randomizeActiveTeam,
    loadTeamFromSeed,
    saveActiveToVault,
    locks,
    resetLocks,
    lastCollisionsAvoided,
    showToast,
  } = useApp();

  const [subTab, setSubTab] = useState<StudioSubTab>('logo');
  const [seedInput, setSeedInput] = useState('');
  const [copiedSeed, setCopiedSeed] = useState(false);

  const activeLocksCount = Object.values(locks).filter(Boolean).length;

  const handleCopySeed = () => {
    navigator.clipboard?.writeText(activeTeam.seedCode);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1800);
  };

  const handleLoadSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedInput.trim()) return;
    loadTeamFromSeed(seedInput.trim());
    setSeedInput('');
  };

  const handleExportPng = async () => {
    try {
      await downloadLogoAsPng(
        activeTeam.logo,
        `${activeTeam.name.toLowerCase().replace(/\s+/g, '-')}-crest.png`,
        4
      );
      showToast('Exported high-res 800×880 PNG crest');
    } catch {
      showToast('PNG export failed in this browser');
    }
  };

  const jerseySvg = buildJerseySvgString(
    activeSport.jerseySilhouette,
    activeTeam.logo.primary,
    activeTeam.logo.secondary,
    activeTeam.logo.trim,
    String(activeTeam.roster[0]?.jerseyNumber ?? 10)
  );

  return (
    <div className="space-y-6">
      {/* Studio Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#131b2c] p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => randomizeActiveTeam()}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400 active:scale-[0.99] cursor-pointer"
          >
            <Shuffle className="h-4 w-4" />
            Randomize {activeSport.name.split(' ')[0]} Team
          </button>

          {activeLocksCount > 0 && (
            <button
              type="button"
              onClick={resetLocks}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 cursor-pointer"
            >
              <LockOpen className="h-3.5 w-3.5" />
              Clear {activeLocksCount} Lock{activeLocksCount > 1 ? 's' : ''}
            </button>
          )}

          <form onSubmit={handleLoadSeed} className="flex items-center gap-1.5">
            <input
              type="text"
              maxLength={10}
              placeholder="10-char seed (K9X4M2P8Q1)"
              value={seedInput}
              onChange={(e) =>
                setSeedInput(
                  e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10)
                )
              }
              className="font-mono-code w-48 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 cursor-pointer"
            >
              Load Seed
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveActiveToVault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25 cursor-pointer"
          >
            <BookmarkPlus className="h-4 w-4" />
            Save to My Teams
          </button>

          <button
            type="button"
            onClick={() => {
              downloadLogoAsSvg(
                activeTeam.logo,
                `${activeTeam.name.toLowerCase().replace(/\s+/g, '-')}-crest.svg`
              );
              showToast('Downloaded scalable SVG crest');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 cursor-pointer"
          >
            <FileCode2 className="h-4 w-4 text-sky-400" />
            SVG
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 cursor-pointer"
          >
            <ImageDown className="h-4 w-4 text-purple-400" />
            PNG
          </button>

          <button
            type="button"
            onClick={() => {
              downloadJsonFile(
                activeTeam,
                `${activeTeam.name.toLowerCase().replace(/\s+/g, '-')}.json`
              );
              showToast('Exported franchise JSON');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 cursor-pointer"
          >
            <FileJson className="h-4 w-4 text-amber-400" />
            JSON
          </button>
        </div>
      </div>

      {/* Main Two-Column Studio Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Live Franchise Showcase */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-6 shadow-xl">
            <div className="studio-grid-bg relative flex items-center justify-center rounded-xl border border-slate-800/80 bg-[#0b0f19] p-6">
              <LogoSvg config={activeTeam.logo} size={200} />
              <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                Zero-Dup Verified
              </div>
              <div className="absolute top-3 right-3 rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-0.5 font-mono-code text-xs font-bold text-amber-400">
                OVR {activeTeam.overallRating}
              </div>
              {/* Sport Jersey Silhouette Corner Badge */}
              <div
                className="absolute right-3 bottom-3 h-14 w-14 rounded-xl border border-slate-800 bg-slate-950/90 p-1.5 shadow"
                title={`${activeSport.name} Uniform Silhouette`}
                dangerouslySetInnerHTML={{ __html: jerseySvg }}
              />
            </div>

            <div className="mt-5 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
                <span>{activeSport.name}</span>
                <span>·</span>
                <span>Est. {activeTeam.foundedYear}</span>
              </div>
              <h2 className="font-display mt-1 text-3xl font-extrabold tracking-wide text-white uppercase">
                {activeTeam.name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                {activeTeam.stadium} · {activeTeam.playstyle}
              </p>
            </div>

            {/* Quick Franchise Stats */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  Star Rating
                </div>
                <div className="mt-0.5 font-mono-code text-sm font-bold text-amber-400">
                  {activeTeam.starRating.toFixed(1)} ★
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  All-Time
                </div>
                <div className="mt-0.5 font-mono-code text-xs font-semibold text-slate-200">
                  {activeTeam.historicalRecord.wins}-{activeTeam.historicalRecord.losses}
                  {activeSport.defaultRules.drawsAllowed
                    ? `-${activeTeam.historicalRecord.draws}`
                    : ''}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  Titles
                </div>
                <div className="mt-0.5 font-mono-code text-sm font-bold text-emerald-400">
                  {activeTeam.historicalRecord.championships}
                </div>
              </div>
            </div>

            {/* Seed & Logo DNA Fingerprint */}
            <div className="mt-4 space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">10-Char Base36 Seed</span>
                <button
                  type="button"
                  onClick={handleCopySeed}
                  className="font-mono-code inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 font-semibold text-sky-300 hover:border-sky-500/50 cursor-pointer"
                >
                  <span>{activeTeam.seedCode}</span>
                  {copiedSeed ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Fingerprint className="h-3.5 w-3.5 text-emerald-400" />
                    Logo DNA
                  </span>
                  {lastCollisionsAvoided > 0 && (
                    <span className="text-[10px] text-amber-300">
                      {lastCollisionsAvoided} collision re-roll(s)
                    </span>
                  )}
                </div>
                <div className="font-mono-code break-all rounded border border-slate-800 bg-slate-900/90 p-2 text-[10px] leading-relaxed text-slate-300">
                  {activeTeam.logo.dna}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Custom Builder / Identity / Roster Tabs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-[#131b2c] p-1.5">
            <button
              type="button"
              onClick={() => setSubTab('logo')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                subTab === 'logo'
                  ? 'bg-slate-800 text-amber-300 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="h-4 w-4" />
              Custom Logo Builder
            </button>
            <button
              type="button"
              onClick={() => setSubTab('identity')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                subTab === 'identity'
                  ? 'bg-slate-800 text-amber-300 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="h-4 w-4" />
              Franchise Details
            </button>
            <button
              type="button"
              onClick={() => setSubTab('roster')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                subTab === 'roster'
                  ? 'bg-slate-800 text-amber-300 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Roster ({activeTeam.roster.length})
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5 shadow-xl">
            {subTab === 'logo' && <LogoBuilderPanel />}
            {subTab === 'identity' && <IdentityEditorPanel />}
            {subTab === 'roster' && <RosterEditorPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};
