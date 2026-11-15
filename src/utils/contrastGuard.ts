/**
 * Contrast guard — safety net for themes.
 * Many screens use hard-coded Tailwind colours (text-white, text-slate-900 ...).
 * Theme CSS re-maps most of them, but any that slip through can end up with
 * text the same colour as its background. This watches the page and, for any
 * text whose contrast against its real background is too low, switches the
 * text to light or dark (whichever is readable). Overrides are cleared and
 * re-checked whenever the theme or a class changes, so nothing gets stuck.
 */

type RGBA = [number, number, number, number];

const MIN_RATIO = 3;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'PRE', 'CODE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CANVAS', 'IFRAME', 'VIDEO', 'IMG', 'NOSCRIPT']);

function parseColor(value: string): RGBA | null {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
  if (p.length < 3 || p.some((n) => Number.isNaN(n))) return null;
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}

function lum([r, g, b]: RGBA): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: RGBA, b: RGBA): number {
  const l1 = lum(a);
  const l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function over(top: RGBA, bottom: RGBA): RGBA {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
}

/** Real background behind an element, or null when it cannot be known (gradient/image). */
function backgroundOf(el: Element): RGBA | null {
  const layers: RGBA[] = [];
  let node: Element | null = el;
  while (node) {
    const cs = getComputedStyle(node);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
    const c = parseColor(cs.backgroundColor);
    if (c && c[3] > 0) {
      layers.push(c);
      if (c[3] >= 0.99) break;
    }
    node = node.parentElement;
  }
  let base: RGBA = [255, 255, 255, 1];
  const root = getComputedStyle(document.documentElement).backgroundColor;
  const rc = parseColor(root);
  if (rc && rc[3] > 0) base = [rc[0], rc[1], rc[2], 1];
  else {
    const bc = parseColor(getComputedStyle(document.body).backgroundColor);
    if (bc && bc[3] > 0) base = [bc[0], bc[1], bc[2], 1];
    else if (document.documentElement.getAttribute('data-theme') === 'dark') base = [8, 20, 40, 1];
  }
  for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
  return base;
}

const LIGHT: RGBA = [248, 250, 252, 1];
const DARK: RGBA = [15, 23, 42, 1];

function hasOwnContent(el: Element): boolean {
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === 3 && n.textContent && n.textContent.trim()) return true;
    if (n.nodeType === 1 && (n as Element).tagName.toLowerCase() === 'svg') return true;
  }
  return false;
}

function fix(el: HTMLElement) {
  if (el.hasAttribute('data-cg')) {
    const orig = el.getAttribute('data-cg') || '';
    if (orig) el.style.setProperty('color', orig);
    else el.style.removeProperty('color');
    el.removeAttribute('data-cg');
  }
  if (SKIP_TAGS.has(el.tagName) || !hasOwnContent(el)) return;
  if (el.closest('pre, [data-no-guard]')) return;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
  const fg = parseColor(cs.color);
  if (!fg || fg[3] === 0) return;
  const bg = backgroundOf(el);
  if (!bg) return;
  const eff = over(fg, bg);
  if (ratio(eff, bg) >= MIN_RATIO) return;
  const pick = ratio(LIGHT, bg) >= ratio(DARK, bg) ? LIGHT : DARK;
  el.setAttribute('data-cg', el.style.getPropertyValue('color'));
  el.style.setProperty('color', `rgb(${pick[0]}, ${pick[1]}, ${pick[2]})`, 'important');
}

function scan(root: Element) {
  if (root instanceof HTMLElement) fix(root);
  root.querySelectorAll<HTMLElement>('*').forEach(fix);
}

export function installContrastGuard(): void {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
  if ((window as unknown as { __venueCG?: boolean }).__venueCG) return;
  (window as unknown as { __venueCG?: boolean }).__venueCG = true;

  const pending = new Set<Element>();
  let timer: number | undefined;
  let full = false;

  const run = () => {
    timer = undefined;
    try {
      if (full) {
        full = false;
        pending.clear();
        scan(document.body);
        return;
      }
      const items = Array.from(pending);
      pending.clear();
      items.forEach((el) => { if (el.isConnected) scan(el); });
    } catch { /* never break the app */ }
  };
  const queue = (el: Element | null, whole = false) => {
    if (whole) full = true;
    else if (el) pending.add(el);
    if (timer === undefined) timer = window.setTimeout(run, 180);
  };

  const mo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.target === document.documentElement || r.target === document.body) {
        if (r.type === 'attributes') { queue(null, true); continue; }
      }
      if (r.type === 'childList') {
        r.addedNodes.forEach((n) => { if (n.nodeType === 1) queue(n as Element); });
        if (r.target.nodeType === 1) queue(r.target as Element);
      } else if (r.type === 'characterData') {
        const p = (r.target as Node).parentElement;
        if (p) queue(p);
      } else if (r.type === 'attributes') {
        queue(r.target as Element);
      }
    }
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-color-theme'] });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'data-color-theme'] });
  queue(null, true);
}
