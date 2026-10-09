import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Plus } from 'lucide-react';
import type { Group, Pass } from './types';
import { PassStatsBar } from './components/PassStatsBar';
import { PassesTable } from './components/PassesTable';
import { CreatePassDrawer } from './components/CreatePassDrawer';
import { QrShareModal } from './components/QrShareModal';

export default function HostPasses() {
  const navigate = useNavigate();
  const [passes, setPasses] = useState<Pass[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Drawer & modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeQrModal, setActiveQrModal] = useState<{ url: string; name: string } | null>(null);
  const [newPassName, setNewPassName] = useState('');
  const [newPassRole, setNewPassRole] = useState<'camera' | 'viewer' | 'both'>('camera');
  const [newPassCanDownload, setNewPassCanDownload] = useState(true);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [copiedModal, setCopiedModal] = useState(false);

  const fetchPasses = async () => {
    try {
      const res = await fetch('/api/host/passes');
      if (res.status === 401 || res.status === 403) {
        navigate('/host/setup');
        return;
      }
      const data = await res.json();
      setPasses(data.passes || []);
      setGroups(data.groups || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/host/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      const data = await res.json();
      if (data.group) {
        setGroups([...groups, data.group]);
        setSelectedGroupIds([...selectedGroupIds, data.group.id]);
        setNewGroupName('');
      }
    } catch (err: any) {
      alert('Failed to create group: ' + err.message);
    }
  };

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName.trim()) return;

    try {
      const res = await fetch('/api/host/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPassName.trim(),
          role: newPassRole,
          canDownload: newPassCanDownload,
          groupIds: selectedGroupIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsDrawerOpen(false);
      setNewPassName('');
      setSelectedGroupIds([]);
      await fetchPasses();

      if (data.joinUrl) {
        setActiveQrModal({ url: data.joinUrl, name: data.pass.name });
      }
    } catch (err: any) {
      alert('Error creating pass: ' + err.message);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this pass? The device will be disconnected immediately.')) {
      return;
    }

    try {
      const res = await fetch(`/api/host/passes/${id}/revoke`, { method: 'POST' });
      if (!res.ok) throw new Error('Revoke failed');
      await fetchPasses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this pass? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/host/passes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchPasses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleDownload = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/host/passes/${id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canDownload: !current }),
      });
      await fetchPasses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyModalUrl = () => {
    if (!activeQrModal) return;
    navigator.clipboard.writeText(activeQrModal.url);
    setCopiedModal(true);
    setTimeout(() => setCopiedModal(false), 2000);
  };

  const handleToggleGroup = (id: string) => {
    setSelectedGroupIds(
      selectedGroupIds.includes(id)
        ? selectedGroupIds.filter((gid) => gid !== id)
        : [...selectedGroupIds, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-brand-600 selection:text-white pb-12">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-slate-900">Passes & Access QRs</h1>
            <p className="text-xs text-slate-500">Event QR codes for guests and photographers</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dash')}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition font-semibold cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center space-x-2 text-xs px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Pass / QR</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto p-6 space-y-6">
        <PassStatsBar passes={passes} />
        <PassesTable
          passes={passes}
          onToggleDownload={handleToggleDownload}
          onRevoke={handleRevoke}
          onDelete={handleDelete}
        />
      </main>

      <CreatePassDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        name={newPassName}
        setName={setNewPassName}
        role={newPassRole}
        setRole={setNewPassRole}
        canDownload={newPassCanDownload}
        setCanDownload={setNewPassCanDownload}
        groups={groups}
        selectedGroupIds={selectedGroupIds}
        onToggleGroup={handleToggleGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        onCreateGroup={handleCreateGroup}
        onSubmit={handleCreatePass}
      />

      <QrShareModal
        isOpen={!!activeQrModal}
        onClose={() => setActiveQrModal(null)}
        url={activeQrModal?.url || ''}
        name={activeQrModal?.name || ''}
        copied={copiedModal}
        onCopy={handleCopyModalUrl}
      />
    </div>
  );
}
