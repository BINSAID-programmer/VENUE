import React, { useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      onClick={onContinue}
      className="min-h-full flex-1 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-[#070b14] via-[#0b1329] to-[#070b14] relative overflow-hidden text-center cursor-pointer select-none"
    >
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Tagline Badge */}
      <div className="pt-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Your Academic Space</span>
        </div>
      </div>

      {/* Center Hero: VENUE Logo & Brand Identity */}
      <div className="my-auto py-8 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-6"
        >
          {/* Glowing Ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
          {/* Logo Card */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-2 border-blue-500/40 flex flex-col items-center justify-center shadow-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center shadow-inner">
              <span className="font-extrabold text-white text-3xl sm:text-4xl tracking-tighter font-['Space_Grotesk']">
                V
              </span>
            </div>
          </div>
        </motion.div>

        {/* Brand Name - Strictly "VENUE" */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold text-white tracking-widest uppercase font-['Space_Grotesk']"
        >
          VENUE
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg sm:text-xl font-medium text-sky-400 mt-2 tracking-wide"
        >
          Your Academic Space
        </motion.p>

        {/* Program Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs"
        >
          <span>Modern University Education Platform</span>
        </motion.div>
      </div>

      {/* Bottom Loading Indicator & Tap to Continue */}
      <div className="space-y-3 pb-4">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300" />
        </div>

        <button
          id="splash-continue-btn"
          onClick={onContinue}
          className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto font-medium transition-colors"
        >
          <span>Tap to continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
