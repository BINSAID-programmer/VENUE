import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, BatteryCharging, Signal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DeviceWrapperProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const DeviceWrapper: React.FC<DeviceWrapperProps> = ({ children, fullWidth = false }) => {
  const { isDark } = useTheme();
  // Allow toggling between Smartphone Frame and Expanded responsive view
  const [deviceMode, setDeviceMode] = useState<'mobile-frame' | 'fluid'>('mobile-frame');
  const [currentTime, setCurrentTime] = useState('09:41');

  // Update time realistically
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  if (fullWidth) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 antialiased font-sans selection:bg-indigo-600 selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4 selection:bg-blue-600 selection:text-white relative transition-colors duration-200 venue-device-outer ${
        isDark ? 'bg-[#04070e]' : 'bg-[#e5e7eb]'
      }`}
    >
      {/* Top Floating Viewport Switcher for Developers & Evaluators */}
      <aside
        aria-label="Device Viewport Switcher"
        className={`hidden sm:flex items-center gap-2 mb-4 rounded-full px-3 py-1.5 backdrop-blur-md shadow-xl z-50 border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-300'
            : 'bg-white/95 border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        <span className="text-xs font-semibold mr-1 flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Preview Mode:
        </span>
        <button
          id="toggle-mobile-frame"
          onClick={() => setDeviceMode('mobile-frame')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            deviceMode === 'mobile-frame'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile Frame (Play Store)
        </button>
        <button
          id="toggle-fluid-view"
          onClick={() => setDeviceMode('fluid')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            deviceMode === 'fluid'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Fluid Responsive
        </button>
      </aside>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 venue-device-frame ${
          deviceMode === 'mobile-frame'
            ? `max-w-[430px] sm:min-h-[860px] sm:max-h-[920px] sm:rounded-[44px] sm:border-[8px] relative sm:overflow-hidden flex flex-col ${
                isDark
                  ? 'bg-[#070b14] sm:border-slate-800/90 sm:shadow-2xl sm:shadow-blue-950/40'
                  : 'bg-[#f3f4f6] sm:border-slate-300 sm:shadow-2xl sm:shadow-slate-400/25'
              }`
            : `max-w-4xl min-h-screen sm:rounded-2xl sm:border flex flex-col ${
                isDark
                  ? 'bg-[#070b14] sm:border-slate-800/90'
                  : 'bg-[#f3f4f6] sm:border-slate-200 shadow-md shadow-slate-900/5'
              }`
        }`}
      >
        {/* Realistic Mobile Status Bar (Visible in phone frame mode) */}
        {deviceMode === 'mobile-frame' && (
          <div
            className={`hidden sm:flex items-center justify-between px-6 pt-3 pb-1 text-xs font-medium select-none z-50 backdrop-blur-md border-b transition-colors venue-status-bar ${
              isDark
                ? 'bg-[#070b14]/90 text-slate-300 border-slate-800/40'
                : 'bg-white/95 text-slate-600 border-slate-200/80'
            }`}
          >
            <span>{currentTime}</span>
            {/* Dynamic Island / Speaker Pill */}
            <div
              className={`w-24 h-4 rounded-full flex items-center justify-center border ${
                isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-slate-200/90 border-slate-300/80'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full border mr-2 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-300 border-slate-400'
                }`}
              />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryCharging className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        )}

        {/* Inner Scrollable Screen Content */}
        <div className="flex-1 flex flex-col overflow-y-auto relative custom-scrollbar pb-20">
          {children}
        </div>
      </div>
    </div>
  );
};

