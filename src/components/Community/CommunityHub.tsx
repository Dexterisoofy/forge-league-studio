import React, { useState } from 'react';
import {
  CopyPlus,
  Dumbbell,
  ExternalLink,
  Globe,
  Link2,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildJerseySvgString } from '../../engine/sports/jerseySvg';
import { buildShareUrl } from '../../lib/auth-db';
import { LogoSvg } from '../common/LogoSvg';

export const CommunityHub: React.FC = () => {
  const {
    communitySports,
    competitions,
    cloneCommunitySport,
    setActiveTab,
    sharedRoute,
    clearSharedRoute,
    showToast,
  } = useApp();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'sports' | 'competitions'>('all');

  const publicCompetitions = competitions.filter(
    (c) => c.sharing?.visibility === 'public'
  );

  // If user arrived via #/sport/<slug>, highlight that sport
  const sharedSport =
    sharedRoute?.kind === 'sport'
      ? communitySports.find(
          (s) => s.sharing?.slug.toLowerCase() === sharedRoute.slug
        )
      : undefined;

  const q = query.trim().toLowerCase();
  const filteredSports = communitySports.filter(
    (s) =>
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.ownerName ?? '').toLowerCase().includes(q) ||
      (s.sharing?.slug ?? '').toLowerCase().includes(q)
  );
  const filteredComps = publicCompetitions.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.ownerName ?? '').toLowerCase().includes(q) ||
      (c.sharing?.slug ?? '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#131b2c] p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-300 uppercase">
            <Globe className="h-4 w-4" />
            Public Directory &amp; Shared Links
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
            Community Hub &amp; Sport Importer
          </h2>
          <p className="text-sm text-slate-400">
            Browse public Custom Sports, Leagues, and Cups, or clone shared sports into your own library.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, creator, or slug..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-xl border border-slate-700 bg-slate-950 py-2 pr-3 pl-9 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
            {(
              [
                ['all', 'All'],
                ['sports', 'Sports'],
                ['competitions', 'Leagues & Cups'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                  filter === id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Highlighted Shared Sport Link Banner */}
      {sharedSport && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-500/40 bg-sky-500/10 p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-sky-400" />
            <div>
              <div className="text-xs font-bold tracking-wider text-sky-300 uppercase">
                Opened Shared Sport Link (/sport/{sharedSport.sharing?.slug})
              </div>
              <div className="font-display text-2xl font-extrabold text-white uppercase">
                {sharedSport.name}
              </div>
              <div className="text-xs text-slate-300">
                Created by {sharedSport.ownerName ?? 'Community Creator'} · {sharedSport.positions.length} Positions · {sharedSport.scoringEvents.length} Scoring Plays
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                cloneCommunitySport(sharedSport);
                clearSharedRoute();
                setActiveTab('sports');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <CopyPlus className="h-4 w-4" />
              Import / Clone to My Library
            </button>
            <button
              type="button"
              onClick={clearSharedRoute}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Community Custom Sports */}
      {(filter === 'all' || filter === 'sports') && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-white uppercase">
            <Dumbbell className="h-5 w-5 text-amber-400" />
            Public Custom Sports ({filteredSports.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSports.map((sp) => (
              <div
                key={sp.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#131b2c] p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="h-12 w-12 shrink-0 rounded-xl border border-slate-800 bg-slate-950 p-1.5"
                      dangerouslySetInnerHTML={{
                        __html: buildJerseySvgString(
                          sp.jerseySilhouette,
                          sp.accentColor,
                          '#1e293b',
                          '#f8fafc',
                          String(sp.activeLineupSize)
                        ),
                      }}
                    />
                    <span className="font-mono-code inline-flex items-center gap-1 rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                      <Link2 className="h-3 w-3" />
                      /sport/{sp.sharing?.slug ?? sp.id}
                    </span>
                  </div>
                  <h4 className="font-display mt-3 text-xl font-bold text-white uppercase">
                    {sp.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    By {sp.ownerName ?? 'Community'} · {sp.activeLineupSize} starters · {sp.periodCount}× {sp.periodName}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Scoring: {sp.scoringEvents.map((e) => `${e.name} (${e.points})`).join(', ')}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      cloneCommunitySport(sp);
                      setActiveTab('sports');
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    <CopyPlus className="h-3.5 w-3.5" />
                    Import / Clone to My Library
                  </button>
                  {sp.sharing?.slug && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          buildShareUrl('sport', sp.sharing!.slug)
                        );
                        showToast('Copied sport share link');
                      }}
                      title="Copy Share Link"
                      className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-sky-400 hover:bg-slate-800 cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Public Leagues & Cups */}
      {(filter === 'all' || filter === 'competitions') && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-white uppercase">
            <Trophy className="h-5 w-5 text-amber-400" />
            Public Leagues &amp; Cups ({filteredComps.length})
          </h3>
          {filteredComps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
              No public Leagues or Cups published yet. Set any competition&apos;s visibility to &ldquo;Public Hub&rdquo; in its Share &amp; Permissions modal to list it here.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredComps.map((comp) => (
                <div
                  key={comp.id}
                  className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 font-bold text-amber-300 uppercase">
                      {comp.format} · {comp.size} Teams
                    </span>
                    <span className="font-mono-code text-[10px] text-sky-300">
                      /l/{comp.sharing?.slug}
                    </span>
                  </div>
                  <h4 className="font-display text-xl font-bold text-white uppercase">
                    {comp.name}
                  </h4>
                  <div className="flex -space-x-1.5">
                    {comp.teams.slice(0, 6).map((t) => (
                      <div
                        key={t.id}
                        className="rounded-full border border-slate-800 bg-[#0b0f19] p-0.5"
                      >
                        <LogoSvg config={t.logo} size={24} />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = `#/l/${comp.sharing?.slug}`;
                    }}
                    className="w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
                  >
                    Open Public Competition
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
