import React from 'react';
import { Bell, ArrowLeft, Search, Sparkles, BookOpen, User, Settings as SettingsIcon } from 'lucide-react';
import { ScreenId } from '../../types';
import { ThemeToggle } from '../ThemeToggle';

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
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {isSubScreen ? (
            <button
              id="header-back-button"
              onClick={onBack || (() => onNavigate('home'))}
              className="p-1.5 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-blue-400" />
            </button>
          ) : (
            <button
              id="header-home-logo-btn"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-white text-base tracking-tighter">V</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-slate-100 tracking-wider text-base uppercase leading-none font-['Space_Grotesk']">
                    VENUE
                  </h1>
                  {universityShort && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {universityShort}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                  Your Academic Space
                </p>
              </div>
            </button>
          )}

          {isSubScreen && (
            <div className="truncate">
              <h1 className="font-semibold text-slate-100 text-sm md:text-base leading-tight truncate">
                {title || 'VENUE'}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
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
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-400" />
              <span>AI Tutor</span>
            </button>
          )}

          {/* Notifications Button with unread indicator */}
          <button
            id="header-notifications-btn"
            onClick={() => onNavigate('notifications')}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-[#070b14] animate-pulse" />
            )}
          </button>

          {/* Settings Button */}
          <button
            id="header-settings-btn"
            onClick={() => onNavigate('settings')}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5 text-slate-300" />
          </button>

          {/* Theme Quick Toggle */}
          <ThemeToggle variant="icon" />
        </div>
      </div>
    </header>
  );
};
