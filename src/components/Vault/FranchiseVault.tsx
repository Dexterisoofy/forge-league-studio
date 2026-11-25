import React, { useState } from 'react';
import {
  Archive,
  Edit3,
  FileCode2,
  FileJson,
  ImageDown,
  Search,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadJsonFile } from '../../engine/storage/persistence';
import { downloadLogoAsPng, downloadLogoAsSvg } from '../../engine/svg-logo/renderLogoSvg';
import { LogoSvg } from '../common/LogoSvg';

export const FranchiseVault: React.FC = () => {
  const { vault, removeFromVault, editVaultTeam, setActiveTab, showToast } = useApp();
  const [query, setQuery] = useState('');

  const filtered = vault.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.playstyle.toLowerCase().includes(q) ||
      t.seedCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#131b2c] p-5">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
            My Teams — Franchise Vault
          </h2>
          <p className="text-sm text-slate-400">
            Saved franchises stored in localStorage for editing and League/Cup entry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search saved teams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-60 rounded-xl border border-slate-700 bg-slate-950 py-2 pr-3 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          {vault.length > 0 && (
            <button
              type="button"
              onClick={() => {
                downloadJsonFile(vault, 'forge-league-my-teams.json');
                showToast(`Exported ${vault.length} team(s) as JSON`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <FileJson className="h-4 w-4 text-amber-400" />
              Export All Vault Teams
            </button>
          )}
        </div>
      </div>

      {vault.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
          <Archive className="mb-3 h-10 w-10 text-slate-600" />
          <h3 className="text-lg font-semibold text-white">Your Franchise Vault is Empty</h3>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            Customize or randomize a franchise in the Team Studio and click &ldquo;Save to My Teams&rdquo; to store it here for future Leagues and Cups.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
          >
            <Wand2 className="h-4 w-4" />
            Go to Team Studio
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team) => (
            <div
              key={team.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#131b2c] p-5 transition hover:border-slate-700"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-slate-800 bg-[#0b0f19] p-2.5">
                    <LogoSvg config={team.logo} size={76} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-code rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                        OVR {team.overallRating}
                      </span>
                      <span className="font-mono-code text-[11px] text-slate-400">
                        {team.starRating.toFixed(1)}★
                      </span>
                    </div>
                    <h3 className="font-display mt-1 truncate text-xl font-bold text-white uppercase">
                      {team.name}
                    </h3>
                    <p className="truncate text-xs text-slate-400">{team.stadium}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {team.playstyle} · {team.roster.length} players
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-950/60 px-2.5 py-1.5 font-mono-code text-[10px] text-slate-400 truncate">
                  Seed: {team.seedCode} · {team.logo.dna}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => editVaultTeam(team)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                  Edit in Studio
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Export SVG"
                    onClick={() => downloadLogoAsSvg(team.logo, `${team.name}.svg`)}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-sky-400 hover:bg-slate-800 cursor-pointer"
                  >
                    <FileCode2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Export PNG"
                    onClick={() => downloadLogoAsPng(team.logo, `${team.name}.png`, 4)}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-purple-400 hover:bg-slate-800 cursor-pointer"
                  >
                    <ImageDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Export JSON"
                    onClick={() => downloadJsonFile(team, `${team.name}.json`)}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-amber-400 hover:bg-slate-800 cursor-pointer"
                  >
                    <FileJson className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete from Vault"
                    onClick={() => removeFromVault(team.id)}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
