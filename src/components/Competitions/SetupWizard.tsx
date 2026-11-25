import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Flame,
  GitBranch,
  Layers,
  Palette,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createCustomAdvantageRule,
  PRESET_ADVANTAGE_RULES,
} from '../../engine/simulation/advantageEngine';
import { createCup, createGroupKnockout } from '../../engine/simulation/cupEngine';
import { createLeague } from '../../engine/simulation/leagueEngine';
import { DEFAULT_PRESEASON_CONFIG } from '../../engine/simulation/preseasonEngine';
import {
  buildDefaultRulesForSport,
  DEFAULT_BREAK_WEEKS_CONFIG,
  DEFAULT_COMPETITION_BRANDING,
  DEFAULT_SCHEDULE_CONFIG,
} from '../../engine/simulation/scheduler';
import {
  createCompetitionConstraints,
  generateUniqueTeam,
} from '../../engine/generator/teamGenerator';
import { getPrimaryColorSchemeKey } from '../../engine/svg-logo/palettes';
import {
  buildTrophySvgString,
  TROPHY_STYLES,
  type TrophyStyle,
} from '../../engine/svg-logo/trophies';
import type {
  AdvantageRewardType,
  AdvantageRule,
  AdvantageTriggerType,
  Competition,
  CompetitionBranding,
  CompetitionFormat,
  CompetitionRules,
  CompetitionTier,
  OvertimeRule,
  PreseasonConfig,
  ScheduleConfig,
  Team,
  TiebreakerCriterion,
  WinnerCriterion,
} from '../../types';
import { LogoSvg } from '../common/LogoSvg';

interface SetupWizardProps {
  onCancel: () => void;
  onCreated: (comp: Competition) => void;
}

type PopulateMode = 'brand-new' | 'vault-only' | 'mix';

const FORMAT_OPTIONS: {
  id: CompetitionFormat;
  label: string;
  desc: string;
}[] = [
  { id: 'single-rr', label: 'Single Round-Robin', desc: 'Every club meets once' },
  { id: 'double-rr', label: 'Double Round-Robin', desc: 'Home & away legs' },
  { id: 'group-knockout', label: 'Groups + Knockout', desc: 'Group tables into playoffs' },
  { id: 'single-elim', label: 'Single-Elim Cup', desc: 'Sudden-death bracket + byes' },
  { id: 'double-elim', label: 'Double-Elim Cup', desc: 'Winners & Losers brackets' },
];

const WEEKDAYS = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
];

const TIEBREAKER_LABELS: Record<TiebreakerCriterion, string> = {
  'goal-diff': 'Point / Goal Differential',
  'head-to-head': 'Head-to-Head Record',
  'goals-for': 'Total Points / Goals Scored',
  'win-pct': 'Win Percentage',
};

const TIER_OPTIONS: CompetitionTier[] = [
  'Premier',
  'Championship',
  'Continental',
  'Global',
  'Invitational',
  'Amateur',
];

const BRAND_COLORS = ['#f59e0b', '#38bdf8', '#10b981', '#f43f5e', '#a855f7', '#eab308'];

