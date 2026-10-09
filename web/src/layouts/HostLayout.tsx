import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Radio,
  Image as ImageIcon,
  QrCode,
  LogOut,
  ChevronDown,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import { LogoMark } from '../components/Logo';

interface HostLayoutProps {
  children: React.ReactNode;
  eventName?: string;
}

export function HostLayout({ children, eventName }: HostLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api('/api/host/events')
      .then((data: any) => setEvents(data.events || []))
      .catch(() => {});
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/host/logout', { method: 'POST' });
    } finally {
      navigate('/host/setup');
    }
  };

  const handleSwitchEvent = async (eventId: string) => {
    try {
      await api('/api/host/events/switch', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });
      setDropdownOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/host', icon: LayoutDashboard },
    { label: 'Event & QR', path: '/host/event', icon: QrCode },
    { label: 'Guests', path: '/host/guests', icon: Users },
    { label: 'Live Grid', path: '/host/live', icon: Radio },
    { label: 'Gallery', path: '/host/gallery', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar (Responsive drawer on mobile, sticky bar on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:sticky lg:top-0 lg:h-screen shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LogoMark className="w-10 h-10" />
              <div>
                <span className="font-serif font-bold text-base block text-slate-900 leading-tight">Gather</span>
                <span className="text-[11px] text-slate-400 font-medium">Host Control Center</span>
              </div>
            </div>

            {/* Mobile close sidebar button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3 relative">
          {/* Event Switcher Box */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-left transition cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Event</span>
                <span className="text-xs font-semibold text-slate-900 truncate block">
                  {eventName || 'Current Event'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1 z-50">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Event
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {events.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => handleSwitchEvent(e.id)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{e.name}</span>
                      {e.name === eventName && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-600 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <a
                    href="/host/setup"
                    className="w-full flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Event</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Host Session</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xs px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="font-serif font-semibold text-slate-900 text-base sm:text-lg truncate max-w-[180px] sm:max-w-xs md:max-w-none">
              {eventName || 'Event Host Portal'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <a
              href="/host/setup"
              className="flex items-center space-x-1.5 text-xs px-3 sm:px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-slate-800 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Event</span>
            </a>
            <a
              href="/host/event"
              className="text-xs px-3 sm:px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-white transition shadow-2xs whitespace-nowrap"
            >
              Join QR
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
