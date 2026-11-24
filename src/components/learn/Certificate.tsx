import React, { useEffect, useRef, useState } from 'react';
import { Award, Download, X } from 'lucide-react';

const NAME_KEY = 'venue_cert_name_v1';
const W = 1600;
const H = 1130;

function certId(name: string, track: string, date: string): string {
  let h = 5381;
  const s = `${name}|${track}|${date}`;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return `VNU-${h.toString(36).toUpperCase().padStart(7, '0')}`;
}

function draw(c: HTMLCanvasElement, name: string, track: string, lessons: number, date: string) {
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#0f172a';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#fbbf24';
  g.lineWidth = 8;
  g.strokeRect(40, 40, W - 80, H - 80);
  g.strokeStyle = '#60a5fa';
  g.lineWidth = 2;
  g.strokeRect(62, 62, W - 124, H - 124);
  g.textAlign = 'center';
  g.fillStyle = '#60a5fa';
  g.font = '700 34px system-ui, sans-serif';
  g.fillText('VENUE  ·  YOUR ACADEMIC SPACE', W / 2, 160);
  g.fillStyle = '#f8fafc';
  g.font = '800 84px Georgia, serif';
  g.fillText('Certificate of Completion', W / 2, 300);
  g.fillStyle = '#94a3b8';
  g.font = '400 36px system-ui, sans-serif';
  g.fillText('This certifies that', W / 2, 400);
  let size = 110;
  g.fillStyle = '#fbbf24';
  do {
    g.font = `italic 700 ${size}px Georgia, serif`;
    size -= 4;
  } while (g.measureText(name).width > W - 300 && size > 40);
  g.fillText(name, W / 2, 540);
  g.strokeStyle = '#475569';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(300, 580);
  g.lineTo(W - 300, 580);
  g.stroke();
  g.fillStyle = '#94a3b8';
  g.font = '400 36px system-ui, sans-serif';
  g.fillText('has completed all lessons of the course', W / 2, 660);
  g.fillStyle = '#34d399';
  g.font = '800 70px system-ui, sans-serif';
  g.fillText(track, W / 2, 770);
  g.fillStyle = '#cbd5e1';
  g.font = '400 32px system-ui, sans-serif';
  g.fillText(`${lessons} lessons with quizzes and exercises`, W / 2, 830);
  g.textAlign = 'left';
  g.fillStyle = '#e2e8f0';
  g.font = '600 30px system-ui, sans-serif';
  g.fillText(`Date: ${date}`, 130, 980);
  g.textAlign = 'right';
  g.fillText(`Certificate no: ${certId(name, track, date)}`, W - 130, 980);
  g.textAlign = 'center';
  g.fillStyle = '#64748b';
  g.font = '400 24px system-ui, sans-serif';
  g.fillText('A VENUE learning certificate for personal progress. It is not an accredited university qualification.', W / 2, 1050);
}

export const CertificateModal: React.FC<{ track: string; lessons: number; onClose: () => void }> = ({ track, lessons, onClose }) => {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const ref = useRef<HTMLCanvasElement>(null);
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const shown = name.trim() || 'Your Name';

  useEffect(() => {
    if (ref.current) draw(ref.current, shown, track, lessons, date);
  }, [shown, track, lessons, date]);

  const download = () => {
    const c = ref.current;
    if (!c || !name.trim()) return;
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* ignore */
    }
    c.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VENUE-certificate-${track.replace(/\s+/g, '-')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" /> Your certificate
          </p>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg bg-slate-800 text-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <canvas ref={ref} width={W} height={H} className="w-full rounded-lg border border-slate-800" />
        <label className="block text-[11px] font-bold text-slate-400">
          Full name on the certificate
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            placeholder="Type your full name"
            className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-blue-500"
          />
        </label>
        <button
          onClick={download}
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Download certificate (PNG)
        </button>
      </div>
    </div>
  );
};
