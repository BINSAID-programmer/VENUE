import React, { useCallback, useEffect, useState } from 'react';
import { Crown, X, Check, Copy, Sparkles, Download, Bot, Compass, Clock, ShieldCheck, MessageCircle, Infinity as InfinityIcon, Minus } from 'lucide-react';
import { premiumService, PremiumStatus, PlanInfo, PlanId } from '../../services/premiumService';

/** Defined at module level so inputs inside a step keep focus while typing. */
const Step = ({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) => (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm font-bold text-white">{title}</p>
        {children}
      </div>
    </div>
);

/**
 * Global Premium sheet: plan, how to pay (mobile money), submit the transaction ID,
 * and request status. Opens from anywhere via premiumService.openPremium().
 */
export default function PremiumHost() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [kind, setKind] = useState<'premium' | 'download_pack'>('premium');
  const [plan, setPlan] = useState<PlanId>('month');
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

  const plans: PlanInfo[] = status?.plans?.length
    ? status.plans
    : [
        { id: 'day', label: 'Day', days: 1, priceTzs: 300, downloads: 2 },
        { id: 'week', label: 'Week', days: 7, priceTzs: 800, downloads: 3 },
        { id: 'month', label: 'Month', days: 30, priceTzs: 1500, downloads: 5 },
        { id: 'semester', label: 'Semester (4 months)', days: 120, priceTzs: 4500, downloads: 20 },
      ];
  const selectedPlan = plans.find((p) => p.id === plan) || plans[2] || plans[0];
  const price = selectedPlan.priceTzs;
  const number = status?.paymentNumber || '255795995278';
  const display = '0' + number.replace(/^255/, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  const isPremium = Boolean(status?.isPremium);
  const pendingKinds = (status?.pending || []).map((p) => p.kind);
  const until = status?.premiumUntil ? new Date(status.premiumUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await premiumService.submitRequest(kind, reference, phone, kind === 'premium' ? plan : undefined);
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
  const dayPrice = plans.find((p) => p.id === 'day')?.priceTzs ?? 300;
  const perDay = (p: PlanInfo) => Math.max(1, Math.round(p.priceTzs / Math.max(1, p.days)));
  const savePct = (p: PlanInfo) => (p.days > 1 ? Math.round((1 - p.priceTzs / (dayPrice * p.days)) * 100) : 0);
  const daysLeft = status?.premiumUntil ? Math.max(0, Math.ceil((new Date(status.premiumUntil).getTime() - Date.now()) / 86400000)) : 0;
  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const supportHref = 'https://wa.me/255759974073?text=' + encodeURIComponent('Hello VENUE, I need help with Premium payment.');
  const inputCls = 'w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500/60';
  const rows: Array<{ icon: React.ReactNode; label: string; free: React.ReactNode; pro: React.ReactNode }> = [
    { icon: <Bot className="w-4 h-4 text-sky-400" />, label: 'AI Tutor', free: `${status?.aiDailyLimit ?? 10} / day`, pro: <InfinityIcon className="w-4 h-4 inline" /> },
    { icon: <Download className="w-4 h-4 text-amber-400" />, label: 'Original file downloads', free: <Minus className="w-4 h-4 inline text-slate-600" />, pro: `${selectedPlan.downloads}+` },
    { icon: <Compass className="w-4 h-4 text-emerald-400" />, label: 'Career paths', free: `${status?.freeCareerPaths ?? 3}`, pro: 'All' },
    { icon: <Sparkles className="w-4 h-4 text-violet-400" />, label: 'AI Career Advisor', free: <Minus className="w-4 h-4 inline text-slate-600" />, pro: <Check className="w-4 h-4 inline" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain p-3"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md my-4 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-5 pb-6 bg-gradient-to-br from-amber-500/25 via-slate-900 to-blue-950/70 border-b border-slate-800">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute top-3 right-3 p-1.5 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white leading-tight">VENUE Premium</h3>
          <p className="text-sm text-slate-300 mt-1">Study without limits. Pay only for the days you need, from TZS {Math.min(...plans.map((p) => p.priceTzs)).toLocaleString()}.</p>
        </div>

        <div className="p-5 space-y-5">
          {notice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">{notice}</div>
          )}

          {isPremium && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-emerald-300 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Premium is active</p>
                <span className="text-xs font-bold text-emerald-200">{daysLeft} day{daysLeft === 1 ? '' : 's'} left</span>
              </div>
              <p className="text-[11px] text-emerald-100/80">{until ? `Until ${until}. ` : ''}
                {(status?.downloadsAllowed ?? 0) >= 9999 ? 'Downloads: unlimited.' : `Downloads left: ${status?.downloadsLeft ?? 0} of ${status?.downloadsAllowed ?? 5}.`}
              </p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">What you get</p>
            <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
              <div className="grid grid-cols-[1fr_64px_64px] bg-slate-950 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span />
                <span className="text-center">Free</span>
                <span className="text-center text-amber-300">Premium</span>
              </div>
              {rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[1fr_64px_64px] items-center px-3 py-2.5 border-t border-slate-800">
                  <span className="flex items-center gap-2 text-slate-200">{r.icon}{r.label}</span>
                  <span className="text-center text-slate-400">{r.free}</span>
                  <span className="text-center font-bold text-amber-300">{r.pro}</span>
                </div>
              ))}
            </div>
          </div>

          {kind === 'premium' && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Choose a plan</p>
              <div className="space-y-2" role="radiogroup" aria-label="Plan">
                {plans.map((p) => {
                  const on = plan === p.id;
                  const save = savePct(p);
                  const badge = p.id === 'month' ? 'Most popular' : p.id === 'semester' ? 'Best value' : '';
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setPlan(p.id)}
                      className={`relative w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left cursor-pointer ${on ? 'bg-amber-500/15 border-amber-400/70' : 'bg-slate-950 border-slate-800'}`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? 'border-amber-400 bg-amber-400' : 'border-slate-600'}`}>
                        {on && <Check className="w-3 h-3 text-slate-950" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{p.label}</span>
                          {badge && <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">{badge}</span>}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {p.days === 1 ? '24 hours' : `${p.days} days`} · {p.downloads} downloads · TZS {perDay(p).toLocaleString()}/day
                        </span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="block text-base font-extrabold text-white">TZS {p.priceTzs.toLocaleString()}</span>
                        {save > 0 && <span className="block text-[10px] font-bold text-emerald-400">Save {save}%</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How to pay</p>
            {isPremium && (
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['premium', 'Buy / extend plan'],
                  ['download_pack', `+${status?.downloadPackSize ?? 5} downloads`],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${kind === k ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <Step n={1} title={`Send TZS ${amount.toLocaleString()}`}>
              <p className="text-xs text-slate-400">Use M-Pesa, Tigo Pesa or Airtel Money.</p>
              <button type="button" onClick={copyNumber} className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer">
                <span className="text-base font-extrabold text-white tracking-wide">{display}</span>
                <span className="text-[11px] text-sky-300 flex items-center gap-1">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
            </Step>
            <Step n={2} title="Enter your payment details">
              <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID (from the SMS)" autoCapitalize="characters" className={inputCls} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number you paid from" inputMode="tel" className={inputCls} />
            </Step>
            <Step n={3} title="Send the request">
              <p className="text-xs text-slate-400">We check the payment and activate your plan. You can follow the status below.</p>
              {error && <p className="text-xs text-rose-300">{error}</p>}
              {done && <p className="text-xs text-emerald-300">{done}</p>}
              <button
                type="button"
                disabled={busy || !reference.trim() || !phone.trim() || pendingKinds.includes(kind)}
                onClick={submit}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {busy ? 'Sending...' : pendingKinds.includes(kind) ? 'Waiting for approval' : `I have paid TZS ${amount.toLocaleString()}`}
              </button>
            </Step>
          </div>

          {[...(status?.pending || []), ...(status?.recent || [])].length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your requests</p>
              {[...(status?.pending || []), ...(status?.recent || [])].map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 text-xs px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="min-w-0">
                    <span className="block text-slate-200 font-semibold truncate">
                      {r.kind === 'premium' ? `Premium ${plans.find((p) => p.id === (r.plan || 'month'))?.label || 'month'}` : 'Extra downloads'}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">{r.reference}{r.createdAt ? ` · ${fmtDate(r.createdAt)}` : ''}</span>
                  </span>
                  <span className={`font-bold flex items-center gap-1 shrink-0 ${r.status === 'approved' ? 'text-emerald-400' : r.status === 'rejected' ? 'text-rose-400' : 'text-amber-300'}`}>
                    {r.status === 'pending' && <Clock className="w-3 h-3" />}
                    {r.status === 'pending' ? 'Pending' : r.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" /> Problem with payment? Chat with support
          </a>
        </div>
      </div>
    </div>
  );
}
