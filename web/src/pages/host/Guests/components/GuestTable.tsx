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
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-900">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
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
          <tbody className="divide-y divide-slate-100">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No guests found matching this view.
                </td>
              </tr>
            ) : (
              guests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-5 font-medium flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 text-xs font-bold">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <button
                        onClick={() => onSelectGuest(g)}
                        className="text-slate-900 font-semibold hover:underline text-left cursor-pointer"
                      >
                        {g.name}
                      </button>
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {g.id.slice(0, 8)}...
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs font-mono text-slate-600">
                    {formatDisplayPhone(g.phone)}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        g.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : g.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span className="capitalize">{g.status}</span>
                    </span>
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                    {g.shotsCount}
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                    {g.sharedWithThemCount}
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => onToggleDownload(g.id, g.canDownload)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition border ${
                        g.canDownload
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
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
                          className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer inline-flex items-center justify-center"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {g.status === 'active' && (
                        <button
                          title="Block guest"
                          onClick={() => onBlock(g.id)}
                          className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer inline-flex items-center justify-center"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {g.status === 'blocked' && (
                        <button
                          title="Unblock guest"
                          onClick={() => onActivate(g.id)}
                          className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer inline-flex items-center justify-center"
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
                        className="w-8 h-8 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-700 border border-emerald-200 transition cursor-pointer inline-flex items-center justify-center"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>

                      <button
                        title="Reset Password (generate temp code)"
                        onClick={() => onResetPassword(g.id)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer inline-flex items-center justify-center"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete guest"
                        onClick={() => onDelete(g.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer inline-flex items-center justify-center"
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
