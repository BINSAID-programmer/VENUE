import React, { useEffect, useState } from 'react';
import { sponsorService, SponsorPublic } from '../../services/sponsorService';
import { premiumService } from '../../services/premiumService';

/** Sponsor banner on Home. Hidden for Premium subscribers and when there are no live sponsors. */
export const SponsorBanner: React.FC = () => {
  const [items, setItems] = useState<SponsorPublic[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const status = await premiumService.getStatus().catch(() => null);
      if (status?.isPremium) return;
      const list = await sponsorService.list();
      if (alive) setItems(list);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const s = items[index % items.length];

  const open = () => {
    if (!s.linkUrl) return;
    sponsorService.trackClick(s.id);
    window.open(s.linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section aria-label="Sponsored" className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Sponsored</p>
      <div
        onClick={open}
        className={`rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/70 ${s.linkUrl ? 'cursor-pointer' : ''}`}
      >
        {s.imageData && <img src={s.imageData} alt={s.title || s.name} className="w-full max-h-40 object-cover" loading="lazy" />}
        {(s.title || s.text) && (
          <div className="p-3">
            {s.title && <p className="text-sm font-bold text-white">{s.title}</p>}
            {s.text && <p className="text-xs text-slate-300 mt-0.5">{s.text}</p>}
            <p className="text-[10px] text-slate-500 mt-1">{s.name}</p>
          </div>
        )}
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-1 pt-0.5">
          {items.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index % items.length ? 'bg-slate-300' : 'bg-slate-700'}`} />
          ))}
        </div>
      )}
    </section>
  );
};
