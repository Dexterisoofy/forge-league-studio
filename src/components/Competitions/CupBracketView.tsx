import React, { useMemo, useState } from 'react';
import {
  Calendar,
  FastForward,
  Flame,
  GitBranch,
  Play,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  advanceCupWinner,
  groupCupRounds,
  seedGroupKnockoutPlayoffs,
  simulateCupScore,
} from '../../engine/simulation/cupEngine';
import {
  applyLeagueMatchResult,
  computeStandings,
  simulateLeagueScore,
} from '../../engine/simulation/leagueEngine';
import { pushCompetitionSnapshot } from '../../engine/simulation/historyEngine';
import { resolveUserPermissions } from '../../lib/auth-db';
import type { Competition, CupRound, Match } from '../../types';
import { LogoSvg } from '../common/LogoSvg';
import { SimulationHistoryBar } from './SimulationHistoryBar';

interface CupBracketViewProps {
  competition: Competition;
  onUpdate: (comp: Competition) => void;
}

export const CupBracketView: React.FC<CupBracketViewProps> = ({
  competition,
  onUpdate,
}) => {
  const { getSport, user, showToast } = useApp();
  const sport = getSport(competition.sportId);
  const perms = resolveUserPermissions(competition, user);
  const [confirmFullSim, setConfirmFullSim] = useState(false);

  const isDoubleElim = competition.format === 'double-elim';
  const isGroupKnockout = competition.format === 'group-knockout';
  const hasPreseason = competition.matches.some((m) => m.bracket === 'preseason');

  const [showPreseason, setShowPreseason] = useState(false);
  const [deTab, setDeTab] = useState<'winners' | 'losers' | 'grand-final'>('winners');
  const [gkTab, setGkTab] = useState<'groups' | 'knockout'>(
    competition.knockoutSeeded ? 'knockout' : 'groups'
  );

  const teamMap = useMemo(
    () => new Map(competition.teams.map((t) => [t.id, t])),
    [competition.teams]
  );

  const championTeam = competition.championId
    ? teamMap.get(competition.championId)
    : null;

  const accent = competition.branding?.accentColor ?? sport.accentColor;

  const handleSimMatch = (matchId: string) => {
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

    if (match.bracket === 'group' || match.bracket === 'preseason') {
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
      return;
    }

    const res = simulateCupScore(
      home,
      away,
      withSnap.rules,
      sport,
      withSnap,
      match
    );
    onUpdate(
      advanceCupWinner(
        withSnap,
        matchId,
        res.homeScore,
        res.awayScore,
        res.penaltyWinnerId,
        res.resolutionNote,
        sport,
        {
          isOvertime: res.isOvertime,
          scoringSummary: res.scoringSummary,
          preApplied: res.preApplied,
        }
      )
    );
  };

  const handleSimRound = (roundMatches: Match[]) => {
    if (!perms.canSimulateMatches) return;
    let next = pushCompetitionSnapshot(
      competition,
      roundMatches[0]?.roundName ?? 'Cup Round'
    );
    for (const m of roundMatches) {
      const fresh = next.matches.find((fm) => fm.id === m.id);
      if (!fresh || fresh.played || !fresh.homeTeamId || !fresh.awayTeamId) continue;
      const home = teamMap.get(fresh.homeTeamId);
      const away = teamMap.get(fresh.awayTeamId);
      if (!home || !away) continue;
      const res = simulateCupScore(home, away, next.rules, sport, next, fresh);
      next = advanceCupWinner(
        next,
        fresh.id,
        res.homeScore,
        res.awayScore,
        res.penaltyWinnerId,
        res.resolutionNote,
        sport,
        {
          isOvertime: res.isOvertime,
          scoringSummary: res.scoringSummary,
          preApplied: res.preApplied,
        }
      );
    }
    onUpdate(next);
  };

  const handleSimPreseason = () => {
    if (!perms.canSimulateSeason) return;
    let next = pushCompetitionSnapshot(competition, 'Full Preseason Sim');
    for (const m of next.matches) {
      if (m.bracket !== 'preseason' || m.played || !m.homeTeamId || !m.awayTeamId) continue;
      const home = teamMap.get(m.homeTeamId);
      const away = teamMap.get(m.awayTeamId);
      if (!home || !away) continue;
      const sim = simulateLeagueScore(
        home,
        away,
        next.rules?.homeFieldAdvantage ?? true,
        sport,
        next,
        m
      );
      next = applyLeagueMatchResult(
        next,
        m.id,
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

  const handleSimAllGroups = () => {
    if (!perms.canSimulateSeason) return;
    let next = pushCompetitionSnapshot(competition, 'Simulate All Groups');
    for (const m of next.matches) {
      if (m.bracket !== 'group' || m.played || !m.homeTeamId || !m.awayTeamId) continue;
      const home = teamMap.get(m.homeTeamId);
      const away = teamMap.get(m.awayTeamId);
      if (!home || !away) continue;
      const sim = simulateLeagueScore(
        home,
        away,
        next.rules?.homeFieldAdvantage ?? true,
        sport,
        next,
        m
      );
      next = applyLeagueMatchResult(
        next,
        m.id,
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
    if (!next.knockoutSeeded) {
      next = seedGroupKnockoutPlayoffs(next);
      setGkTab('knockout');
    }
    onUpdate(next);
  };

  const handleSimFullBracket = () => {
    if (!perms.canSimulateSeason) return;
    let next = pushCompetitionSnapshot(competition, 'Full Tournament Batch Sim');
    // Simulate preseason if unfinished
    for (const m of next.matches) {
      if (m.bracket !== 'preseason' || m.played || !m.homeTeamId || !m.awayTeamId) continue;
      const home = teamMap.get(m.homeTeamId);
      const away = teamMap.get(m.awayTeamId);
      if (!home || !away) continue;
      const sim = simulateLeagueScore(
        home,
        away,
        next.rules?.homeFieldAdvantage ?? true,
        sport,
        next,
        m
      );
      next = applyLeagueMatchResult(next, m.id, sim.homeScore, sim.awayScore, sport, {
        isOvertime: sim.isOvertime,
        resolutionNote: sim.resolutionNote,
        scoringSummary: sim.scoringSummary,
        preApplied: sim.preApplied,
      });
    }

    if (isGroupKnockout) {
      for (const m of next.matches) {
        if (m.bracket !== 'group' || m.played || !m.homeTeamId || !m.awayTeamId) continue;
        const home = teamMap.get(m.homeTeamId);
        const away = teamMap.get(m.awayTeamId);
        if (!home || !away) continue;
        const sim = simulateLeagueScore(
          home,
          away,
          next.rules?.homeFieldAdvantage ?? true,
          sport,
          next,
          m
        );
        next = applyLeagueMatchResult(next, m.id, sim.homeScore, sim.awayScore, sport, {
          isOvertime: sim.isOvertime,
          resolutionNote: sim.resolutionNote,
          scoringSummary: sim.scoringSummary,
          preApplied: sim.preApplied,
        });
      }
      if (!next.knockoutSeeded) {
        next = seedGroupKnockoutPlayoffs(next);
      }
    }

    for (let pass = 0; pass < 35; pass++) {
      const playable = next.matches.filter(
        (m) =>
          m.bracket !== 'group' &&
          m.bracket !== 'preseason' &&
          !m.played &&
          m.homeTeamId &&
          m.awayTeamId
      );
      if (playable.length === 0) break;
      playable.sort((a, b) => a.round - b.round);
      const target = playable[0];
      const home = teamMap.get(target.homeTeamId!);
      const away = teamMap.get(target.awayTeamId!);
      if (!home || !away) break;
      const res = simulateCupScore(home, away, next.rules, sport, next, target);
      next = advanceCupWinner(
        next,
        target.id,
        res.homeScore,
        res.awayScore,
        res.penaltyWinnerId,
        res.resolutionNote,
        sport,
        {
          isOvertime: res.isOvertime,
          scoringSummary: res.scoringSummary,
          preApplied: res.preApplied,
        }
      );
    }

    onUpdate(next);
    if (isGroupKnockout) setGkTab('knockout');
  };

  const renderBracketColumns = (rounds: CupRound[]) => (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex min-w-full gap-6">
        {rounds.map((round) => {
          const hasPlayable = round.matches.some(
            (m) => !m.played && m.homeTeamId && m.awayTeamId
          );
          const roundDate = round.matches.find((m) => m.scheduledDate)?.scheduledDate;
          return (
            <div key={round.round} className="w-72 shrink-0 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2">
                <div>
                  <div
                    className="font-display text-sm font-bold tracking-wider uppercase"
                    style={{ color: accent }}
                  >
                    {round.name}
                  </div>
                  {roundDate && (
                    <div className="font-mono-code text-[10px] text-slate-400">
                      {roundDate}
                    </div>
                  )}
                </div>
                {hasPlayable && (
                  <button
                    type="button"
                    disabled={!perms.canSimulateMatches}
                    title={!perms.canSimulateMatches ? 'Permission required: Simulate Matches' : ''}
                    onClick={() => handleSimRound(round.matches)}
                    className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-1 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/25 disabled:opacity-40 cursor-pointer"
                  >
                    <Play className="h-3 w-3" />
                    Sim Round
                  </button>
                )}
              </div>

              <div className="flex flex-col justify-around gap-3.5">
                {round.matches.map((m) => {
                  const home = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
                  const away = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
                  const canSim = Boolean(home && away && !m.played);

                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-2.5 shadow ${
                        m.isBye
                          ? 'border-slate-800/60 bg-slate-950/50 opacity-80'
                          : 'border-slate-800 bg-[#131b2c]'
                      }`}
                    >
                      {[
                        { team: home, score: m.homeScore },
                        { team: away, score: m.awayScore },
                      ].map((slot, idx) => {
                        const isWinner = Boolean(
                          slot.team && m.winnerId === slot.team.id
                        );
                        const wonNote =
                          isWinner && m.resolutionNote ? m.resolutionNote : null;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs ${
                              idx === 0 ? 'mb-1' : ''
                            } ${
                              isWinner
                                ? 'bg-emerald-500/15 text-white font-bold'
                                : 'bg-slate-950/60 text-slate-300'
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              {slot.team ? (
                                <>
                                  <LogoSvg config={slot.team.logo} size={22} />
                                  <span className="truncate">{slot.team.name}</span>
                                </>
                              ) : m.isBye ? (
                                <span className="font-mono-code text-[10px] uppercase text-slate-500">
                                  BYE
                                </span>
                              ) : (
                                <span className="italic text-slate-600">TBD</span>
                              )}
                            </div>
                            <div className="font-mono-code flex items-center gap-1 shrink-0">
                              {wonNote && (
                                <span className="rounded bg-amber-500/20 px-1 text-[10px] text-amber-300">
                                  {wonNote}
                                </span>
                              )}
                              <span>
                                {m.isBye
                                  ? isWinner
                                    ? 'ADV'
                                    : '-'
                                  : slot.score !== null
                                    ? slot.score
                                    : '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {m.appliedAdvantages && m.appliedAdvantages.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
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

                      {canSim && (
                        <button
                          type="button"
                          disabled={!perms.canSimulateMatches}
                          title={!perms.canSimulateMatches ? 'Permission required: Simulate Matches' : ''}
                          onClick={() => handleSimMatch(m.id)}
                          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 py-1 text-[11px] font-semibold text-amber-300 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                        >
                          <Play className="h-3 w-3" />
                          Simulate Match
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const winnersRounds = useMemo(
    () =>
      groupCupRounds(
        competition.matches.filter(
          (m) => m.bracket === 'winners' || m.bracket === 'knockout' || !m.bracket
        )
      ),
    [competition.matches]
  );

  const losersRounds = useMemo(
    () =>
      groupCupRounds(competition.matches.filter((m) => m.bracket === 'losers')),
    [competition.matches]
  );

  const grandFinalRounds = useMemo(
    () =>
      groupCupRounds(competition.matches.filter((m) => m.bracket === 'grand-final')),
    [competition.matches]
  );

  const preseasonMatches = competition.matches.filter(
    (m) => m.bracket === 'preseason'
  );
  const groupMatches = competition.matches.filter((m) => m.bracket === 'group');
  const groupsAllPlayed =
    groupMatches.length > 0 && groupMatches.every((m) => m.played);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#131b2c] p-4">
        <div>
          <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
            {sport.name} —{' '}
            {isDoubleElim
              ? `Double-Elimination Cup (${competition.size} Teams)`
              : isGroupKnockout
                ? `Group Stage + Knockout Playoffs (${competition.size} Teams)`
                : `Single-Elimination Bracket (${competition.size} Teams)`}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 font-mono-code text-sky-300">
              <Calendar className="h-3.5 w-3.5" />
              {competition.schedule.startDate} → {competition.schedule.endDate}
            </span>
            <span>·</span>
            <span>Overtime: {competition.rules.overtimeRule}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SimulationHistoryBar
            competition={competition}
            canUndo={perms.canUndoSimulations}
            onUpdate={onUpdate}
            onMessage={showToast}
          />
          {hasPreseason && (
            <button
              type="button"
              onClick={() => setShowPreseason((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                showPreseason
                  ? 'bg-purple-500 text-slate-950 font-bold'
                  : 'border border-purple-500/40 bg-purple-500/15 text-purple-300'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              {showPreseason ? 'View Tournament' : 'View Preseason'}
            </button>
          )}
          {!confirmFullSim ? (
            <button
              type="button"
              disabled={!perms.canSimulateSeason}
              title={
                !perms.canSimulateSeason
                  ? 'Permission required: Simulate Season / Batch'
                  : 'Simulate remaining tournament'
              }
              onClick={() => setConfirmFullSim(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 disabled:opacity-40 cursor-pointer"
              style={{ backgroundColor: accent }}
            >
              <FastForward className="h-4 w-4" />
              Simulate Entire Tournament
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs">
              <span className="font-semibold text-amber-200">Sim entire cup?</span>
              <button
                type="button"
                onClick={() => {
                  handleSimFullBracket();
                  setConfirmFullSim(false);
                }}
                className="rounded bg-amber-500 px-2.5 py-0.5 font-bold text-slate-950 cursor-pointer"
              >
                Run
              </button>
              <button
                type="button"
                onClick={() => setConfirmFullSim(false)}
                className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {championTeam && (
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 p-5"
          style={{ borderColor: `${accent}66` }}
        >
          <div className="flex items-center gap-4">
            <LogoSvg config={championTeam.logo} size={64} />
            <div>
              <div
                className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase"
                style={{ color: accent }}
              >
                <Trophy className="h-4 w-4" />
                Tournament Champion
              </div>
              <div className="font-display text-3xl font-extrabold text-white uppercase">
                {championTeam.name}
              </div>
              <div className="text-xs text-slate-400">
                {championTeam.stadium} · OVR {championTeam.overallRating}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreseason && hasPreseason ? (
        <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg font-bold text-purple-300 uppercase">
              Preseason Exhibitions ({preseasonMatches.length} {sport.terminology.matchUnit}s)
            </h4>
            <button
              type="button"
              onClick={handleSimPreseason}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-purple-400 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              Simulate Preseason
            </button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {preseasonMatches.map((m) => {
              const home = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
              const away = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
              if (!home || !away) return null;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs"
                >
                  <span className="font-mono-code text-[10px] text-slate-500">
                    {m.scheduledDate}
                  </span>
                  <span className="truncate flex-1 font-semibold text-white">
                    {home.abbreviation}
                  </span>
                  <span className="font-mono-code font-bold text-purple-300">
                    {m.played ? `${m.homeScore}-${m.awayScore}` : 'vs'}
                  </span>
                  <span className="truncate flex-1 text-right font-semibold text-white">
                    {away.abbreviation}
                  </span>
                  {!m.played && (
                    <button
                      type="button"
                      onClick={() => handleSimMatch(m.id)}
                      className="rounded bg-slate-800 p-1 text-amber-400 hover:bg-slate-700 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {isGroupKnockout && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2 rounded-xl border border-slate-800 bg-[#131b2c] p-1">
                  <button
                    type="button"
                    onClick={() => setGkTab('groups')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer ${
                      gkTab === 'groups'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Group Stage ({competition.groups?.length ?? 0} Groups)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGkTab('knockout')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer ${
                      gkTab === 'knockout'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Knockout Playoffs
                  </button>
                </div>

                {gkTab === 'groups' && (
                  <div className="flex flex-wrap gap-2">
                    {!groupsAllPlayed && (
                      <button
                        type="button"
                        onClick={handleSimAllGroups}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Simulate All Groups
                      </button>
                    )}
                    {groupsAllPlayed && !competition.knockoutSeeded && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdate(seedGroupKnockoutPlayoffs(competition));
                          setGkTab('knockout');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Seed &amp; Advance Top 2 to Playoffs
                      </button>
                    )}
                  </div>
                )}
              </div>

              {gkTab === 'groups' ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  {competition.groups?.map((grp) => {
                    const grpTeams = grp.teamIds
                      .map((id) => teamMap.get(id)!)
                      .filter(Boolean);
                    const grpMatches = groupMatches.filter(
                      (m) => m.groupName === grp.name
                    );
                    const rows = computeStandings(
                      grpTeams,
                      grpMatches,
                      competition.rules,
                      competition.appliedAdvantages,
                      'regular',
                      competition.advantageRules
                    );
                    return (
                      <div
                        key={grp.name}
                        className="rounded-2xl border border-slate-800 bg-[#131b2c] p-4 space-y-4"
                      >
                        <h4 className="font-display text-lg font-bold text-amber-400 uppercase">
                          {grp.name}
                        </h4>
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                            <tr>
                              <th className="py-1.5 w-6">#</th>
                              <th className="py-1.5">Club</th>
                              <th className="px-1.5 py-1.5 text-center">P</th>
                              <th className="px-1.5 py-1.5 text-center">GD</th>
                              <th className="px-1.5 py-1.5 text-center">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {rows.map((r, i) => {
                              const t = teamMap.get(r.teamId);
                              if (!t) return null;
                              return (
                                <tr
                                  key={r.teamId}
                                  className={i < 2 ? 'bg-emerald-500/5' : ''}
                                >
                                  <td className="py-1.5 font-mono-code text-slate-400">
                                    {i + 1}
                                  </td>
                                  <td className="py-1.5">
                                    <div className="flex items-center gap-2">
                                      <LogoSvg config={t.logo} size={22} />
                                      <span className="font-semibold text-white">
                                        {t.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-1.5 py-1.5 text-center font-mono-code">
                                    {r.played}
                                  </td>
                                  <td className="px-1.5 py-1.5 text-center font-mono-code">
                                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                                  </td>
                                  <td className="px-1.5 py-1.5 text-center font-mono-code font-bold text-amber-300">
                                    {r.points}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {grpMatches.map((m) => {
                            const home = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
                            const away = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
                            if (!home || !away) return null;
                            return (
                              <div
                                key={m.id}
                                className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-[11px]"
                              >
                                <span className="font-mono-code text-[10px] text-slate-500">
                                  {m.scheduledDate}
                                </span>
                                <span className="truncate flex-1 font-medium text-slate-200">
                                  {home.abbreviation}
                                </span>
                                <span className="font-mono-code font-bold text-amber-300">
                                  {m.played ? `${m.homeScore}-${m.awayScore}` : 'vs'}
                                </span>
                                <span className="truncate flex-1 text-right font-medium text-slate-200">
                                  {away.abbreviation}
                                </span>
                                {!m.played && (
                                  <button
                                    type="button"
                                    onClick={() => handleSimMatch(m.id)}
                                    className="rounded bg-slate-800 p-1 text-amber-400 hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Play className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                renderBracketColumns(winnersRounds)
              )}
            </div>
          )}

          {isDoubleElim && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-[#131b2c] p-1 w-fit">
                {[
                  { id: 'winners' as const, label: 'Winners Bracket' },
                  { id: 'losers' as const, label: 'Losers Bracket' },
                  { id: 'grand-final' as const, label: 'Grand Final' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDeTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer ${
                      deTab === tab.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {deTab === 'winners' && renderBracketColumns(winnersRounds)}
              {deTab === 'losers' && renderBracketColumns(losersRounds)}
              {deTab === 'grand-final' && renderBracketColumns(grandFinalRounds)}
            </div>
          )}

          {!isDoubleElim && !isGroupKnockout && renderBracketColumns(winnersRounds)}
        </>
      )}
    </div>
  );
};
