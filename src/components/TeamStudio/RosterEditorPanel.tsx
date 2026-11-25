import React from 'react';
import { Lock, Plus, RefreshCw, Trash2, Unlock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createSinglePlayer,
  generateRoster,
  starRatingToBaseOverall,
} from '../../engine/generator/rosterGenerator';
import { createRng } from '../../engine/prng';
import type { Player, PlayerPosition } from '../../types';

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
              <th className="px-2 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {roster.map((player) => (
              <tr key={player.id} className="hover:bg-slate-900/50">
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
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
