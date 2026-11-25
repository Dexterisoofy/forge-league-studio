import React, { useState } from 'react';
import { History, RotateCcw, Undo2 } from 'lucide-react';
import {
  restoreSnapshotById,
  undoLastSimulation,
} from '../../engine/simulation/historyEngine';
import type { Competition } from '../../types';

interface SimulationHistoryBarProps {
  competition: Competition;
  canUndo: boolean;
  onUpdate: (comp: Competition) => void;
  onMessage?: (msg: string) => void;
}

export const SimulationHistoryBar: React.FC<SimulationHistoryBarProps> = ({
  competition,
  canUndo,
  onUpdate,
  onMessage,
}) => {
  const [open, setOpen] = useState(false);
  const history = competition.history ?? [];
  const latest = history[history.length - 1];

  const handleUndoLast = () => {
    if (!canUndo || history.length === 0) return;
    const restored = undoLastSimulation(competition);
    onUpdate(restored);
    onMessage?.(`Reverted: ${latest.label}`);
  };

  const handleRestoreCheckpoint = (id: string, label: string) => {
    if (!canUndo) return;
    const restored = restoreSnapshotById(competition, id);
    onUpdate(restored);
    setOpen(false);
    onMessage?.(`Restored checkpoint before "${label}"`);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <button
        type="button"
        disabled={!canUndo || history.length === 0}
        onClick={handleUndoLast}
        title={
          !canUndo
            ? 'Permission required: Undo Simulations'
            : history.length === 0
              ? 'No simulation history yet'
              : `Undo "${latest?.label}"`
        }
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
      >
        <Undo2 className="h-3.5 w-3.5 text-amber-400" />
        Undo Sim
      </button>

      <button
        type="button"
        disabled={history.length === 0}
        onClick={() => setOpen((v) => !v)}
        title="View Simulation History Checkpoints"
        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
      >
        <History className="h-3.5 w-3.5 text-sky-400" />
        <span>({history.length})</span>
      </button>

      {open && history.length > 0 && (
        <div className="absolute top-full right-0 z-40 mt-2 w-80 rounded-xl border border-slate-700 bg-[#0f172a] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider">
              Simulation History (Last {history.length})
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
            {[...history].reverse().map((snap) => (
              <div
                key={snap.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-[11px]"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-200">
                    {snap.label}
                  </div>
                  <div className="font-mono-code text-[10px] text-slate-500">
                    {new Date(snap.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={() => handleRestoreCheckpoint(snap.id, snap.label)}
                  title={!canUndo ? 'Requires Undo permission' : 'Restore before this simulation'}
                  className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/25 disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
