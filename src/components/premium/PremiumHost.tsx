import React, { useCallback, useEffect, useState } from 'react';
import { Crown, X, Check, Copy, Sparkles, Download, Bot, Compass, Clock } from 'lucide-react';
import { premiumService, PremiumStatus } from '../../services/premiumService';

/**
 * Global Premium sheet: plan, how to pay (mobile money), submit the transaction ID,
 * and request status. Opens from anywhere via premiumService.openPremium().
 */
export default function PremiumHost() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [kind, setKind] = useState<'premium' | 'download_pack'>('premium');
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (force = false) => {
    setStatus(await premiumService.getStatus(force));
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setNotice((e as CustomEvent).detail?.message || '');
      setDone('');
      setError('');
      setOpen(true);
      void load(true);
    };
    const onRequired = (e: Event) => {
      setNotice((e as CustomEvent).detail?.message || 'This feature needs VENUE Premium.');
      setDone('');
      setError('');
      setOpen(true);
      void load(true);
    };
    window.addEventListener(premiumService.openEventName, onOpen);
    window.addEventListener('venue:premium-required', onRequired);
    return () => {
      window.removeEventListener(premiumService.openEventName, onOpen);
      window.removeEventListener('venue:premium-required', onRequired);
    };
  }, [load]);

  if (!open) return null;

  const price = status?.priceTzs ?? 1500;
  const number = status?.paymentNumber || '255795995278';
  const display = '0' + number.replace(/^255/, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  const isPremium = Boolean(status?.isPremium);
  const pendingKinds = (status?.pending || []).map((p) => p.kind);
  const until = status?.premiumUntil ? new Date(status.premiumUntil).toLocaleDateString() : '';

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await premiumService.submitRequest(kind, reference, phone);
      setDone('Request sent. We will confirm your payment and activate it shortly.');
      setReference('');
      await load(true);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(display.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const amount = kind === 'premium' ? price : status?.downloadPackPriceTzs ?? 1500;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain p-3"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md my-4 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-gradient-to-br from-amber-500/15 via-slate-900 to-blue-950/60 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">VENUE Premium</h3>
              <p className="text-xs text-amber-300 font-semibold">TZS {price.toLocaleString()} / month</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1.5 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {notice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              {notice}
            </div>
          )}

          {isPremium && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-0.5">
              <p className="font-bold">Premium is active{until ? ` until ${until}` : ''}</p>
              <p>
                Downloads left this month: <b>{status?.downloadsLeft ?? 0}</b> of {status?.downloadsAllowed ?? 5}
              </p>
            </div>
          )}

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex gap-2.5"><Bot className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" /> Unlimited AI Tutor (free plan: {status?.aiDailyLimit ?? 10} requests per day)</li>
            <li className="flex gap-2.5"><Download className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Download original files — 5 per month, buy {status?.downloadPackSize ?? 5} more anytime for TZS {(status?.downloadPackPriceTzs ?? 1500).toLocaleString()}</li>
            <li className="flex gap-2.5"><Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> All career paths and the AI Career Advisor (free plan: {status?.freeCareerPaths ?? 3} paths)</li>
          </ul>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <p className="text-xs font-bold text-white">How to pay</p>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
              <li>Send <b>TZS {amount.toLocaleString()}</b> by M-Pesa, Tigo Pesa or Airtel Money to:</li>
            </ol>
            <button
              type="button"
              onClick={copyNumber}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
            >
              <span className="text-base font-extrabold text-white tracking-wide">{display}</span>
              <span className="text-[11px] text-sky-300 flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
            <p className="text-xs text-slate-300">2. Fill in the details below, so we can confirm your payment.</p>
          </div>

          <div className="space-y-2.5">
            {isPremium && (
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['premium', 'Renew month'],
                  ['download_pack', `+${status?.downloadPackSize ?? 5} downloads`],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      kind === k ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction ID (from the payment SMS)"
              autoCapitalize="characters"
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500/60"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number you paid from"
              inputMode="tel"
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500/60"
            />
            {error && <p className="text-xs text-rose-300">{error}</p>}
            {done && <p className="text-xs text-emerald-300">{done}</p>}
            <button
              type="button"
              disabled={busy || !reference.trim() || !phone.trim() || pendingKinds.includes(kind)}
              onClick={submit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {busy ? 'Sending…' : pendingKinds.includes(kind) ? 'Waiting for approval' : "I've paid — send request"}
            </button>
          </div>

          {[...(status?.pending || []), ...(status?.recent || [])].length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your requests</p>
              {[...(status?.pending || []), ...(status?.recent || [])].map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-300">
                    {r.kind === 'premium' ? 'Premium month' : 'Extra downloads'} · {r.reference}
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      r.status === 'approved' ? 'text-emerald-400' : r.status === 'rejected' ? 'text-rose-400' : 'text-amber-300'
                    }`}
                  >
                    {r.status === 'pending' && <Clock className="w-3 h-3" />}
                    {r.status === 'pending' ? 'Pending' : r.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
