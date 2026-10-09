import { X, Search, Globe, Lock, Check } from 'lucide-react';
import { useState } from 'react';

interface SharePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  guests: any[];
  onShare: (guestIds: string[], everyone: boolean) => void;
  onMakePrivate: () => void;
  sharing: boolean;
}

export function SharePanel({
  isOpen,
  onClose,
  selectedCount,
  guests,
  onShare,
  onMakePrivate,
  sharing,
}: SharePanelProps) {
  const [search, setSearch] = useState('');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [everyone, setEveryone] = useState(false);

  if (!isOpen) return null;

  const filteredGuests = guests.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.phone.includes(q);
  });

  const toggleGuest = (id: string) => {
    setEveryone(false);
    setSelectedGuestIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleShareSubmit = () => {
    onShare(selectedGuestIds, everyone);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Share {selectedCount} items
              </h3>
              <p className="text-xs text-slate-500">Choose who can view these photos</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Everyone Toggle */}
          <div
            onClick={() => {
              setEveryone(!everyone);
              if (!everyone) setSelectedGuestIds([]);
            }}
            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
              everyone
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5" />
              <div>
                <span className="text-xs font-bold block">Share with Everyone</span>
                <span className={`text-[11px] block ${everyone ? 'text-slate-300' : 'text-slate-500'}`}>
                  All approved guests can see these in their gallery
                </span>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                everyone ? 'bg-white text-slate-900 border-white' : 'border-slate-300'
              }`}
            >
              {everyone && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Search guests */}
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1.5">
              Or pick specific guests
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Guest list */}
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {filteredGuests.map((g) => {
              const isSelected = selectedGuestIds.includes(g.id);
              return (
                <div
                  key={g.id}
                  onClick={() => toggleGuest(g.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-100 border-slate-900 text-slate-900 font-semibold'
                      : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-800 shrink-0">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="text-xs block truncate">{g.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        ...{g.phone.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                      isSelected ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onMakePrivate}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition border border-slate-200 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Make Private (Host Only)</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleShareSubmit}
            disabled={sharing || (!everyone && selectedGuestIds.length === 0)}
            className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {sharing ? 'Saving...' : 'Apply Sharing'}
          </button>
        </div>
      </div>
    </div>
  );
}
