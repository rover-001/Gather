import { Check, Ban, KeyRound, Share2, Trash2 } from 'lucide-react';
import type { Guest } from '../types';

interface GuestTableProps {
  guests: Guest[];
  onApprove: (id: string) => void;
  onBlock: (id: string) => void;
  onActivate: (id: string) => void;
  onToggleDownload: (id: string, current: boolean) => void;
  onResetPassword: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectGuest: (guest: Guest) => void;
  loginUrl: string;
}

export function GuestTable({
  guests,
  onApprove,
  onBlock,
  onActivate,
  onToggleDownload,
  onResetPassword,
  onDelete,
  onSelectGuest,
  loginUrl,
}: GuestTableProps) {
  const formatDisplayPhone = (p: string) => {
    if (p.length === 12 && p.startsWith('91')) {
      return `+91 ${p.slice(2, 7)} ${p.slice(7)}`;
    }
    return `+${p}`;
  };

  return (
    <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-900 dark:text-slate-100">
          <thead className="bg-slate-50 dark:bg-[#090b0e] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-semibold">
            <tr>
              <th className="py-3.5 px-5">Guest</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Shots</th>
              <th className="py-3.5 px-4">Shared with them</th>
              <th className="py-3.5 px-4">Downloads</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  No guests found matching this view.
                </td>
              </tr>
            ) : (
              guests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-4 px-5 font-medium flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 text-xs font-bold">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <button
                        onClick={() => onSelectGuest(g)}
                        className="text-slate-900 dark:text-slate-100 font-semibold hover:underline text-left cursor-pointer"
                      >
                        {g.name}
                      </button>
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {g.id.slice(0, 8)}...
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                    {formatDisplayPhone(g.phone)}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        g.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : g.status === 'pending'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <span className="capitalize">{g.status}</span>
                    </span>
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {g.shotsCount}
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {g.sharedWithThemCount}
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => onToggleDownload(g.id, g.canDownload)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition border ${
                        g.canDownload
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {g.canDownload ? 'Allowed' : 'Disabled'}
                    </button>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex items-center justify-end space-x-1.5">
                      {g.status === 'pending' && (
                        <button
                          title="Approve guest"
                          onClick={() => onApprove(g.id)}
                          className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 transition cursor-pointer inline-flex items-center justify-center"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {g.status === 'active' && (
                        <button
                          title="Block guest"
                          onClick={() => onBlock(g.id)}
                          className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 transition cursor-pointer inline-flex items-center justify-center"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {g.status === 'blocked' && (
                        <button
                          title="Unblock guest"
                          onClick={() => onActivate(g.id)}
                          className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 transition cursor-pointer inline-flex items-center justify-center"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      <a
                        href={`https://wa.me/${g.phone}?text=${encodeURIComponent(
                          `Hi ${g.name}, here is your link to view photos from the event: ${loginUrl}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Notify on WhatsApp"
                        className="w-8 h-8 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 transition cursor-pointer inline-flex items-center justify-center"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>

                      <button
                        title="Reset Password (generate temp code)"
                        onClick={() => onResetPassword(g.id)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer inline-flex items-center justify-center"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete guest"
                        onClick={() => onDelete(g.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 transition cursor-pointer inline-flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
