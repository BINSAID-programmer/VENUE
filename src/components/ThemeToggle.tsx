import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'icon';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        id="theme-toggle-icon-btn"
        onClick={toggleTheme}
        type="button"
        title={isDark ? 'Switch to ☀️ Light Theme' : 'Switch to 🌙 Dark Theme'}
        aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
          isDark
            ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/70 border border-slate-800'
            : 'text-amber-500 hover:text-amber-600 hover:bg-slate-200/80 border border-slate-300'
        } ${className}`}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        id="theme-toggle-compact-btn"
        onClick={toggleTheme}
        type="button"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 border ${
          isDark
            ? 'bg-slate-900/90 text-amber-300 border-slate-800 hover:bg-slate-800'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-blue-600" />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }

  // Default 'pill' variant showing both options
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border transition-all ${
        isDark
          ? 'bg-slate-950/80 border-slate-800/90'
          : 'bg-slate-100 border-slate-300 shadow-inner'
      } ${className}`}
      role="radiogroup"
      aria-label="Theme preference"
    >
      <button
        id="theme-btn-light"
        type="button"
        onClick={() => !isDark || toggleTheme()}
        role="radio"
        aria-checked={!isDark}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          !isDark
            ? 'bg-white text-amber-600 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>Light</span>
      </button>
      <button
        id="theme-btn-dark"
        type="button"
        onClick={() => isDark || toggleTheme()}
        role="radio"
        aria-checked={isDark}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          isDark
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-sky-300" />
        <span>Dark</span>
      </button>
    </div>
  );
};
