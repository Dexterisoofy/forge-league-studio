import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Check,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { selectTeamRotation } from '../../engine/simulation/lineupEngine';
import {
  formatSuspensionBadge,
  getEffectiveTeamRating,
  isPlayerSuspended,
} from '../../engine/simulation/suspensionEngine';
import type { Competition } from '../../types';
import { LogoSvg } from '../common/LogoSvg';

interface CompetitionRostersPanelProps {
  competition: Competition;
  initialTeamId?: string | null;
}

export const CompetitionRostersPanel: React.FC<CompetitionRostersPanelProps> = ({
  competition,
  initialTeamId,
}) => {
  const { getSport, vault, saveTeamToVault, editVaultTeam } = useApp();
  const sport = getSport(competition.sportId);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    initialTeamId || competition.teams[0]?.id || ''
  );
  const [teamQuery, setTeamQuery] = useState('');
  const [playerQuery, setPlayerQuery] = useState('');
  const [sortBy, setSortBy] = useState<'overall' | 'jersey'>('overall');

  useEffect(() => {
    if (initialTeamId && competition.teams.some((t) => t.id === initialTeamId)) {
      setSelectedTeamId(initialTeamId);
    }
  }, [initialTeamId, competition.teams]);

  const filteredTeams = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    return competition.teams.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.abbreviation.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
    );
  }, [competition.teams, teamQuery]);

  const selectedTeam =
    competition.teams.find((t) => t.id === selectedTeamId) ??
    competition.teams[0] ??
    null;

  const isInVault = selectedTeam
    ? vault.some((v) => v.id === selectedTeam.id || v.seedCode === selectedTeam.seedCode)
    : false;

  const rotation = useMemo(() => {
    if (!selectedTeam) return null;
    return selectTeamRotation(selectedTeam, sport);
  }, [selectedTeam, sport]);

  const starterSlotMap = useMemo(() => {
    const map = new Map<string, { slot: number; role: string; shortLabel: string; fitScore: number }>();
    if (!rotation) return map;
    for (const s of rotation.starters) {
      map.set(s.player.id, {
        slot: s.slot,
        role: s.role,
        shortLabel: s.shortLabel,
        fitScore: s.fitScore,
      });
    }
    return map;
  }, [rotation]);

  const sixthManId = rotation?.sixthMan?.id ?? null;

  const displayedRoster = useMemo(() => {
    if (!selectedTeam) return [];
    const q = playerQuery.trim().toLowerCase();
    const matchesQuery = (p: typeof selectedTeam.roster[number]) =>
      !q ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      p.archetype.toLowerCase().includes(q) ||
      String(p.jerseyNumber).includes(q);

    if (sortBy === 'jersey') {
      return selectedTeam.roster
        .filter(matchesQuery)
        .sort((a, b) => a.jerseyNumber - b.jerseyNumber);
    }

    // Preserve positional order (Slot 1 -> Slot 5), then 6th Man, then remaining bench by OVR
    return selectedTeam.roster.filter(matchesQuery).sort((a, b) => {
      const slotA = starterSlotMap.get(a.id)?.slot;
      const slotB = starterSlotMap.get(b.id)?.slot;
      if (slotA !== undefined && slotB !== undefined) return slotA - slotB;
      if (slotA !== undefined) return -1;
      if (slotB !== undefined) return 1;
      if (a.id === sixthManId && b.id !== sixthManId) return -1;
      if (b.id === sixthManId && a.id !== sixthManId) return 1;
      return b.overall - a.overall;
    });
  }, [selectedTeam, playerQuery, sortBy, starterSlotMap, sixthManId]);

  if (!selectedTeam) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-8 text-center text-sm text-slate-400">
        No teams found in this competition.
      </div>
    );
  }

  const effectiveOvr = getEffectiveTeamRating(selectedTeam, sport.activeLineupSize);
  const suspendedCount = selectedTeam.roster.filter((p) => isPlayerSuspended(p)).length;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Club Sidebar */}
      <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#131b2c] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-wide text-white uppercase">
            <Users className="h-4 w-4 text-amber-400" />
            Clubs ({competition.teams.length})
          </h3>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter clubs..."
            value={teamQuery}
            onChange={(e) => setTeamQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-1.5 pr-3 pl-8 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="max-h-[580px] space-y-1.5 overflow-y-auto pr-1">
          {filteredTeams.map((team) => {
            const active = team.id === selectedTeam.id;
            const suspCount = team.roster.filter((p) => isPlayerSuspended(p)).length;
            const eff = getEffectiveTeamRating(team, sport.activeLineupSize);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                className={`flex w-full items-center justify-between gap-2.5 rounded-xl border p-2.5 text-left transition cursor-pointer ${
                  active
                    ? 'border-amber-500 bg-amber-500/15'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LogoSvg config={team.logo} size={34} />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-white">
                      {team.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {team.abbreviation} · {team.roster.length} players · {team.playstyle}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="font-mono-code rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-bold text-amber-300">
                    OVR {eff}
                    {eff !== team.overallRating ? ` (${team.overallRating})` : ''}
                  </span>
                  {suspCount > 0 && (
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
                      {suspCount} SUSP
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Team Roster Detail */}
      <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#131b2c] p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <LogoSvg config={selectedTeam.logo} size={64} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-amber-500/15 px-2 py-0.5 font-mono-code text-[10px] font-bold text-amber-300">
                  {selectedTeam.abbreviation}
                </span>
                <span className="font-mono-code text-[11px] text-sky-300">
                  Seed: {selectedTeam.seedCode}
                </span>
                <span className="text-[11px] text-slate-400">
                  · Est. {selectedTeam.foundedYear}
                </span>
              </div>
              <h3 className="font-display mt-1 text-2xl font-extrabold text-white uppercase">
                {selectedTeam.name}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedTeam.stadium} · {selectedTeam.playstyle} · {selectedTeam.budgetTier} Budget
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Team OVR</div>
              <div className="font-mono-code text-base font-bold text-amber-300">
                {effectiveOvr}
                {effectiveOvr !== selectedTeam.overallRating && (
                  <span className="ml-1 text-xs text-slate-500">
                    / {selectedTeam.overallRating}
                  </span>
                )}
              </div>
            </div>

            {isInVault ? (
              <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                <Check className="h-3.5 w-3.5" />
                In Vault
              </span>
            ) : (
              <button
                type="button"
                onClick={() => saveTeamToVault(selectedTeam)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5" />
                Save Team to Vault
              </button>
            )}

            <button
              type="button"
              onClick={() => editVaultTeam(selectedTeam)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <Wand2 className="h-3.5 w-3.5 text-amber-400" />
              Open in Studio
            </button>
          </div>
        </div>

        {/* Starting Rotation Bar (Positional Slot 1-5 + Sixth Man) */}
        {rotation && rotation.starters.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-bold uppercase tracking-wider text-emerald-300">
                {rotation.isBasketballRotation
                  ? `Starting 5 Rotation (${selectedTeam.playstyle})`
                  : 'Active Starting Lineup'}
              </span>
              {rotation.usedThreeGuardFallback && (
                <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  3-Guard Talent Override
                </span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6 text-[11px]">
              {rotation.starters.map((s) => (
                <div
                  key={s.player.id}
                  title={`${s.role} · Fit ${s.fitScore} (OVR ${s.player.overall} + Scheme ${s.schemeBonus} + Role ${s.roleBonus.toFixed(1)})`}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-300">
                    <span>{s.shortLabel}</span>
                    <span>{s.player.position} · {s.player.height}</span>
                  </div>
                  <div className="truncate font-semibold text-white">
                    #{s.player.jerseyNumber} {s.player.lastName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    OVR {s.player.overall} · Fit {s.fitScore.toFixed(1)}
                  </div>
                </div>
              ))}
              {rotation.sixthMan && (
                <div
                  title="Designated Sixth Man (Highest-OVR bench guard/scorer)"
                  className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-sky-300">
                    <span>6TH MAN</span>
                    <span>{rotation.sixthMan.position} · {rotation.sixthMan.height}</span>
                  </div>
                  <div className="truncate font-semibold text-white">
                    #{rotation.sixthMan.jerseyNumber} {rotation.sixthMan.lastName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    OVR {rotation.sixthMan.overall} · {rotation.sixthMan.archetype}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Squad Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>
              <strong className="text-white">{selectedTeam.roster.length}</strong> Players ·{' '}
              <strong className="text-emerald-300">{starterSlotMap.size}</strong> Active Starters
              {sixthManId ? ' · 1 Sixth Man' : ''}
            </span>
            {suspendedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                <ShieldAlert className="h-3 w-3" />
                {suspendedCount} Suspended / Banned
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search player, pos, #..."
                value={playerQuery}
                onChange={(e) => setPlayerQuery(e.target.value)}
                className="w-48 rounded-lg border border-slate-700 bg-slate-950 py-1.5 pr-2.5 pl-8 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setSortBy('overall')}
                className={`rounded px-2.5 py-1 font-semibold cursor-pointer ${
                  sortBy === 'overall' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Sort OVR
              </button>
              <button
                type="button"
                onClick={() => setSortBy('jersey')}
                className={`rounded px-2.5 py-1 font-semibold cursor-pointer ${
                  sortBy === 'jersey' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Sort #
              </button>
            </div>
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-[10px] font-semibold text-slate-400 uppercase">
              <tr>
                <th className="px-3 py-2.5 w-12">#</th>
                <th className="px-3 py-2.5">Player</th>
                <th className="px-2.5 py-2.5 w-16">Pos</th>
                <th className="px-2.5 py-2.5 w-12 text-center">Age</th>
                <th className="px-2.5 py-2.5">Ht / Wt</th>
                <th className="px-2.5 py-2.5">Archetype</th>
                <th className="px-2 py-2.5 text-center" title={sport.attributeLabels.offense}>
                  {sport.attributeLabels.offense.slice(0, 5)}
                </th>
                <th className="px-2 py-2.5 text-center" title={sport.attributeLabels.defense}>
                  {sport.attributeLabels.defense.slice(0, 5)}
                </th>
                <th className="px-2 py-2.5 text-center" title={sport.attributeLabels.speed}>
                  {sport.attributeLabels.speed.slice(0, 5)}
                </th>
                <th className="px-2 py-2.5 text-center" title={sport.attributeLabels.stamina}>
                  {sport.attributeLabels.stamina.slice(0, 5)}
                </th>
                <th className="px-2 py-2.5 text-center" title={sport.attributeLabels.iq}>
                  {sport.attributeLabels.iq.slice(0, 5)}
                </th>
                <th className="px-2.5 py-2.5 text-center w-14">OVR</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {displayedRoster.map((player) => {
                const suspended = isPlayerSuspended(player);
                const starterInfo = starterSlotMap.get(player.id);
                const isStarter = Boolean(starterInfo);
                const isSixthMan = player.id === sixthManId;
                return (
                  <tr
                    key={player.id}
                    className={
                      suspended
                        ? 'bg-rose-500/5'
                        : isStarter
                          ? 'bg-emerald-500/5 hover:bg-slate-900/60'
                          : isSixthMan
                            ? 'bg-sky-500/5 hover:bg-slate-900/60'
                            : 'hover:bg-slate-900/50'
                    }
                  >
                    <td className="px-3 py-2 font-mono-code font-bold text-amber-300">
                      #{player.jerseyNumber}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">
                          {player.firstName} {player.lastName}
                        </span>
                        {starterInfo && (
                          <span
                            title={`${starterInfo.role} (Fit ${starterInfo.fitScore.toFixed(1)})`}
                            className="inline-flex items-center gap-0.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 uppercase"
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            {starterInfo.shortLabel}
                          </span>
                        )}
                        {isSixthMan && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 uppercase">
                            6th Man
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2.5 py-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 font-semibold text-sky-300">
                        {player.position}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono-code text-slate-300">
                      {player.age}
                    </td>
                    <td className="px-2.5 py-2 text-slate-400 whitespace-nowrap">
                      {player.height} · {player.weight}lb
                    </td>
                    <td className="px-2.5 py-2 text-slate-300">{player.archetype}</td>
                    <td className="px-2 py-2 text-center font-mono-code text-slate-300">
                      {player.offense}
                    </td>
                    <td className="px-2 py-2 text-center font-mono-code text-slate-300">
                      {player.defense}
                    </td>
                    <td className="px-2 py-2 text-center font-mono-code text-slate-300">
                      {player.speed}
                    </td>
                    <td className="px-2 py-2 text-center font-mono-code text-slate-300">
                      {player.stamina}
                    </td>
                    <td className="px-2 py-2 text-center font-mono-code text-slate-300">
                      {player.iq}
                    </td>
                    <td className="px-2.5 py-2 text-center">
                      <span
                        className={`font-mono-code inline-block min-w-8 rounded px-1.5 py-0.5 font-bold ${
                          player.overall >= 82
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : player.overall >= 72
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {player.overall}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {suspended && player.suspension ? (
                        <span
                          title={player.suspension.reason}
                          className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300"
                        >
                          {formatSuspensionBadge(player.suspension)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-400">
                          Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
