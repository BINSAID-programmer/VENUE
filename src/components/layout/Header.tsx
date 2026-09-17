import React from 'react';
import { Bell, ArrowLeft, Search, Sparkles, BookOpen, User, Settings as SettingsIcon } from 'lucide-react';
import { ScreenId } from '../../types';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadCount: number;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  universityShort?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  unreadCount,
  onBack,
  title,
  subtitle,
  universityShort,
}) => {
  const { isDark } = useTheme();

  // Determine if this is a sub-screen that should show a back button
  const isSubScreen = [
    'course-detail',
    'resources',
    'past-papers',
    'planner',
    'quiz',
    'flashcards',
    'scholarships',
    'career',
    'university-hub',
    'financial-planner',
    'notifications',
    'settings',
    'profile',
    'edit-profile',
    'complete-profile',
  ].includes(currentScreen);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 transition-all ${
        isDark
          ? 'bg-[#070b14]/90 border-slate-800/80 text-slate-100'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {isSubScreen ? (
            <button
              id="header-back-button"
              onClick={onBack || (() => onNavigate('home'))}
              className={`p-1.5 -ml-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-blue-500" />
            </button>
          ) : (
            <button
              id="header-home-logo-btn"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-white text-base tracking-tighter">V</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1
                    className={`font-extrabold tracking-wider text-base uppercase leading-none font-['Space_Grotesk'] ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    VENUE
                  </h1>
                  {universityShort && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      {universityShort}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] font-normal leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your Academic Space
                </p>
              </div>
            </button>
          )}

          {isSubScreen && (
            <div className="truncate">
              <h1
                className={`font-semibold text-sm md:text-base leading-tight truncate ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {title || 'VENUE'}
              </h1>
              {subtitle && (
                <p className={`text-[11px] truncate leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI Tutor Quick Access Button */}
          {currentScreen !== 'ai-tutor' && (
            <button
              id="header-ai-tutor-btn"
              onClick={() => onNavigate('ai-tutor')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-500" />
              <span>AI Tutor</span>
            </button>
          )}

          {/* Notifications Button with unread indicator */}
          <button
            id="header-notifications-btn"
            onClick={() => onNavigate('notifications')}
            className={`relative p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse ring-2 ${
                  isDark ? 'ring-[#070b14]' : 'ring-white'
                }`}
              />
            )}
          </button>

          {/* Settings Button */}
          <button
            id="header-settings-btn"
            onClick={() => onNavigate('settings')}
            className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* Theme Quick Toggle */}
          <ThemeToggle variant="icon" />
        </div>
      </div>
    </header>
  );
};

