import type { LearnLesson } from './learnLessons';
import { HTML_A } from './learnHtmlA';
import { HTML_B } from './learnHtmlB';

const CHAPTERS: Array<{ title: string; ids: string[] }> = [
  { title: '1. Getting Started', ids: ['intro', 'basic'] },
  { title: '2. Text and Characters', ids: ['text'] },
  { title: '3. Links, Images and Media', ids: ['links', 'images', 'media'] },
  { title: '4. Lists and Tables', ids: ['lists', 'tables'] },
  { title: '5. Forms', ids: ['forms1', 'forms2'] },
  { title: '6. Structure and Good Practice', ids: ['semantic', 'attrs', 'seo'] },
  { title: '7. Project', ids: ['project'] },
];

const byId: Record<string, LearnLesson> = {};
for (const l of [...HTML_A, ...HTML_B]) byId[l.id.replace(/^html-/, '')] = l;

export const HTML_LESSONS: LearnLesson[] = CHAPTERS.flatMap((c) =>
  c.ids.map((id) => {
    const l = byId[id];
    if (!l) throw new Error('Missing HTML lesson: ' + id);
    return { ...l, chapter: c.title };
  })
);
