// [TEMPORARY STAGE 1 DIAGNOSTIC PANEL — REMOVE AFTER VERIFICATION]
import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, ChevronUp, ChevronDown, AlertCircle, UserX } from 'lucide-react';
import { auth } from '../services/firebase';
import { verifyCurrentSessionWhoAmI, WhoAmIDiagnosticResult } from '../services/apiClient';

export const TempAuthDiagnosticPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSignedOutWarning, setClientSignedOutWarning] = useState(false);
  const [result, setResult] = useState<WhoAmIDiagnosticResult | null>(null);

  const handleRunDiagnostic = async () => {
    setLoading(true);
    setClientSignedOutWarning(!auth.currentUser);
    try {
      const res = await verifyCurrentSessionWhoAmI();
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const renderErrorStateMessage = (res: WhoAmIDiagnosticResult): string | null => {
    if (res.authenticated && res.status === 200) return null;
    if (res.status === 0) {
      return res.error || 'Network error: Unable to reach /api/auth/whoami.';
    }
    if (res.status === 401) {
      return clientSignedOutWarning
        ? 'No Firebase user is currently signed in on this browser (401 Unauthorized).'
        : res.message || '401 Unauthorized: Missing or invalid Firebase ID token.';
    }
    if (res.status >= 500) {
      return res.message || `Server error (${res.status}) verifying session.`;
    }
    return res.message || res.error || `Request failed with HTTP ${res.status}.`;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-3 z-50">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (!result && !loading) {
              handleRunDiagnostic();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/95 text-indigo-300 border border-indigo-500/40 shadow-lg text-xs font-semibold tracking-tight active:scale-95 transition cursor-pointer"
          title="Temporary Stage 1 Auth Check"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Auth Check</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  const errorMessage = result ? renderErrorStateMessage(result) : null;

  return (
    <div className="fixed bottom-20 right-3 left-3 sm:left-auto sm:w-80 z-50 bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl text-xs text-slate-200 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Stage 1 Auth Diagnostic (Temp)</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Minimize diagnostic panel"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            Endpoint: <code className="text-slate-300">/api/auth/whoami</code>
          </span>
          <button
            type="button"
            onClick={handleRunDiagnostic}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-[11px] transition cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Checking...' : 'Run Check'}</span>
          </button>
        </div>

        {loading && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
            Verifying current Firebase session with backend...
          </div>
        )}

        {!loading && result && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">HTTP Status:</span>
              <span
                className={
                  result.status === 200
                    ? 'text-emerald-400 font-bold'
                    : 'text-amber-400 font-bold'
                }
              >
                {result.status === 0 ? 'NETWORK_ERR' : result.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Authenticated:</span>
              <span
                className={
                  result.authenticated
                    ? 'text-emerald-400 font-bold'
                    : 'text-rose-400 font-bold'
                }
              >
                {String(Boolean(result.authenticated))}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 shrink-0">Verified UID:</span>
              <span className="text-slate-200 truncate" title={result.uid || '—'}>
                {result.uid || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Resolved Role:</span>
              <span className="text-indigo-300 font-semibold">
                {result.role || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">isOwner:</span>
              <span
                className={
                  result.isOwner
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-300'
                }
              >
                {result.authenticated ? String(Boolean(result.isOwner)) : 'false'}
              </span>
            </div>

            {errorMessage && (
              <div className="pt-1.5 mt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-rose-300 font-sans">
                {clientSignedOutWarning ? (
                  <UserX className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
