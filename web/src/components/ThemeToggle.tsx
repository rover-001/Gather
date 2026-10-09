import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer select-none text-xs font-semibold ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-amber-400 hover:text-amber-300 shadow-2xs'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 shrink-0 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 shrink-0 transition-transform duration-200 -hover:rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      )}
    </button>
  );
}
