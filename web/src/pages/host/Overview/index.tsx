import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostLayout } from '../../../layouts/HostLayout';
import {
  Users,
  Camera,
  Radio,
  QrCode,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { EventMetaCard } from '../Event/components/EventMetaCard';

export default function HostOverviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  const fetchOverview = async () => {
    try {
      const res: any = await api('/api/host/overview');
      setData(res);
      if (res?.event) {
        setName(res.event.name || '');
        setDate(res.event.date || '');
      }
    } catch {
      navigate('/host/setup');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    try {
      const res: any = await api('/api/host/event', {
        method: 'PATCH',
        body: JSON.stringify({ eventId: data?.event?.id, name, date }),
      });
      if (res.event) {
        setData((prev: any) => ({ ...prev, event: res.event }));
      }
      alert('Event details updated successfully!');
    } catch (err: any) {
      alert('Error updating event: ' + err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  return (
    <HostLayout eventName={data?.event?.name}>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">Overview Dashboard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live metrics, guest count, and event configuration.</p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/host/event"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Event QR</span>
            </a>
          </div>
        </div>

        {/* Metric Cards Grid (Total Guests, Live Cameras, Photos Taken) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Guests</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{data?.guestsCount ?? 0}</span>
              <span className="block text-[11px] text-slate-400">
                {data?.pendingGuestsCount > 0 ? `${data.pendingGuestsCount} pending approval` : 'All approved'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Cameras</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-3xl font-serif font-bold text-emerald-600 dark:text-emerald-400">{data?.connectedCamerasCount ?? 0}</span>
              <span className="block text-[11px] text-slate-400">Streaming live right now</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Photos Taken</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{data?.photosCount ?? 0}</span>
              <span className="block text-[11px] text-slate-400">Uploads processed</span>
            </div>
          </div>
        </div>

        {/* Event Details Section (Moved from Event & QR page) */}
        <div className="max-w-2xl">
          <EventMetaCard
            name={name}
            setName={setName}
            date={date}
            setDate={setDate}
            slug={data?.event?.slug || ''}
            onSave={handleSaveMeta}
            saving={savingMeta}
          />
        </div>

        {/* Quick Action Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/host/event"
            className="group bg-white dark:bg-[#12151c] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition shadow-xs flex items-center justify-between cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 block group-hover:text-slate-800 dark:group-hover:text-white">
                Event QR & Settings
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Display QR code, toggle approval & joining</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition" />
          </a>

          <a
            href="/host/guests"
            className="group bg-white dark:bg-[#12151c] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition shadow-xs flex items-center justify-between cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 block group-hover:text-slate-800 dark:group-hover:text-white">
                Manage Guests
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Approve join requests, notify on WhatsApp</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition" />
          </a>

          <a
            href="/host/gallery"
            className="group bg-white dark:bg-[#12151c] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition shadow-xs flex items-center justify-between cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 block group-hover:text-slate-800 dark:group-hover:text-white">
                Gallery & Sharing
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Curate captured media and share with guests</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition" />
          </a>
        </div>
      </div>
    </HostLayout>
  );
}
