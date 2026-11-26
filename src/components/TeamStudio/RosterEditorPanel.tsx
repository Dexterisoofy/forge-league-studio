import React, { useState } from 'react';
import { Ban, Lock, Plus, RefreshCw, ShieldAlert, Trash2, Unlock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createSinglePlayer,
  generateRoster,
  starRatingToBaseOverall,
} from '../../engine/generator/rosterGenerator';
import { createRng, createUuid } from '../../engine/prng';
import {
  formatSuspensionBadge,
  isPlayerSuspended,
} from '../../engine/simulation/suspensionEngine';
import type {
  Player,
  PlayerPosition,
  PlayerSuspension,
  SuspensionDurationType,
} from '../../types';

export const RosterEditorPanel: React.FC = () => {
  const {
    activeTeam,
    activeSport,
    updateActiveTeamFields,
    locks,
    toggleLock,
    showToast,
  } = useApp();
  const roster = activeTeam.roster;
  const positions = activeSport.positions;

  const [suspEditPlayerId, setSuspEditPlayerId] = useState<string | null>(null);
  const [suspType, setSuspType] = useState<'suspension' | 'ban'>('suspension');
  const [suspDuration, setSuspDuration] = useState<SuspensionDurationType>('matches');
  const [suspGames, setSuspGames] = useState(3);
  const [suspUntilDate, setSuspUntilDate] = useState(
    () => new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [suspReason, setSuspReason] = useState('Disciplinary infraction');

  const issueSuspension = (playerId: string) => {
    const newSusp: PlayerSuspension = {
      id: createUuid(),
      type: suspType,
      durationType: suspDuration,
      gamesRemaining: suspDuration === 'matches' ? Math.max(1, suspGames) : undefined,
      totalGames: suspDuration === 'matches' ? Math.max(1, suspGames) : undefined,
      untilDate: suspDuration === 'until-date' ? suspUntilDate : undefined,
      reason: suspReason.trim() || (suspType === 'ban' ? 'Indefinite Ban' : 'Team Suspension'),
      issuedAt: new Date().toISOString(),
      active: true,
    };
    handlePlayerChange(playerId, { suspension: newSusp });
    setSuspEditPlayerId(null);
    showToast(`Issued ${formatSuspensionBadge(newSusp)}`);
  };

  const handleRerollRoster = () => {
    const rng = createRng(`${activeTeam.seedCode}-${Date.now()}`);
    const nextRoster = generateRoster(rng, activeTeam.starRating, activeSport);
    updateActiveTeamFields({ roster: nextRoster });
    showToast(`Generated ${nextRoster.length} ${activeSport.name} players`);
  };

  const handlePlayerChange = (playerId: string, patch: Partial<Player>) => {
    if (patch.jerseyNumber !== undefined) {
      const targetNum = Math.max(1, Math.min(99, Math.round(patch.jerseyNumber)));
      const duplicate = roster.some(
        (p) => p.id !== playerId && p.jerseyNumber === targetNum
      );
      if (duplicate) {
        showToast(`Jersey #${targetNum} is already assigned to another player`);
        return;
      }
      patch.jerseyNumber = targetNum;
    }

    const updated = roster.map((p) => {
      if (p.id !== playerId) return p;
      const merged = { ...p, ...patch };
      const avg = Math.round(
        (merged.offense + merged.defense + merged.speed + merged.stamina + merged.iq) / 5
      );
      return {
        ...merged,
        overall: patch.overall !== undefined ? patch.overall : avg,
      };
    });
    updateActiveTeamFields({ roster: updated });
  };

  const handleAddPlayer = () => {
    const maxAllowed = Math.max(activeSport.rosterSize.max, 25);
    if (roster.length >= maxAllowed) {
      showToast(`Roster is at maximum ${maxAllowed} players`);
      return;
    }
    const used = new Set(roster.map((p) => p.jerseyNumber));
    let nextNum = 1;
    while (used.has(nextNum) && nextNum <= 99) nextNum++;
    const rng = createRng(`add-${Date.now()}`);
    const spec = rng.pick(positions);
    const newPlayer = createSinglePlayer(
      rng,
      spec,
      nextNum,
      starRatingToBaseOverall(activeTeam.starRating)
    );
    updateActiveTeamFields({ roster: [...roster, newPlayer] });
  };

  const handleRemovePlayer = (playerId: string) => {
    const minAllowed = Math.min(activeSport.rosterSize.min, 5);
    if (roster.length <= minAllowed) {
      showToast(`Minimum roster size is ${minAllowed} players`);
      return;
    }
    updateActiveTeamFields({ roster: roster.filter((p) => p.id !== playerId) });
  };

  const benchCount = Math.max(0, roster.length - activeSport.activeLineupSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Active Squad ({roster.length} Players · {Math.min(activeSport.activeLineupSize, roster.length)} Starters / {benchCount} Bench)
          </h3>
          <p className="text-xs text-slate-400">
            {activeSport.name} · Team OVR {activeTeam.overallRating} · Jersey numbers strictly unique
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleLock('roster')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
              locks.roster
                ? 'border border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {locks.roster ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            {locks.roster ? 'Roster Locked' : 'Lock Roster'}
          </button>
          <button
            type="button"
            onClick={handleAddPlayer}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Player
          </button>
          <button
            type="button"
            onClick={handleRerollRoster}
            className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/25 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-roll Roster
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase">
            <tr>
              <th className="px-3 py-2.5 w-16">#</th>
              <th className="px-3 py-2.5">Player Name</th>
              <th className="px-3 py-2.5 w-24">Pos</th>
              <th className="px-3 py-2.5 w-16">Age</th>
              <th className="px-3 py-2.5 w-24">Ht / Wt</th>
              <th className="px-3 py-2.5">Archetype</th>
              <th className="px-2 py-2.5 text-center w-16" title={activeSport.attributeLabels.offense}>
                {activeSport.attributeLabels.offense.slice(0, 5)}
              </th>
              <th className="px-2 py-2.5 text-center w-16" title={activeSport.attributeLabels.defense}>
                {activeSport.attributeLabels.defense.slice(0, 5)}
              </th>
              <th className="px-2 py-2.5 text-center w-16" title={activeSport.attributeLabels.speed}>
                {activeSport.attributeLabels.speed.slice(0, 5)}
              </th>
              <th className="px-2 py-2.5 text-center w-14">OVR</th>
              <th className="px-2 py-2.5 text-center">Discipline</th>
              <th className="px-2 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {roster.map((player) => {
              const suspended = isPlayerSuspended(player);
              const editingSusp = suspEditPlayerId === player.id;
              return (
                <React.Fragment key={player.id}>
                  <tr className={`hover:bg-slate-900/50 ${suspended ? 'bg-rose-500/5' : ''}`}>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={player.jerseyNumber}
                    onChange={(e) =>
                      handlePlayerChange(player.id, {
                        jerseyNumber: Number(e.target.value),
                      })
                    }
                    className="font-mono-code w-12 rounded border border-slate-700 bg-slate-900 px-1.5 py-1 text-center font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={player.firstName}
                      onChange={(e) =>
                        handlePlayerChange(player.id, { firstName: e.target.value })
                      }
                      className="w-24 rounded border border-slate-800 bg-slate-900/80 px-2 py-1 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={player.lastName}
                      onChange={(e) =>
                        handlePlayerChange(player.id, { lastName: e.target.value })
                      }
                      className="w-28 rounded border border-slate-800 bg-slate-900/80 px-2 py-1 font-medium text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={player.position}
                    onChange={(e) =>
                      handlePlayerChange(player.id, {
                        position: e.target.value as PlayerPosition,
                      })
                    }
                    className="rounded border border-slate-700 bg-slate-900 px-1.5 py-1 font-semibold text-sky-300 focus:border-amber-500 focus:outline-none"
                  >
                    {positions.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 font-mono-code text-slate-300">
                  {player.age}
                </td>
                <td className="px-3 py-2 text-slate-400">
                  {player.height} · {player.weight}lb
                </td>
                <td className="px-3 py-2 text-slate-300">{player.archetype}</td>
                {(['offense', 'defense', 'speed'] as const).map((stat) => (
                  <td key={stat} className="px-2 py-2 text-center">
                    <input
                      type="number"
                      min={40}
                      max={99}
                      value={player[stat]}
                      onChange={(e) =>
                        handlePlayerChange(player.id, {
                          [stat]: Math.max(40, Math.min(99, Number(e.target.value) || 40)),
                        })
                      }
                      className="font-mono-code w-11 rounded border border-slate-800 bg-slate-900 py-1 text-center text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </td>
                ))}
                <td className="px-2 py-2 text-center">
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
                <td className="px-2 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {suspended && player.suspension ? (
                      <>
                        <span
                          title={player.suspension.reason}
                          className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 whitespace-nowrap"
                        >
                          {formatSuspensionBadge(player.suspension)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlayerChange(player.id, { suspension: null })}
                          title="Lift suspension / Reinstate player"
                          className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                        >
                          Lift
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSuspEditPlayerId(editingSusp ? null : player.id)
                        }
                        title="Suspend or ban player"
                        className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 hover:border-rose-500/50 hover:text-rose-300 cursor-pointer whitespace-nowrap"
                      >
                        <ShieldAlert className="h-3 w-3" />
                        {editingSusp ? 'Close' : 'Suspend/Ban'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
              {editingSusp && (
                <tr className="bg-slate-900/90">
                  <td colSpan={11} className="px-3 py-3">
                    <div className="flex flex-wrap items-end gap-2.5">
                      <div className="flex items-center gap-1.5 text-rose-300 font-semibold mr-2">
                        <Ban className="h-3.5 w-3.5" />
                        <span>
                          Discipline #{player.jerseyNumber} {player.firstName} {player.lastName}:
                        </span>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] text-slate-400">Type</label>
                        <select
                          value={suspType}
                          onChange={(e) =>
                            setSuspType(e.target.value as 'suspension' | 'ban')
                          }
                          className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                        >
                          <option value="suspension">Suspension</option>
                          <option value="ban">Ban</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] text-slate-400">Duration</label>
                        <select
                          value={suspDuration}
                          onChange={(e) =>
                            setSuspDuration(e.target.value as SuspensionDurationType)
                          }
                          className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                        >
                          <option value="matches">Custom # of Matches</option>
                          <option value="until-date">Until Date</option>
                          <option value="season">Rest of Season</option>
                          <option value="indefinite">Indefinite</option>
                        </select>
                      </div>
                      {suspDuration === 'matches' && (
                        <div>
                          <label className="mb-1 block text-[10px] text-slate-400"># Matches</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={suspGames}
                            onChange={(e) =>
                              setSuspGames(Math.max(1, Number(e.target.value) || 1))
                            }
                            className="font-mono-code w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                          />
                        </div>
                      )}
                      {suspDuration === 'until-date' && (
                        <div>
                          <label className="mb-1 block text-[10px] text-slate-400">Until Date</label>
                          <input
                            type="date"
                            value={suspUntilDate}
                            onChange={(e) => setSuspUntilDate(e.target.value)}
                            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-44">
                        <label className="mb-1 block text-[10px] text-slate-400">Reason</label>
                        <input
                          type="text"
                          value={suspReason}
                          onChange={(e) => setSuspReason(e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => issueSuspension(player.id)}
                        className="rounded-lg bg-rose-500 px-3 py-1.5 font-bold text-white hover:bg-rose-400 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