export const SetupWizard: React.FC<SetupWizardProps> = ({ onCancel, onCreated }) => {
  const {
    vault,
    registry,
    allSports,
    activeSportId,
    getSport,
    updateRegistryDirect,
    showToast,
  } = useApp();

  const [sportId, setSportId] = useState<string>(activeSportId);
  const selectedSport = getSport(sportId);

  const [name, setName] = useState(`Apex ${selectedSport.name.split(' ')[0]} League`);
  const [format, setFormat] = useState<CompetitionFormat>('single-rr');
  const [size, setSize] = useState<number>(8);
  const [groupCount, setGroupCount] = useState<number>(2);

  const [rules, setRules] = useState<CompetitionRules>(() =>
    buildDefaultRulesForSport(selectedSport)
  );
  const [schedule, setSchedule] = useState<ScheduleConfig>(() => ({
    ...DEFAULT_SCHEDULE_CONFIG,
    breakWeeks: selectedSport.defaultBreakWeeks
      ? { ...selectedSport.defaultBreakWeeks, teamBreaks: { ...selectedSport.defaultBreakWeeks.teamBreaks } }
      : { ...DEFAULT_BREAK_WEEKS_CONFIG, teamBreaks: {} },
  }));
  const [branding, setBranding] = useState<CompetitionBranding>({
    ...DEFAULT_COMPETITION_BRANDING,
    accentColor: selectedSport.accentColor,
  });
  const [preseason, setPreseason] = useState<PreseasonConfig>(DEFAULT_PRESEASON_CONFIG);
  const [advantageRules, setAdvantageRules] = useState<AdvantageRule[]>(
    PRESET_ADVANTAGE_RULES.map((r) => ({ ...r }))
  );

  // New custom rule builder state
  const [newRuleName, setNewRuleName] = useState('Custom Bonus');
  const [newTrigger, setNewTrigger] = useState<AdvantageTriggerType>('margin-of-victory');
  const [newThreshold, setNewThreshold] = useState(10);
  const [newReward, setNewReward] = useState<AdvantageRewardType>('bonus-standings-points');
  const [newRewardValue, setNewRewardValue] = useState(1);

  const [mode, setMode] = useState<PopulateMode>('brand-new');
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const handleSportChange = (nextSportId: string) => {
    setSportId(nextSportId);
    const sp = getSport(nextSportId);
    setRules(buildDefaultRulesForSport(sp));
    setSchedule((s) => ({
      ...s,
      breakWeeks: sp.defaultBreakWeeks
        ? { ...sp.defaultBreakWeeks, teamBreaks: { ...sp.defaultBreakWeeks.teamBreaks } }
        : { ...DEFAULT_BREAK_WEEKS_CONFIG, teamBreaks: {} },
    }));
    setBranding((b) => ({ ...b, accentColor: sp.accentColor }));
    setName(`Apex ${sp.name.split(' ')[0]} League`);
    setSelectedTeams([]);
  };

  const handleFormatChange = (nextFormat: CompetitionFormat) => {
    setFormat(nextFormat);
    const shortSport = selectedSport.name.split(' ')[0];
    if (nextFormat === 'single-elim' || nextFormat === 'double-elim') {
      setName(`Forge ${shortSport} Cup`);
    } else if (nextFormat === 'group-knockout') {
      setName(`Continental ${shortSport} Trophy`);
    } else {
      setName(`Apex ${shortSport} League`);
    }
  };

  const handleSizeChange = (raw: number) => {
    const clamped = Math.max(3, Math.min(64, Math.round(raw) || 3));
    setSize(clamped);
    if (groupCount > Math.floor(clamped / 2)) {
      setGroupCount(Math.max(2, Math.floor(clamped / 2)));
    }
    if (selectedTeams.length > clamped) {
      setSelectedTeams((prev) => prev.slice(0, clamped));
    }
  };

  const toggleAllowedDay = (day: number) => {
    setSchedule((prev) => {
      const exists = prev.allowedDays.includes(day);
      if (exists && prev.allowedDays.length === 1) {
        showToast('At least one match day of the week must remain active');
        return prev;
      }
      const next = exists
        ? prev.allowedDays.filter((d) => d !== day)
        : [...prev.allowedDays, day].sort((a, b) => a - b);
      return { ...prev, allowedDays: next };
    });
  };

  const moveTiebreaker = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= rules.tiebreakers.length) return;
    const copy = [...rules.tiebreakers];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setRules((prev) => ({ ...prev, tiebreakers: copy }));
  };

  const handleAddCustomAdvantage = () => {
    const rule = createCustomAdvantageRule({
      name: newRuleName.trim() || 'Custom Rule',
      enabled: true,
      trigger: newTrigger,
      threshold: newThreshold,
      reward: newReward,
      rewardValue: newRewardValue,
      description: `If ${newTrigger} >= ${newThreshold}, grant ${newReward} (+${newRewardValue})`,
    });
    setAdvantageRules((prev) => [...prev, rule]);
    showToast(`Added rule "${rule.name}"`);
  };

  const getVaultTeamConflict = (candidate: Team): string | null => {
    if (selectedTeams.some((t) => t.id === candidate.id)) {
      return 'Already added';
    }
    const scheme = getPrimaryColorSchemeKey(candidate.logo);
    for (const existing of selectedTeams) {
      if (existing.logo.iconId === candidate.logo.iconId) {
        return `Shares "${candidate.logo.iconId}" icon with ${existing.name}`;
      }
      if (existing.city.toLowerCase() === candidate.city.toLowerCase()) {
        return `Shares city "${candidate.city}" with ${existing.name}`;
      }
      if (getPrimaryColorSchemeKey(existing.logo) === scheme) {
        return `Shares primary color scheme with ${existing.name}`;
      }
    }
    return null;
  };

  const handleToggleVaultTeam = (team: Team) => {
    const exists = selectedTeams.some((t) => t.id === team.id);
    if (exists) {
      setSelectedTeams((prev) => prev.filter((t) => t.id !== team.id));
      return;
    }
    if (selectedTeams.length >= size) {
      showToast(`Competition is already full (${size} teams)`);
      return;
    }
    const conflict = getVaultTeamConflict(team);
    if (conflict) {
      showToast(`Uniqueness rule: ${conflict}`);
      return;
    }
    setSelectedTeams((prev) => [...prev, team]);
  };

  const competitionSource =
    format === 'single-rr' || format === 'double-rr' ? 'league' : 'cup';

  const handleAutoFillRemaining = () => {
    const remaining = size - selectedTeams.length;
    if (remaining <= 0) return;

    const constraints = createCompetitionConstraints(selectedTeams);
    let currentReg = registry;
    const generated: Team[] = [];

    for (let i = 0; i < remaining; i++) {
      const res = generateUniqueTeam(currentReg, {
        constraints,
        source: competitionSource,
        sport: selectedSport,
      });
      currentReg = res.registry;
      generated.push(res.team);
    }

    updateRegistryDirect(currentReg);
    setSelectedTeams((prev) => [...prev, ...generated]);
    showToast(`Auto-filled ${generated.length} unique ${selectedSport.name} team(s)`);
  };

  const handleGenerateAllNew = () => {
    const constraints = createCompetitionConstraints([]);
    let currentReg = registry;
    const generated: Team[] = [];

    for (let i = 0; i < size; i++) {
      const res = generateUniqueTeam(currentReg, {
        constraints,
        source: competitionSource,
        sport: selectedSport,
      });
      currentReg = res.registry;
      generated.push(res.team);
    }

    updateRegistryDirect(currentReg);
    setSelectedTeams(generated);
    showToast(`Generated ${size} unique ${selectedSport.name} teams`);
  };

  const uniquenessAudit = useMemo(() => {
    const icons = new Set<string>();
    const cities = new Set<string>();
    const schemes = new Set<string>();
    for (const t of selectedTeams) {
      icons.add(t.logo.iconId);
      cities.add(t.city.toLowerCase());
      schemes.add(getPrimaryColorSchemeKey(t.logo));
    }
    return {
      ok:
        icons.size === selectedTeams.length &&
        cities.size === selectedTeams.length &&
        schemes.size === selectedTeams.length,
    };
  }, [selectedTeams]);

  const handleCreate = () => {
    let finalTeams = selectedTeams;
    if (mode === 'brand-new' && finalTeams.length !== size) {
      const constraints = createCompetitionConstraints([]);
      let currentReg = registry;
      const generated: Team[] = [];
      for (let i = 0; i < size; i++) {
        const res = generateUniqueTeam(currentReg, {
          constraints,
          source: competitionSource,
          sport: selectedSport,
        });
        currentReg = res.registry;
        generated.push(res.team);
      }
      updateRegistryDirect(currentReg);
      finalTeams = generated;
    }

    if (finalTeams.length !== size) {
      showToast(`Please select or auto-fill all ${size} team slots first`);
      return;
    }

    let comp: Competition;
    if (format === 'single-rr' || format === 'double-rr') {
      comp = createLeague(
        name,
        finalTeams,
        format,
        rules,
        schedule,
        branding,
        sportId,
        preseason,
        advantageRules
      );
    } else if (format === 'group-knockout') {
      comp = createGroupKnockout(
        name,
        finalTeams,
        groupCount,
        rules,
        schedule,
        branding,
        sportId,
        preseason,
        advantageRules
      );
    } else {
      comp = createCup(
        name,
        finalTeams,
        format,
        rules,
        schedule,
        branding,
        sportId,
        preseason,
        advantageRules
      );
    }

    onCreated(comp);
  };

  const maxGroups = Math.max(2, Math.min(16, Math.floor(size / 2)));

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-[#131b2c] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              Competition Setup Wizard
            </h2>
            <p className="text-xs text-slate-400">
              Multi-sport engine, optional Preseason, If/Then Advantage Rules, and strict zero-duplicate clubs
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Sport, Identity & Branding */}
      <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-12">
        <div className="md:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <Dumbbell className="h-3.5 w-3.5" />
            Sport
          </label>
          <select
            value={sportId}
            onChange={(e) => handleSportChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white focus:border-amber-500 focus:outline-none"
          >
            {allSports.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.isBuiltIn ? sp.name : `★ ${sp.name}`}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Competition Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-medium text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Tier
          </label>
          <select
            value={branding.tier}
            onChange={(e) =>
              setBranding((b) => ({ ...b, tier: e.target.value as CompetitionTier }))
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-3">
          <div
            className="h-14 w-14 shrink-0 rounded-xl border border-slate-700 bg-slate-900 p-2"
            dangerouslySetInnerHTML={{
              __html: buildTrophySvgString(branding.trophyStyle, branding.accentColor),
            }}
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-1">
              <Palette className="h-3.5 w-3.5 text-amber-400" />
              <select
                value={branding.trophyStyle}
                onChange={(e) =>
                  setBranding((b) => ({
                    ...b,
                    trophyStyle: e.target.value as TrophyStyle,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
              >
                {TROPHY_STYLES.map((ts) => (
                  <option key={ts.id} value={ts.id}>
                    {ts.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              {BRAND_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setBranding((b) => ({ ...b, accentColor: hex }))}
                  className={`h-4 w-4 rounded-full border cursor-pointer ${
                    branding.accentColor === hex ? 'border-white scale-110' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) =>
                  setBranding((b) => ({ ...b, accentColor: e.target.value }))
                }
                className="h-5 w-6 cursor-pointer rounded border border-slate-700 bg-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Format & Any Team Count (3-64) */}
      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase">
          <Layers className="h-4 w-4" />
          Format &amp; Team Count
        </div>

        <div className="grid gap-2 sm:grid-cols-5">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleFormatChange(opt.id)}
              className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                format === opt.id
                  ? 'border-amber-500 bg-amber-500/15'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-white">{opt.label}</div>
              <div className="mt-0.5 text-[11px] text-slate-400">{opt.desc}</div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Custom Team Count (3–64)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={3}
                max={64}
                value={size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="font-mono-code w-20 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {[5, 6, 8, 10, 12, 16, 24, 32, 48, 64].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSizeChange(preset)}
                    className={`font-mono-code rounded-lg border px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      size === preset
                        ? 'border-amber-500 bg-amber-500 text-slate-950'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {format === 'group-knockout' && (
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Groups (2–{maxGroups})
              </label>
              <input
                type="number"
                min={2}
                max={maxGroups}
                value={groupCount}
                onChange={(e) =>
                  setGroupCount(
                    Math.max(2, Math.min(maxGroups, Number(e.target.value) || 2))
                  )
                }
                className="font-mono-code w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-sky-300"
              />
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Calendar & Rules */}
      <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-300 uppercase">
            <Calendar className="h-4 w-4" />
            Regular Season / Tournament Calendar
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Start Date</label>
              <input
                type="date"
                value={schedule.startDate}
                onChange={(e) =>
                  setSchedule((s) => ({ ...s, startDate: e.target.value }))
                }
                className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>End Date</span>
                <button
                  type="button"
                  onClick={() =>
                    setSchedule((s) => ({
                      ...s,
                      endDateMode: s.endDateMode === 'auto' ? 'fixed' : 'auto',
                    }))
                  }
                  className="text-[11px] font-semibold text-sky-400 hover:underline cursor-pointer"
                >
                  {schedule.endDateMode === 'auto' ? 'Auto' : 'Fixed'}
                </button>
              </div>
              {schedule.endDateMode === 'fixed' ? (
                <input
                  type="date"
                  value={schedule.endDate}
                  min={schedule.startDate}
                  onChange={(e) =>
                    setSchedule((s) => ({ ...s, endDate: e.target.value }))
                  }
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                  Auto-calculated from pacing
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Match Days</label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((wd) => {
                const active = schedule.allowedDays.includes(wd.day);
                return (
                  <button
                    key={wd.day}
                    type="button"
                    onClick={() => toggleAllowedDay(wd.day)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                        : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {wd.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Pacing Mode</label>
              <select
                value={schedule.pacingMode}
                onChange={(e) =>
                  setSchedule((s) => ({
                    ...s,
                    pacingMode: e.target.value as ScheduleConfig['pacingMode'],
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
              >
                <option value="min-rest-days">Min Rest Days</option>
                <option value="games-per-week">Games per Week</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                {schedule.pacingMode === 'min-rest-days' ? 'Rest Days' : 'Games / Week'}
              </label>
              <input
                type="number"
                min={schedule.pacingMode === 'min-rest-days' ? 0 : 1}
                max={schedule.pacingMode === 'min-rest-days' ? 30 : 7}
                value={
                  schedule.pacingMode === 'min-rest-days'
                    ? schedule.minRestDays
                    : schedule.gamesPerWeek
                }
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSchedule((s) =>
                    s.pacingMode === 'min-rest-days'
                      ? { ...s, minRestDays: Math.max(0, Math.min(30, v || 0)) }
                      : { ...s, gamesPerWeek: Math.max(1, Math.min(7, v || 1)) }
                  );
                }}
                className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
            <Settings2 className="h-4 w-4" />
            Winner Rule, Standings Points &amp; Tiebreakers
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Champion / Seeding Criterion
              </label>
              <select
                value={rules.winnerCriterion}
                onChange={(e) =>
                  setRules((r) => ({
                    ...r,
                    winnerCriterion: e.target.value as WinnerCriterion,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
              >
                <option value="standings-points">Most Standings Points</option>
                <option value="win-pct">Best Win %</option>
                <option value="goal-diff">Highest Differential</option>
                <option value="goals-for">Most Scored</option>
                <option value="head-to-head">Head-to-Head Record</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Overtime Rule</label>
              <select
                value={rules.overtimeRule}
                onChange={(e) =>
                  setRules((r) => ({
                    ...r,
                    overtimeRule: e.target.value as OvertimeRule,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
              >
                <option value="extra-time-penalties">Extra Time + Penalties</option>
                <option value="overtime-periods">Overtime Periods</option>
                <option value="penalties">Direct Shootout / Penalties</option>
                <option value="golden-goal">Golden Goal OT</option>
                <option value="draws-allowed">Draws / Ties Allowed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {(
              [
                ['pointsWin', 'Win'],
                ['pointsOtWin', 'OT W'],
                ['pointsDraw', 'Draw'],
                ['pointsOtLoss', 'OT L'],
                ['pointsLoss', 'Loss'],
              ] as const
            ).map(([field, lbl]) => (
              <div key={field}>
                <label className="mb-1 block text-[10px] text-slate-400">{lbl}</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={rules[field]}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, [field]: Math.max(0, Number(e.target.value) || 0) }))
                  }
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-xs font-bold text-white"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {rules.tiebreakers.map((tb, idx) => (
              <div
                key={tb}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs"
              >
                <span className="text-slate-200">
                  <span className="font-mono-code mr-2 text-amber-400">{idx + 1}.</span>
                  {TIEBREAKER_LABELS[tb]}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveTiebreaker(idx, -1)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === rules.tiebreakers.length - 1}
                    onClick={() => moveTiebreaker(idx, 1)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.homeFieldAdvantage}
              onChange={(e) =>
                setRules((r) => ({ ...r, homeFieldAdvantage: e.target.checked }))
              }
              className="h-4 w-4 rounded accent-amber-500"
            />
            <span>Enable Home-Field Advantage</span>
          </label>
        </div>
      </section>

      {/* Optional Custom Break Weeks (for League formats) */}
      {(format === 'single-rr' || format === 'double-rr') && (
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-300 uppercase">
              <Calendar className="h-4 w-4" />
              Optional Custom Break / Bye Weeks for Teams
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(schedule.breakWeeks?.enabled)}
                onChange={(e) =>
                  setSchedule((s) => ({
                    ...s,
                    breakWeeks: {
                      ...(s.breakWeeks ?? DEFAULT_BREAK_WEEKS_CONFIG),
                      enabled: e.target.checked,
                    },
                  }))
                }
                className="h-4 w-4 rounded accent-sky-500"
              />
              <span>{schedule.breakWeeks?.enabled ? 'Break Weeks Enabled' : 'Enable Break Weeks'}</span>
            </label>
          </div>

          {schedule.breakWeeks?.enabled && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-slate-400">
                    Auto Breaks / Team (if no per-team override)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={schedule.breakWeeks.breaksPerTeam}
                    onChange={(e) =>
                      setSchedule((s) => ({
                        ...s,
                        breakWeeks: {
                          ...s.breakWeeks!,
                          breaksPerTeam: Math.max(0, Math.min(4, Number(e.target.value) || 0)),
                        },
                      }))
                    }
                    className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Auto Window Start MD</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={schedule.breakWeeks.windowStartRound}
                    onChange={(e) =>
                      setSchedule((s) => ({
                        ...s,
                        breakWeeks: {
                          ...s.breakWeeks!,
                          windowStartRound: Math.max(1, Number(e.target.value) || 2),
                        },
                      }))
                    }
                    className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Auto Window End MD</label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={schedule.breakWeeks.windowEndRound}
                    onChange={(e) =>
                      setSchedule((s) => ({
                        ...s,
                        breakWeeks: {
                          ...s.breakWeeks!,
                          windowEndRound: Math.max(1, Number(e.target.value) || 8),
                        },
                      }))
                    }
                    className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] text-slate-400">
                  Specific Team Break Rounds (comma-separated Matchday numbers, e.g. &ldquo;3, 6&rdquo; — leave blank to skip or auto-stagger):
                </div>
                <div className="grid max-h-44 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: size }, (_, idx) => {
                    const team = selectedTeams[idx];
                    const key = team ? team.id : `slot-${idx}`;
                    const label = team ? team.name : `Team Slot #${idx + 1}`;
                    const currentVal = (schedule.breakWeeks?.teamBreaks?.[key] ?? []).join(', ');
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5"
                      >
                        <span className="truncate text-[11px] font-medium text-slate-200">
                          {label}
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. 3, 6"
                          value={currentVal}
                          onChange={(e) => {
                            const nums = e.target.value
                              .split(',')
                              .map((v) => parseInt(v.trim(), 10))
                              .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 120);
                            setSchedule((s) => ({
                              ...s,
                              breakWeeks: {
                                ...s.breakWeeks!,
                                teamBreaks: {
                                  ...(s.breakWeeks?.teamBreaks ?? {}),
                                  [key]: nums,
                                },
                              },
                            }));
                          }}
                          className="font-mono-code w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center text-[11px] text-sky-300 placeholder:text-slate-600"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Section 4: Optional Preseason & Exhibition Builder */}
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-purple-300 uppercase">
            <Flame className="h-4 w-4" />
            Optional Preseason &amp; Exhibition Schedule
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
            <input
              type="checkbox"
              checked={preseason.enabled}
              onChange={(e) =>
                setPreseason((p) => ({ ...p, enabled: e.target.checked }))
              }
              className="h-4 w-4 rounded accent-purple-500"
            />
            <span>{preseason.enabled ? 'Preseason Enabled' : 'Enable Preseason'}</span>
          </label>
        </div>

        {preseason.enabled && (
          <div className="grid gap-3 pt-2 sm:grid-cols-4 text-xs">
            <div>
              <label className="mb-1 block text-slate-400">Configuration Mode</label>
              <select
                value={preseason.mode}
                onChange={(e) =>
                  setPreseason((p) => ({
                    ...p,
                    mode: e.target.value as PreseasonConfig['mode'],
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
              >
                <option value="game-count">Fixed Games / Team (1–8)</option>
                <option value="date-range">Preseason Date Window</option>
              </select>
            </div>

            {preseason.mode === 'game-count' ? (
              <div>
                <label className="mb-1 block text-slate-400">Games per Team (1–8)</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={preseason.gamesPerTeam}
                  onChange={(e) =>
                    setPreseason((p) => ({
                      ...p,
                      gamesPerTeam: Math.max(1, Math.min(8, Number(e.target.value) || 3)),
                    }))
                  }
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="mb-1 block text-slate-400">Pre Start</label>
                  <input
                    type="date"
                    value={preseason.startDate}
                    onChange={(e) =>
                      setPreseason((p) => ({ ...p, startDate: e.target.value }))
                    }
                    className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-1.5 py-2 text-[11px] text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Pre End</label>
                  <input
                    type="date"
                    value={preseason.endDate}
                    onChange={(e) =>
                      setPreseason((p) => ({ ...p, endDate: e.target.value }))
                    }
                    className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-1.5 py-2 text-[11px] text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-slate-400">Opponent Matchmaking</label>
              <select
                value={preseason.matchmaking}
                onChange={(e) =>
                  setPreseason((p) => ({
                    ...p,
                    matchmaking: e.target.value as PreseasonConfig['matchmaking'],
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
              >
                <option value="random">Random Exhibition Draw</option>
                <option value="rivals">Regional Rivals Pairing</option>
              </select>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="mb-1 block text-slate-400">Days Between Games</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={preseason.frequencyDays}
                  onChange={(e) =>
                    setPreseason((p) => ({
                      ...p,
                      frequencyDays: Math.max(1, Math.min(14, Number(e.target.value) || 3)),
                    }))
                  }
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            </div>

            <label className="sm:col-span-4 inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={preseason.carryOverStats}
                onChange={(e) =>
                  setPreseason((p) => ({ ...p, carryOverStats: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-purple-500"
              />
              <span>Carry over preseason player stats into regular-season totals (off by default)</span>
            </label>
          </div>
        )}
      </section>

      {/* Section 5: Conditional Rule & Advantage Builder (If/Then Modifiers) */}
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase">
          <Zap className="h-4 w-4" />
          Competition Rules &amp; Conditional Advantages (If / Then Modifiers)
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {advantageRules.map((rule) => (
            <div
              key={rule.id}
              className={`flex items-start justify-between gap-2 rounded-xl border p-3 text-xs transition ${
                rule.enabled
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-900/50 opacity-75'
              }`}
            >
              <label className="flex items-start gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() =>
                    setAdvantageRules((prev) =>
                      prev.map((r) =>
                        r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                      )
                    )
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-amber-500"
                />
                <div>
                  <div className="font-bold text-white">{rule.name}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {rule.description}
                  </div>
                </div>
              </label>
              {!rule.id.startsWith('preset-') && (
                <button
                  type="button"
                  onClick={() =>
                    setAdvantageRules((prev) => prev.filter((r) => r.id !== rule.id))
                  }
                  className="text-rose-400 hover:bg-rose-500/15 p-1 rounded cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Custom If/Then Rule Adder */}
        <div className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:grid-cols-6 text-xs items-end">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] text-slate-400">Rule Name</label>
            <input
              type="text"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-slate-400">IF Trigger</label>
            <select
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value as AdvantageTriggerType)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
            >
              <option value="preseason-wins">Preseason Wins ≥</option>
              <option value="preseason-undefeated">Undefeated Preseason</option>
              <option value="win-streak">Win Streak ≥</option>
              <option value="margin-of-victory">Win Margin ≥</option>
              <option value="top-seed">Top Seed (#1)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-slate-400">Threshold</label>
            <input
              type="number"
              min={1}
              max={100}
              value={newThreshold}
              onChange={(e) => setNewThreshold(Number(e.target.value) || 1)}
              className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-slate-400">THEN Reward</label>
            <select
              value={newReward}
              onChange={(e) => setNewReward(e.target.value as AdvantageRewardType)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
            >
              <option value="bonus-standings-points">+ Standings Pts</option>
              <option value="bonus-win">+ Bonus Win</option>
              <option value="next-match-rating-boost">+% Rating Boost</option>
              <option value="post-game-score-boost">+% Score Boost</option>
              <option value="home-score-bonus">+ Home Score</option>
            </select>
          </div>
          <div className="flex gap-1.5">
            <input
              type="number"
              min={1}
              max={50}
              value={newRewardValue}
              onChange={(e) => setNewRewardValue(Number(e.target.value) || 1)}
              className="font-mono-code w-14 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-amber-300"
            />
            <button
              type="button"
              onClick={handleAddCustomAdvantage}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      </section>

      {/* Section 6: Team Population Mode */}
      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">
            Team Population Mode ({selectedTeams.length} / {size} Ready)
          </h3>
          {uniquenessAudit.ok && selectedTeams.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Unique Icons, Cities &amp; Colors Verified
            </span>
          )}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          {[
            {
              id: 'brand-new' as PopulateMode,
              title: '100% Brand-New Unique',
              desc: `Auto-generate ${size} non-duplicate ${selectedSport.name} clubs`,
            },
            {
              id: 'vault-only' as PopulateMode,
              title: 'Pick from Franchise Vault',
              desc: `Choose ${size} saved teams (${vault.length} in Vault)`,
            },
            {
              id: 'mix' as PopulateMode,
              title: 'Mix Vault + Auto-Fill',
              desc: 'Pick custom favorites & auto-fill remaining slots',
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setMode(opt.id);
                if (opt.id === 'brand-new') {
                  setSelectedTeams([]);
                }
              }}
              className={`rounded-xl border p-3.5 text-left transition cursor-pointer ${
                mode === opt.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-bold text-white">{opt.title}</div>
              <div className="mt-0.5 text-xs text-slate-400">{opt.desc}</div>
            </button>
          ))}
        </div>

        {mode === 'brand-new' && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-300">
              Generate {size} unique {selectedSport.name} franchises now or click Launch below.
            </p>
            <button
              type="button"
              onClick={handleGenerateAllNew}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Preview {size} Brand-New Teams
            </button>
          </div>
        )}

        {(mode === 'vault-only' || mode === 'mix') && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                Click teams from your Franchise Vault ({selectedTeams.length}/{size} filled).
              </span>
              {mode === 'mix' && selectedTeams.length < size && (
                <button
                  type="button"
                  onClick={handleAutoFillRemaining}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-Fill Remaining {size - selectedTeams.length} Slot{size - selectedTeams.length > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {vault.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
                No teams in your Franchise Vault yet.
              </div>
            ) : (
              <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {vault.map((t) => {
                  const isAdded = selectedTeams.some((s) => s.id === t.id);
                  const conflict = !isAdded ? getVaultTeamConflict(t) : null;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToggleVaultTeam(t)}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        isAdded
                          ? 'border-emerald-500 bg-emerald-500/15'
                          : conflict
                            ? 'border-rose-900/60 bg-slate-900/40 opacity-65'
                            : 'border-slate-800 bg-slate-900/70 hover:border-slate-600'
                      }`}
                    >
                      <LogoSvg config={t.logo} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-white">{t.name}</div>
                        {conflict ? (
                          <div className="flex items-center gap-1 truncate text-[10px] text-rose-400">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span className="truncate">{conflict}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">
                            OVR {t.overallRating} · {t.logo.iconId}
                          </div>
                        )}
                      </div>
                      {isAdded ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Plus className="h-4 w-4 shrink-0 text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedTeams.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Competition Lineup ({selectedTeams.length}/{size})</span>
              <button
                type="button"
                onClick={() => setSelectedTeams([])}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Clear Lineup
              </button>
            </div>
            <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
              {selectedTeams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5"
                >
                  <span className="font-mono-code text-[10px] text-slate-500">
                    {idx + 1}.
                  </span>
                  <LogoSvg config={team.logo} size={24} />
                  <span className="truncate text-xs font-medium text-slate-200 flex-1">
                    {team.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTeams((prev) => prev.filter((p) => p.id !== team.id))
                    }
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Launch Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={mode !== 'brand-new' && selectedTeams.length !== size}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md transition hover:brightness-110 disabled:opacity-40 cursor-pointer"
          style={{ backgroundColor: branding.accentColor }}
        >
          {format === 'single-elim' || format === 'double-elim' ? (
            <GitBranch className="h-4 w-4" />
          ) : (
            <Trophy className="h-4 w-4" />
          )}
          Launch {selectedSport.name.split(' ')[0]} Competition ({size} Teams)
        </button>
      </div>
    </div>
  );
};
