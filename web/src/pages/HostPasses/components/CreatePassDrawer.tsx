import { X, Camera, Eye, Layers } from 'lucide-react';
import type { Group } from '../types';

interface CreatePassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  role: 'camera' | 'viewer' | 'both';
  setRole: (r: 'camera' | 'viewer' | 'both') => void;
  canDownload: boolean;
  setCanDownload: (v: boolean) => void;
  groups: Group[];
  selectedGroupIds: string[];
  onToggleGroup: (id: string) => void;
  newGroupName: string;
  setNewGroupName: (v: string) => void;
  onCreateGroup: (e: React.FormEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreatePassDrawer({
  isOpen,
  onClose,
  name,
  setName,
  role,
  setRole,
  canDownload,
  setCanDownload,
  groups,
  selectedGroupIds,
  onToggleGroup,
  newGroupName,
  setNewGroupName,
  onCreateGroup,
  onSubmit,
}: CreatePassDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-serif font-bold text-slate-900">Issue Pass / QR Code</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="pass-form" onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                Pass / QR Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Table 4 QR, Guests, Photographers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-sm transition"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Anyone who scans this QR code on their phone will instantly join with this role.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                Pass Role *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['camera', 'viewer', 'both'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold capitalize flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                      role === r
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {r === 'camera' && <Camera className="w-4 h-4" />}
                    {r === 'viewer' && <Eye className="w-4 h-4" />}
                    {r === 'both' && <Layers className="w-4 h-4" />}
                    <span>{r}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-sm font-semibold text-slate-900 block">Allow Media Downloads</span>
                <span className="text-xs text-slate-500">Can save photos/videos to phone</span>
              </div>
              <input
                type="checkbox"
                checked={canDownload}
                onChange={(e) => setCanDownload(e.target.checked)}
                className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Assign Groups (Optional)
                </label>
              </div>

              {groups.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {groups.map((group) => {
                    const isSelected = selectedGroupIds.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => onToggleGroup(group.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {group.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="New group (e.g. VIP, Bridal Party)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={onCreateGroup}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="pt-6 border-t border-slate-200 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="pass-form"
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition shadow-sm cursor-pointer"
          >
            Create & View QR
          </button>
        </div>
      </div>
    </div>
  );
}
