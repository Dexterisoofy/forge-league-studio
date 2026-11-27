import React, { useMemo, useState } from 'react';
import {
  Calendar,
  FastForward,
  Flame,
  ListOrdered,
  Play,
  Shield,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  applyLeagueMatchResult,
  computeStandings,
  simulateLeagueScore,
} from '../../engine/simulation/leagueEngine';
import { pushCompetitionSnapshot } from '../../engine/simulation/historyEngine';
import { resolveUserPermissions } from '../../lib/auth-db';
import type { Competition } from '../../types';
import { LogoSvg } from '../common/LogoSvg';
import { CompetitionRostersPanel } from './CompetitionRostersPanel';
import { SimulationHistoryBar } from './SimulationHistoryBar';

interface LeagueViewProps {
  competition: Competition;
  onUpdate: (comp: Competition) => void;
}

export const LeagueView: React.FC<LeagueViewProps> = ({ competition, onUpdate }) => {
  const { getSport, user, showToast } = useApp();
  const sport = getSport(competition.sportId);
  const perms = resolveUserPermissions(competition, user);
  const [confirmSeasonSim, setConfirmSeasonSim] = useState(false);

  const hasPreseason = competition.matches.some((m) => m.bracket === 'preseason');
  const [phaseTab, setPhaseTab] = useState<'regular' | 'preseason' | 'leaders' | 'rosters'>(
    'regular'
  );
  const [rosterTeamId, setRosterTeamId] = useState<string | null>(null);
  const [scheduleMode, setScheduleMode] = useState<'round' | 'calendar'>('round');

  const phaseMatches = useMemo(
    () =>
      competition.matches.filter((m) =>
        phaseTab === 'preseason'
          ? m.bracket === 'preseason'
          : m.bracket !== 'preseason'
      ),
    [competition.matches, phaseTab]
  );

  const rounds = useMemo(
    () =>
      Array.from(new Set(phaseMatches.map((m) => m.round))).sort((a, b) => a - b),
    [phaseMatches]
  );

  const [selectedRound, setSelectedRound] = useState<number>(rounds[0] ?? 1);
  const activeRound = rounds.includes(selectedRound) ? selectedRound : rounds[0] ?? 1;

  const teamMap = useMemo(
    () => new Map(competition.teams.map((t) => [t.id, t])),
    [competition.teams]
  );

  const standings = useMemo(
    () =>
      computeStandings(
        competition.teams,
        competition.matches,
        competition.rules,
        competition.appliedAdvantages,
        phaseTab === 'preseason' ? 'preseason' : 'regular',
        competition.advantageRules
      ),
    [
      competition.teams,
      competition.matches,
      competition.rules,
      competition.appliedAdvantages,
      phaseTab,
      competition.advantageRules,
    ]
  );

  const roundMatches = phaseMatches.filter((m) => m.round === activeRound);
  const roundDate = roundMatches[0]?.scheduledDate;
  const championTeam = competition.championId ? teamMap.get(competition.championId) : null;
  const accent = competition.branding?.accentColor ?? sport.accentColor;

  const handleSimulateMatch = (matchId: string) => {
    if (!perms.canSimulateMatches) return;
    const match = competition.matches.find((m) => m.id === matchId);
    if (!match || !match.homeTeamId || !match.awayTeamId) return;
    const home = teamMap.get(match.homeTeamId);
    const away = teamMap.get(match.awayTeamId);
    if (!home || !away) return;
    const withSnap = pushCompetitionSnapshot(
      competition,
      `${home.abbreviation} vs ${away.abbreviation}`
    );
    const sim = simulateLeagueScore(
      home,
      away,
      withSnap.rules?.homeFieldAdvantage ?? true,
      sport,
      withSnap,
      match
    );
    onUpdate(
      applyLeagueMatchResult(
        withSnap,
        matchId,
        sim.homeScore,
        sim.awayScore,
        sport,
        {
          isOvertime: sim.isOvertime,
          resolutionNote: sim.resolutionNote,
          scoringSummary: sim.scoringSummary,
          preApplied: sim.preApplied,
        }
      )
    );
  };

  const handleSimulateRound = () => {
    if (!perms.canSimulateMatches) return;
    let next = pushCompetitionSnapshot(
      competition,
      `${phaseTab === 'preseason' ? 'Preseason' : 'Matchday'} ${activeRound}`
    );
    for (const m of roundMatches) {
      const fresh = next.matches.find((fm) => fm.id === m.id);
      if (!fresh || fresh.played || !fresh.homeTeamId || !fresh.awayTeamId) continue;
      const home = teamMap.get(fresh.homeTeamId);
      const away = teamMap.get(fresh.awayTeamId);
      if (!home || !away) continue;
      const sim = simulateLeagueScore(
        home,
        away,
        next.rules?.homeFieldAdvantage ?? true,
        sport,
        next,
        fresh
      );
      next = applyLeagueMatchResult(
        next,
        fresh.id,
        sim.homeScore,
        sim.awayScore,
        sport,
        {
          isOvertime: sim.isOvertime,
          resolutionNote: sim.resolutionNote,
          scoringSummary: sim.scoringSummary,
          preApplied: sim.preApplied,
        }
      );
    }
    onUpdate(next);
  };

  const handleSimulatePhase = (targetPhase: 'preseason' | 'regular') => {
    if (!perms.canSimulateSeason) return;
    let next = pushCompetitionSnapshot(
      competition,
      targetPhase === 'preseason' ? 'Full Preseason Sim' : 'Full Regular Season Sim'
    );
    const targets = next.matches
      .filter((m) =>
        targetPhase === 'preseason'
          ? m.bracket === 'preseason'
          : m.bracket !== 'preseason'
      )
      .sort((a, b) => a.round - b.round);

    for (const m of targets) {
      const fresh = next.matches.find((fm) => fm.id === m.id);
      if (!fresh || fresh.played || !fresh.homeTeamId || !fresh.awayTeamId) continue;
      const home = teamMap.get(fresh.homeTeamId);
      const away = teamMap.get(fresh.awayTeamId);
      if (!home || !away) continue;
      const sim = simulateLeagueScore(
        home,
        away,
        next.rules?.homeFieldAdvantage ?? true,
        sport,
        next,
        fresh
      );
      next = applyLeagueMatchResult(
        next,
        fresh.id,
        sim.homeScore,
        sim.awayScore,
        sport,
        {
          isOvertime: sim.isOvertime,
          resolutionNote: sim.resolutionNote,
          scoringSummary: sim.scoringSummary,
          preApplied: sim.preApplied,
        }
      );
    }
    onUpdate(next);
  };

  const handleScoreEdit = (matchId: string, side: 'home' | 'away', val: number) => {
    const match = competition.matches.find((m) => m.id === matchId);
    if (!match) return;
    const score = Math.max(0, Math.min(250, Math.round(val) || 0));
    const hs = side === 'home' ? score : match.homeScore ?? 0;
    const as = side === 'away' ? score : match.awayScore ?? 0;
    onUpdate(applyLeagueMatchResult(competition, matchId, hs, as, sport));
  };

  const matchesByDate = useMemo(() => {
    const map = new Map<string, typeof phaseMatches>();
    for (const m of phaseMatches) {
      const date = m.scheduledDate ?? 'Unscheduled';
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [phaseMatches]);

  // Player stat leaders for regular vs preseason
  const [statsScope, setStatsScope] = useState<'regular' | 'preseason'>('regular');
  const playerStatRows = useMemo(() => {
    const map =
      statsScope === 'preseason'
        ? competition.preseasonPlayerStats ?? {}
        : competition.regularPlayerStats ?? {};
    const playerLookup = new Map<
      string,
      { name: string; pos: string; teamAbbr: string }
    >();
    for (const t of competition.teams) {
      for (const p of t.roster) {
        playerLookup.set(p.id, {
          name: `${p.firstName} ${p.lastName}`,
          pos: p.position,
          teamAbbr: t.abbreviation,
        });
      }
    }
    const primaryStatKey = sport.statColumns[0]?.key ?? 'goals';
    return Object.values(map)
      .map((entry) => ({
        ...entry,
        meta: playerLookup.get(entry.playerId),
      }))
      .filter((e) => Boolean(e.meta))
      .sort(
        (a, b) =>
          (b.stats[primaryStatKey] ?? 0) - (a.stats[primaryStatKey] ?? 0)
      )
      .slice(0, 30);
  }, [competition, statsScope, sport]);

  return (
    <div className="space-y-6">
      {/* Phase Tabs & Sport Rules Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#131b2c] px-4 py-3 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-2">
          {hasPreseason && (
            <button
              type="button"
              onClick={() => setPhaseTab('preseason')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold cursor-pointer ${
                phaseTab === 'preseason'
                  ? 'bg-purple-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              Preseason
            </button>
          )}
          <button
            type="button"
            onClick={() => setPhaseTab('regular')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold cursor-pointer ${
              phaseTab === 'regular'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            Regular Season
          </button>
          <button
            type="button"
            onClick={() => setPhaseTab('leaders')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold cursor-pointer ${
              phaseTab === 'leaders'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Player Stat Leaders
          </button>
          <button
            type="button"
            onClick={() => setPhaseTab('rosters')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold cursor-pointer ${
              phaseTab === 'rosters'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Team Rosters ({competition.teams.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="font-semibold text-amber-300">{sport.name}</span>
          <span>·</span>
          <span className="font-mono-code text-sky-300">
            {competition.schedule.startDate} → {competition.schedule.endDate}
          </span>
          <span>·</span>
          <span>Winner: {competition.rules.winnerCriterion}</span>
        </div>
      </div>

      {/* Champion Banner */}
      {championTeam && phaseTab === 'regular' && (
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 p-4"
          style={{ borderColor: `${accent}66` }}
        >
          <div className="flex items-center gap-3">
            <LogoSvg config={championTeam.logo} size={52} />
            <div>
              <div
                className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase"
                style={{ color: accent }}
              >
                <Trophy className="h-3.5 w-3.5" />
                League Champion
              </div>
              <div className="font-display text-2xl font-extrabold text-white uppercase">
                {championTeam.name}
              </div>
            </div>
          </div>
          <div className="font-mono-code text-sm font-bold text-amber-300">
            {standings[0]?.points ?? 0} PTS · {standings[0]?.won ?? 0}W-
            {standings[0]?.drawn ?? 0}D-{standings[0]?.lost ?? 0}L
          </div>
        </div>
      )}

      {phaseTab === 'rosters' ? (
        <CompetitionRostersPanel
          competition={competition}
          initialTeamId={rosterTeamId}
        />
      ) : phaseTab === 'leaders' ? (
        <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-white uppercase">
                {sport.name} Player Statistics
              </h3>
              <p className="text-xs text-slate-400">
                Preseason and Regular Season stats are tracked in separate pools unless carryover is enabled
              </p>
            </div>
            {hasPreseason && (
              <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStatsScope('regular')}
                  className={`rounded px-3 py-1 font-semibold cursor-pointer ${
                    statsScope === 'regular'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Regular Season
                </button>
                <button
                  type="button"
                  onClick={() => setStatsScope('preseason')}
                  className={`rounded px-3 py-1 font-semibold cursor-pointer ${
                    statsScope === 'preseason'
                      ? 'bg-purple-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Preseason
                </button>
              </div>
            )}
          </div>

          {playerStatRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
              Simulate {statsScope} {sport.terminology.matchUnit.toLowerCase()}s to populate player statistics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                  <tr>
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-3">Player</th>
                    <th className="px-2 py-2">Club</th>
                    <th className="px-2 py-2">Pos</th>
                    <th className="px-2 py-2 text-center">GP</th>
                    {sport.statColumns.map((col) => (
                      <th key={col.key} className="px-2 py-2 text-center text-amber-300">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {playerStatRows.map((row, idx) => (
                    <tr key={row.playerId} className="hover:bg-slate-900/50">
                      <td className="py-2 pr-2 font-mono-code text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 pr-3 font-semibold text-white">
                        {row.meta?.name}
                      </td>
                      <td className="px-2 py-2 font-mono-code text-sky-300">
                        {row.meta?.teamAbbr}
                      </td>
                      <td className="px-2 py-2 text-slate-400">{row.meta?.pos}</td>
                      <td className="px-2 py-2 text-center font-mono-code text-slate-300">
                        {row.gamesPlayed}
                      </td>
                      {sport.statColumns.map((col) => {
                        const val = row.stats[col.key] ?? 0;
                        const display =
                          col.format === 'pct'
                            ? `${val}%`
                            : col.format === 'avg3'
                              ? val.toFixed(3)
                              : col.format === 'dec1'
                                ? val.toFixed(1)
                                : val;
                        return (
                          <td
                            key={col.key}
                            className="px-2 py-2 text-center font-mono-code font-semibold text-slate-200"
                          >
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Standings Table */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#131b2c] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
                {phaseTab === 'preseason' ? 'Preseason Standings' : 'Standings Table'}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <SimulationHistoryBar
                  competition={competition}
                  canUndo={perms.canUndoSimulations}
                  onUpdate={onUpdate}
                  onMessage={showToast}
                />
                {!confirmSeasonSim ? (
                  <button
                    type="button"
                    disabled={!perms.canSimulateSeason}
                    title={
                      !perms.canSimulateSeason
                        ? 'Permission required: Simulate Season / Batch'
                        : 'Simulate remaining phase'
                    }
                    onClick={() => setConfirmSeasonSim(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 disabled:opacity-40 cursor-pointer"
                    style={{ backgroundColor: phaseTab === 'preseason' ? '#a855f7' : accent }}
                  >
                    <FastForward className="h-3.5 w-3.5" />
                    Sim {phaseTab === 'preseason' ? 'Preseason' : 'Regular Season'}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs">
                    <span className="font-semibold text-amber-200">Confirm Batch Sim?</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleSimulatePhase(phaseTab === 'preseason' ? 'preseason' : 'regular');
                        setConfirmSeasonSim(false);
                      }}
                      className="rounded bg-amber-500 px-2 py-0.5 font-bold text-slate-950 cursor-pointer"
                    >
                      Run
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSeasonSim(false)}
                      className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[620px]">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="sticky top-0 bg-[#131b2c] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                  <tr>
                    <th className="py-2 pr-2 w-8">#</th>
                    <th className="py-2 pr-3">Club &amp; Active Advantages</th>
                    <th className="px-2 py-2 text-center">P</th>
                    <th className="px-2 py-2 text-center">W</th>
                    <th className="px-2 py-2 text-center">D</th>
                    <th className="px-2 py-2 text-center">L</th>
                    <th className="px-2 py-2 text-center">GD</th>
                    <th className="px-2 py-2 text-center">WIN%</th>
                    <th className="px-2 py-2 text-center text-white">PTS</th>
                    <th className="pl-2 py-2 text-right">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {standings.map((row, idx) => {
                    const team = teamMap.get(row.teamId);
                    if (!team) return null;
                    return (
                      <tr
                        key={row.teamId}
                        className={idx === 0 ? 'bg-amber-500/5' : 'hover:bg-slate-900/50'}
                      >
                        <td className="py-2.5 pr-2 font-mono-code font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <LogoSvg config={team.logo} size={26} />
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  setRosterTeamId(team.id);
                                  setPhaseTab('rosters');
                                }}
                                title="View club roster"
                                className="font-semibold text-white hover:text-amber-300 hover:underline text-left cursor-pointer"
                              >
                                {team.name}
                              </button>
                              {row.activeAdvantages.length > 0 && (
                                <div className="mt-0.5 flex flex-wrap gap-1">
                                  {row.activeAdvantages.map((adv, ai) => (
                                    <span
                                      key={ai}
                                      className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300"
                                    >
                                      <Zap className="h-2.5 w-2.5" />
                                      {adv}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono-code text-slate-300">
                          {row.played}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono-code text-slate-300">
                          {row.won + row.otWon}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono-code text-slate-300">
                          {row.drawn}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono-code text-slate-300">
                          {row.lost + row.otLost}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono-code text-slate-300">
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono-code text-slate-400">
                          {(row.winPct * 100).toFixed(0)}%
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono-code font-bold text-amber-400">
                          {row.points}
                        </td>
                        <td className="pl-2 py-2.5 text-right">
                          <div className="inline-flex gap-1">
                            {row.form.map((f, fi) => (
                              <span
                                key={fi}
                                className={`inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold ${
                                  f === 'W'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : f === 'D'
                                      ? 'bg-slate-700 text-slate-300'
                                      : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule & Match Breakdowns */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#131b2c] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setScheduleMode('round')}
                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    scheduleMode === 'round'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                  Rounds
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode('calendar')}
                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    scheduleMode === 'calendar'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Calendar
                </button>
              </div>

              {scheduleMode === 'round' && (
                <button
                  type="button"
                  disabled={!perms.canSimulateMatches}
                  title={!perms.canSimulateMatches ? 'Permission required: Simulate Matches' : ''}
                  onClick={handleSimulateRound}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 disabled:opacity-40 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  Sim Round {activeRound}
                </button>
              )}
            </div>

            {scheduleMode === 'round' ? (
              <>
                <div className="mb-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {rounds.map((r) => {
                    const allDone = phaseMatches
                      .filter((m) => m.round === r)
                      .every((m) => m.played);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRound(r)}
                        className={`font-mono-code rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          activeRound === r
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : allDone
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {phaseTab === 'preseason' ? `PRE ${r}` : `MD ${r}`}
                      </button>
                    );
                  })}
                </div>

                {roundDate && (
                  <div className="mb-2 flex items-center gap-1.5 font-mono-code text-[11px] text-sky-300">
                    <Calendar className="h-3 w-3" />
                    {roundMatches[0]?.roundName} · {roundDate}
                  </div>
                )}

                {phaseTab === 'regular' &&
                  (competition.resolvedBreakWeeks?.[activeRound]?.length ?? 0) > 0 && (
                    <div className="mb-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px]">
                      <div className="font-semibold text-sky-300 uppercase tracking-wider text-[10px]">
                        On Break / Bye Week (Matchday {activeRound})
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {competition.resolvedBreakWeeks![activeRound].map((tid) => {
                          const restingTeam = teamMap.get(tid);
                          if (!restingTeam) return null;
                          return (
                            <span
                              key={tid}
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/90 px-2 py-0.5 text-slate-200"
                            >
                              <LogoSvg config={restingTeam.logo} size={16} />
                              <span>{restingTeam.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {roundMatches.map((m) => {
                    const home = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
                    const away = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
                    if (!home || !away) return null;
                    return (
                      <div
                        key={m.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <LogoSvg config={home.logo} size={24} />
                            <span className="truncate font-semibold text-white">
                              {home.abbreviation}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={250}
                              disabled={!perms.canSimulateMatches}
                              value={m.homeScore ?? ''}
                              placeholder="-"
                              onChange={(e) =>
                                handleScoreEdit(m.id, 'home', Number(e.target.value))
                              }
                              className="font-mono-code w-10 rounded border border-slate-700 bg-slate-900 py-1 text-center font-bold text-white disabled:opacity-60"
                            />
                            <span className="text-slate-500">:</span>
                            <input
                              type="number"
                              min={0}
                              max={250}
                              disabled={!perms.canSimulateMatches}
                              value={m.awayScore ?? ''}
                              placeholder="-"
                              onChange={(e) =>
                                handleScoreEdit(m.id, 'away', Number(e.target.value))
                              }
                              className="font-mono-code w-10 rounded border border-slate-700 bg-slate-900 py-1 text-center font-bold text-white disabled:opacity-60"
                            />
                            {m.resolutionNote && (
                              <span className="rounded bg-slate-800 px-1 text-[10px] text-amber-300">
                                {m.resolutionNote}
                              </span>
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                            <span className="truncate font-semibold text-white">
                              {away.abbreviation}
                            </span>
                            <LogoSvg config={away.logo} size={24} />
                          </div>

                          <button
                            type="button"
                            disabled={!perms.canSimulateMatches}
                            onClick={() => handleSimulateMatch(m.id)}
                            title={!perms.canSimulateMatches ? 'Permission required: Simulate Matches' : 'Simulate Match'}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-amber-400 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                          >
                            <Play className="h-3 w-3" />
                          </button>
                        </div>

                        {m.scoringSummary && m.scoringSummary.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {m.scoringSummary.join(' · ')}
                          </div>
                        )}
                        {m.appliedAdvantages && m.appliedAdvantages.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {m.appliedAdvantages.map((adv, ai) => (
                              <span
                                key={ai}
                                className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300"
                              >
                                <Zap className="h-2.5 w-2.5" />
                                {teamMap.get(adv.teamId)?.abbreviation}: {adv.detail}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {matchesByDate.map(([date, list]) => (
                  <div key={date} className="space-y-1.5">
                    <div className="sticky top-0 flex items-center justify-between rounded bg-slate-900/95 px-2.5 py-1 font-mono-code text-[11px] font-bold text-sky-300">
                      <span>{date}</span>
                      <span className="text-slate-400">{list[0]?.roundName}</span>
                    </div>
                    {list.map((m) => {
                      const home = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
                      const away = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
                      if (!home || !away) return null;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs"
                        >
                          <span className="truncate flex-1 font-medium text-slate-200">
                            {home.name}
                          </span>
                          <span className="font-mono-code rounded bg-slate-900 px-2 py-0.5 font-bold text-amber-300">
                            {m.played ? `${m.homeScore} - ${m.awayScore}` : 'vs'}
                          </span>
                          <span className="truncate flex-1 text-right font-medium text-slate-200">
                            {away.name}
                          </span>
                        </div>
                      );
                    })}
                    {phaseTab === 'regular' &&
                      list[0]?.round &&
                      (competition.resolvedBreakWeeks?.[list[0].round]?.length ?? 0) > 0 && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-2.5 py-1 text-[10px] text-sky-300">
                          Break Week:{' '}
                          {competition.resolvedBreakWeeks![list[0].round]
                            .map((tid) => teamMap.get(tid)?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
