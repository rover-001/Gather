import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuestLayout } from '../../../layouts/GuestLayout';
import { api } from '../../../lib/api';
import { Phone, KeyRound, LogOut, ShieldCheck, CheckCircle2, Moon } from 'lucide-react';
import { ThemeToggle } from '../../../components/ThemeToggle';

let cachedGuestProfile: any = null;

export default function GuestMePage() {
  const [guest, setGuest] = useState<any>(() => cachedGuestProfile);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/api/me')
      .then((res: any) => {
        cachedGuestProfile = res.guest;
        setGuest(res.guest);
      })
      .catch(() => navigate('/'));
  }, [navigate]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }

    setSavingPw(true);
    try {
      await api('/api/me/password', {
        method: 'POST',
        body: JSON.stringify({
          oldPassword: guest.mustChangePassword ? undefined : oldPassword,
          newPassword,
        }),
      });
      setPwSuccess(true);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api('/api/logout', { method: 'POST' });
    } finally {
      navigate('/');
    }
  };

  return (
    <GuestLayout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 flex flex-col p-4 transition-colors duration-200">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
            {guest?.name ? guest.name.slice(0, 2).toUpperCase() : 'G'}
          </div>

          <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{guest?.name || 'Guest'}</h2>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>+{guest?.phone}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Active Guest Account</span>
          </div>
        </div>

        {/* Appearance & Theme Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block">Appearance</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Switch theme appearance</span>
            </div>
          </div>
          <ThemeToggle showLabel />
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs mb-4">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Change Password</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Your password keeps your shared photos private on any device.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3">
            {!guest?.mustChangePassword && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-brand-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-brand-500"
                required
                minLength={6}
              />
            </div>

            {pwError && <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{pwError}</p>}
            {pwSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Password updated successfully</span>
              </p>
            )}

            <button
              type="submit"
              disabled={savingPw}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 font-bold text-xs transition border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </GuestLayout>
  );
}
