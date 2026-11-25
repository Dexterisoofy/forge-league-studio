import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Edit3,
  FileJson,
  Info,
  Plus,
  Save,
  Share2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createUuid } from '../../engine/prng';
import { BUILT_IN_SPORTS } from '../../engine/sports/builtInSports';
import { buildJerseySvgString } from '../../engine/sports/jerseySvg';
import { downloadJsonFile } from '../../engine/storage/persistence';
import { createDefaultShareMetadata, resolveUserPermissions } from '../../lib/auth-db';
import { SharePermissionsModal } from '../Sharing/SharePermissionsModal';
import type {
  JerseySilhouette,
  OvertimeRule,
  ScoringEvent,
  SportDefinition,
  SportPositionSpec,
  SportStatDef,
  WinnerCriterion,
} from '../../types';

const JERSEY_OPTIONS: { id: JerseySilhouette; label: string }[] = [
  { id: 'soccer-kit', label: 'Soccer Kit' },
  { id: 'basketball-tank', label: 'Basketball Tank' },
  { id: 'football-pads', label: 'Football Pads' },
  { id: 'baseball-button', label: 'Baseball Jersey' },
  { id: 'hockey-sweater', label: 'Hockey Sweater' },
  { id: 'volleyball-jersey', label: 'Volleyball Kit' },
  { id: 'rugby-collar', label: 'Rugby Collar' },
  { id: 'esports-hoodie', label: 'Esports Hoodie' },
];

function createBlankSport(): SportDefinition {
  const base = BUILT_IN_SPORTS[0];
  return {
    ...JSON.parse(JSON.stringify(base)),
    id: `custom-${createUuid().slice(0, 8)}`,
    name: 'Hyperball Pro',
    isBuiltIn: false,
    terminology: { scoreUnit: 'Points', matchUnit: 'Match', venueNoun: 'Arena' },
    periodName: 'Quarter',
    periodCount: 4,
    periodLengthLabel: '10 min',
    rosterSize: { min: 12, max: 16 },
    activeLineupSize: 6,
    positions: [
      {
        code: 'CAP',
        name: 'Captain',
        countRange: [2, 3],
        heightInRange: [70, 76],
        weightLbsRange: [175, 210],
        archetypes: ['Playmaker', 'Leader'],
        statWeights: { offense: 1.05, defense: 0.95, speed: 1.05, stamina: 1.05, iq: 1.15 },
      },
      {
        code: 'STR',
        name: 'Striker',
        countRange: [4, 6],
        heightInRange: [70, 77],
        weightLbsRange: [175, 215],
        archetypes: ['Scorer', 'Finisher'],
        statWeights: { offense: 1.18, defense: 0.65, speed: 1.12, stamina: 1.0, iq: 1.0 },
      },
      {
        code: 'GRD',
        name: 'Guardian',
        countRange: [4, 6],
        heightInRange: [72, 79],
        weightLbsRange: [190, 235],
        archetypes: ['Anchor', 'Interceptor'],
        statWeights: { offense: 0.65, defense: 1.18, speed: 0.9, stamina: 1.05, iq: 1.02 },
      },
    ],
    scoringEvents: [
      { id: 'goal', name: 'Zone Goal', points: 2, weight: 65 },
      { id: 'super', name: 'Hyper Shot', points: 5, weight: 35 },
    ],
    expectedScoringEventsPerTeam: 8.5,
    startingScore: 0,
    lowestScoreWins: false,
    statColumns: [
      { key: 'pts', label: 'PTS', format: 'int' },
      { key: 'assists', label: 'AST', format: 'int' },
      { key: 'blocks', label: 'BLK', format: 'int' },
    ],
    playstyles: ['Blitz Tempo', 'Zone Lock', 'Counter Surge'],
    venueTemplates: ['Arena', 'Dome', 'Plex'],
    equipmentIconIds: ['lightning', 'atom-core'],
    jerseySilhouette: 'esports-hoodie',
    accentColor: '#38bdf8',
  };
}

