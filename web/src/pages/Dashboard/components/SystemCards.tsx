import { ShieldCheck, Wifi, KeyRound, QrCode } from 'lucide-react';

interface SystemCardsProps {
  health: { status: string; db: string } | null;
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  echoMessage: string;
}

export function SystemCards({ health, wsStatus, echoMessage }: SystemCardsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#161a24] border border-[#e2e8f0] dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block">PostgreSQL Database</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Container pg-db (keepsake)</span>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-mono font-medium ${
              health?.db === 'connected'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {health ? health.db : 'Checking...'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#161a24] border border-[#e2e8f0] dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block">WebSocket Bridge</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Real-time socket echo</span>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-mono font-medium ${
              wsStatus === 'connected'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {wsStatus}
          </span>
        </div>
      </div>

      {echoMessage && (
        <p className="text-xs text-center text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl py-2.5">
          ✓ {echoMessage}
        </p>
      )}

      <div className="pt-2 grid grid-cols-2 gap-3">
        <a
          href="/host/setup"
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Host Portal</span>
        </a>
        <a
          href="/host/event"
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          <span>Event & QR</span>
        </a>
      </div>
    </div>
  );
}
