import React from 'react';
import {
  Archive,
  Cloud,
  Database,
  Dumbbell,
  Fingerprint,
  Globe,
  LogIn,
  Shield,
  Trophy,
  User,
  Wand2,
} from 'lucide-react';
import { useApp, type AppTab } from '../../context/AppContext';

const TABS: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'studio', label: 'Team Studio', icon: Wand2 },
  { id: 'vault', label: 'Vault', icon: Archive },
  { id: 'competitions', label: 'Leagues & Cups', icon: Trophy },
  { id: 'sports', label: 'Sport Creator', icon: Dumbbell },
  { id: 'community', label: 'Community', icon: Globe },
  { id: 'registry', label: 'Registry', icon: Database },
];

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    registry,
    vault,
    competitions,
    customSports,
    allSports,
    activeSportId,
    selectActiveSport,
    user,
    cloudStatus,
    setAuthModalOpen,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#0b0f19]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-slate-900 shadow-inner">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-extrabold tracking-wide text-white uppercase">
                ForgeLeague
              </h1>
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
                Cloud Studio
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Sport Team, League &amp; Cup Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/70 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const badge =
              tab.id === 'vault' && vault.length > 0
                ? vault.length
                : tab.id === 'competitions' && competitions.length > 0
                  ? competitions.length
                  : tab.id === 'sports' && customSports.length > 0
                    ? customSports.length
                    : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {badge !== null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold ${
                      active
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sport Selector, Registry & Auth */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeSportId}
            onChange={(e) => selectActiveSport(e.target.value, true)}
            title="Select active sport for Team Studio"
            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-amber-300 focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            {allSports.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.isBuiltIn ? sp.name : `★ ${sp.name}`}
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveTab('registry')}
            title="View Global Zero-Duplicate Registry"
            className="hidden lg:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-left transition hover:border-emerald-400/50 cursor-pointer"
          >
            <Fingerprint className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="font-mono-code text-xs font-semibold text-white">
              {registry.totalTeamsGenerated}T · {registry.totalLogosGenerated}L
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            title={cloudStatus.label}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
              user
                ? 'border-sky-500/40 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {user ? (
              <>
                <User className="h-3.5 w-3.5 text-sky-400" />
                <span className="max-w-24 truncate">{user.displayName}</span>
                <Cloud className="h-3 w-3 text-emerald-400" />
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5 text-amber-400" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