export const SportCreatorPanel: React.FC = () => {
  const {
    allSports,
    activeSportId,
    selectActiveSport,
    saveCustomSport,
    deleteCustomSport,
    user,
    showToast,
  } = useApp();

  const [draft, setDraft] = useState<SportDefinition>(() => createBlankSport());
  const [shareSportId, setShareSportId] = useState<string | null>(null);
  const shareTarget = allSports.find((s) => s.id === shareSportId && !s.isBuiltIn) ?? null;

  const handleLoadBuiltInTemplate = (src: SportDefinition) => {
    setDraft({
      ...JSON.parse(JSON.stringify(src)),
      id: `custom-${createUuid().slice(0, 8)}`,
      name: `${src.name.split(' ')[0]} Custom`,
      isBuiltIn: false,
    });
    showToast(`Loaded ${src.name} as template`);
  };

  const handleEditCustom = (sp: SportDefinition) => {
    setDraft(JSON.parse(JSON.stringify(sp)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      showToast('Sport name cannot be empty');
      return;
    }
    if (draft.positions.length === 0) {
      showToast('Add at least 1 position');
      return;
    }
    saveCustomSport(draft);
    selectActiveSport(draft.id, true);
  };

  const addPosition = () => {
    const newPos: SportPositionSpec = {
      code: `P${draft.positions.length + 1}`,
      name: 'Utility',
      countRange: [2, 3],
      heightInRange: [70, 76],
      weightLbsRange: [175, 215],
      archetypes: ['All-Rounder'],
      statWeights: { offense: 1, defense: 1, speed: 1, stamina: 1, iq: 1 },
    };
    setDraft((d) => ({ ...d, positions: [...d.positions, newPos] }));
  };

  const addScoringEvent = () => {
    const ev: ScoringEvent = {
      id: `ev-${Date.now().toString(36)}`,
      name: 'Bonus Play',
      points: 1,
      weight: 25,
    };
    setDraft((d) => ({ ...d, scoringEvents: [...d.scoringEvents, ev] }));
  };

  const addPenaltyEvent = () => {
    const ev: ScoringEvent = {
      id: `pen-${Date.now().toString(36)}`,
      name: 'Penalty / Foul',
      points: -1,
      weight: 25,
    };
    setDraft((d) => ({ ...d, scoringEvents: [...d.scoringEvents, ev] }));
  };

  const totalEventWeight = draft.scoringEvents.reduce((acc, ev) => acc + Math.max(1, ev.weight), 0);
  const avgPointsPerEvent =
    draft.scoringEvents.length > 0 && totalEventWeight > 0
      ? draft.scoringEvents.reduce((acc, ev) => acc + ev.points * Math.max(1, ev.weight), 0) /
        totalEventWeight
      : 0;
  const startingScoreVal = draft.startingScore ?? 0;
  const expectedAvgScore =
    draft.scoringEvents.length === 0 || draft.expectedScoringEventsPerTeam <= 0
      ? startingScoreVal
      : startingScoreVal + draft.expectedScoringEventsPerTeam * avgPointsPerEvent;

  const addStatColumn = () => {
    const st: SportStatDef = {
      key: `stat${draft.statColumns.length + 1}`,
      label: 'STAT',
      format: 'int',
    };
    setDraft((d) => ({ ...d, statColumns: [...d.statColumns, st] }));
  };

  return (
    <div className="space-y-6">
      {/* Built-in & Custom Sports Library */}
      <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              Multi-Sport Library &amp; Custom Sport Creator
            </h2>
            <p className="text-xs text-slate-400">
              8 built-in sports plus unlimited custom sports persisted in localStorage
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDraft(createBlankSport())}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Blank Sport
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {allSports.map((sp) => {
            const isActive = sp.id === activeSportId;
            return (
              <div
                key={sp.id}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition ${
                  isActive
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="h-10 w-10 shrink-0 rounded-lg border border-slate-800 bg-slate-900 p-1"
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
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        sp.isBuiltIn
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {sp.isBuiltIn ? 'Built-In' : 'Custom'}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-white uppercase">
                    {sp.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {sp.activeLineupSize} starters · {sp.rosterSize.min}–{sp.rosterSize.max} roster · {sp.periodCount}× {sp.periodName}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    Pos: {sp.positions.map((p) => p.code).join(', ')}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-2.5">
                  <button
                    type="button"
                    onClick={() => selectActiveSport(sp.id, true)}
                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {isActive ? 'Active' : 'Use Sport'}
                  </button>
                  {sp.isBuiltIn ? (
                    <button
                      type="button"
                      onClick={() => handleLoadBuiltInTemplate(sp)}
                      title="Clone as Custom Sport"
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-sky-300 hover:bg-slate-800 cursor-pointer"
                    >
                      Clone
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditCustom(sp)}
                        title="Edit Custom Sport"
                        className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-amber-400 hover:bg-slate-800 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareSportId(sp.id)}
                        title="Share & Permissions"
                        className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-emerald-400 hover:bg-slate-800 cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadJsonFile(sp, `${sp.name.toLowerCase().replace(/\s+/g, '-')}.json`)}
                        title="Export Sport JSON"
                        className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-sky-400 hover:bg-slate-800 cursor-pointer"
                      >
                        <FileJson className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomSport(sp.id)}
                        title="Delete Custom Sport"
                        className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Sport Editor Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-800 bg-[#131b2c] p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-amber-400" />
            <h3 className="font-display text-xl font-bold text-white uppercase">
              Custom Sport Designer — {draft.name || 'Untitled'}
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                downloadJsonFile(
                  draft,
                  `${(draft.name || 'custom-sport').toLowerCase().replace(/\s+/g, '-')}.json`
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              <FileJson className="h-4 w-4 text-sky-400" />
              Export Sport JSON
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Save &amp; Activate Custom Sport
            </button>
          </div>
        </div>

        {/* Quick Guide Banner */}
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sky-200">How Custom Sports Work</p>
            <p className="text-[11px] leading-relaxed text-slate-300/90">
              1) <strong>Identity &amp; Periods</strong> sets the labels shown across schedules and match cards.{' '}
              2) <strong>Scoring Events &amp; Penalties</strong> controls how matches simulate scores (supports positive plays, negative penalties, starting scores, lowest-score-wins, or 0 plays for shootout-only sports).{' '}
              3) <strong>Winner Criterion &amp; Positions</strong> sets default league table rules and what players get drafted onto every club.
            </p>
          </div>
        </div>

        {/* Basic Identity, Terminology & Periods */}
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Sport Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">Shown in the sport selector and Community Hub.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Score Unit</label>
            <input
              type="text"
              value={draft.terminology.scoreUnit}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  terminology: { ...draft.terminology, scoreUnit: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">Plural word for points (e.g., Goals, Points, Penalties, Strokes).</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Match Noun</label>
            <input
              type="text"
              value={draft.terminology.matchUnit}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  terminology: { ...draft.terminology, matchUnit: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">Singular word for a fixture (e.g., Match, Game, Bout, Round).</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Venue Noun</label>
            <input
              type="text"
              value={draft.terminology.venueNoun}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  terminology: { ...draft.terminology, venueNoun: e.target.value },
                  venueTemplates: [e.target.value || 'Arena'],
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">Default stadium suffix used for auto-generated teams (e.g., Arena, Pitch, Course).</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Period Name</label>
            <input
              type="text"
              value={draft.periodName}
              onChange={(e) => setDraft({ ...draft, periodName: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">e.g., Half, Quarter, Set, Heat</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300"># Periods</label>
            <input
              type="number"
              min={1}
              max={12}
              value={draft.periodCount}
              onChange={(e) => setDraft({ ...draft, periodCount: Number(e.target.value) || 2 })}
              className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">Parts per regulation match</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Period Length</label>
            <input
              type="text"
              value={draft.periodLengthLabel}
              onChange={(e) => setDraft({ ...draft, periodLengthLabel: e.target.value })}
              placeholder="e.g. 12 min or Unlimited"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">Display text (e.g., 10 min, 25 pts, or Unlimited)</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Roster Min / Max</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={5}
                max={35}
                value={draft.rosterSize.min}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    rosterSize: { ...draft.rosterSize, min: Number(e.target.value) || 10 },
                  })
                }
                className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white"
              />
              <input
                type="number"
                min={5}
                max={40}
                value={draft.rosterSize.max}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    rosterSize: { ...draft.rosterSize, max: Number(e.target.value) || 15 },
                  })
                }
                className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Players generated per club</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Active Lineup</label>
            <input
              type="number"
              min={1}
              max={20}
              value={draft.activeLineupSize}
              onChange={(e) =>
                setDraft({ ...draft, activeLineupSize: Number(e.target.value) || 5 })
              }
              className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">Starters playing at once</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Jersey Silhouette</label>
            <select
              value={draft.jerseySilhouette}
              onChange={(e) =>
                setDraft({ ...draft, jerseySilhouette: e.target.value as JerseySilhouette })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white"
            >
              {JERSEY_OPTIONS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-slate-500">Vector kit icon for teams</p>
          </div>
        </div>

        {/* Scoring Events & Avg Events */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                  Scoring Events &amp; Penalties
                </h4>
                <p className="text-[11px] text-slate-400">
                  Positive plays reward teams; negative penalties penalize teams (stronger teams commit fewer penalties).
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={addPenaltyEvent}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Add Penalty (-1)
                </button>
                <button
                  type="button"
                  onClick={addScoringEvent}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Add Play
                </button>
              </div>
            </div>

            {draft.scoringEvents.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_4.25rem_4.25rem_1.75rem] gap-2 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>Play / Penalty Name</span>
                  <span className="text-center">Pts (+/-)</span>
                  <span className="text-center">Weight</span>
                  <span />
                </div>
                {draft.scoringEvents.map((ev, idx) => (
                  <div key={ev.id} className="grid grid-cols-[1fr_4.25rem_4.25rem_1.75rem] items-center gap-2 text-xs">
                    <input
                      type="text"
                      value={ev.name}
                      onChange={(e) => {
                        const next = [...draft.scoringEvents];
                        next[idx] = { ...ev, name: e.target.value };
                        setDraft({ ...draft, scoringEvents: next });
                      }}
                      placeholder="Play or Penalty Name"
                      className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="number"
                      min={-100}
                      max={100}
                      value={ev.points}
                      onChange={(e) => {
                        const parsed = Number.parseInt(e.target.value, 10);
                        const next = [...draft.scoringEvents];
                        next[idx] = { ...ev, points: Number.isNaN(parsed) ? 0 : parsed };
                        setDraft({ ...draft, scoringEvents: next });
                      }}
                      title="Points added (positive) or deducted (negative) per occurrence"
                      className={`font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-center ${
                        ev.points < 0
                          ? 'text-rose-300'
                          : ev.points === 0
                            ? 'text-slate-300'
                            : 'text-amber-300'
                      }`}
                    />
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={ev.weight}
                      onChange={(e) => {
                        const parsed = Number.parseInt(e.target.value, 10);
                        const next = [...draft.scoringEvents];
                        next[idx] = { ...ev, weight: Number.isNaN(parsed) ? 1 : Math.max(1, parsed) };
                        setDraft({ ...draft, scoringEvents: next });
                      }}
                      title="Relative frequency weight (higher = occurs more often compared to other rows)"
                      className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-center text-sky-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          scoringEvents: draft.scoringEvents.filter((_, i) => i !== idx),
                        })
                      }
                      title="Remove event (you can have 0 plays for shootout-only sports)"
                      className="p-1 text-rose-400 hover:bg-rose-500/15 rounded cursor-pointer flex justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-[11px] text-amber-200/90">
                <strong>No scoring plays configured (0-Play Mode):</strong> Every match starts tied at the{' '}
                <strong>Starting Score ({startingScoreVal})</strong> and is decided strictly by Overtime / Shootout rules or ends in a draw if draws are allowed.
              </div>
            )}

            <div className="grid gap-3 pt-2 sm:grid-cols-3 border-t border-slate-800/80 text-xs">
              <div>
                <label className="mb-1 block text-[11px] text-slate-300">
                  Expected Events / Team
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={80}
                  value={draft.expectedScoringEventsPerTeam}
                  onChange={(e) => {
                    const parsed = Number.parseFloat(e.target.value);
                    setDraft({
                      ...draft,
                      expectedScoringEventsPerTeam: Number.isNaN(parsed) ? 0 : Math.max(0, parsed),
                    });
                  }}
                  className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-center text-white"
                />
                <p className="mt-1 text-[10px] text-slate-500">Avg plays/penalties per team each match (0 = no events).</p>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-300">Starting Score</label>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={draft.startingScore ?? 0}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    setDraft({
                      ...draft,
                      startingScore: Number.isNaN(parsed) ? 0 : parsed,
                    });
                  }}
                  className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-center text-white"
                />
                <p className="mt-1 text-[10px] text-slate-500">Score each team starts at (e.g., 100 for penalty deductions).</p>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-300">Win Condition</label>
                <select
                  value={draft.lowestScoreWins ? 'lowest' : 'highest'}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      lowestScoreWins: e.target.value === 'lowest',
                    })
                  }
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                >
                  <option value="highest">Highest Score Wins</option>
                  <option value="lowest">Lowest Score Wins</option>
                </select>
                <p className="mt-1 text-[10px] text-slate-500">Use Lowest Score Wins for penalty-count or golf sports.</p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-3 py-2 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>Weight</strong> = relative odds (<code className="text-sky-300">weight / sum</code>; doesn&apos;t need to equal 100).
              </span>
              <span className="font-mono-code text-amber-300 font-semibold">
                Est. Avg Score: {expectedAvgScore.toFixed(1)} {draft.terminology.scoreUnit || 'pts'}/team
              </span>
            </div>
          </div>

          {/* League Winner & Custom Standings Points */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
                Winner Criterion &amp; Standings Points
              </h4>
              <p className="text-[11px] text-slate-400">
                Default league table sorting and tie-breaking rules whenever you create a league using this sport.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-300">Champion / Seeding Rule</label>
                <select
                  value={draft.defaultRules.winnerCriterion}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      defaultRules: {
                        ...draft.defaultRules,
                        winnerCriterion: e.target.value as WinnerCriterion,
                      },
                    })
                  }
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                >
                  <option value="standings-points">Most Standings Points</option>
                  <option value="win-pct">Best Win %</option>
                  <option value="goal-diff">Highest Point Differential</option>
                  <option value="goals-for">Most Total Points Scored</option>
                  <option value="head-to-head">Head-to-Head Record</option>
                </select>
                <p className="mt-1 text-[10px] text-slate-500">Primary stat used to rank teams in standings.</p>
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Overtime / Tie Rule</label>
                <select
                  value={draft.defaultRules.overtimeRule}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      defaultRules: {
                        ...draft.defaultRules,
                        overtimeRule: e.target.value as OvertimeRule,
                        drawsAllowed: e.target.value === 'draws-allowed',
                      },
                    })
                  }
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                >
                  <option value="draws-allowed">Draws / Ties Allowed</option>
                  <option value="overtime-periods">Overtime Periods (No Ties)</option>
                  <option value="extra-time-penalties">Extra Time + Shootout</option>
                  <option value="penalties">Direct Shootout / Penalties</option>
                  <option value="golden-goal">Golden Goal Sudden Death</option>
                </select>
                <p className="mt-1 text-[10px] text-slate-500">How tied matches finish (crucial for 0-play sports).</p>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] text-slate-400">
                Table points awarded to a team&apos;s standings based on match outcome:
              </p>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {(
                  [
                    ['pointsWin', 'Win'],
                    ['pointsOtWin', 'OT Win'],
                    ['pointsDraw', 'Draw'],
                    ['pointsOtLoss', 'OT Loss'],
                    ['pointsLoss', 'Loss'],
                  ] as const
                ).map(([field, lbl]) => (
                  <div key={field}>
                    <label className="mb-1 block text-[10px] text-slate-400">{lbl}</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={draft.defaultRules[field]}
                      onChange={(e) => {
                        const parsed = Number.parseInt(e.target.value, 10);
                        setDraft({
                          ...draft,
                          defaultRules: {
                            ...draft.defaultRules,
                            [field]: Number.isNaN(parsed) ? 0 : parsed,
                          },
                        });
                      }}
                      className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-center font-bold text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Positions & Custom Stat Columns */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold tracking-wider text-sky-300 uppercase">
                  Custom Positions ({draft.positions.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Roles assigned when generating club rosters. Short code appears next to player names.
                </p>
              </div>
              <button
                type="button"
                onClick={addPosition}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Position
              </button>
            </div>
            <div className="grid grid-cols-[4rem_1fr_1.75rem] gap-2 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Code</span>
              <span>Full Position Name</span>
              <span />
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {draft.positions.map((pos, idx) => (
                <div key={idx} className="grid grid-cols-[4rem_1fr_1.75rem] items-center gap-2 text-xs">
                  <input
                    type="text"
                    maxLength={5}
                    value={pos.code}
                    onChange={(e) => {
                      const next = [...draft.positions];
                      next[idx] = { ...pos, code: e.target.value.toUpperCase() };
                      setDraft({ ...draft, positions: next });
                    }}
                    placeholder="CAP"
                    className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 font-bold text-sky-300 uppercase"
                  />
                  <input
                    type="text"
                    value={pos.name}
                    onChange={(e) => {
                      const next = [...draft.positions];
                      next[idx] = { ...pos, name: e.target.value };
                      setDraft({ ...draft, positions: next });
                    }}
                    placeholder="e.g. Captain"
                    className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                  />
                  {draft.positions.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          positions: draft.positions.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1 text-rose-400 hover:bg-rose-500/15 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold tracking-wider text-purple-300 uppercase">
                  Player Stat Columns ({draft.statColumns.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Columns tracked for every player across Preseason and Regular Season leaderboards.
                </p>
              </div>
              <button
                type="button"
                onClick={addStatColumn}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Stat
              </button>
            </div>
            <div className="grid grid-cols-[1fr_8.5rem_1.75rem] gap-2 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Stat Label</span>
              <span>Display Format</span>
              <span />
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {draft.statColumns.map((st, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_8.5rem_1.75rem] items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => {
                      const next = [...draft.statColumns];
                      next[idx] = {
                        ...st,
                        label: e.target.value,
                        key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') || st.key,
                      };
                      setDraft({ ...draft, statColumns: next });
                    }}
                    placeholder="e.g. PTS, PEN, AST"
                    className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                  />
                  <select
                    value={st.format}
                    onChange={(e) => {
                      const next = [...draft.statColumns];
                      next[idx] = {
                        ...st,
                        format: e.target.value as SportStatDef['format'],
                      };
                      setDraft({ ...draft, statColumns: next });
                    }}
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-200"
                  >
                    <option value="int">Integer (12)</option>
                    <option value="dec1">Per-Game (12.4)</option>
                    <option value="pct">Percentage (74%)</option>
                    <option value="avg3">Average (.312)</option>
                  </select>
                  {draft.statColumns.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          statColumns: draft.statColumns.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1 text-rose-400 hover:bg-rose-500/15 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Default Break Weeks */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-sky-300 uppercase">
                Optional Default Break / Bye Weeks
              </h4>
              <p className="text-[11px] text-slate-400">
                Automatically assign staggered rest rounds (no matches played) when creating leagues with this sport.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(draft.defaultBreakWeeks?.enabled)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    defaultBreakWeeks: {
                      enabled: e.target.checked,
                      breaksPerTeam: draft.defaultBreakWeeks?.breaksPerTeam ?? 1,
                      windowStartRound: draft.defaultBreakWeeks?.windowStartRound ?? 2,
                      windowEndRound: draft.defaultBreakWeeks?.windowEndRound ?? 8,
                      teamBreaks: draft.defaultBreakWeeks?.teamBreaks ?? {},
                    },
                  })
                }
                className="h-4 w-4 rounded accent-sky-500"
              />
              <span>{draft.defaultBreakWeeks?.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          {draft.defaultBreakWeeks?.enabled && (
            <div className="grid gap-3 sm:grid-cols-3 text-xs pt-1">
              <div>
                <label className="mb-1 block text-slate-300">Breaks per Team</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={draft.defaultBreakWeeks.breaksPerTeam}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      defaultBreakWeeks: {
                        ...draft.defaultBreakWeeks!,
                        breaksPerTeam: Math.max(1, Math.min(4, Number(e.target.value) || 1)),
                      },
                    })
                  }
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white"
                />
                <p className="mt-1 text-[10px] text-slate-500">How many rest rounds each club gets during the season.</p>
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Window Start Matchday</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={draft.defaultBreakWeeks.windowStartRound}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      defaultBreakWeeks: {
                        ...draft.defaultBreakWeeks!,
                        windowStartRound: Math.max(1, Number(e.target.value) || 2),
                      },
                    })
                  }
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white"
                />
                <p className="mt-1 text-[10px] text-slate-500">Earliest matchday/round a team can be given a break.</p>
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Window End Matchday</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={draft.defaultBreakWeeks.windowEndRound}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      defaultBreakWeeks: {
                        ...draft.defaultBreakWeeks!,
                        windowEndRound: Math.max(1, Number(e.target.value) || 8),
                      },
                    })
                  }
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white"
                />
                <p className="mt-1 text-[10px] text-slate-500">Latest matchday/round before breaks stop being scheduled.</p>
              </div>
            </div>
          )}
        </div>
      </form>

      {shareTarget && (
        <SharePermissionsModal
          isOpen={true}
          onClose={() => setShareSportId(null)}
          title={shareTarget.name}
          kind="sport"
          resourceId={shareTarget.id}
          sharing={shareTarget.sharing ?? createDefaultShareMetadata()}
          canManageCollaborators={
            resolveUserPermissions(shareTarget, user).canManageCollaborators
          }
          onSave={(nextSharing) =>
            saveCustomSport({ ...shareTarget, sharing: nextSharing })
          }
        />
      )}
    </div>
  );
};
