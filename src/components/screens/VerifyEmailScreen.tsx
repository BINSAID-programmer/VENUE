import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import {
  resendVerificationEmail,
  checkEmailVerificationStatus,
  markPreviewEmailVerified,
  logoutUser,
  formatFirebaseVerificationError,
  auth,
} from '../../services/firebase';

interface VerifyEmailScreenProps {
  email: string;
  initialSent?: boolean;
  initialError?: string | null;
  onVerified: () => void;
  onLogout: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;
const COOLDOWN_KEY = 'venue_email_verify_resend_timestamp';

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({
  email,
  initialSent,
  initialError,
  onVerified,
  onLogout,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(() => {
    if (initialError) {
      return {
        type: 'warning',
        text: initialError,
      };
    }
    if (initialSent) {
      return {
        type: 'success',
        text: 'Verification email sent successfully.',
      };
    }
    return null;
  });
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Cooldown countdown state
  const [cooldown, setCooldown] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(COOLDOWN_KEY);
      if (stored) {
        const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
        if (elapsed < RESEND_COOLDOWN_SECONDS) {
          return RESEND_COOLDOWN_SECONDS - elapsed;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // Cooldown timer interval
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Copy email helper
  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard?.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Action: Check verification status (I've Verified My Email)
  const handleCheckStatus = useCallback(async () => {
    setIsChecking(true);
    setStatusMessage(null);

    try {
      const result = await checkEmailVerificationStatus();
      if (result.verified) {
        setStatusMessage({
          type: 'success',
          text: 'Email verified successfully! Directing you to your VENUE setup...',
        });
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else {
        setStatusMessage({
          type: 'warning',
          text: 'Email not verified yet. Please click the confirmation link sent by Firebase to your inbox, then tap this button again.',
        });
      }
    } catch (err: any) {
      console.warn('Verification status check note:', err);
      setStatusMessage({
        type: 'warning',
        text: 'Unable to check verification status right now. Please check your connection and try again.',
      });
    } finally {
      setIsChecking(false);
    }
  }, [onVerified]);

  // Action: Resend Verification Email with Cooldown
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setStatusMessage(null);

    try {
      // 1. Confirm that Firebase Authentication actually executes sendEmailVerification()
      await resendVerificationEmail();
      // 6. Keep the existing resend cooldown
      const now = Date.now();
      localStorage.setItem(COOLDOWN_KEY, now.toString());
      setCooldown(RESEND_COOLDOWN_SECONDS);
      // 3 & 4: Do not show "Verification email sent" unless the Firebase sendEmailVerification() promise succeeds.
      // If it succeeds, show "Verification email sent successfully."
      setStatusMessage({
        type: 'success',
        text: 'Verification email sent successfully.',
      });
    } catch (err: any) {
      console.warn('[Firebase Auth] Resend verification note:', err);
      // 2 & 5: Catch and display the REAL Firebase error code/message if sending fails in a user-friendly way
      const errorText = formatFirebaseVerificationError(err);
      setStatusMessage({
        type: 'warning',
        text: errorText,
      });
    } finally {
      setIsResending(false);
    }
  };

  // Safe logout handler
  const handleLogoutClick = async () => {
    try {
      await logoutUser();
    } finally {
      onLogout();
    }
  };

  // Check if Webmail quick-links are applicable
  const getEmailProviderUrl = () => {
    const domain = (email.split('@')[1] || '').toLowerCase();
    if (domain.includes('gmail')) return 'https://mail.google.com';
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
      return 'https://outlook.live.com';
    }
    if (domain.includes('yahoo')) return 'https://mail.yahoo.com';
    return null;
  };

  const providerUrl = getEmailProviderUrl();

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-7 bg-gradient-to-b from-[#070b14] via-[#091122] to-[#070b14] text-white">
      {/* Top Brand Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            V
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base">VENUE</span>
            <span className="text-[10px] text-blue-400 font-mono tracking-widest block uppercase">
              Identity Verification
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="my-auto max-w-md w-full mx-auto py-6">
        {/* Animated Badge */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center shadow-xl shadow-blue-500/10">
              <Mail className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Verify Your Email
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Please verify your student email address with <span className="text-blue-300 font-medium">Firebase Authentication</span> to confirm and activate your account.
          </p>
        </div>

        {/* Registered Email Card */}
        <div className="mb-6 p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Inbox className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="truncate">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Registered Student Email
                </div>
                <div className="text-white font-mono text-sm font-semibold truncate">
                  {email || 'Your registered email'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              title="Copy email address"
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
            >
              {copiedEmail ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {providerUrl && (
            <div className="mt-3 pt-3 border-t border-blue-900/40 flex justify-end">
              <a
                href={providerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <span>Open Webmail Inbox</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Feedback / Status Alert */}
        {statusMessage && (
          <div
            className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'warning'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="mb-6 p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Next Steps:
          </div>
          <ol className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <span>Open the confirmation message from Firebase in your inbox.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <span>Click the secure verification link inside the email.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <span>Return here and tap <strong className="text-white">"I've Verified My Email"</strong> below.</span>
            </li>
          </ol>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Emails usually arrive in 1-2 minutes. Be sure to check your Spam folder.</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          {/* Primary Action: Refresh / Check Verification */}
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking Firebase Status...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-blue-200" />
                <span>I've Verified My Email</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>

          {/* Secondary Action: Resend Verification Email with Cooldown */}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="w-full py-3 px-4 rounded-xl font-medium text-xs border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Verification Link...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Resend available in {cooldown}s</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>

          {/* Fallback helper for preview testing when Firebase Console toggle is pending */}
          {!auth.currentUser && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  markPreviewEmailVerified();
                  setStatusMessage({
                    type: 'success',
                    text: 'Preview verification recorded! Directing you to account setup...',
                  });
                  setTimeout(() => {
                    onVerified();
                  }, 1000);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-400 underline decoration-slate-600 transition-colors"
              >
                (Testing in preview? Click here to mark verified)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Note */}
      <div className="pt-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
        Signed up with the wrong email?{' '}
        <button
          type="button"
          onClick={handleLogoutClick}
          className="text-blue-400 hover:text-blue-300 underline font-medium ml-1 transition-colors"
        >
          Create account with different email
        </button>
      </div>
    </div>
  );
};
