import { X, Copy, Check, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
  copied: boolean;
  onCopy: () => void;
}

export function QrShareModal({ isOpen, onClose, url, name, copied, onCopy }: QrShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="max-w-sm w-full bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">{name}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-white border border-slate-200 dark:border-slate-700/80 rounded-2xl inline-block shadow-sm">
          <QRCodeSVG value={url} size={220} level="M" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Scan with phone camera</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Scanning this code on any phone instantly joins the event. No app download needed.
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={onCopy}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Event Pass Link'}</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Scan or open this link to join our event: ${url}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
