import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getFirebaseAuthErrorMessage } from '../../services/firebase';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onGoogleSignIn?: () => Promise<void> | void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onLogin,
  onGoogleSignIn,
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleClick = async () => {
    if (!onGoogleSignIn) return;
    setGoogleError('');
    setIsGoogleLoading(true);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setGoogleError(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-7 bg-gradient-to-b from-[#070b14] via-[#091122] to-[#070b14] relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="pt-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-600/30">
            <span className="font-extrabold text-white text-base font-['Space_Grotesk']">V</span>
          </div>
          <span className="font-extrabold text-white tracking-wider text-base uppercase font-['Space_Grotesk']">
            VENUE
          </span>
        </div>

        <span className="text-[11px] font-semibold text-sky-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25">
          Your Academic Space
        </span>
      </div>

      {/* Center Value Proposition */}
      <div className="my-auto py-6 space-y-6 z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your Academic Space</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Welcome to VENUE
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-md">
            The personalized academic workspace designed for university undergraduate and postgraduate students.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-2.5">
          {[
            {
              icon: BookOpen,
              title: 'Curated Course Hub',
              desc: 'Comprehensive lecture notes, syllabus modules, slides & past papers.',
            },
            {
              icon: Sparkles,
              title: 'AI Academic Tutor',
              desc: 'Instant step-by-step problem explanations, derivations & conceptual clarity.',
            },
            {
              icon: Clock,
              title: 'Study Planner & Timetables',
              desc: 'Exam countdowns, CA continuous assessment & daily time blocks.',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-sky-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">{feat.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 text-center">
          VENUE • <span className="font-semibold text-slate-300">Your Academic Space</span>
        </div>
      </div>

      {/* Bottom CTA Actions */}
      <div className="space-y-2.5 pt-2 z-10">
        {googleError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{googleError}</span>
          </div>
        )}

        {/* Primary Google Authentication Button */}
        <button
          id="welcome-google-signin-btn"
          type="button"
          onClick={handleGoogleClick}
          disabled={isGoogleLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-white/10 flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer disabled:opacity-75"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="flex items-center my-1">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        <button
          id="welcome-get-started-btn"
          onClick={onGetStarted}
          className="w-full py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <span>Get Started with Email</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          id="welcome-login-btn"
          onClick={onLogin}
          className="w-full py-2.5 rounded-2xl text-slate-400 hover:text-slate-200 font-medium text-xs active:scale-95 transition-all cursor-pointer text-center"
        >
          I Already Have an Account • Log In
        </button>
      </div>
    </div>
  );
};
