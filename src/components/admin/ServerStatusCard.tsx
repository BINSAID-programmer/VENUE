import React, { useCallback, useEffect, useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface Health {
  status?: string;
  hasGeminiKey?: boolean;
  firebaseAdminReady?: boolean;
  persistence?: { mode?: string; reason?: string; pausedStores?: string[]; lastError?: string | null };
  features?: { premium?: boolean; tutorLimits?: boolean; uptimeSeconds?: number };
}

type Level = 'ok' | 'warn' | 'bad';

function Row({ level, title, detail }: { level: Level; title: string; detail: string }) {
  const Icon = level === 'ok' ? CheckCircle2 : level === 'warn' ? AlertTriangle : XCircle;
  const color = level === 'ok' ? 'text-emerald-400' : level === 'warn' ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-800/70 last:border-0">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-white">{title}</p>
        <p className="text-[11px] text-slate-400 leading-relaxed break-words">{detail}</p>
      </div>
    </div>
  );
}

/** Owner-only: one-tap check of the live server (Render) so problems are visible without a browser. */
export function ServerStatusCard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [failed, setFailed] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed('');
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.includes('json')) {
        throw new Error(`Server answered ${res.status}${type.includes('json') ? '' : ' (not the VENUE server)'}`);
      }
      setHealth(await res.json());
    } catch (e: any) {
      setHealth(null);
      setFailed(e?.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mode = health?.persistence?.mode;
  const paused = health?.persistence?.pausedStores || [];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Server status</h3>
        </div>
        <button type="button" onClick={load} aria-label="Refresh" className="p-1.5 text-slate-400 cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {failed && (
        <Row
          level="bad"
          title="Server not reachable"
          detail={`${failed}. On Render, open the service and check that the latest deploy finished, then tap refresh. A free server can take about a minute to wake up.`}
        />
      )}

      {health && (
        <>
          <Row level="ok" title="Server is running" detail={`Up for ${Math.round((health.features?.uptimeSeconds || 0) / 60)} minutes.`} />
          <Row
            level={health.features?.premium ? 'ok' : 'warn'}
            title="Latest version"
            detail={
              health.features?.premium
                ? 'Premium and AI limits are active on this server.'
                : 'This server is still on an old version. On Render choose Manual Deploy → Deploy latest commit.'
            }
          />
          <Row
            level={mode === 'firestore' && paused.length === 0 ? 'ok' : mode === 'firestore' ? 'warn' : 'bad'}
            title="Saved data (Firestore link)"
            detail={
              mode === 'firestore'
                ? paused.length === 0
                  ? 'Connected. Profiles, payments and uploaded files survive restarts.'
                  : `Connected, but these stores are paused: ${paused.join(', ')}.`
                : `Not connected — data and uploaded files are lost whenever Render restarts. Add FIREBASE_SERVICE_ACCOUNT_JSON in Render → Environment. ${health.persistence?.reason || ''}`
            }
          />
          {health.persistence?.lastError && (
            <Row level="warn" title="Last save error" detail={String(health.persistence.lastError)} />
          )}
          <Row
            level={health.hasGeminiKey ? 'ok' : 'bad'}
            title="AI key (Gemini)"
            detail={health.hasGeminiKey ? 'Set.' : 'Missing — the AI Tutor cannot answer. Add GEMINI_API_KEY in Render → Environment.'}
          />
          <Row
            level={health.firebaseAdminReady ? 'ok' : 'warn'}
            title="Sign-in verification"
            detail={health.firebaseAdminReady ? 'Server can verify student sign-ins.' : 'Server could not start Firebase Admin; some protected features may fail.'}
          />
        </>
      )}
    </section>
  );
}
