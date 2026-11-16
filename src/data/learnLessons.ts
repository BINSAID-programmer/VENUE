import { PYTHON_LESSONS } from './learnPython';
import { HTML_LESSONS } from './learnHtml';
import { CSS_LESSONS } from './learnCss';

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

const html = (inner: string, css = '') =>
  `<!DOCTYPE html>\n<html>\n<head>\n<meta name="viewport" content="width=device-width, initial-scale=1">${css ? `\n<style>\n${css}\n</style>` : ''}\n</head>\n<body>\n${inner}\n</body>\n</html>`;

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
    lessons: [
      {
        id: 'js-basics',
        title: 'Variables and console',
        body: ['let makes a variable, const makes one that never changes. console.log() prints output.'],
        sw: 'let na const zinahifadhi thamani; console.log inaonyesha.',
        code: `const name = "VENUE";\nlet year = 1;\nyear = year + 1;\nconsole.log("Hello " + name);\nconsole.log("Year", year);`,
        task: 'Print the area of a circle with radius 5 (Math.PI * r * r).',
      },
      {
        id: 'js-arrays',
        title: 'Arrays and loops',
        body: ['Arrays hold lists. Use for...of to visit each item, and .map / .filter to transform them.'],
        sw: 'Array ni orodha; map na filter zinabadilisha au kuchuja.',
        code: `const marks = [55, 72, 40, 88];\nconst passed = marks.filter(m => m >= 50);\nconsole.log(passed);\nconsole.log(passed.map(m => m + 5));`,
        task: 'Compute the average of marks using reduce.',
      },
      {
        id: 'js-func',
        title: 'Functions',
        body: ['Functions are reusable code. Arrow style: const add = (a, b) => a + b;'],
        sw: 'Function inatumika tena na tena.',
        code: `const grade = (m) => m >= 70 ? "A" : m >= 60 ? "B" : "C";\nconsole.log(grade(75), grade(62), grade(40));`,
        task: 'Add grade D for 40 to 49 and F below that.',
      },
      {
        id: 'js-dom',
        title: 'Click a button',
        body: ['JavaScript can change the page. Find an element, listen for a click, update its text.'],
        sw: 'JavaScript inabadilisha ukurasa kwa kubonyeza.',
        code: html('<button id="b">Count: 0</button>\n<script>\n  let n = 0;\n  const b = document.getElementById("b");\n  b.addEventListener("click", () => { n++; b.textContent = "Count: " + n; });\n</script>'),
        task: 'Show the count in a <p> instead of the button text.',
      },
    ],
  },
];
