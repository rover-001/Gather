import { Camera, Eye, Layers, Smartphone, ShieldAlert, Ban, Trash2 } from 'lucide-react';
import type { Pass } from '../types';

interface PassesTableProps {
  passes: Pass[];
  onToggleDownload: (id: string, current: boolean) => void;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PassesTable({ passes, onToggleDownload, onRevoke, onDelete }: PassesTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-serif text-base text-slate-900 font-semibold">Active Passes & Access Tokens</h2>
        <span className="text-xs text-slate-500 font-medium">{passes.length} registered</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-900">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
            <tr>
              <th className="py-3.5 px-5">Pass / QR Name</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Device Bound</th>
              <th className="py-3.5 px-4">Groups</th>
              <th className="py-3.5 px-4">Downloads</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {passes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No passes or QR codes created yet. Click "Issue Pass / QR" above to create one.
                </td>
              </tr>
            ) : (
              passes.map((pass) => (
                <tr key={pass.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-5 font-medium flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                      {pass.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-slate-900 font-semibold">{pass.name}</span>
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {pass.id.slice(0, 8)}...
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pass.role === 'camera'
                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                          : pass.role === 'viewer'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {pass.role === 'camera' && <Camera className="w-3 h-3 text-slate-700" />}
                      {pass.role === 'viewer' && <Eye className="w-3 h-3 text-sky-700" />}
                      {pass.role === 'both' && <Layers className="w-3 h-3 text-emerald-700" />}
                      <span className="capitalize">{pass.role}</span>
                    </span>
                  </td>

                  <td className="py-4 px-4 text-xs">
                    {pass.deviceId ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Bound</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not yet bound</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {pass.groups && pass.groups.length > 0 ? (
                        pass.groups.map((g) => (
                          <span
                            key={g.id}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium"
                          >
                            {g.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => onToggleDownload(pass.id, pass.canDownload)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition border ${
                        pass.canDownload
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {pass.canDownload ? 'Allowed' : 'Disabled'}
                    </button>
                  </td>

                  <td className="py-4 px-4">
                    {pass.revoked ? (
                      <span className="inline-flex items-center space-x-1 text-rose-700 text-xs font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Revoked</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 text-xs font-semibold">Active</span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right space-x-2">
                    {!pass.revoked && (
                      <button
                        title="Revoke pass (blocks access)"
                        onClick={() => onRevoke(pass.id)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      title="Delete pass permanently"
                      onClick={() => onDelete(pass.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
