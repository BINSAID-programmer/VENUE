import type { LearnLesson } from './learnLessons';

type Sec = { h: string; p: string[]; code?: string; note?: string; explain?: string[] };
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

