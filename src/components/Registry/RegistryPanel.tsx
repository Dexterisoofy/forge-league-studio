import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Download,
  FileJson,
  Fingerprint,
  RotateCcw,
  Search,
  Trophy,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  downloadJsonFile,
  parseImportedJson,
  type ExportBundle,
} from '../../engine/storage/persistence';

export const RegistryPanel: React.FC = () => {
  const {
    registry,
    vault,
    competitions,
    customSports,
    clearGlobalRegistry,
    importPayload,
    showToast,
  } = useApp();

  const [query, setQuery] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredEntries = registry.entries.filter((entry) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.teamName.toLowerCase().includes(q) ||
      entry.logoDna.toLowerCase().includes(q) ||
      entry.seedCode.toLowerCase().includes(q)
    );
  });

  const handleExportFullBackup = () => {
    const bundle: ExportBundle = {
      schema: 'forge-league-bundle-v1',
      exportedAt: new Date().toISOString(),
      teams: vault,
      competitions,
      customSports,
      registry,
    };
    downloadJsonFile(bundle, 'forge-league-backup.json');
    showToast('Exported full backup JSON');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { teams, competitions: importedComps, customSports: importedSports } =
        parseImportedJson(text);
      importPayload(teams, importedComps, importedSports);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to import JSON file');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-[#131b2c] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
              Unique Teams Registered
            </span>
            <Fingerprint className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-mono-code mt-2 text-3xl font-bold text-white">
            {registry.totalTeamsGenerated}
          </div>
          <p className="mt-1 text-xs text-slate-400">Zero-duplicate name index</p>
        </div>

        <div className="rounded-2xl border border-sky-500/30 bg-[#131b2c] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-sky-300 uppercase">
              Unique Logos Registered
            </span>
            <Fingerprint className="h-4 w-4 text-sky-400" />
          </div>
          <div className="font-mono-code mt-2 text-3xl font-bold text-white">
            {registry.totalLogosGenerated}
          </div>
          <p className="mt-1 text-xs text-slate-400">Zero-duplicate Logo DNA index</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-amber-300 uppercase">
              Franchise Vault
            </span>
            <Archive className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-mono-code mt-2 text-3xl font-bold text-white">
            {vault.length}
          </div>
          <p className="mt-1 text-xs text-slate-400">Saved custom &amp; favorite teams</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-purple-300 uppercase">
              Active Competitions
            </span>
            <Trophy className="h-4 w-4 text-purple-400" />
          </div>
          <div className="font-mono-code mt-2 text-3xl font-bold text-white">
            {competitions.length}
          </div>
          <p className="mt-1 text-xs text-slate-400">Leagues &amp; Knockout Cups</p>
        </div>
      </div>

      {/* JSON Import / Export & Reset Registry Controls */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#131b2c] p-5 space-y-4">
          <div>
            <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
              JSON Data Portability
            </h3>
            <p className="text-xs text-slate-400">
              Export or import individual Teams, Franchise Vault arrays, Leagues, Cups, or full backups.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                downloadJsonFile(vault, 'forge-league-teams.json');
                showToast('Exported Vault teams JSON');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
            >
              <Download className="h-4 w-4 text-amber-400" />
              Export Vault Teams
            </button>

            <button
              type="button"
              onClick={() => {
                downloadJsonFile(competitions, 'forge-league-competitions.json');
                showToast('Exported competitions JSON');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
            >
              <FileJson className="h-4 w-4 text-sky-400" />
              Export Competitions
            </button>

            <button
              type="button"
              onClick={handleExportFullBackup}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export Full Backup
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Import JSON File
            </button>
          </div>
        </div>

        {/* Reset Registry */}
        <div className="lg:col-span-5 rounded-2xl border border-rose-500/30 bg-[#131b2c] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
              Registry Settings
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Resetting clears the persistent Global Registry of generated Logo DNAs and Team Names in localStorage (your saved Vault teams and Competitions remain intact).
          </p>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Registry
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3">
              <span className="text-xs font-medium text-rose-200">
                Clear all {registry.totalTeamsGenerated} recorded entries?
              </span>
              <button
                type="button"
                onClick={() => {
                  clearGlobalRegistry();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Registry History Log */}
      <div className="rounded-2xl border border-slate-800 bg-[#131b2c] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
              Global Zero-Duplicate Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Recent unique franchises and Logo DNA fingerprints committed to localStorage
            </p>
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by team, DNA, or seed..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-xl border border-slate-700 bg-slate-950 py-1.5 pr-3 pl-9 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 max-h-96">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="sticky top-0 border-b border-slate-800 bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase">
              <tr>
                <th className="px-3 py-2.5">Team Name</th>
                <th className="px-3 py-2.5">Logo DNA Fingerprint</th>
                <th className="px-3 py-2.5">Seed</th>
                <th className="px-3 py-2.5">Source</th>
                <th className="px-3 py-2.5">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No registry entries match your filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/40">
                    <td className="px-3 py-2 font-semibold text-white">
                      {entry.teamName}
                    </td>
                    <td className="px-3 py-2 font-mono-code text-[11px] text-emerald-300">
                      {entry.logoDna}
                    </td>
                    <td className="px-3 py-2 font-mono-code text-sky-300">
                      {entry.seedCode}
                    </td>
                    <td className="px-3 py-2 uppercase text-slate-400">
                      {entry.source}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
