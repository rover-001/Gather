interface JoiningControlsCardProps {
  joinOpen: boolean;
  onToggleJoinOpen: () => void;
  requireApproval: boolean;
  onToggleRequireApproval: () => void;
}

export function JoiningControlsCard({
  joinOpen,
  onToggleJoinOpen,
  requireApproval,
  onToggleRequireApproval,
}: JoiningControlsCardProps) {
  return (
    <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Joining Controls</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control who can register via the QR code</p>
      </div>

      <div className="space-y-4">
        {/* Toggle Joining Open */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090b0e] border border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between space-x-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Joining Open</span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  joinOpen
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                }`}
              >
                {joinOpen ? 'Active' : 'Closed'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Close joining once the ceremony begins to prevent strangers from registering.
            </p>
          </div>

          <button
            onClick={onToggleJoinOpen}
            type="button"
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-200 shrink-0 ${
              joinOpen ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                joinOpen ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle Require Approval */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090b0e] border border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between space-x-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Require Host Approval</span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  requireApproval
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {requireApproval ? 'Enabled' : 'Off'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              New guests will be held in "Pending" until you explicitly approve them in the Guests list.
            </p>
          </div>

          <button
            onClick={onToggleRequireApproval}
            type="button"
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-200 shrink-0 ${
              requireApproval ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                requireApproval ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
