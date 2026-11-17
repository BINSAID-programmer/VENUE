import { PYTHON_LESSONS } from './learnPython';
import { HTML_LESSONS } from './learnHtml';
import { CSS_LESSONS } from './learnCss';
import { JS_LESSONS } from './learnJs';

export type LearnLang = 'python' | 'html' | 'js';

export interface LearnLesson {
  id: string;
  title: string;
  /** Main topic (chapter) this lesson belongs to. */
  chapter?: string;
  /** Short explanation, one paragraph per entry. */
  body: string[];
  /** Kwa kifupi — one-line Swahili summary. */
  sw: string;
  /** Multiple-choice questions shown after the lesson. */
  quiz?: Array<{ q: string; options: string[]; answer: number; why: string }>;
  /** Auto-checked coding challenge. `check` raises AssertionError (with a message) when wrong. */
  challenge?: { prompt: string; starter: string; check: string; hint: string; solution: string };
  /** Common mistakes shown in an amber box. */
  mistakes?: string[];
  /** Practice questions; `a` is runnable Python shown on demand. */
  exercises?: Array<{ q: string; a: string }>;
  /** Optional richer layout: headed sections, each with its own runnable example. */
  sections?: Array<{ h: string; p: string[]; code?: string; note?: string; explain?: string[] }>;
  /** Editable example the learner can run. */
  code: string;
  /** Small exercise. */
  task: string;
}

export interface LearnTrack {
  id: string;
  title: string;
  lang: LearnLang;
  tagline: string;
  color: string; // tailwind text/bg/border classes
  lessons: LearnLesson[];
}

export const LEARN_TRACKS: LearnTrack[] = [
  {
    id: 'python',
    title: 'Python',
    lang: 'python',
    tagline: 'The easiest language to start with — great for data and statistics.',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    lessons: PYTHON_LESSONS,
  },
  {
    id: 'html',
    title: 'HTML',
    lang: 'html',
    tagline: 'The structure of every web page.',
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    lessons: HTML_LESSONS,
  },
  {
    id: 'css',
    title: 'CSS',
    lang: 'html',
    tagline: 'Colours, spacing and layout — make pages look good.',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    lessons: CSS_LESSONS,
  },
  {
    id: 'js',
    title: 'JavaScript',
    lang: 'js',
    tagline: 'Make web pages interactive.',
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    lessons: JS_LESSONS,
  },
];
