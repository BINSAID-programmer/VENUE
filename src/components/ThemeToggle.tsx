import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, AppTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'icon' | 'segmented';
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'pill',
  showLabels = true,
}) => {
  const { theme, resolvedTheme, toggleTheme, setTheme, isDark } = useTheme();

  // 1. Icon button variant (header / quick action, min 44x44 touch target on mobile)
  if (variant === 'icon') {
    return (
      <button
        id="theme-toggle-icon-btn"
        onClick={toggleTheme}
        type="button"
        title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        aria-label={isDark ? 'Currently Dark theme. Click to switch to Light theme' : 'Currently Light theme. Click to switch to Dark theme'}
        className={`min-w-[40px] min-h-[40px] sm:min-w-[38px] sm:min-h-[38px] p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center relative cursor-pointer ${
          isDark
            ? 'bg-slate-900/90 text-amber-300 hover:text-amber-200 hover:bg-slate-800 border border-slate-800 shadow-sm'
            : 'bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 shadow-xs'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 animate-pulse" />
        ) : (
          <Moon className="w-4 h-4 text-blue-600" />
        )}
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  // 2. Compact pill with current status
  if (variant === 'compact') {
    return (
      <button
        id="theme-toggle-compact-btn"
        onClick={toggleTheme}
        type="button"
        aria-label={`Current theme: ${resolvedTheme}. Click to switch`}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border cursor-pointer ${
          isDark
            ? 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Moon className="w-3.5 h-3.5 text-sky-400" />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </>
        )}
      </button>
    );
  }

  // 3. Segmented 3-option control (Light | Dark | System)
  if (variant === 'segmented') {
    const options: { id: AppTheme; label: string; icon: typeof Sun }[] = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Laptop },
    ];

    return (
      <div
        className={`inline-flex items-center p-1 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-950/90 border-slate-800'
            : 'bg-slate-100 border-slate-200/80'
        } ${className}`}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              id={`theme-option-${opt.id}`}
              type="button"
              onClick={() => setTheme(opt.id)}
              role="radio"
              aria-checked={isSelected}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                isSelected
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white text-blue-700 shadow-xs border border-slate-200/90'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isSelected
                    ? isDark
                      ? 'text-white'
                      : 'text-blue-600'
                    : 'text-slate-400'
                }`}
              />
              {showLabels && <span>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // 4. Default 2-button pill switcher (Light / Dark)
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border transition-all ${
        isDark
          ? 'bg-slate-950/90 border-slate-800/90'
          : 'bg-slate-100 border-slate-200/80'
      } ${className}`}
      role="radiogroup"
      aria-label="Theme selection"
    >
      <button
        id="theme-btn-light"
        type="button"
        onClick={() => setTheme('light')}
        role="radio"
        aria-checked={!isDark}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[34px] ${
          !isDark
            ? 'bg-white text-amber-600 shadow-xs border border-slate-200/90'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        {showLabels && <span>Light</span>}
      </button>

      <button
        id="theme-btn-dark"
        type="button"
        onClick={() => setTheme('dark')}
        role="radio"
        aria-checked={isDark}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[34px] ${
          isDark
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-sky-300" />
        {showLabels && <span>Dark</span>}
      </button>
    </div>
  );
};

