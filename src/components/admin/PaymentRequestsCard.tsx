import React, { useCallback, useEffect, useState } from 'react';
import { Crown, Check, X, RefreshCw } from 'lucide-react';
import { premiumService, PaymentRequestItem } from '../../services/premiumService';

/** Owner-only: confirm mobile-money payments and activate Premium / extra downloads. */
export function PaymentRequestsCard() {
  const [items, setItems] = useState<PaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await premiumService.adminListRequests());
    } catch (e: any) {
      setError(e?.message || 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: string, approve: boolean) => {
    setBusyId(id);
    setError('');
    try {
      await premiumService.adminDecide(id, approve);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not save.');
    } finally {
      setBusyId('');
    }
  };

  const pending = items.filter((i) => i.status === 'pending');
  const decided = items.filter((i) => i.status !== 'pending').slice(0, 8);

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Premium payments</h3>
          {pending.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold">
              {pending.length} pending
            </span>
          )}
        </div>
        <button type="button" onClick={load} aria-label="Refresh" className="p-1.5 text-slate-400 cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Check the payment SMS on your phone: the transaction ID and amount must match, then approve.
      </p>

      {error && <p className="text-xs text-rose-300">{error}</p>}
      {!loading && pending.length === 0 && <p className="text-xs text-slate-500">No payments waiting.</p>}

      {pending.map((r) => (
        <div key={r.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{r.name || r.email}</p>
              <p className="text-[11px] text-slate-400 truncate">{r.email}</p>
            </div>
            <span className="text-xs font-extrabold text-amber-300 shrink-0">TZS {r.amountTzs.toLocaleString()}</span>
          </div>
          <div className="text-xs text-slate-300 space-y-0.5">
            <p>
              {r.kind === 'premium' ? 'Premium — 1 month' : 'Extra downloads pack'} · ID <b className="font-mono">{r.reference}</b>
            </p>
            <p>Paid from {r.senderPhone} · {new Date(r.createdAt).toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => decide(r.id, true)}
              className="py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => decide(r.id, false)}
              className="py-2 rounded-lg bg-slate-800 text-rose-300 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        </div>
      ))}

      {decided.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recent</p>
          {decided.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">{r.name || r.email} · {r.reference}</span>
              <span className={r.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
