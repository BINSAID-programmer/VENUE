/**
 * Page-aware helpers for the AI Tutor. Pure functions (no I/O) so they can be tested on their own.
 * They let a student say "explain page 40", "pages 12-14", "ukurasa wa 7" or "chapter 3 of my notes" and let the
 * tutor answer from the lecturer's own material instead of general knowledge.
 */

export interface PageChunk {
  pageNumber?: number;
  sectionIndex: number;
  text: string;
}

export interface PageReference {
  pages: number[];
  /** true when the student asked about the whole file ("summarise these notes", "what is in this PDF") */
  wholeDocument: boolean;
  /** chapter / section number such as "3" or "2.4" */
  section?: string;
}

const MAX_PAGES_PER_REQUEST = 6;

const PAGE_WORDS = '(?:pages?|pgs?|pp|p\\.|ukurasa(?:\\s+wa)?|kurasa(?:\\s+za)?|uk\\.?|slides?|slaidi)';
const PAGE_RE = new RegExp(
  `\\b${PAGE_WORDS}\\s*(?:no\\.?|number|namba|#)?\\s*(\\d{1,4})(?:\\s*(?:-|–|—|to|hadi|mpaka|through)\\s*(?:page\\s*)?(\\d{1,4}))?`,
  'gi'
);
const PAGE_LIST_TAIL_RE = /^\s*(?:,|and|na|&)\s*(\d{1,4})/i;

/** Finds page numbers in a message. Understands English and Kiswahili ("pages 40-42", "ukurasa wa 7 na 9"). */
export function parsePageReference(message: string): PageReference {
  const text = String(message || '');
  const pages: number[] = [];
  let m: RegExpExecArray | null;
  PAGE_RE.lastIndex = 0;
  while ((m = PAGE_RE.exec(text)) !== null) {
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : NaN;
    if (!Number.isFinite(a) || a < 1) continue;
    if (Number.isFinite(b) && b >= a) {
      for (let p = a; p <= Math.min(b, a + MAX_PAGES_PER_REQUEST - 1); p++) pages.push(p);
    } else {
      pages.push(a);
      // "pages 7, 9 and 12"
      let rest = text.slice(m.index + m[0].length);
      let tail: RegExpMatchArray | null;
      while ((tail = rest.match(PAGE_LIST_TAIL_RE))) {
        pages.push(parseInt(tail[1], 10));
        rest = rest.slice(tail[0].length);
      }
    }
  }
  const unique = Array.from(new Set(pages)).filter((p) => p >= 1 && p <= 5000).slice(0, MAX_PAGES_PER_REQUEST);

  const sectionMatch = text.match(/\b(?:chapter|sura(?:\s+ya)?|section|sehemu(?:\s+ya)?|topic\s+no\.?)\s*(\d{1,2}(?:\.\d{1,2}){0,2})\b/i);
  const wholeDocument =
    /\b(?:this|these|the|my|our)\s+(?:notes|material|materials|document|pdf|handout|lecture|slides|file|book|module)\b/i.test(text) ||
    /\b(?:notes|pdf|document|handout)\s+(?:hizi|hii|zangu|yangu|hii)\b/i.test(text) ||
    /\b(?:hizi|hii)\s+(?:notes|pdf|document|handout|slides)\b/i.test(text) ||
    /\b(?:muhtasari|yaliyomo|kinahusu|inahusu\s+nini)\b/i.test(text) ||
    /\b(?:table\s+of\s+contents|what\s+is\s+(?:in|covered)|what\s+does\s+(?:it|this)\s+cover|outline)\b/i.test(text);

  return { pages: unique, wholeDocument, section: sectionMatch ? sectionMatch[1] : undefined };
}

/** Removes the overlap that chunking repeats between neighbouring chunks of the same page. */
function joinWithoutOverlap(parts: string[]): string {
  let out = '';
  for (const raw of parts) {
    const next = raw.trim();
    if (!next) continue;
    if (!out) {
      out = next;
      continue;
    }
    let cut = 0;
    const max = Math.min(260, out.length, next.length);
    for (let k = max; k >= 25; k--) {
      if (out.endsWith(next.slice(0, k))) {
        cut = k;
        break;
      }
    }
    out += (cut ? '' : '\n') + next.slice(cut);
  }
  return out;
}

/** Full text of one page, rebuilt from its chunks. Empty string when the page has no extractable text. */
export function getPageText(chunks: PageChunk[], page: number): string {
  const parts = chunks
    .filter((c) => c.pageNumber === page)
    .sort((a, b) => a.sectionIndex - b.sectionIndex)
    .map((c) => c.text);
  return joinWithoutOverlap(parts);
}

export interface PageRead {
  page: number;
  text: string;
  /** true when the page exists in the file but no text could be extracted (scan, picture, drawing) */
  empty: boolean;
  /** true when the requested page is beyond the end of the file */
  outOfRange: boolean;
}

