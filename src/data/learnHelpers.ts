import type { LearnLesson, LearnSection } from './learnLessons';

type Sec = LearnSection;
type Extra = Pick<LearnLesson, 'mistakes' | 'exercises' | 'quiz' | 'challenge'>;
export const L = (id: string, title: string, sw: string, task: string, sections: Sec[], extra: Extra = {}): LearnLesson => ({
  ...extra,
  id: `py-${id}`,
  title,
  sw,
  task,
  sections,
  body: sections[0].p,
  code: sections.find((s) => s.code)?.code || '',
});


/** Text lesson (no code): used by the Computer Basics track. Ids look like cb-<id>. */
/** Rotate the options of each quiz question so the right answer is not always first (stable, so it never changes between visits). */
const spread = (id: string, quiz: Extra['quiz']): Extra['quiz'] =>
  quiz?.map((q, i) => {
    const n = q.options.length;
    let h = 7;
    for (const ch of `${id}:${i}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const k = h % n;
    return { ...q, options: [...q.options.slice(k), ...q.options.slice(0, k)], answer: (q.answer - k + n) % n };
  });

export const T = (id: string, title: string, sw: string, task: string, sections: Sec[], extra: Extra = {}): LearnLesson => ({
  ...extra,
  quiz: spread(id, extra.quiz),
  id: `cb-${id}`,
  title,
  sw,
  task,
  sections,
  body: sections[0].p,
  code: '',
});
