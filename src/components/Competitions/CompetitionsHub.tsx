import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  FileJson,
  GitBranch,
  Lock,
  Plus,
  Share2,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadJsonFile } from '../../engine/storage/persistence';
import { buildTrophySvgString } from '../../engine/svg-logo/trophies';
import { createDefaultShareMetadata, resolveUserPermissions } from '../../lib/auth-db';
import type { CompetitionFormat } from '../../types';
import { LogoSvg } from '../common/LogoSvg';
import { SharePermissionsModal } from '../Sharing/SharePermissionsModal';
import { CupBracketView } from './CupBracketView';
import { LeagueView } from './LeagueView';
import { SetupWizard } from './SetupWizard';

const FORMAT_LABELS: Record<CompetitionFormat, string> = {
  'single-rr': 'Single Round-Robin',
  'double-rr': 'Double Round-Robin',
  'group-knockout': 'Groups + Knockout',
  'single-elim': 'Single-Elim Cup',
  'double-elim': 'Double-Elim Cup',
};

export const CompetitionsHub: React.FC = () => {
  const {
    competitions,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    getSport,
    user,
    sharedRoute,
    clearSharedRoute,
    showToast,
  } = useApp();

  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shareModalCompId, setShareModalCompId] = useState<string | null>(null);

  const sharedComp =
    sharedRoute?.kind === 'league'
      ? competitions.find(
          (c) => c.sharing?.slug.toLowerCase() === sharedRoute.slug
        )
      : undefined;

  const activeComp =
    competitions.find((c) => c.id === selectedId) ?? sharedComp ?? null;
  const shareModalComp =
    competitions.find((c) => c.id === shareModalCompId) ?? null;

  if (creating) {
    return (
      <SetupWizard
        onCancel={() => setCreating(false)}
        onCreated={(comp) => {
          addCompetition(comp);
          setCreating(false);
          setSelectedId(comp.id);
        }}
      />
    );
  }

  if (activeComp) {
    const isLeagueFormat =
      activeComp.format === 'single-rr' || activeComp.format === 'double-rr';
    const accent = activeComp.branding?.accentColor ?? '#f59e0b';
    const perms = resolveUserPermissions(activeComp, user);

    if (!perms.canView) {
      return (
        <div className="rounded-2xl border border-rose-500/40 bg-[#131b2c] p-10 text-center space-y-3">
          <Lock className="mx-auto h-10 w-10 text-rose-400" />
          <h3 className="font-display text-2xl font-bold text-white uppercase">
            Private Competition
          </h3>
          <p className="text-sm text-slate-400">
            You do not have access to view &ldquo;{activeComp.name}&rdquo;. Ask the owner to invite your Email, Google account, Phone, or Username.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              clearSharedRoute();
            }}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            Back to Competitions
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#131b2c] p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                clearSharedRoute();
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className="h-11 w-11 shrink-0 rounded-xl border border-slate-700 bg-slate-950 p-1.5"
              dangerouslySetInnerHTML={{
                __html: buildTrophySvgString(
                  activeComp.branding?.trophyStyle ?? 'classic-cup',
                  accent
                ),
              }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-950 uppercase"
                  style={{ backgroundColor: accent }}
                >
                  {getSport(activeComp.sportId).name.split(' ')[0]} ·{' '}
                  {activeComp.branding?.tier ?? 'Premier'} ·{' '}
                  {FORMAT_LABELS[activeComp.format]} · {activeComp.size} Teams
                </span>
                {activeComp.sharing?.slug && (
                  <span className="font-mono-code rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] text-sky-300">
                    /l/{activeComp.sharing.slug} · {activeComp.sharing.visibility}
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                {activeComp.name}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShareModalCompId(activeComp.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              Share &amp; Permissions
            </button>

            <button
              type="button"
              onClick={() => {
                downloadJsonFile(
                  activeComp,
                  `${activeComp.name.toLowerCase().replace(/\s+/g, '-')}.json`
                );
                showToast('Exported competition JSON');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <FileJson className="h-4 w-4 text-amber-400" />
              Export JSON
            </button>
          </div>
        </div>

        {isLeagueFormat ? (
          <LeagueView competition={activeComp} onUpdate={updateCompetition} />
        ) : (
          <CupBracketView competition={activeComp} onUpdate={updateCompetition} />
        )}

        {shareModalComp && (
          <SharePermissionsModal
            isOpen={true}
            onClose={() => setShareModalCompId(null)}
            title={shareModalComp.name}
            kind="league"
            resourceId={shareModalComp.id}
            sharing={shareModalComp.sharing ?? createDefaultShareMetadata()}
            canManageCollaborators={
              resolveUserPermissions(shareModalComp, user).canManageCollaborators
            }
            onSave={(nextSharing) =>
              updateCompetition({ ...shareModalComp, sharing: nextSharing })
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#131b2c] p-5">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
            Leagues &amp; Knockout Cups
          </h2>
          <p className="text-sm text-slate-400">
            Create 3 to 64-team Round-Robin Leagues, Group + Playoff Trophies, or Single/Double-Elimination Cups.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New League / Cup
        </button>
      </div>

      {competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
          <Trophy className="mb-3 h-10 w-10 text-slate-600" />
          <h3 className="text-lg font-semibold text-white">No Active Competitions</h3>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            Launch the Competition Setup Wizard to build custom schedules, match-day calendars, tiebreakers, and brackets for 3 to 64 unique clubs.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Launch Setup Wizard
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((comp) => {
            const playableMatches = comp.matches.filter((m) => !m.isBye);
            const playedCount = playableMatches.filter((m) => m.played).length;
            const champ = comp.championId
              ? comp.teams.find((t) => t.id === comp.championId)
              : null;
            const accent = comp.branding?.accentColor ?? '#f59e0b';
            return (
              <div
                key={comp.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#131b2c] p-5 transition hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase"
                      style={{ backgroundColor: accent }}
                    >
                      {comp.type === 'league' ? (
                        <Trophy className="h-3 w-3" />
                      ) : (
                        <GitBranch className="h-3 w-3" />
                      )}
                      {FORMAT_LABELS[comp.format]} · {comp.size}
                    </span>
                    <span className="font-mono-code text-xs text-slate-400">
                      {playedCount}/{playableMatches.length} Played
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className="h-10 w-10 shrink-0 rounded-lg border border-slate-800 bg-slate-950 p-1.5"
                      dangerouslySetInnerHTML={{
                        __html: buildTrophySvgString(
                          comp.branding?.trophyStyle ?? 'classic-cup',
                          accent
                        ),
                      }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-display truncate text-xl font-bold text-white uppercase">
                        {comp.name}
                      </h3>
                      <div className="flex items-center gap-1 font-mono-code text-[10px] text-slate-400">
                        <Calendar className="h-3 w-3 text-sky-400" />
                        {comp.schedule.startDate} → {comp.schedule.endDate}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex -space-x-1.5 overflow-hidden">
                    {comp.teams.slice(0, 8).map((t) => (
                      <div
                        key={t.id}
                        className="rounded-full border border-slate-800 bg-[#0b0f19] p-0.5"
                        title={t.name}
                      >
                        <LogoSvg config={t.logo} size={26} />
                      </div>
                    ))}
                    {comp.teams.length > 8 && (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-300">
                        +{comp.teams.length - 8}
                      </span>
                    )}
                  </div>

                  {champ && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-200">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      <span>
                        Champion: <strong>{champ.name}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(comp.id)}
                    className="flex-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
                  >
                    Open {comp.type === 'league' ? 'Standings & Fixtures' : 'Tournament'}
                  </button>
                  <button
                    type="button"
                    title="Delete Competition"
                    onClick={() => deleteCompetition(comp.id)}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
