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
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 block">PostgreSQL Database</span>
              <span className="text-xs text-slate-500">Container pg-db (keepsake)</span>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-mono font-medium ${
              health?.db === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {health ? health.db : 'Checking...'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 block">WebSocket Bridge</span>
              <span className="text-xs text-slate-500">Real-time socket echo</span>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-mono font-medium ${
              wsStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {wsStatus}
          </span>
        </div>
      </div>

      {echoMessage && (
        <p className="text-xs text-center text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 rounded-xl py-2.5">
          ✓ {echoMessage}
        </p>
      )}

      <div className="pt-2 grid grid-cols-2 gap-3">
        <a
          href="/host/setup"
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 transition cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Host Portal</span>
        </a>
        <a
          href="/host/passes"
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          <span>Passes & QR</span>
        </a>
      </div>
    </div>
  );
}
