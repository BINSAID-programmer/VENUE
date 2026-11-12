import React, { useState } from 'react';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { getFirebaseAuthErrorMessage } from '../../services/firebase';
import { VenueLogo } from '../common/VenueLogo';
import { CAMPUS_BG } from '../../assets_campusBg';

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
    <div className="min-h-full min-h-screen sm:min-h-full flex-1 flex flex-col justify-between relative overflow-hidden bg-[#070b14]">
      <img
        src={CAMPUS_BG}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/10 via-[#0b1329]/45 to-[#070b14]/92" />

      {/* Logo + brand */}
      <div className="relative z-10 flex flex-col items-center pt-14 px-6">
        <VenueLogo size={72} className="drop-shadow-[0_0_22px_rgba(59,130,246,0.55)]" />
        <h1 className="mt-3 text-4xl font-extrabold text-white tracking-wide uppercase font-['Space_Grotesk']">
          VENUE
        </h1>
      </div>

      {/* Actions */}
      <div className="relative z-10 px-6 pb-8 pt-10 space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to VENUE</h2>
          <p className="text-sm text-slate-300 mt-1">Your academic journey, all in one place.</p>
        </div>

        {googleError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{googleError}</span>
          </div>
        )}

        <button
          id="welcome-login-btn"
          onClick={onLogin}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
        >
          Login
        </button>

        <button
          id="welcome-get-started-btn"
          onClick={onGetStarted}
          className="w-full py-3.5 rounded-xl bg-transparent border border-white/70 hover:bg-white/10 text-white font-bold text-sm active:scale-95 transition-all cursor-pointer"
        >
          Create Account
        </button>

        <div className="flex items-center pt-1">
          <div className="flex-1 border-t border-white/15" />
          <span className="px-3 text-[11px] text-slate-400">or continue with</span>
          <div className="flex-1 border-t border-white/15" />
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            id="welcome-google-signin-btn"
            type="button"
            onClick={handleGoogleClick}
            disabled={isGoogleLoading}
            aria-label="Continue with Google"
            className="w-28 h-14 rounded-xl bg-slate-900/80 border border-white/15 hover:bg-slate-800 flex flex-col items-center justify-center gap-0.5 text-white text-[11px] font-medium active:scale-95 transition-all cursor-pointer disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{isGoogleLoading ? 'Connecting…' : 'Google'}</span>
          </button>

          <button
            type="button"
            onClick={onLogin}
            aria-label="Continue with Email"
            className="w-28 h-14 rounded-xl bg-slate-900/80 border border-white/15 hover:bg-slate-800 flex flex-col items-center justify-center gap-0.5 text-white text-[11px] font-medium active:scale-95 transition-all cursor-pointer"
          >
            <Mail className="w-5 h-5" />
            <span>Email</span>
          </button>
        </div>

      </div>
    </div>
  );
};
