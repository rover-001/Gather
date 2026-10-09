import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostLayout } from '../../../layouts/HostLayout';
import { GuestTable } from './components/GuestTable';
import { TempCodeModal } from './components/TempCodeModal';
import { Search, UserCheck, Clock, Ban } from 'lucide-react';
import { api } from '../../../lib/api';
import type { Guest } from './types';

export default function HostGuestsPage() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Temp code modal state
  const [tempCodeModal, setTempCodeModal] = useState<{
    isOpen: boolean;
    tempCode: string;
    guestName: string;
  }>({
    isOpen: false,
    tempCode: '',
    guestName: '',
  });

  const fetchGuestsAndEvent = async () => {
    try {
      const [guestsData, eventData] = await Promise.all([
        api('/api/host/guests'),
        api('/api/host/event'),
      ]);
      setGuests(guestsData.guests || []);
      setEvent(eventData.event || null);
    } catch {
      navigate('/host/setup');
    }
  };

  useEffect(() => {
    fetchGuestsAndEvent();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api(`/api/host/guests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      });
      await fetchGuestsAndEvent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBlock = async (id: string) => {
    if (!confirm('Are you sure you want to block this guest? They will be immediately disconnected.')) {
      return;
    }
    try {
      await api(`/api/host/guests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'blocked' }),
      });
      await fetchGuestsAndEvent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api(`/api/host/guests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      });
      await fetchGuestsAndEvent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleDownload = async (id: string, current: boolean) => {
    try {
      await api(`/api/host/guests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ canDownload: !current }),
      });
      await fetchGuestsAndEvent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (id: string) => {
    const target = guests.find((g) => g.id === id);
    if (!confirm(`Generate a temporary 6-digit login code for ${target?.name}?`)) return;

    try {
      const data = await api(`/api/host/guests/${id}/reset-password`, {
        method: 'POST',
      });
      setTempCodeModal({
        isOpen: true,
        tempCode: data.tempCode,
        guestName: target?.name || 'Guest',
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this guest?')) return;
    try {
      await api(`/api/host/guests/${id}`, { method: 'DELETE' });
      await fetchGuestsAndEvent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredGuests = guests.filter((g) => {
    if (activeTab === 'pending' && g.status !== 'pending') return false;
    if (activeTab === 'blocked' && g.status !== 'blocked') return false;
    if (activeTab === 'all' && g.status === 'blocked') return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return g.name.toLowerCase().includes(query) || g.phone.includes(query);
    }
    return true;
  });

  const pendingCount = guests.filter((g) => g.status === 'pending').length;
  const loginUrl = event ? `${window.location.origin}/e/${event.slug}/login` : '';

  return (
    <HostLayout eventName={event?.name}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight">Guests Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registered guests, download permissions, and access management.
            </p>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-brand-500 shadow-2xs leading-normal transition"
            />
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>All ({guests.filter((g) => g.status !== 'blocked').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Pending Approvals ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'blocked'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <Ban className="w-4 h-4 shrink-0" />
            <span>Blocked ({guests.filter((g) => g.status === 'blocked').length})</span>
          </button>
        </div>

        {/* Guest Table */}
        <GuestTable
          guests={filteredGuests}
          onApprove={handleApprove}
          onBlock={handleBlock}
          onActivate={handleActivate}
          onToggleDownload={handleToggleDownload}
          onResetPassword={handleResetPassword}
          onDelete={handleDelete}
          onSelectGuest={() => {}}
          loginUrl={loginUrl}
        />

        {/* Temporary Code Modal */}
        <TempCodeModal
          isOpen={tempCodeModal.isOpen}
          onClose={() => setTempCodeModal({ ...tempCodeModal, isOpen: false })}
          tempCode={tempCodeModal.tempCode}
          guestName={tempCodeModal.guestName}
        />
      </div>
    </HostLayout>
  );
}
