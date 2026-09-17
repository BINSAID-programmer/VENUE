import React from 'react';
import { Check, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LIGHT_THEMES, DARK_THEMES, ThemeDefinition } from '../data/themes';

interface ThemeSelectorProps {
  className?: string;
  onThemeSelect?: (id: string) => void;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  onThemeSelect,
  compact = false,
}) => {
  const { themeId, setThemeId, isDark } = useTheme();

  const handleSelect = (id: typeof themeId) => {
    setThemeId(id);
    if (onThemeSelect) {
      onThemeSelect(id);
    }
  };

  const renderThemeCard = (theme: ThemeDefinition) => {
    const isSelected = themeId === theme.id;

    return (
      <button
        key={theme.id}
        id={`theme-select-card-${theme.id}`}
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={() => handleSelect(theme.id)}
        className={`w-full text-left p-3 sm:p-3.5 rounded-2xl transition-all relative border cursor-pointer group active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isSelected
            ? isDark
              ? 'bg-slate-900/95 border-sky-500/80 shadow-md shadow-sky-950/30 ring-1 ring-sky-500/50'
              : 'bg-white border-blue-500/80 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40'
            : isDark
            ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
            : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Radio circle */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? isDark
                  ? 'border-sky-400 bg-sky-500/20'
                  : 'border-blue-600 bg-blue-50'
                : isDark
                ? 'border-slate-600 group-hover:border-slate-400'
                : 'border-slate-300 group-hover:border-slate-400'
            }`}
          >
            {isSelected && (
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDark ? 'bg-sky-400' : 'bg-blue-600'
                }`}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs sm:text-sm font-bold tracking-tight ${
                  isSelected
                    ? isDark
                      ? 'text-white'
                      : 'text-slate-900'
                    : isDark
                    ? 'text-slate-200'
                    : 'text-slate-800'
                }`}
              >
                {theme.name}
              </span>
              {isSelected && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  Active
                </span>
              )}
            </div>
            <p
              className={`text-[11px] truncate mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {theme.shortDesc}
            </p>
          </div>
        </div>

        {/* Visual Preview Swatches */}
        <div
          className="flex items-center gap-1.5 self-end sm:self-center p-1 rounded-xl border shrink-0"
          style={{
            backgroundColor: theme.swatches.page,
            borderColor: theme.swatches.border,
          }}
          title={`${theme.name} palette preview`}
          aria-label={`${theme.name} palette preview`}
        >
          {/* Card surface chip */}
          <div
            className="w-4 h-4 rounded-md border shadow-2xs"
            style={{
              backgroundColor: theme.swatches.card,
              borderColor: theme.swatches.border,
            }}
            title="Surface"
          />
          {/* Accent chip */}
          <div
            className="w-4 h-4 rounded-md shadow-2xs"
            style={{ backgroundColor: theme.swatches.accent }}
            title="Accent"
          />
          {/* Text chip */}
          <div
            className="w-4 h-4 rounded-md flex items-center justify-center font-bold text-[9px]"
            style={{
              backgroundColor: theme.swatches.card,
              color: theme.swatches.text,
              border: `1px solid ${theme.swatches.border}`,
            }}
            title="Text"
          >
            Aa
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`space-y-4 ${className}`} role="radiogroup" aria-label="VENUE Soft Color Themes">
      {/* Light Themes Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sun className="w-3.5 h-3.5" />
            <span>Light Themes</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">4 soft palettes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LIGHT_THEMES.map(renderThemeCard)}
        </div>
      </div>

      {/* Dark Themes Section */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60 dark:border-slate-800/80 light:border-slate-200">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <Moon className="w-3.5 h-3.5" />
            <span>Dark Themes</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">4 calm palettes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DARK_THEMES.map(renderThemeCard)}
        </div>
      </div>
    </div>
  );
};
