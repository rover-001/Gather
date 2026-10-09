import type { Pass } from '../types';

interface PassStatsBarProps {
  passes: Pass[];
}

export function PassStatsBar({ passes }: PassStatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Total Passes</span>
        <span className="text-2xl font-serif text-slate-900 dark:text-slate-100 font-bold">{passes.length}</span>
      </div>
      <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Active Devices</span>
        <span className="text-2xl font-serif text-slate-900 dark:text-slate-100 font-bold">
          {passes.filter((p) => p.deviceId && !p.revoked).length}
        </span>
      </div>
      <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Cameras</span>
        <span className="text-2xl font-serif text-emerald-700 dark:text-emerald-400 font-bold">
          {passes.filter((p) => (p.role === 'camera' || p.role === 'both') && !p.revoked).length}
        </span>
      </div>
      <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Revoked</span>
        <span className="text-2xl font-serif text-rose-700 dark:text-rose-400 font-bold">
          {passes.filter((p) => p.revoked).length}
        </span>
      </div>
    </div>
  );
}
