// Usage: bun scripts/validate-cb.ts src/data/learnComputerCh02.ts   (checks every exported lesson array)
import { FIGURES } from '../src/data/learnFigures';
const file = process.argv[2];
const mod = await import('../' + file.replace(/^\.?\//, ''));
let bad = 0;
const err = (id: string, m: string) => { bad++; console.log('ERR', id, m); };
let count = 0;
for (const [name, arr] of Object.entries(mod)) {
  if (!Array.isArray(arr)) continue;
  for (const l of arr as any[]) {
    count++;
    const id = l.id;
    if (!/^cb-[a-z0-9-]+$/.test(id || '')) err(id, 'id must look like cb-xxx');
    for (const k of ['title', 'sw', 'task']) if (!l[k] || typeof l[k] !== 'string') err(id, 'missing ' + k);
    const s = l.sections || [];
    if (s.length < 3) err(id, 'needs at least 3 sections');
    s.forEach((x: any, i: number) => {
      if (!x.h) err(id, `section ${i} has no heading`);
      if (!Array.isArray(x.p) || !x.p.length || x.p.some((t: any) => typeof t !== 'string' || t.length < 20)) err(id, `section ${i} paragraphs missing/too short`);
      if (x.fig && !FIGURES[x.fig]) err(id, `section ${i}: unknown fig ${x.fig}`);
      if (x.table) {
        const n = x.table.head.length;
        if (x.table.rows.some((r: string[]) => r.length !== n)) err(id, `section ${i}: table rows must have ${n} cells`);
      }
      if (x.steps && (!Array.isArray(x.steps) || x.steps.length < 2)) err(id, `section ${i}: steps needs 2+ items`);
      if (x.video && !/^[A-Za-z0-9_-]{11}$/.test(x.video.id)) err(id, `section ${i}: bad video id`);
    });
    if ((l.mistakes || []).length < 3) err(id, 'needs 3+ mistakes');
    if ((l.exercises || []).length < 3) err(id, 'needs 3+ exercises');
    (l.exercises || []).forEach((e: any, i: number) => { if (!e.q || !e.a) err(id, `exercise ${i} needs q and a`); });
    const q = l.quiz || [];
    if (q.length < 3) err(id, 'needs 3+ quiz questions');
    q.forEach((x: any, i: number) => {
      if (!x.q || !x.why) err(id, `quiz ${i} needs q and why`);
      if (!Array.isArray(x.options) || x.options.length < 2 || x.options.length > 5) err(id, `quiz ${i}: 2-5 options`);
      else if (!(x.answer >= 0 && x.answer < x.options.length)) err(id, `quiz ${i}: answer index out of range`);
      else if (new Set(x.options).size !== x.options.length) err(id, `quiz ${i}: duplicate options`);
    });
  }
}
console.log(`${count} lessons checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
