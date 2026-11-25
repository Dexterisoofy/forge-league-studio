import React from 'react';
import { Lock, RefreshCw, Star, Unlock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BUDGET_TIERS } from '../../engine/generator/pools';
import { rebalanceRosterToStarRating } from '../../engine/generator/rosterGenerator';
import type { BudgetTier, PlaystyleArchetype, TeamLocks } from '../../types';

const LockToggle: React.FC<{
  lockKey: keyof TeamLocks;
  label: string;
}> = ({ lockKey, label }) => {
  const { locks, toggleLock } = useApp();
  const locked = locks[lockKey];
  return (
    <button
      type="button"
      onClick={() => toggleLock(lockKey)}
      title={locked ? `Unlock ${label}` : `Lock ${label}`}
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
        locked
          ? 'border border-amber-500/50 bg-amber-500/15 text-amber-300'
          : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
      }`}
    >
      {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
      {locked ? 'Locked' : 'Lock'}
    </button>
  );
};

export const IdentityEditorPanel: React.FC = () => {
  const { activeTeam, activeSport, updateActiveTeamFields, showToast } = useApp();

  const playstyles = Array.from(
    new Set([...activeSport.playstyles, activeTeam.playstyle])
  );

  const handleRebalanceRoster = () => {
    const rebalanced = rebalanceRosterToStarRating(
      activeTeam.roster,
      activeTeam.starRating,
      activeTeam.seedCode,
      activeSport.activeLineupSize
    );
    updateActiveTeamFields({ roster: rebalanced });
    showToast(`Rebalanced ${rebalanced.length} players around ${activeTeam.starRating.toFixed(1)}★`);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase">
              City / Region
            </label>
            <LockToggle lockKey="city" label="City" />
          </div>
          <input
            type="text"
            value={activeTeam.city}
            onChange={(e) => updateActiveTeamFields({ city: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase">
              Mascot Name
            </label>
            <LockToggle lockKey="mascot" label="Mascot" />
          </div>
          <input
            type="text"
            value={activeTeam.mascot}
            onChange={(e) => updateActiveTeamFields({ mascot: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase">
              Home {activeSport.terminology.venueNoun}
            </label>
            <LockToggle lockKey="stadium" label="Stadium" />
          </div>
          <input
            type="text"
            value={activeTeam.stadium}
            onChange={(e) => updateActiveTeamFields({ stadium: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300 uppercase">
              Abbreviation
            </label>
            <input
              type="text"
              maxLength={4}
              value={activeTeam.abbreviation}
              onChange={(e) =>
                updateActiveTeamFields({ abbreviation: e.target.value.toUpperCase() })
              }
              className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white uppercase focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300 uppercase">
              Founded Year
            </label>
            <input
              type="number"
              min={1850}
              max={2030}
              value={activeTeam.foundedYear}
              onChange={(e) =>
                updateActiveTeamFields({
                  foundedYear: Math.max(1850, Math.min(2030, Number(e.target.value) || 2000)),
                })
              }
              className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase">
              {activeSport.name} Playstyle
            </label>
            <LockToggle lockKey="playstyle" label="Playstyle" />
          </div>
          <select
            value={activeTeam.playstyle}
            onChange={(e) =>
              updateActiveTeamFields({ playstyle: e.target.value as PlaystyleArchetype })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            {playstyles.map((ps) => (
              <option key={ps} value={ps}>
                {ps}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase">
              Budget Tier
            </label>
            <LockToggle lockKey="budgetTier" label="Budget Tier" />
          </div>
          <select
            value={activeTeam.budgetTier}
            onChange={(e) =>
              updateActiveTeamFields({ budgetTier: e.target.value as BudgetTier })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            {BUDGET_TIERS.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-white">
              Franchise Star Rating: {activeTeam.starRating.toFixed(1)} ★
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRebalanceRoster}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/25 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rebalance Roster to {activeTeam.starRating.toFixed(1)}★
            </button>
            <LockToggle lockKey="starRating" label="Star Rating" />
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={activeTeam.starRating}
          onChange={(e) =>
            updateActiveTeamFields({ starRating: parseFloat(e.target.value) })
          }
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>1.0★ Rebuild</span>
          <span>3.0★ Contender</span>
          <span>5.0★ Dynasty</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-300 uppercase">
          Franchise Historical Record
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['wins', 'losses', 'draws', 'championships'] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-xs text-slate-400 capitalize">
                {field}
              </label>
              <input
                type="number"
                min={0}
                value={activeTeam.historicalRecord[field]}
                onChange={(e) =>
                  updateActiveTeamFields({
                    historicalRecord: {
                      ...activeTeam.historicalRecord,
                      [field]: Math.max(0, Number(e.target.value) || 0),
                    },
                  })
                }
                className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
