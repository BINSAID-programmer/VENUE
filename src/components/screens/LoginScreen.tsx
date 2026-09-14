import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  loginWithEmailPassword,
  signInWithGoogle,
  sendPasswordReset,
  validateEmailFormat,
  getFirebaseAuthErrorMessage,
} from '../../services/firebase';

interface LoginScreenProps {
  onSuccess: (data?: { email: string; uid?: string; emailVerified?: boolean }) => void;
  onGoToSignup: () => void;
  onGoogleSignIn?: () => Promise<void> | void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onGoToSignup, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      if (onGoogleSignIn) {
        await onGoogleSignIn();
      } else {
        const result = await signInWithGoogle();
        if (result?.user) {
          onSuccess({
            email: result.user.email || '',
            uid: result.user.uid,
            emailVerified: result.user.emailVerified,
          });
        }
      }
    } catch (err: any) {
      console.warn('Google login note:', err);
      setErrorMsg(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both your student email and password.');
      return;
    }

    if (!validateEmailFormat(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. student@udsm.ac.tz).');
      return;
    }

    setIsLoading(true);
    try {
      // Firebase Authentication login
      const result = await loginWithEmailPassword(cleanEmail, password);
      onSuccess({
        email: result.user.email || cleanEmail,
        uid: result.user.uid,
        emailVerified: result.user.emailVerified,
      });
    } catch (err: any) {
      console.warn('Login attempt note:', err);
      setErrorMsg(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setForgotError('');
    const cleanForgotEmail = forgotEmail.trim();

    if (!cleanForgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    if (!validateEmailFormat(cleanForgotEmail)) {
      setForgotError('Please enter a valid email format.');
      return;
    }

    setForgotLoading(true);
    try {
      await sendPasswordReset(cleanForgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      console.warn('Forgot password attempt note:', err);
      setForgotError(getFirebaseAuthErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email.trim());
    setForgotSent(false);
    setForgotError('');
    setForgotModalOpen(true);
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-7 bg-gradient-to-b from-[#070b14] via-[#091122] to-[#070b14]">
      {/* Top Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-600/30">
            <span className="font-extrabold text-white text-base font-['Space_Grotesk']">V</span>
          </div>
          <span className="font-extrabold text-white tracking-wider text-base uppercase font-['Space_Grotesk']">
            VENUE
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Sign in to access your courses, AI tutor, and study planner
        </p>
      </div>

      {/* Main Login Form */}
      <div className="my-auto py-4 space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Primary Google Authentication Button */}
        <button
          id="login-google-btn"
          type="button"
          onClick={handleGoogleClick}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md shadow-white/5 flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer disabled:opacity-70 group"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider">or with university email</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. student@udsm.ac.tz"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Log In to VENUE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom Switch to Sign Up */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            id="login-goto-signup-btn"
            onClick={onGoToSignup}
            className="text-sky-400 hover:text-sky-300 font-bold ml-1 cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>

      {/* Real Firebase Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Reset VENUE Password</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Enter your registered student email address. Firebase will send a secure password reset link to your inbox.
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSent ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <p className="font-semibold">Reset link sent successfully!</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Please check your email inbox at <span className="font-medium text-white">{forgotEmail}</span> to complete your password reset.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (forgotError) setForgotError('');
                    }}
                    placeholder="student@udsm.ac.tz"
                    disabled={forgotLoading}
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(false);
                  setForgotSent(false);
                  setForgotError('');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
              >
                {forgotSent ? 'Done' : 'Cancel'}
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={forgotLoading}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-blue-600/30"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
