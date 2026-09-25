import React, { useState, useMemo } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import {
  registerWithEmailPassword,
  signInWithGoogle,
  validateEmailFormat,
  validatePasswordRequirements,
  getFirebaseAuthErrorMessage,
} from '../../services/firebase';

interface CreateAccountScreenProps {
  onSuccess: (data: {
    fullName: string;
    email: string;
    uid: string;
    emailVerified?: boolean;
    verificationSent?: boolean;
    verificationError?: string | null;
  }) => void;
  onGoToLogin: () => void;
  onGoogleSignIn?: () => Promise<void> | void;
}

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({
  onSuccess,
  onGoToLogin,
  onGoogleSignIn,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
            fullName: result.user.displayName || 'Student',
            email: result.user.email || '',
            uid: result.user.uid,
            emailVerified: result.user.emailVerified,
            verificationSent: false,
            verificationError: null,
          });
        }
      }
    } catch (err: any) {
      console.warn('Google sign up note:', err);
      setErrorMsg(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Password requirement analysis
  const passwordCheck = useMemo(() => {
    return validatePasswordRequirements(password);
  }, [password]);

  // Is typing password
  const hasStartedTypingPassword = password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!validateEmailFormat(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. student@university.ac or student@institution.edu).');
      return;
    }

    // Strict validation of password criteria
    if (!passwordCheck.isValid) {
      if (!passwordCheck.hasMinLength) {
        setErrorMsg('Password must have at least 8 characters.');
      } else if (!passwordCheck.hasLetter) {
        setErrorMsg('Password must contain at least one letter.');
      } else if (!passwordCheck.hasNumber) {
        setErrorMsg('Password must contain at least one number.');
      } else if (!passwordCheck.hasSpecialChar) {
        setErrorMsg('Password must contain at least one special character (! @ # $ %).');
      } else {
        setErrorMsg('Please satisfy all password security requirements.');
      }
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      // Firebase Authentication creates user securely without plaintext storage
      const result = await registerWithEmailPassword(cleanEmail, password, cleanName);
      onSuccess({
        fullName: cleanName,
        email: cleanEmail,
        uid: result.user.uid,
        emailVerified: result.user.emailVerified,
        verificationSent: result.verificationSent,
        verificationError: result.verificationError,
      });
    } catch (err: any) {
      console.warn('Registration attempt note:', err);
      setErrorMsg(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
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
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Join VENUE with your verified university credentials
        </p>
      </div>

      {/* Main Form */}
      <div className="my-auto py-3 space-y-3.5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Primary Google Authentication Button */}
        <button
          id="create-google-btn"
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
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
        </button>

        <div className="flex items-center my-2.5">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider">or create with email</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="create-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Baraka Mwita"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Student Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="create-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. student@institution.edu or student@university.ac"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="create-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Create password"
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

            {/* Real-time Password Requirements Checklist */}
            <div className="mt-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Password Requirements:
                </span>
                {hasStartedTypingPassword && (
                  <span
                    className={
                      passwordCheck.isValid
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {passwordCheck.isValid ? 'Secure' : 'Incomplete'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {/* Rule 1: Min 8 chars */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                      passwordCheck.hasMinLength
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {passwordCheck.hasMinLength ? <Check className="w-2.5 h-2.5" /> : '○'}
                  </span>
                  <span
                    className={
                      passwordCheck.hasMinLength ? 'text-slate-200' : 'text-slate-500'
                    }
                  >
                    8+ characters
                  </span>
                </div>

                {/* Rule 2: At least one letter */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                      passwordCheck.hasLetter
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {passwordCheck.hasLetter ? <Check className="w-2.5 h-2.5" /> : '○'}
                  </span>
                  <span
                    className={
                      passwordCheck.hasLetter ? 'text-slate-200' : 'text-slate-500'
                    }
                  >
                    One letter (a-z)
                  </span>
                </div>

                {/* Rule 3: At least one number */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                      passwordCheck.hasNumber
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {passwordCheck.hasNumber ? <Check className="w-2.5 h-2.5" /> : '○'}
                  </span>
                  <span
                    className={
                      passwordCheck.hasNumber ? 'text-slate-200' : 'text-slate-500'
                    }
                  >
                    One number (0-9)
                  </span>
                </div>

                {/* Rule 4: Special character */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                      passwordCheck.hasSpecialChar
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {passwordCheck.hasSpecialChar ? <Check className="w-2.5 h-2.5" /> : '○'}
                  </span>
                  <span
                    className={
                      passwordCheck.hasSpecialChar ? 'text-slate-200' : 'text-slate-500'
                    }
                  >
                    Special (!@#$%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="create-confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Repeat password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="create-account-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom switch to login */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <button
            id="create-goto-login-btn"
            onClick={onGoToLogin}
            className="text-sky-400 hover:text-sky-300 font-bold ml-1 cursor-pointer"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};
