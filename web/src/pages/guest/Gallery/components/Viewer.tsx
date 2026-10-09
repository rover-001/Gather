import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { api } from '../../../../lib/api';

export default function GuestViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    api('/api/me')
      .then((res: any) => setGuestInfo(res.guest))
      .catch(() => {});
  }, []);

  const handleDownload = () => {
    if (!id) return;
    window.location.href = `/api/media/${id}?download=1`;
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await api(`/api/media/${id}`, { method: 'DELETE' });
      navigate('/album');
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between select-none">
      {/* Top Bar */}
      <header className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => navigate('/album')}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 backdrop-blur-md transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {guestInfo?.canDownload && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-full bg-white text-slate-900 font-semibold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save</span>
            </button>
          )}
        </div>
      </header>

      {/* Media Viewer Area */}
      <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden">
        <div className="max-w-full max-h-[80vh] flex items-center justify-center">
          {!isVideo ? (
            <img
              src={`/api/media/${id}`}
              alt="Viewing memory"
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
              onError={() => setIsVideo(true)}
            />
          ) : (
            <video
              id="viewer-video"
              src={`/api/media/${id}`}
              controls
              playsInline
              autoPlay
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          )}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <footer className="p-6 bg-gradient-to-t from-black/80 to-transparent text-center z-20">
        <p className="text-xs text-slate-400">
          Saved with Gather. Tap Save to download to your camera roll.
        </p>
      </footer>
    </div>
  );
}
