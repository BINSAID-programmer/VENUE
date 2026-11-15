import React from 'react';
import { FIGURES } from '../../data/learnFigures';

/** A drawing from learnFigures.ts. Fixed colours, so every theme shows it the same way. */
export const Figure: React.FC<{ name: string }> = ({ name }) => {
  const f = FIGURES[name];
  if (!f) return null;
  return (
    <figure data-no-guard="1" style={{ margin: 0, background: '#0f172a', border: '1px solid #26304f', borderRadius: 16, overflow: 'hidden' }}>
      <div dangerouslySetInnerHTML={{ __html: f.svg }} />
      <figcaption style={{ color: '#94a3b8', background: '#111833', fontSize: 11, lineHeight: '16px', padding: '8px 12px' }}>{f.caption}</figcaption>
    </figure>
  );
};

/** A simple table that works on a phone: scrolls sideways if it is wide. */
export const LearnTable: React.FC<{ head: string[]; rows: string[][] }> = ({ head, rows }) => (
  <div data-no-guard="1" style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #26304f', background: '#0f172a' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} style={{ textAlign: 'left', color: '#e2e8f0', background: '#1e293b', padding: '8px 10px', fontWeight: 800, whiteSpace: 'nowrap' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderTop: '1px solid #26304f' }}>
            {r.map((c, j) => (
              <td key={j} style={{ color: j === 0 ? '#e2e8f0' : '#cbd5e1', fontWeight: j === 0 ? 700 : 400, padding: '8px 10px', verticalAlign: 'top', lineHeight: '17px', minWidth: j === 0 ? 90 : 120 }}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Numbered hands-on steps. */
export const Steps: React.FC<{ items: string[] }> = ({ items }) => (
  <ol data-no-guard="1" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
    {items.map((t, i) => (
      <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#0f172a', border: '1px solid #26304f', borderRadius: 12, padding: '8px 10px' }}>
        <span style={{ flex: '0 0 auto', width: 22, height: 22, borderRadius: 11, background: '#fbbf24', color: '#0f172a', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
        <span style={{ color: '#e2e8f0', fontSize: 13, lineHeight: '19px' }}>{t}</span>
      </li>
    ))}
  </ol>
);

/** YouTube video that costs no data until the learner taps it. */
export const VideoCard: React.FC<{ id: string; title: string; by: string }> = ({ id, title, by }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div data-no-guard="1" style={{ background: '#0f172a', border: '1px solid #26304f', borderRadius: 16, overflow: 'hidden' }}>
      {open ? (
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            title={title}
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Play video: ${title}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: '16 / 9', background: 'linear-gradient(135deg,#1e293b,#0b1220)', border: 0, cursor: 'pointer' }}
        >
          <span style={{ width: 58, height: 58, borderRadius: 29, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ marginLeft: 4, borderLeft: '18px solid #ffffff', borderTop: '11px solid transparent', borderBottom: '11px solid transparent' }} />
          </span>
        </button>
      )}
      <div style={{ padding: '8px 12px', background: '#111833' }}>
        <p style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700, margin: 0 }}>{title}</p>
        <p style={{ color: '#94a3b8', fontSize: 11, margin: '2px 0 0' }}>
          {by} · tap to play (uses data only when played) ·{' '}
          <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>
            open on YouTube
          </a>
        </p>
      </div>
    </div>
  );
};
