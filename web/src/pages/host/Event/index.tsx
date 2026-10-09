import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostLayout } from '../../../layouts/HostLayout';
import { QrCenterCard } from './components/QrCenterCard';
import { JoiningControlsCard } from './components/JoiningControlsCard';
import { api } from '../../../lib/api';

export default function HostEventPage() {
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    try {
      const data = await api('/api/host/event');
      if (!data.event) {
        navigate('/host/setup');
        return;
      }
      setEvent(data.event);
      setJoinUrl(data.joinUrl || `${window.location.origin}/e/${data.event.slug}`);
    } catch {
      navigate('/host/setup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  const handleToggleJoinOpen = async () => {
    if (!event) return;
    try {
      const res = await api('/api/host/event', {
        method: 'PATCH',
        body: JSON.stringify({ eventId: event.id, joinOpen: !event.joinOpen }),
      });
      setEvent(res.event);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleRequireApproval = async () => {
    if (!event) return;
    try {
      const res = await api('/api/host/event', {
        method: 'PATCH',
        body: JSON.stringify({ eventId: event.id, requireApproval: !event.requireApproval }),
      });
      setEvent(res.event);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <HostLayout>
        <div className="py-20 text-center text-slate-400">Loading event details...</div>
      </HostLayout>
    );
  }

  return (
    <HostLayout eventName={event?.name}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">Event Join QR & Access</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Share this single QR code with all guests to allow registration and capture.
            </p>
          </div>
          <a
            href="/host"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151c] transition"
          >
            ← Back to Overview
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* QR Code Center Card */}
          <QrCenterCard joinUrl={joinUrl} slug={event?.slug || ''} />

          {/* Joining Controls */}
          <JoiningControlsCard
            joinOpen={event?.joinOpen ?? true}
            onToggleJoinOpen={handleToggleJoinOpen}
            requireApproval={event?.requireApproval ?? false}
            onToggleRequireApproval={handleToggleRequireApproval}
          />
        </div>
      </div>
    </HostLayout>
  );
}
