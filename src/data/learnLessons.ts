import { PYTHON_LESSONS } from './learnPython';

export type LearnLang = 'python' | 'html' | 'js';

export interface LearnLesson {
  id: string;
  title: string;
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
    lessons: [
      {
        id: 'html-basics',
        title: 'Headings and paragraphs',
        body: ['HTML uses tags like <h1> and <p>. Most tags open and close: <p>text</p>.'],
        sw: 'Tag zinafungua na kufunga: <p>maandishi</p>.',
        code: html('<h1>My page</h1>\n<p>Hello from <b>VENUE</b>!</p>'),
        task: 'Add an <h2> and a second paragraph about your course.',
      },
      {
        id: 'html-lists',
        title: 'Lists and links',
        body: ['<ul> makes a bullet list, <ol> a numbered one, each item is <li>. <a href="..."> makes a link.'],
        sw: '<ul> ni orodha ya vitone, <a> ni kiungo.',
        code: html('<ul>\n  <li>Mathematics</li>\n  <li>Statistics</li>\n</ul>\n<a href="https://www.udsm.ac.tz">UDSM</a>'),
        task: 'Make a numbered list of your five favourite courses.',
      },
      {
        id: 'html-img-table',
        title: 'Images and tables',
        body: ['<img src="..." alt="..."> shows a picture. A table has rows <tr> with cells <td> or headers <th>.'],
        sw: '<table> inapanga data kwenye safu na nguzo.',
        code: html('<table border="1" cellpadding="6">\n  <tr><th>Student</th><th>Mark</th></tr>\n  <tr><td>Asha</td><td>78</td></tr>\n  <tr><td>Juma</td><td>64</td></tr>\n</table>'),
        task: 'Add a third student and a column for grade.',
      },
      {
        id: 'html-form',
        title: 'Forms',
        body: ['Forms collect input: <input>, <select>, <button>. Give inputs a type such as text, number or email.'],
        sw: 'Form inakusanya taarifa kutoka kwa mtumiaji.',
        code: html('<form>\n  <label>Name <input type="text" placeholder="Your name"></label><br><br>\n  <label>Year <select><option>1</option><option>2</option><option>3</option></select></label><br><br>\n  <button type="button">Save</button>\n</form>'),
        task: 'Add an email field.',
      },
    ],
  },
  {
    id: 'css',
    title: 'CSS',
    lang: 'html',
    tagline: 'Colours, spacing and layout — make pages look good.',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    lessons: [
      {
        id: 'css-colors',
        title: 'Colours and fonts',
        body: ['CSS rules look like: selector { property: value; }. color is text colour, background is the fill.'],
        sw: 'CSS inapamba: rangi, ukubwa wa herufi, mpangilio.',
        code: html('<h1>Hello</h1>\n<p>Style me!</p>', 'body { font-family: sans-serif; padding: 16px; }\nh1 { color: #2563eb; }\np { background: #fef3c7; font-size: 18px; }'),
        task: 'Change the heading colour and the paragraph background.',
      },
      {
        id: 'css-box',
        title: 'The box model',
        body: ['Every element is a box: content, padding (inside), border, margin (outside).'],
        sw: 'Kila kitu ni boksi: padding ndani, margin nje.',
        code: html('<div class="card">A card</div>', '.card { padding: 20px; margin: 16px; border: 2px solid #2563eb; border-radius: 12px; background: #eff6ff; }'),
        task: 'Make the corners fully round and the border thicker.',
      },
      {
        id: 'css-flex',
        title: 'Flexbox layout',
        body: ['display: flex puts children in a row. justify-content spaces them, gap adds space between.'],
        sw: 'flex inapanga vitu kwenye mstari kwa urahisi.',
        code: html('<div class="row"><div>1</div><div>2</div><div>3</div></div>', '.row { display: flex; gap: 12px; justify-content: center; }\n.row div { background: #10b981; color: white; padding: 20px; border-radius: 8px; }'),
        task: 'Use justify-content: space-between and add a 4th box.',
      },
      {
        id: 'css-hover',
        title: 'Hover and responsive',
        body: [':hover styles an element when the mouse/finger is over it. @media changes styles on small screens.'],
        sw: ':hover na @media vinafanya ukurasa uwe hai na ufae simu.',
        code: html('<button class="btn">Tap me</button>', '.btn { padding: 12px 20px; border: 0; border-radius: 10px; background: #2563eb; color: white; font-size: 16px; }\n.btn:hover { background: #1d4ed8; }\n@media (max-width: 400px) { .btn { width: 100%; } }'),
        task: 'Make the button turn green on hover.',
      },
    ],
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
