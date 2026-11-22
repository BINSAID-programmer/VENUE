import type { LearnLesson } from './learnLessons';
import { JS_A } from './learnJsA';
import { JS_B } from './learnJsB';
import { JS_C } from './learnJsC';
import { JS_D } from './learnJsD';

const CHAPTERS: Array<{ title: string; ids: string[] }> = [
  { title: '1. Getting Started', ids: ['intro', 'vars', 'ops'] },
  { title: '2. Decisions and Loops', ids: ['cond', 'loops'] },
  { title: '3. Arrays, Objects and Text', ids: ['arrays', 'objects', 'strings'] },
  { title: '4. Functions', ids: ['func'] },
  { title: '5. The Browser', ids: ['dom', 'events'] },
  { title: '6. Project', ids: ['project'] },
  { title: '7. Modern JavaScript', ids: ['modern', 'classes', 'async'] },
];

const byId: Record<string, LearnLesson> = {};
for (const l of [...JS_A, ...JS_B, ...JS_C, ...JS_D]) byId[l.id.replace(/^js-/, '')] = l;

export const JS_LESSONS: LearnLesson[] = CHAPTERS.flatMap((c) =>
  c.ids.map((id) => {
    const l = byId[id];
    if (!l) throw new Error('Missing JavaScript lesson: ' + id);
    return { ...l, chapter: c.title };
  })
);
