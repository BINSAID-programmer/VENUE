/**
 * JavaScript challenges are run in a sandboxed iframe (no access to the app). The learner's code runs first, then the
 * lesson's `check` script in the same page. The check can use:
 *   out            array of everything printed with console.log (strings)
 *   CODE           the learner's source text (for checking that a loop or template literal was used)
 *   assert(ok, msg) throws msg when ok is false
 *   plus any top-level variable or function the learner wrote.
 * Returns '' when everything passes, otherwise the message to show.
 */
export function checkJs(code: string, check: string, timeoutMs = 4000): Promise<string> {
  return new Promise((resolve) => {
    const token = 'c' + Math.random().toString(36).slice(2);
    const safe = (s: string) => s.replace(/<\/script/gi, '<\\/script');
    const html = `<!DOCTYPE html><html><body><script>
var out=[],__err='',CODE=${JSON.stringify(code).replace(/</g, '\\u003c')};
var __fmt=function(a){return Array.prototype.map.call(a,function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ')};
console.log=function(){out.push(__fmt(arguments))};console.info=console.log;console.warn=console.log;console.error=console.log;
window.alert=function(){};window.prompt=function(){return ''};
function assert(ok,msg){if(!ok)throw new Error(msg||'Not correct yet.')}
window.addEventListener('error',function(e){if(!__err)__err=(e.message||'Error')+(e.lineno?' (line '+e.lineno+')':'');e.preventDefault()});
</script><script>
${safe(code)}
</script><script>
setTimeout(function(){
  var msg='';
  if(__err){msg='Your code has an error: '+__err}
  else{try{(function(){
${safe(check)}
  })()}catch(e){msg=e&&e.message?e.message:'Not correct yet.'}}
  parent.postMessage({__venueCheck:'${token}',msg:msg},'*');
},60);
</script></body></html>`;
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none';
    let done = false;
    const finish = (msg: string) => {
      if (done) return;
      done = true;
      window.removeEventListener('message', onMsg);
      clearTimeout(timer);
      frame.remove();
      resolve(msg);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.data && e.data.__venueCheck === token) finish(String(e.data.msg || ''));
    };
    window.addEventListener('message', onMsg);
    const timer = setTimeout(() => finish('Your code took too long (an endless loop?).'), timeoutMs);
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
