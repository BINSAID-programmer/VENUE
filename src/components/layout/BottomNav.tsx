import React from 'react';
import { Home, BookOpen, Sparkles, Search, MoreHorizontal } from 'lucide-react';
import { ScreenId } from '../../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'home' as ScreenId, label: 'Home', icon: Home },
    { id: 'courses' as ScreenId, label: 'Courses', icon: BookOpen },
    { id: 'ai-tutor' as ScreenId, label: 'AI Tutor', icon: Sparkles, isHighlight: true },
    { id: 'search' as ScreenId, label: 'Search', icon: Search },
    { id: 'more' as ScreenId, label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl transition-all">
      <div className="flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.id ||
            (item.id === 'courses' && currentScreen === 'course-detail') ||
            (item.id === 'more' &&
              [
                'planner',
                'resources',
                'browse-materials',
                'past-papers',
                'quiz',
                'flashcards',
                'scholarships',
                'career',
                'university-hub',
                'community',
                'financial-planner',
                'profile',
                'notifications',
                'settings',
              ].includes(currentScreen));

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                id={`bottom-nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className="group relative -top-3 flex flex-col items-center focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 shadow-blue-500/50 scale-105 ring-2 ring-sky-400/50'
                      : 'bg-gradient-to-tr from-blue-600 to-sky-500 shadow-blue-900/40 hover:scale-105 group-hover:shadow-blue-500/30'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-tight mt-1 transition-colors ${
                    isActive ? 'text-sky-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  AI Tutor
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-[54px] cursor-pointer ${
                isActive
                  ? 'text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-sky-400' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
