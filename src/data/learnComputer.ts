import type { LearnLesson } from './learnLessons';
import { CB_CH1 } from './learnComputerCh1';

const CHAPTERS: Array<{ title: string; lessons: LearnLesson[] }> = [
  { title: '1. Understanding Computers', lessons: CB_CH1 },
];

/** Computer Basics: no code, but drawings, tables, hands-on steps and videos. */
export const COMPUTER_LESSONS: LearnLesson[] = CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, chapter: c.title })));
