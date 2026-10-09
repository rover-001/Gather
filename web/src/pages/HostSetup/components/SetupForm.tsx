import React from 'react';
import { Calendar, Lock, ArrowRight, ChevronDown } from 'lucide-react';

interface SetupFormProps {
  isLoginMode: boolean;
  events?: Array<{
    id: string;
    name: string;
    slug: string;
    date?: string | null;
  }>;
  selectedEventId?: string;
  setSelectedEventId?: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function SetupForm({
  isLoginMode,
  events = [],
  selectedEventId,
  setSelectedEventId,
  name,
  setName,
  date,
  setDate,
  password,
  setPassword,
  loading,
  onSubmit,
}: SetupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isLoginMode && events.length > 0 && (
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center justify-between">
            <span>Select Event to Open</span>
            {events.length > 1 && (
              <span className="text-[10px] text-slate-400 font-normal">{events.length} available</span>
            )}
          </label>
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId?.(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white text-sm transition appearance-none cursor-pointer pr-10"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.slug}){ev.date ? ` • ${ev.date}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      )}
      {!isLoginMode && (
        <>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
              Couple or Event Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah & Michael"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center justify-between">
              <span>Event Date</span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white text-sm transition"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
          Host Master Password *
        </label>
        <div className="relative">
          <input
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-sm transition"
          />
          <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
        </div>
        {!isLoginMode && (
          <p className="text-[11px] text-slate-500 mt-1.5">
            Keep this safe. Used to manage event QR passes, gallery sharing, and downloads.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? 'Authenticating...' : isLoginMode ? 'Unlock Host Portal' : 'Create Event'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
