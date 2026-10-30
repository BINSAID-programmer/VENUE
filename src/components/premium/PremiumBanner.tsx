import React, { useEffect, useState } from 'react';
import { Crown, ChevronRight } from 'lucide-react';
import { premiumService, PremiumStatus } from '../../services/premiumService';

/** Home banner: invites free students to get Premium, shows status for Premium students. */
export default function PremiumBanner() {
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    premiumService.getStatus().then((s) => {
      if (!alive) return;
      setStatus(s);
      setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!checked) return null;

  // Server could not be reached (or is still updating): still show the offer.
  if (!status) {
    return (
      <button
        type="button"
        onClick={() => premiumService.openPremium()}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-left cursor-pointer"
      >
        <Crown className="w-6 h-6 text-amber-400 shrink-0" />
        <span className="flex-1 text-xs text-amber-100 leading-relaxed">
          <b className="text-sm text-white">Get VENUE Premium · TZS 1,500/month</b>
          <br />
          Unlimited AI Tutor, file downloads and all career paths.
        </span>
        <ChevronRight className="w-4 h-4 text-amber-300" />
      </button>
    );
  }

  if (status.isPremium) {
    const until = status.premiumUntil ? new Date(status.premiumUntil).toLocaleDateString() : '';
    return (
      <button
        type="button"
        onClick={() => premiumService.openPremium()}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left cursor-pointer"
      >
        <Crown className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="flex-1 text-xs text-emerald-100">
          <b>Premium active{until ? ` until ${until}` : ''}</b>
          <br />
          {status.downloadsLeft} download{status.downloadsLeft === 1 ? '' : 's'} left this month
        </span>
        <ChevronRight className="w-4 h-4 text-emerald-300" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => premiumService.openPremium()}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-left cursor-pointer"
    >
      <Crown className="w-6 h-6 text-amber-400 shrink-0" />
      <span className="flex-1 text-xs text-amber-100 leading-relaxed">
        <b className="text-sm text-white">Get VENUE Premium · TZS {status.priceTzs.toLocaleString()}/month</b>
        <br />
        Unlimited AI Tutor, file downloads and all career paths.
        {status.aiRemainingToday !== null && ` Free AI left today: ${status.aiRemainingToday}.`}
      </span>
      <ChevronRight className="w-4 h-4 text-amber-300" />
    </button>
  );
}
