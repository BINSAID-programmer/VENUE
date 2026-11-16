import type { LearnLesson } from './learnLessons';
import { CSS_A } from './learnCssA';
import { CSS_B } from './learnCssB';

const byId: Record<string, LearnLesson> = {};
for (const l of [...CSS_A, ...CSS_B]) byId[l.id.replace(/^css-/, '')] = l;

const CHAPTERS: Array<{ title: string; ids: string[] }> = [
  { title: '1. Getting Started', ids: ['intro', 'selectors', 'colors'] },
  { title: '2. Text and the Box Model', ids: ['text', 'box', 'sizing'] },
  { title: '3. Layout', ids: ['flex', 'grid', 'position'] },
  { title: '4. Responsive and Effects', ids: ['responsive', 'effects'] },
  { title: '5. Project', ids: ['project'] },
];

export const CSS_LESSONS: LearnLesson[] = CHAPTERS.flatMap((c) =>
  c.ids.map((id) => {
    const l = byId[id];
    if (!l) throw new Error('Missing CSS lesson: ' + id);
    return { ...l, chapter: c.title };
  })
);
