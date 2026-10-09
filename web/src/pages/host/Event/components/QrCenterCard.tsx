import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download, Printer } from 'lucide-react';

interface QrCenterCardProps {
  joinUrl: string;
  slug: string;
}

export function QrCenterCard({ joinUrl, slug }: QrCenterCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('event-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 100, 100, 800, 800);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `gather-${slug}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Official Event Join QR</h3>
        <p className="text-xs text-slate-500 mt-0.5">Guests scan with their camera to enter</p>
      </div>

      <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner inline-block">
        <QRCodeSVG id="event-qr-svg" value={joinUrl} size={240} level="H" />
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="font-mono text-slate-700 truncate mr-2">{joinUrl}</span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 font-semibold text-slate-900 hover:text-slate-600 cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadQr}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition border border-slate-200 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print QR Card</span>
          </button>
        </div>
      </div>
    </div>
  );
}
