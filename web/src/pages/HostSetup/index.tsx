import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, AlertCircle } from 'lucide-react';
import { SetupForm } from './components/SetupForm';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function HostSetup() {
  const navigate = useNavigate();
  const [hasEvent, setHasEvent] = useState<boolean | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoginMode, setIsLoginMode] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/host/status')
      .then((res) => res.json())
      .then((data) => {
        setHasEvent(data.hasEvent);
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
          setSelectedEventId(data.events[0].id);
        }
        if (data.hasEvent) {
          setIsLoginMode(true);
        }
      })
      .catch(() => setHasEvent(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/api/host/login' : '/api/host/setup';
      const payload = isLoginMode
        ? { password, eventId: selectedEventId || undefined }
        : { name, date, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      navigate('/host/event');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b0e] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-brand-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mb-2 border border-slate-200 dark:border-slate-700">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">
            {isLoginMode ? 'Host Access' : 'Create New Event'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLoginMode
              ? 'Enter your host master password to manage your event'
              : 'Setup a new private wedding or event lens'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(true);
              setError(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              isLoginMode ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(false);
              setError(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              !isLoginMode ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create New Event
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <SetupForm
          isLoginMode={isLoginMode}
          events={events}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          name={name}
          setName={setName}
          date={date}
          setDate={setDate}
          password={password}
          setPassword={setPassword}
          loading={loading}
          onSubmit={handleSubmit}
        />

        {hasEvent && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-900 transition underline cursor-pointer"
            >
              {isLoginMode ? 'Need to run setup again?' : 'Already have an event? Log in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