export function readRequestedPages(
  chunks: PageChunk[],
  totalPages: number | undefined,
  pages: number[],
  maxCharsPerPage = 6000,
  maxTotalChars = 15000
): PageRead[] {
  const reads: PageRead[] = [];
  let used = 0;
  for (const page of pages) {
    const outOfRange = Boolean(totalPages && page > totalPages);
    let text = outOfRange ? '' : getPageText(chunks, page);
    if (text.length > maxCharsPerPage) text = text.slice(0, maxCharsPerPage) + ' …';
    if (used + text.length > maxTotalChars) text = text.slice(0, Math.max(0, maxTotalChars - used));
    used += text.length;
    reads.push({ page, text, empty: !outOfRange && text.trim().length < 20, outOfRange });
  }
  return reads;
}

/** Pages where a chapter / section heading such as "Chapter 3" or "2.4 Sampling" starts. Skips the contents pages. */
export function findSectionStartPages(chunks: PageChunk[], section: string, skipFirstPages = 3): number[] {
  const esc = section.replace(/\./g, '\\.');
  const headingRe = new RegExp(
    `(?:^|\\n)\\s*(?:chapter|sura(?:\\s+ya)?|section|sehemu(?:\\s+ya)?|unit|topic)?\\s*${esc}(?:\\s*[:.)-]|\\s+[A-Z])`,
    'i'
  );
  const hits = new Set<number>();
  for (const c of chunks) {
    const p = c.pageNumber;
    if (!p || p <= skipFirstPages) continue;
    if (headingRe.test(c.text.slice(0, 400))) hits.add(p);
  }
  return Array.from(hits).sort((a, b) => a - b);
}

/** A compact page-by-page outline (first meaningful line of each page) so the tutor knows what the file contains. */
export function buildOutline(chunks: PageChunk[], totalPages: number | undefined, maxChars = 4200): string {
  const firstChunkByPage = new Map<number, string>();
  for (const c of chunks) {
    if (!c.pageNumber) continue;
    const cur = firstChunkByPage.get(c.pageNumber);
    if (cur === undefined) firstChunkByPage.set(c.pageNumber, c.text);
  }
  const lines: string[] = [];
  let used = 0;
  const pages = Array.from(firstChunkByPage.keys()).sort((a, b) => a - b);
  // sample evenly when the file is long
  const budgetLines = Math.floor(maxChars / 70);
  const step = Math.max(1, Math.ceil(pages.length / budgetLines));
  for (let i = 0; i < pages.length; i += step) {
    const p = pages[i];
    const first = (firstChunkByPage.get(p) || '')
      .split('\n')
      .map((s) => s.trim())
      .find((s) => s.length >= 4);
    if (!first) continue;
    const line = `p.${p}: ${first.slice(0, 80)}`;
    if (used + line.length > maxChars) break;
    lines.push(line);
    used += line.length + 1;
  }
  const head = totalPages ? `File has ${totalPages} page(s). Outline (first line per page):\n` : 'Outline (first line per page):\n';
  return head + lines.join('\n');
}

export interface PickableMaterial {
  id: string;
  title?: string;
  fileName?: string;
  courseCode?: string;
  uploaderRole?: string;
  totalPages?: number;
  indexed: boolean;
}

/**
 * Chooses which material the student means. Order of preference:
 * the one named in the message ("lecture 3", a title word) > lecturer uploads > a file long enough to contain the page.
 */
export function pickMaterialForRequest(materials: PickableMaterial[], message: string, pages: number[]): PickableMaterial | null {
  const usable = materials.filter((m) => m.indexed);
  if (usable.length === 0) return null;
  const msg = String(message || '').toLowerCase();
  const maxPage = pages.length ? Math.max(...pages) : 0;
  const numbered = Array.from(msg.matchAll(/\b(lecture|lec|chapter|week|tutorial|assignment|module|unit|part|somo|sura)\s*(\d{1,2})\b/g)).map((m) => `${m[1]}${m[2]}`);

  let best: { m: PickableMaterial; score: number } | null = null;
  for (const m of usable) {
    const hay = `${m.title || ''} ${m.fileName || ''}`.toLowerCase();
    let score = 0;
    for (const w of hay.split(/[^a-z0-9]+/).filter((x) => x.length >= 4)) {
      if (msg.includes(w)) score += 10;
    }
    const hayCompact = hay.replace(/[^a-z0-9]+/g, '');
    for (const n of numbered) {
      if (hayCompact.includes(n)) score += 25;
    }
    if (m.uploaderRole === 'lecturer') score += 6;
    if (maxPage && m.totalPages && m.totalPages >= maxPage) score += 8;
    if (maxPage && m.totalPages && m.totalPages < maxPage) score -= 30;
    if (!best || score > best.score) best = { m, score };
  }
  return best ? best.m : null;
}
