// Lucky Line CRM offline shell. The app files are cached so the CRM opens on a roof with weak signal;
// customer data always comes live from the database (never cached here).
const V='llcrm-v2-18';
const SHELL=['./','index.html','x.css','x-core.js','x-job.js','x-voice.js','x-stats.js','x-signup.js','img/clvr.svg','manifest.webmanifest','icons/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||/proposal\.html|invoice\.html/.test(u.pathname))return;
  // network first, fall back to the cached shell
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(!r.ok)return caches.match(e.request).then(m=>m||(e.request.mode==='navigate'?caches.match('index.html'):null)||r);const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
