import React, { useMemo, useState } from 'react';
import {
  Ban,
  Calendar,
  Flame,
  Lock,
  Plus,
  ShieldAlert,
  Sliders,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createCompetitionConstraints,
  generateUniqueTeam,
} from '../../engine/generator/teamGenerator';
import { createUuid } from '../../engine/prng';
import {
  createCustomAdvantageRule,
  PRESET_ADVANTAGE_RULES,
} from '../../engine/simulation/advantageEngine';
import { createCup, createGroupKnockout } from '../../engine/simulation/cupEngine';
import { pushCompetitionSnapshot } from '../../engine/simulation/historyEngine';
import { createLeague } from '../../engine/simulation/leagueEngine';
import { generatePreseasonMatches } from '../../engine/simulation/preseasonEngine';
import { assignMatchDates } from '../../engine/simulation/scheduler';
import {
  countActiveSuspensions,
  formatSuspensionBadge,
  isPlayerSuspended,
} from '../../engine/simulation/suspensionEngine';
import { resolveUserPermissions } from '../../lib/auth-db';
import type {
  AdvantageRewardType,
  AdvantageRule,
  AdvantageTriggerType,
  Competition,
  CompetitionBranding,
  CompetitionRules,
  CompetitionTier,
  OvertimeRule,
  PlayerSuspension,
  PreseasonConfig,
  ScheduleConfig,
  SuspensionDurationType,
  Team,
  WinnerCriterion,
} from '../../types';
import { LogoSvg } from '../common/LogoSvg';

interface EditCompetitionModalProps {
  competition: Competition;
  onClose: () => void;
  onSave: (updated: Competition) => void;
}

type EditTab = 'general' | 'schedule' | 'advantages' | 'teams' | 'suspensions';

const WEEKDAYS = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

const TIERS: CompetitionTier[] = [
  'Premier',
  'Championship',
  'Continental',
  'Global',
  'Invitational',
  'Amateur',
];

