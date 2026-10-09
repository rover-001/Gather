import { X, KeyRound, Check } from 'lucide-react';
import { useState } from 'react';

interface TempCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempCode: string;
  guestName: string;
}

export function TempCodeModal({ isOpen, onClose, tempCode, guestName }: TempCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(tempCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-slate-900">Password Reset</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-500">
            One-time 6-digit login code generated for <strong className="text-slate-800">{guestName}</strong>:
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="font-mono text-3xl font-extrabold tracking-widest text-slate-900">
            {tempCode}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Provide this code to the guest. When they log in with their phone and this code, they will be forced to choose a new password.
        </p>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <KeyRound className="w-4 h-4" />}
            <span>{copied ? 'Code Copied!' : 'Copy Temporary Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
