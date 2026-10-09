import { Calendar } from 'lucide-react';

interface EventMetaCardProps {
  name: string;
  setName: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  slug: string;
  onSave: () => void;
  saving: boolean;
}

export function EventMetaCard({
  name,
  setName,
  date,
  setDate,
  slug,
  onSave,
  saving,
}: EventMetaCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Event Details</h3>
        <p className="text-xs text-slate-500 mt-0.5">Title and date shown to guests</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
            Event Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
            Event Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
            Event URL Slug
          </label>
          <input
            type="text"
            disabled
            value={slug}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono text-xs cursor-not-allowed"
          />
          <p className="text-[11px] text-slate-400 mt-1">Unique public identifier</p>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Details'}
        </button>
      </div>
    </div>
  );
}
