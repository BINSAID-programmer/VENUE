/**
 * Web challenges (HTML/CSS) are checked without running the learner's code. `check` is a list of rules, one per line:
 *   SELECTOR => message                     an element matching the CSS selector must exist
 *   SELECTOR >= N => message                at least N such elements
 *   NOT SELECTOR => message                 no such element may exist
 *   SELECTOR contains TEXT => message       some matching element's text includes TEXT (ignores case)
 *   re /PATTERN/FLAGS => message            the raw code must match the pattern
 * Lines starting with # are comments. The first failing rule's message is shown.
 */
export function checkWeb(code: string, check: string): string {
  const doc = new DOMParser().parseFromString(code, 'text/html');
  for (const raw of check.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const at = line.lastIndexOf('=>');
    const rule = line.slice(0, at).trim();
    const msg = line.slice(at + 2).trim() || 'Not correct yet.';
    let m: RegExpMatchArray | null;
    try {
      if ((m = rule.match(/^re \/(.+)\/([a-z]*)$/))) {
        if (!new RegExp(m[1], m[2]).test(code)) return msg;
      } else if ((m = rule.match(/^NOT (.+)$/))) {
        if (doc.querySelector(m[1])) return msg;
      } else if ((m = rule.match(/^(.+?) contains (.+)$/))) {
        const want = m[2].toLowerCase();
        const ok = Array.from(doc.querySelectorAll(m[1])).some((el) => (el.textContent || '').toLowerCase().includes(want));
        if (!ok) return msg;
      } else if ((m = rule.match(/^(.+?) >= (\d+)$/))) {
        if (doc.querySelectorAll(m[1]).length < Number(m[2])) return msg;
      } else if (!doc.querySelector(rule)) {
        return msg;
      }
    } catch {
      return 'This challenge has a rule that could not be read.';
    }
  }
  return '';
}
