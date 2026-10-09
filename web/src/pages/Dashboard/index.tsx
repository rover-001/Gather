import { useEffect, useState } from 'react';
import { LogoMark } from '../../components/Logo';
import { SystemCards } from './components/SystemCards';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function Dashboard() {
  const [health, setHealth] = useState<{ status: string; db: string } | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [echoMessage, setEchoMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'error', db: 'unreachable' }));

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setWsStatus('connected');
      socket.send(JSON.stringify({ type: 'ping' }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') {
          setEchoMessage('WS round-trip verified (pong received)');
        }
      } catch {
        setEchoMessage(`Echo: ${event.data}`);
      }
    };

    socket.onclose = () => setWsStatus('disconnected');
    socket.onerror = () => setWsStatus('disconnected');

    return () => socket.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b0e] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-brand-600 selection:text-white transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-[#12151c] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        <div className="text-center space-y-2">
          <LogoMark className="w-14 h-14 mx-auto mb-2" />
          <h1 className="text-2xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">Gather Console</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Local service connectivity & quick navigation</p>
        </div>

        <SystemCards health={health} wsStatus={wsStatus} echoMessage={echoMessage} />
      </div>
    </div>
  );
}
