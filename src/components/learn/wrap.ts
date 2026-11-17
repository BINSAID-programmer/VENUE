/** Short HTML snippets get a readable base style; complete pages are left exactly as written. */
export const wrapHtml = (code: string) =>
  /<html|<!doctype/i.test(code)
    ? code
    : `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;padding:10px;margin:0;color:#111}</style></head><body>${code}</body></html>`;

export const wrapJs = (code: string) =>
  `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:ui-monospace,monospace;font-size:14px;padding:10px;margin:0;color:#e2e8f0;background:#020617}div{white-space:pre-wrap;margin:2px 0}.e{color:#fda4af}</style></head><body><div id="o"></div><script>
const o=document.getElementById('o');
const fmt=a=>a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ');
console.log=(...a)=>{const d=document.createElement('div');d.textContent=fmt(a);o.appendChild(d)};
window.onerror=m=>{const d=document.createElement('div');d.className='e';d.textContent=String(m);o.appendChild(d)};
try{
${code.replace(/<\/script>/gi, '<\\/script>')}
}catch(e){window.onerror(e.message)}
</script></body></html>`;

/** Script that forwards console output and errors of a preview page to the IDE console (postMessage). */
const BRIDGE = `<script>(function(){var send=function(t,a){try{parent.postMessage({__venue:1,type:t,text:Array.prototype.map.call(a,function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ')},'*')}catch(e){}};['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){send(k,arguments);try{o.apply(console,arguments)}catch(e){}}});window.addEventListener('error',function(e){send('error',[e.message+(e.lineno?' (line '+e.lineno+')':'')])});window.addEventListener('unhandledrejection',function(e){send('error',['Unhandled promise rejection: '+(e.reason&&e.reason.message||e.reason)])})})();</script>`;

/** HTML for the IDE preview: wrapped, with the console bridge injected first. */
export const previewHtml = (code: string, lang: 'html' | 'js') => {
  const page = lang === 'js' ? wrapJs(code) : wrapHtml(code);
  if (/<head[^>]*>/i.test(page)) return page.replace(/<head[^>]*>/i, (m) => m + BRIDGE);
  if (/<html[^>]*>/i.test(page)) return page.replace(/<html[^>]*>/i, (m) => m + BRIDGE);
  return BRIDGE + page;
};