export const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({
  competition,
  onClose,
  onSave,
}) => {
  const { vault, registry, registerMultipleTeams, getSport, user, showToast } = useApp();
  const sport = getSport(competition.sportId);
  const perms = resolveUserPermissions(competition, user);

  const hasPlayedProgress = useMemo(
    () => competition.matches.some((m) => m.played && !m.isBye),
    [competition.matches]
  );

  const [tab, setTab] = useState<EditTab>('general');

  // General & Rules
  const [name, setName] = useState(competition.name);
  const [branding, setBranding] = useState<CompetitionBranding>(() => ({
    ...competition.branding,
  }));
  const [rules, setRules] = useState<CompetitionRules>(() => ({
    ...competition.rules,
    tiebreakers: [...competition.rules.tiebreakers],
  }));

  // Schedule & Preseason
  const [schedule, setSchedule] = useState<ScheduleConfig>(() => ({
    ...competition.schedule,
    allowedDays: [...competition.schedule.allowedDays],
  }));
  const [recomputeDates, setRecomputeDates] = useState(true);
  const [preseason, setPreseason] = useState<PreseasonConfig>(() => ({
    ...competition.preseason,
  }));

  // Advantages
  const [advantageRules, setAdvantageRules] = useState<AdvantageRule[]>(() =>
    competition.advantageRules.length > 0
      ? competition.advantageRules.map((r) => ({ ...r }))
      : PRESET_ADVANTAGE_RULES.map((r) => ({ ...r }))
  );
  const [newAdvName, setNewAdvName] = useState('');
  const [newAdvTrigger, setNewAdvTrigger] = useState<AdvantageTriggerType>('win-streak');
  const [newAdvThreshold, setNewAdvThreshold] = useState(3);
  const [newAdvReward, setNewAdvReward] = useState<AdvantageRewardType>('next-match-rating-boost');
  const [newAdvValue, setNewAdvValue] = useState(5);

  // Teams & Player Suspensions
  const [teams, setTeams] = useState<Team[]>(() =>
    JSON.parse(JSON.stringify(competition.teams)) as Team[]
  );
  const [teamsModified, setTeamsModified] = useState(false);

  // Suspensions UI state
  const [selectedSuspTeamId, setSelectedSuspTeamId] = useState<string>(
    competition.teams[0]?.id ?? ''
  );
  const [playerQuery, setPlayerQuery] = useState('');
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [suspType, setSuspType] = useState<'suspension' | 'ban'>('suspension');
  const [suspDuration, setSuspDuration] = useState<SuspensionDurationType>('matches');
  const [suspGames, setSuspGames] = useState<number>(3);
  const [suspUntilDate, setSuspUntilDate] = useState<string>(schedule.endDate);
  const [suspReason, setSuspReason] = useState('League disciplinary rule violation');

  const activeSuspensions = useMemo(() => {
    const out: { team: Team; player: Team['roster'][number]; susp: PlayerSuspension }[] = [];
    for (const t of teams) {
      for (const p of t.roster) {
        if (p.suspension && isPlayerSuspended(p)) {
          out.push({ team: t, player: p, susp: p.suspension });
        }
      }
    }
    return out;
  }, [teams]);

  const toggleAllowedDay = (day: number) => {
    setSchedule((prev) => {
      const exists = prev.allowedDays.includes(day);
      const next = exists
        ? prev.allowedDays.filter((d) => d !== day)
        : [...prev.allowedDays, day].sort((a, b) => a - b);
      return { ...prev, allowedDays: next.length > 0 ? next : [day] };
    });
  };

  const handleAddCustomAdvantage = () => {
    if (!newAdvName.trim()) {
      showToast('Enter a name for the custom advantage rule');
      return;
    }
    const created = createCustomAdvantageRule({
      name: newAdvName.trim(),
      enabled: true,
      trigger: newAdvTrigger,
      threshold: newAdvThreshold,
      reward: newAdvReward,
      rewardValue: newAdvValue,
      description: `When ${newAdvTrigger} >= ${newAdvThreshold}, grant ${newAdvReward} (${newAdvValue}).`,
    });
    setAdvantageRules((prev) => [...prev, created]);
    setNewAdvName('');
    showToast(`Added advantage rule "${created.name}"`);
  };

  const handleAddVaultTeam = (vaultTeam: Team) => {
    if (hasPlayedProgress) return;
    if (teams.some((t) => t.id === vaultTeam.id)) {
      showToast(`${vaultTeam.name} is already in this competition`);
      return;
    }
    const copy = JSON.parse(JSON.stringify(vaultTeam)) as Team;
    setTeams((prev) => [...prev, copy]);
    setTeamsModified(true);
  };

  const handleGenerateAndAddTeam = () => {
    if (hasPlayedProgress) return;
    const constraints = createCompetitionConstraints(teams);
    const res = generateUniqueTeam(registry, {
      constraints,
      source: competition.type,
      sport,
    });
    registerMultipleTeams([res.team], competition.type);
    setTeams((prev) => [...prev, res.team]);
    setTeamsModified(true);
    showToast(`Added ${res.team.name}`);
  };

  const handleRemoveTeam = (teamId: string) => {
    if (hasPlayedProgress) return;
    if (teams.length <= 3) {
      showToast('A competition needs at least 3 teams');
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setTeamsModified(true);
  };

  const applySuspensionToPlayer = (teamId: string, playerId: string) => {
    const newSusp: PlayerSuspension = {
      id: createUuid(),
      type: suspType,
      durationType: suspDuration,
      gamesRemaining: suspDuration === 'matches' ? Math.max(1, suspGames) : undefined,
      totalGames: suspDuration === 'matches' ? Math.max(1, suspGames) : undefined,
      untilDate: suspDuration === 'until-date' ? suspUntilDate : undefined,
      reason: suspReason.trim() || (suspType === 'ban' ? 'Indefinite League Ban' : 'Disciplinary Suspension'),
      issuedAt: new Date().toISOString(),
      active: true,
    };

    setTeams((prev) =>
      prev.map((t) =>
        t.id !== teamId
          ? t
          : {
              ...t,
              roster: t.roster.map((p) =>
                p.id === playerId ? { ...p, suspension: newSusp } : p
              ),
            }
      )
    );
    setTargetPlayerId(null);
    showToast(`Issued ${formatSuspensionBadge(newSusp)}`);
  };

  const liftSuspension = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id !== teamId
          ? t
          : {
              ...t,
              roster: t.roster.map((p) =>
                p.id === playerId ? { ...p, suspension: null } : p
              ),
            }
      )
    );
    showToast('Player reinstated');
  };

  const handleSaveChanges = () => {
    if (!name.trim()) {
      showToast('Competition name cannot be empty');
      return;
    }

    const withSnap = pushCompetitionSnapshot(competition, 'Edited competition settings');
    let nextMatches = withSnap.matches.map((m) => ({ ...m }));
    let nextTeams = teams;
    let nextSchedule: ScheduleConfig = { ...schedule };
    let nextGroups = withSnap.groups;
    let nextGroupCount = withSnap.groupCount;
    let nextResolvedBreaks = withSnap.resolvedBreakWeeks;

    // If no matches were played yet AND teams changed, cleanly rebuild schedule/bracket
    if (!hasPlayedProgress && teamsModified) {
      const rebuilt =
        competition.format === 'single-rr' || competition.format === 'double-rr'
          ? createLeague(
              name,
              teams,
              competition.format,
              rules,
              schedule,
              branding,
              competition.sportId,
              preseason,
              advantageRules
            )
          : competition.format === 'group-knockout'
            ? createGroupKnockout(
                name,
                teams,
                competition.groupCount ?? 4,
                rules,
                schedule,
                branding,
                competition.sportId,
                preseason,
                advantageRules
              )
            : createCup(
                name,
                teams,
                competition.format,
                rules,
                schedule,
                branding,
                competition.sportId,
                preseason,
                advantageRules
              );

      nextMatches = rebuilt.matches;
      nextTeams = rebuilt.teams;
      nextSchedule = rebuilt.schedule;
      nextGroups = rebuilt.groups;
      nextGroupCount = rebuilt.groupCount;
      nextResolvedBreaks = rebuilt.resolvedBreakWeeks;
    } else {
      // Mid-competition edits while preserving played matches
      const hasPreseasonMatches = nextMatches.some((m) => m.bracket === 'preseason');
      const hasPlayedPreseason = nextMatches.some(
        (m) => m.bracket === 'preseason' && m.played
      );

      if (preseason.enabled && !hasPreseasonMatches) {
        const pre = generatePreseasonMatches(nextTeams, preseason, nextSchedule.startDate);
        nextMatches = [...pre, ...nextMatches];
      } else if (!preseason.enabled && hasPreseasonMatches && !hasPlayedPreseason) {
        nextMatches = nextMatches.filter((m) => m.bracket !== 'preseason');
      }

      if (recomputeDates) {
        const dated = assignMatchDates(nextMatches, nextSchedule);
        nextMatches = dated.matches;
        if (nextSchedule.endDateMode === 'auto') {
          nextSchedule = { ...nextSchedule, endDate: dated.computedEndDate };
        }
      }
    }

    onSave({
      ...withSnap,
      name: name.trim(),
      size: nextTeams.length,
      branding,
      rules,
      schedule: nextSchedule,
      preseason,
      advantageRules,
      groups: nextGroups,
      groupCount: nextGroupCount,
      resolvedBreakWeeks: nextResolvedBreaks,
      teams: nextTeams,
      matches: nextMatches,
      updatedAt: new Date().toISOString(),
    });
    showToast('Competition settings & roster discipline updated');
    onClose();
  };

  const selectedTeam = teams.find((t) => t.id === selectedSuspTeamId) ?? teams[0];
  const filteredRoster = useMemo(() => {
    const q = playerQuery.trim().toLowerCase();
    if (!selectedTeam) return [];
    return selectedTeam.roster.filter(
      (p) =>
        !q ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        String(p.jerseyNumber).includes(q)
    );
  }, [selectedTeam, playerQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#131b2c] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase">
              <Sliders className="h-3.5 w-3.5" />
              Mid-Competition Editor
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white uppercase">
              Edit {competition.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-800 bg-slate-950/60 px-6 py-2.5 text-xs">
          {(
            [
              { id: 'general' as EditTab, label: 'General & Rules', icon: Sliders },
              { id: 'schedule' as EditTab, label: 'Schedule & Preseason', icon: Calendar },
              { id: 'advantages' as EditTab, label: 'Advantages', icon: Sparkles },
              { id: 'teams' as EditTab, label: `Teams (${teams.length})`, icon: Users },
              {
                id: 'suspensions' as EditTab,
                label: `Suspensions & Bans (${countActiveSuspensions(teams)})`,
                icon: ShieldAlert,
              },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold cursor-pointer ${
                  tab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {tab === 'general' && (
            <div className="space-y-5">
              {!perms.canEditRulesAndAdvantages && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
                  You do not have permission to edit rules on this competition.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-slate-400">Competition Name</label>
                  <input
                    type="text"
                    disabled={!perms.canEditRulesAndAdvantages}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Tier</label>
                  <select
                    disabled={!perms.canEditRulesAndAdvantages}
                    value={branding.tier}
                    onChange={(e) =>
                      setBranding({ ...branding, tier: e.target.value as CompetitionTier })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-50"
                  >
                    {TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-slate-400">Winner / Seeding Criterion</label>
                  <select
                    disabled={!perms.canEditRulesAndAdvantages}
                    value={rules.winnerCriterion}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        winnerCriterion: e.target.value as WinnerCriterion,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-50"
                  >
                    <option value="standings-points">Most Standings Points</option>
                    <option value="win-pct">Best Win %</option>
                    <option value="goal-diff">Highest Point Differential</option>
                    <option value="goals-for">Most Total Points Scored</option>
                    <option value="head-to-head">Head-to-Head Record</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Overtime / Tie Rule</label>
                  <select
                    disabled={!perms.canEditRulesAndAdvantages}
                    value={rules.overtimeRule}
                    onChange={(e) =>
                      setRules({ ...rules, overtimeRule: e.target.value as OvertimeRule })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-50"
                  >
                    <option value="draws-allowed">Draws / Ties Allowed</option>
                    <option value="overtime-periods">Overtime Periods (No Ties)</option>
                    <option value="extra-time-penalties">Extra Time + Shootout</option>
                    <option value="penalties">Direct Shootout / Penalties</option>
                    <option value="golden-goal">Golden Goal Sudden Death</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!perms.canEditRulesAndAdvantages}
                    checked={rules.homeFieldAdvantage}
                    onChange={(e) =>
                      setRules({ ...rules, homeFieldAdvantage: e.target.checked })
                    }
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span className="text-slate-200 font-medium">Home-Field Advantage</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!perms.canEditRulesAndAdvantages}
                    checked={Boolean(rules.lowestScoreWins)}
                    onChange={(e) =>
                      setRules({ ...rules, lowestScoreWins: e.target.checked })
                    }
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span className="text-slate-200 font-medium">Lowest Score Wins</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Theme Color:</span>
                  <input
                    type="color"
                    disabled={!perms.canEditRulesAndAdvantages}
                    value={branding.accentColor}
                    onChange={(e) =>
                      setBranding({ ...branding, accentColor: e.target.value })
                    }
                    className="h-7 w-10 rounded border border-slate-700 bg-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="font-semibold text-slate-300">Standings Points System</div>
                <div className="grid grid-cols-5 gap-2">
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
                        disabled={!perms.canEditRulesAndAdvantages}
                        value={rules[field]}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            [field]: Number.parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-center font-bold text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'schedule' && (
            <div className="space-y-5">
              {!perms.canEditScheduleAndDates && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
                  You do not have permission to edit schedule and dates on this competition.
                </div>
              )}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <div className="font-semibold text-sky-300 uppercase tracking-wider">
                  Calendar &amp; Matchdays
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-slate-400">Start Date</label>
                    <input
                      type="date"
                      disabled={!perms.canEditScheduleAndDates}
                      value={schedule.startDate}
                      onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-slate-400">End Date Mode</label>
                    <select
                      disabled={!perms.canEditScheduleAndDates}
                      value={schedule.endDateMode}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          endDateMode: e.target.value as 'auto' | 'fixed',
                        })
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                    >
                      <option value="auto">Auto-calculate</option>
                      <option value="fixed">Fixed End Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-slate-400">End Date</label>
                    <input
                      type="date"
                      disabled={!perms.canEditScheduleAndDates || schedule.endDateMode === 'auto'}
                      value={schedule.endDate}
                      onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white disabled:opacity-40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-slate-400">Match Days of Week</label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((wd) => {
                      const active = schedule.allowedDays.includes(wd.id);
                      return (
                        <button
                          key={wd.id}
                          type="button"
                          disabled={!perms.canEditScheduleAndDates}
                          onClick={() => toggleAllowedDay(wd.id)}
                          className={`rounded-lg border px-3 py-1 font-semibold cursor-pointer ${
                            active
                              ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                              : 'border-slate-700 bg-slate-900 text-slate-400'
                          }`}
                        >
                          {wd.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-slate-400">Pacing Mode</label>
                    <select
                      disabled={!perms.canEditScheduleAndDates}
                      value={schedule.pacingMode}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          pacingMode: e.target.value as 'games-per-week' | 'min-rest-days',
                        })
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                    >
                      <option value="min-rest-days">Minimum Rest Days Between Rounds</option>
                      <option value="games-per-week">Games Per Week</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-slate-400">
                      {schedule.pacingMode === 'games-per-week' ? 'Games / Week' : 'Min Rest Days'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      disabled={!perms.canEditScheduleAndDates}
                      value={
                        schedule.pacingMode === 'games-per-week'
                          ? schedule.gamesPerWeek
                          : schedule.minRestDays
                      }
                      onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value) || 1);
                        setSchedule(
                          schedule.pacingMode === 'games-per-week'
                            ? { ...schedule, gamesPerWeek: v }
                            : { ...schedule, minRestDays: v }
                        );
                      }}
                      className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recomputeDates}
                    onChange={(e) => setRecomputeDates(e.target.checked)}
                    className="h-4 w-4 accent-sky-500"
                  />
                  <span className="text-slate-300">
                    Re-assign fixture dates across matches on save (preserves scores &amp; results)
                  </span>
                </label>
              </div>

              {/* Preseason Config */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300 uppercase tracking-wider">
                      <Flame className="h-4 w-4" />
                      Preseason Exhibition Series
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Add a Preseason mid-competition if forgotten (existing regular-season results stay untouched).
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-white">
                    <input
                      type="checkbox"
                      disabled={!perms.canEditScheduleAndDates}
                      checked={preseason.enabled}
                      onChange={(e) =>
                        setPreseason({ ...preseason, enabled: e.target.checked })
                      }
                      className="h-4 w-4 accent-amber-500"
                    />
                    {preseason.enabled ? 'Enabled' : 'Disabled'}
                  </label>
                </div>

                {preseason.enabled && (
                  <div className="grid gap-3 sm:grid-cols-4 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="mb-1 block text-slate-400">Games / Team</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={preseason.gamesPerTeam}
                        onChange={(e) =>
                          setPreseason({
                            ...preseason,
                            gamesPerTeam: Math.max(1, Math.min(8, Number(e.target.value) || 2)),
                          })
                        }
                        className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-400">Preseason Start</label>
                      <input
                        type="date"
                        value={preseason.startDate}
                        onChange={(e) =>
                          setPreseason({ ...preseason, startDate: e.target.value })
                        }
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-400">Days Between</label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={preseason.frequencyDays}
                        onChange={(e) =>
                          setPreseason({
                            ...preseason,
                            frequencyDays: Math.max(1, Number(e.target.value) || 3),
                          })
                        }
                        className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-400">Matchmaking</label>
                      <select
                        value={preseason.matchmaking}
                        onChange={(e) =>
                          setPreseason({
                            ...preseason,
                            matchmaking: e.target.value as 'random' | 'rivals',
                          })
                        }
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                      >
                        <option value="random">Random Opponents</option>
                        <option value="rivals">Regional / Rating Rivals</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'advantages' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                <div className="font-semibold text-amber-300 uppercase tracking-wider">
                  Rule-Based Advantages &amp; Modifiers
                </div>
                {advantageRules.map((rule) => (
                  <label
                    key={rule.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white">{rule.name}</div>
                      <div className="text-[11px] text-slate-400">{rule.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!perms.canEditRulesAndAdvantages}
                      checked={rule.enabled}
                      onChange={(e) =>
                        setAdvantageRules((prev) =>
                          prev.map((r) =>
                            r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                          )
                        )
                      }
                      className="mt-1 h-4 w-4 accent-amber-500"
                    />
                  </label>
                ))}
              </div>

              {perms.canEditRulesAndAdvantages && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="font-semibold text-sky-300 uppercase tracking-wider">
                    Add New Custom If/Then Advantage Rule
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-5 items-end">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-slate-400">Rule Name</label>
                      <input
                        type="text"
                        value={newAdvName}
                        onChange={(e) => setNewAdvName(e.target.value)}
                        placeholder="Hot Streak Surge"
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-400">If Trigger</label>
                      <select
                        value={newAdvTrigger}
                        onChange={(e) =>
                          setNewAdvTrigger(e.target.value as AdvantageTriggerType)
                        }
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                      >
                        <option value="preseason-wins">Preseason Wins ≥</option>
                        <option value="preseason-undefeated">Undefeated Preseason</option>
                        <option value="win-streak">Win Streak ≥</option>
                        <option value="margin-of-victory">Margin of Victory ≥</option>
                        <option value="top-seed">#1 Rated Team</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-400">Threshold</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={newAdvThreshold}
                        onChange={(e) => setNewAdvThreshold(Number(e.target.value) || 1)}
                        className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-400">Reward Value</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={newAdvValue}
                        onChange={(e) => setNewAdvValue(Number(e.target.value) || 1)}
                        className="font-mono-code w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={newAdvReward}
                      onChange={(e) => setNewAdvReward(e.target.value as AdvantageRewardType)}
                      className="flex-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                    >
                      <option value="bonus-standings-points">+ Standings Points</option>
                      <option value="bonus-win">+ Bonus Win</option>
                      <option value="next-match-rating-boost">+% Team Rating Boost</option>
                      <option value="post-game-score-boost">+% Post-Game Score Boost</option>
                      <option value="home-score-bonus">+ Flat Home Score Bonus</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCustomAdvantage}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Advantage
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'teams' && (
            <div className="space-y-4">
              {hasPlayedProgress ? (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
                  <Lock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Team Lineup Locked</div>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      Matches have already been played or logged with progress in this competition, so teams cannot be added or removed. You can still issue player Suspensions or Bans under the Suspensions &amp; Bans tab.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <span className="text-emerald-200">
                    No matches played yet — adding or removing teams will rebuild the schedule cleanly.
                  </span>
                  <button
                    type="button"
                    disabled={!perms.canEditTeamsAndRosters}
                    onClick={handleGenerateAndAddTeam}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Generate &amp; Add Team
                  </button>
                </div>
              )}

              {!hasPlayedProgress && vault.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Quick Add from Franchise Vault
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {vault
                      .filter((vt) => !teams.some((t) => t.id === vt.id))
                      .map((vt) => (
                        <button
                          key={vt.id}
                          type="button"
                          disabled={!perms.canEditTeamsAndRosters}
                          onClick={() => handleAddVaultTeam(vt)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-200 hover:border-amber-500 cursor-pointer"
                        >
                          <Plus className="h-3 w-3 text-emerald-400" />
                          {vt.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LogoSvg config={team.logo} size={32} />
                      <div className="min-w-0">
                        <div className="truncate font-bold text-white">{team.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {team.abbreviation} · OVR {team.overallRating} · {team.roster.length} players
                        </div>
                      </div>
                    </div>
                    {!hasPlayedProgress && perms.canEditTeamsAndRosters && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(team.id)}
                        title="Remove team"
                        className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'suspensions' && (
            <div className="space-y-5">
              {/* Active Suspensions Overview */}
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 uppercase tracking-wider">
                    <Ban className="h-4 w-4" />
                    Active Suspensions &amp; Bans ({activeSuspensions.length})
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Suspended players lower team lineup rating &amp; record 0 match stats
                  </span>
                </div>
                {activeSuspensions.length === 0 ? (
                  <div className="text-slate-500 italic">No active player suspensions or bans.</div>
                ) : (
                  <div className="space-y-1.5">
                    {activeSuspensions.map(({ team, player, susp }) => (
                      <div
                        key={player.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <LogoSvg config={team.logo} size={22} />
                          <div>
                            <span className="font-bold text-white">
                              #{player.jerseyNumber} {player.firstName} {player.lastName}
                            </span>{' '}
                            <span className="text-slate-400">({team.abbreviation})</span>
                            <div className="text-[10px] text-slate-400">
                              Reason: {susp.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                            {formatSuspensionBadge(susp)}
                          </span>
                          {perms.canEditTeamsAndRosters && (
                            <button
                              type="button"
                              onClick={() => liftSuspension(team.id, player.id)}
                              className="rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                            >
                              Lift / Reinstate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team & Player Picker */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-slate-400">Select Club</label>
                    <select
                      value={selectedTeam?.id ?? ''}
                      onChange={(e) => {
                        setSelectedSuspTeamId(e.target.value);
                        setTargetPlayerId(null);
                      }}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.roster.filter((p) => isPlayerSuspended(p)).length} active)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-slate-400">Search Player</label>
                    <input
                      type="text"
                      value={playerQuery}
                      onChange={(e) => setPlayerQuery(e.target.value)}
                      placeholder="Name, position, or #..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/70 rounded-lg border border-slate-800 bg-slate-950">
                  {filteredRoster.map((player) => {
                    const suspended = isPlayerSuspended(player);
                    const isEditingThis = targetPlayerId === player.id;
                    return (
                      <div key={player.id} className="p-2.5 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-code text-amber-300 font-bold">
                              #{player.jerseyNumber}
                            </span>
                            <span className="font-semibold text-white">
                              {player.firstName} {player.lastName}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-sky-300">
                              {player.position}
                            </span>
                            <span className="text-[11px] text-slate-400">OVR {player.overall}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {suspended && player.suspension && (
                              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                {formatSuspensionBadge(player.suspension)}
                              </span>
                            )}
                            {perms.canEditTeamsAndRosters && (
                              <>
                                {suspended && (
                                  <button
                                    type="button"
                                    onClick={() => liftSuspension(selectedTeam.id, player.id)}
                                    className="rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-300 cursor-pointer"
                                  >
                                    Lift
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setTargetPlayerId(isEditingThis ? null : player.id)
                                  }
                                  className="rounded border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                                >
                                  {isEditingThis ? 'Cancel' : suspended ? 'Edit Ban/Susp' : 'Suspend / Ban'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {isEditingThis && selectedTeam && (
                          <div className="rounded-lg border border-rose-500/30 bg-slate-900/90 p-3 grid gap-2.5 sm:grid-cols-4 items-end">
                            <div>
                              <label className="mb-1 block text-[10px] text-slate-400">Type</label>
                              <select
                                value={suspType}
                                onChange={(e) =>
                                  setSuspType(e.target.value as 'suspension' | 'ban')
                                }
                                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
                              >
                                <option value="suspension">Suspension</option>
                                <option value="ban">Ban</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] text-slate-400">Duration Type</label>
                              <select
                                value={suspDuration}
                                onChange={(e) =>
                                  setSuspDuration(e.target.value as SuspensionDurationType)
                                }
                                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
                              >
                                <option value="matches">Custom # of Matches</option>
                                <option value="until-date">Until Specific Date</option>
                                <option value="season">Rest of Season</option>
                                <option value="indefinite">Indefinite</option>
                              </select>
                            </div>
                            {suspDuration === 'matches' && (
                              <div>
                                <label className="mb-1 block text-[10px] text-slate-400">
                                  # of Matches
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={suspGames}
                                  onChange={(e) =>
                                    setSuspGames(Math.max(1, Number(e.target.value) || 1))
                                  }
                                  className="font-mono-code w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
                                />
                              </div>
                            )}
                            {suspDuration === 'until-date' && (
                              <div>
                                <label className="mb-1 block text-[10px] text-slate-400">
                                  Eligible After Date
                                </label>
                                <input
                                  type="date"
                                  value={suspUntilDate}
                                  onChange={(e) => setSuspUntilDate(e.target.value)}
                                  className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
                                />
                              </div>
                            )}
                            <div
                              className={
                                suspDuration === 'season' || suspDuration === 'indefinite'
                                  ? 'sm:col-span-2'
                                  : ''
                              }
                            >
                              <label className="mb-1 block text-[10px] text-slate-400">Reason</label>
                              <input
                                type="text"
                                value={suspReason}
                                onChange={(e) => setSuspReason(e.target.value)}
                                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-white"
                              />
                            </div>
                            <div className="sm:col-span-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  applySuspensionToPlayer(selectedTeam.id, player.id)
                                }
                                className="rounded-lg bg-rose-500 px-3 py-1.5 font-bold text-white hover:bg-rose-400 cursor-pointer"
                              >
                                Confirm {suspType === 'ban' ? 'Ban' : 'Suspension'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
          <span className="text-[11px] text-slate-400">
            Saving pushes a checkpoint to Simulation History so changes can be undone.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              Save Competition Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
