export type CodeLang = 'python' | 'html' | 'js';

/* Colours are inline (not Tailwind classes) so the app themes can never change them: code is always on a dark surface. */
export const C = {
  bg: '#0b1020',
  bar: '#111833',
  line: '#26304f',
  gutter: '#4b5675',
  text: '#d6deeb',
  keyword: '#c792ea',
  string: '#addb67',
  number: '#f78c6c',
  comment: '#6b7a99',
  func: '#82aaff',
  builtin: '#ffcb6b',
  constant: '#ff5874',
  op: '#7fdbca',
  tag: '#ff6b81',
  attr: '#ffcb6b',
  self: '#ef6b73',
  def: '#82aaff',
};

export interface Tok {
  t: string;
  c?: string;
  i?: boolean;
}

const PY_KW = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' '));
const PY_BUILTIN = new Set('print len range input int float str bool list dict set tuple sum min max abs round sorted reversed enumerate zip open type isinstance map filter any all divmod pow format super object Exception ValueError TypeError KeyError IndexError ZeroDivisionError FileNotFoundError'.split(' '));
const JS_KW = new Set('const let var function return if else for while do break continue switch case default new class extends import from export async await try catch finally throw typeof instanceof in of this null undefined true false'.split(' '));
const JS_BUILTIN = new Set('console document window Math JSON Array Object String Number Boolean Date Promise setTimeout'.split(' '));

function tokenizePython(code: string): Tok[] {
  const re = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?''')|((?:[fFrRbB]{1,2})?"(?:\\.|[^"\\\n])*"?|(?:[fFrRbB]{1,2})?'(?:\\.|[^'\\\n])*'?)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)|(@[A-Za-z_][\w.]*)|([+\-*/%=<>!&|^~:.,;()[\]{}]+)|(\s+)|([\s\S])/g;
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  let prev = '';
  while ((m = re.exec(code))) {
    const [s, com, tri, str, num, id, deco, op] = m;
    if (com) out.push({ t: s, c: C.comment, i: true });
    else if (tri || str) out.push({ t: s, c: C.string });
    else if (num) out.push({ t: s, c: C.number });
    else if (id) {
      const next = code.slice(re.lastIndex).match(/^\s*(.)/)?.[1];
      let c: string | undefined;
      if (PY_KW.has(id)) c = id === 'True' || id === 'False' || id === 'None' ? C.constant : C.keyword;
      else if (prev === 'def' || prev === 'class') c = C.def;
      else if (id === 'self' || id === 'cls') c = C.self;
      else if (PY_BUILTIN.has(id) && next === '(') c = C.builtin;
      else if (next === '(') c = C.func;
      out.push({ t: s, c });
      prev = id;
      continue;
    } else if (deco) out.push({ t: s, c: C.builtin });
    else if (op) out.push({ t: s, c: C.op });
    else out.push({ t: s });
    if (s.trim()) prev = s;
  }
  return out;
}

function tokenizeJs(code: string): Tok[] {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([+\-*/%=<>!&|^~:.,;()[\]{}?]+)|(\s+)|([\s\S])/g;
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const [s, com, str, num, id, op] = m;
    if (com) out.push({ t: s, c: C.comment, i: true });
    else if (str) out.push({ t: s, c: C.string });
    else if (num) out.push({ t: s, c: C.number });
    else if (id) {
      const next = code.slice(re.lastIndex).match(/^\s*(.)/)?.[1];
      let c: string | undefined;
      if (JS_KW.has(id)) c = id === 'true' || id === 'false' || id === 'null' || id === 'undefined' ? C.constant : C.keyword;
      else if (JS_BUILTIN.has(id)) c = C.builtin;
      else if (next === '(') c = C.func;
      out.push({ t: s, c });
    } else if (op) out.push({ t: s, c: C.op });
    else out.push({ t: s });
  }
  return out;
}

function tokenizeCss(css: string): Tok[] {
  const re = /(\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg)?\b)|([\w-]+)(?=\s*:)|(@[\w-]+)|([{}:;,()>+~])|(\s+)|([\s\S])/g;
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const [s, com, str, num, prop, at, op] = m;
    if (com) out.push({ t: s, c: C.comment, i: true });
    else if (str) out.push({ t: s, c: C.string });
    else if (num) out.push({ t: s, c: C.number });
    else if (prop) out.push({ t: s, c: C.attr });
    else if (at) out.push({ t: s, c: C.keyword });
    else if (op) out.push({ t: s, c: C.op });
    else out.push({ t: s });
  }
  return out;
}

function tokenizeHtml(code: string): Tok[] {
  const out: Tok[] = [];
  const re = /(<!--[\s\S]*?-->)|(<style[^>]*>)([\s\S]*?)(<\/style>)|(<script[^>]*>)([\s\S]*?)(<\/script>)|(<\/?[A-Za-z][^>]*>?)|([^<]+|<)/g;
  let m: RegExpExecArray | null;
  const tag = (s: string) => {
    const mm = s.match(/^(<\/?)([A-Za-z][\w-]*)([\s\S]*?)(\/?>?)$/);
    if (!mm) return [{ t: s }];
    const res: Tok[] = [{ t: mm[1], c: C.op }, { t: mm[2], c: C.tag }];
    const attrRe = /(\s+)|([\w:-]+)|(=)|("[^"]*"|'[^']*')|([\s\S])/g;
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(mm[3]))) {
      if (a[2]) res.push({ t: a[0], c: C.attr });
      else if (a[3]) res.push({ t: a[0], c: C.op });
      else if (a[4]) res.push({ t: a[0], c: C.string });
      else res.push({ t: a[0] });
    }
    res.push({ t: mm[4], c: C.op });
    return res;
  };
  while ((m = re.exec(code))) {
    if (m[1]) out.push({ t: m[1], c: C.comment, i: true });
    else if (m[2]) out.push(...tag(m[2]), ...tokenizeCss(m[3]), ...tag(m[4]));
    else if (m[5]) out.push(...tag(m[5]), ...tokenizeJs(m[6]), ...tag(m[7]));
    else if (m[8]) out.push(...tag(m[8]));
    else out.push({ t: m[0] });
  }
  return out;
}

export function tokenize(code: string, lang: CodeLang): Tok[] {
  if (lang === 'python') return tokenizePython(code);
  if (lang === 'js') return tokenizeJs(code);
  return tokenizeHtml(code);
}

