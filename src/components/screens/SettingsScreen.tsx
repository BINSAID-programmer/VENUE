import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Bell,
  WifiOff,
  Shield,
  HelpCircle,
  LogOut,
  Info,
  CheckCircle2,
  Sparkles,
  Smartphone,
  BookOpen,
} from 'lucide-react';

interface SettingsScreenProps {
  onLogout: () => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout, onResetData }) => {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (confirm('Reset application prototype data back to initial state?')) {
      onResetData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Preferences, app configuration & creator info</p>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Demo data successfully reset!</span>
        </div>
      )}

      {/* Creator & App Identity Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/30 p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-600/30">
            V
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">VENUE</h3>
            <p className="text-xs text-sky-400 font-semibold">Your Academic Space</p>
            <p className="text-[11px] text-slate-400">VENUE Academic Suite</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          Designed specifically for university students to unify academic resources,
          course planning, past examination papers, and AI-powered tutoring in one personalized space.
        </p>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Release: v1.0.0 (Pre-Alpha Prototype)</span>
          <span className="text-emerald-400 font-medium">Ready for Google Play</span>
        </div>
      </div>

      {/* General Preferences */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Preferences</h3>

        {/* Dark Theme Setting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-850 text-sky-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">Theme</p>
              <p className="text-[11px] text-slate-400">Electric Navy & Dark Mode (Optimized)</p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
            Always Dark
          </span>
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-850 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">Academic Alerts</p>
              <p className="text-[11px] text-slate-400">CA marks, timetable changes & deadlines</p>
            </div>
          </div>
          <button
            id="toggle-notifications"
            onClick={() => setPushNotifs(!pushNotifs)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              pushNotifs ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                pushNotifs ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Offline Caching Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-850 text-emerald-400 flex items-center justify-center">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">Offline Study Mode</p>
              <p className="text-[11px] text-slate-400">Cache lecture notes & flashcards locally</p>
            </div>
          </div>
          <button
            id="toggle-offline-sync"
            onClick={() => setOfflineSync(!offlineSync)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              offlineSync ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                offlineSync ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* AI Tutor Suggestions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-850 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">AI Proof Derivations</p>
              <p className="text-[11px] text-slate-400">Step-by-step mathematical reasoning</p>
            </div>
          </div>
          <button
            id="toggle-ai-suggestions"
            onClick={() => setAiSuggestions(!aiSuggestions)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              aiSuggestions ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                aiSuggestions ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account & Storage Actions */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account & Storage</h3>

        <button
          id="settings-reset-data-btn"
          onClick={handleReset}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Reset Demo Data to Initial</span>
          <span className="text-[11px] text-slate-500">Restore Mock Data</span>
        </button>

        <button
          id="settings-logout-btn"
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of VENUE</span>
        </button>
      </div>

      <div className="text-center text-slate-500 text-[11px] pt-2">
        <p>VENUE: Your Academic Space © 2026.</p>
        <p className="mt-0.5">Empowering university students with personalized study tools.</p>
      </div>
    </div>
  );
};
