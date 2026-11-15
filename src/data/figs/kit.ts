/** Tiny helpers for drawing consistent, theme-proof SVG diagrams (colours are fixed, so every theme shows them the same). */
export const C = {
  bg: '#0f172a', panel: '#1e293b', panel2: '#273449', line: '#64748b', text: '#e2e8f0', mute: '#94a3b8',
  blue: '#60a5fa', green: '#34d399', amber: '#fbbf24', rose: '#fb7185', vio: '#a78bfa', cyan: '#22d3ee', orange: '#fb923c',
};

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface Fig { svg: string; caption: string }

export function svg(w: number, h: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="display:block;max-width:${w * 1.6}px;margin:0 auto" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.mute}"/></marker>
<marker id="ahb" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.blue}"/></marker></defs>
<rect width="${w}" height="${h}" fill="${C.bg}"/>${body}</svg>`;
}

export function txt(x: number, y: number, s: string, o: { fs?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; w?: number } = {}): string {
  const { fs = 11, fill = C.text, anchor = 'middle', w = 600 } = o;
  const lines = s.split('\n');
  const lh = fs * 1.25;
  const y0 = y - ((lines.length - 1) * lh) / 2;
  return `<text x="${x}" y="${y0}" font-size="${fs}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" dominant-baseline="central">${lines
    .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`)
    .join('')}</text>`;
}

export function box(x: number, y: number, w: number, h: number, label: string, color = C.blue, o: { fs?: number; fill?: string; sub?: string; dash?: boolean } = {}): string {
  const { fs = 11, fill = C.panel, sub, dash } = o;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${color}" stroke-width="1.6"${dash ? ' stroke-dasharray="5 4"' : ''}/>`;
  if (sub) {
    out += txt(x + w / 2, y + h / 2 - fs * 0.6, label, { fs, fill: C.text, w: 700 });
    out += txt(x + w / 2, y + h / 2 + fs * 0.9, sub, { fs: fs - 2, fill: C.mute, w: 500 });
  } else out += txt(x + w / 2, y + h / 2, label, { fs, w: 700 });
  return out;
}

export function arrow(x1: number, y1: number, x2: number, y2: number, color = C.mute, dash = false): string {
  const m = color === C.blue ? 'ahb' : 'ah';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.8" marker-end="url(#${m})"${dash ? ' stroke-dasharray="5 4"' : ''}/>`;
}

export function line(x1: number, y1: number, x2: number, y2: number, color = C.line, wd = 1.4): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${wd}"/>`;
}

export function rect(x: number, y: number, w: number, h: number, fill = C.panel, stroke = C.line, r = 6): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
}

export function circle(cx: number, cy: number, r: number, fill = C.panel, stroke = C.line): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
}

/** A dot that travels along an SVG path forever (a tiny "video"). */
export function mover(path: string, dur = 6, color = C.amber, r = 6): string {
  return `<circle r="${r}" fill="${color}"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${path}"/></circle>`;
}

/** Numbered badge. */
export function badge(x: number, y: number, n: number | string, color = C.amber): string {
  return `<circle cx="${x}" cy="${y}" r="10" fill="${color}"/>` + txt(x, y, String(n), { fs: 11, fill: '#0f172a', w: 800 });
}
