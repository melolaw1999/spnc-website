// Increment BUILD whenever any shell file changes. No private data or API caches.
const BUILD='spnc-abacus-shell-aea6a088fb79ae28';
const BASE='/abacus/';
const ASSETS=['index.html','app.js','calculator.js','legacy.css','mobile.css','fifo-inventory.js','fifo-inventory.css','procurement-history.js','procurement-history.css','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 if(new URL(self.registration.scope).pathname!==BASE)throw Error('Unexpected application scope');
 const responses=await Promise.all(ASSETS.map(async asset=>{
   const url=new URL(asset,self.registration.scope);
   const response=await fetch(url,{cache:'no-store',credentials:'same-origin',redirect:'error'});
   if(!response.ok||response.redirected)throw Error('Application shell unavailable');
   // Drain every response immediately; holding unread bodies can exhaust the
   // HTTP/1 connection pool before all parallel shell requests have completed.
   const bytes=await response.arrayBuffer();
   return [url,new Response(bytes,{status:response.status,statusText:response.statusText,headers:response.headers})];
 }));
 const cache=await caches.open(BUILD);
 await Promise.all(responses.map(([url,response])=>cache.put(url,response)));
})()));
// Let an existing session finish on its current coherent version; no skipWaiting.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('spnc-abacus-shell-')&&k!==BUILD).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||!url.pathname.startsWith(BASE)||event.request.method!=='GET')return;
 const base=new URL(self.registration.scope),relative=url.pathname.slice(base.pathname.length);
 if(!(relative===''||ASSETS.includes(relative)))return;
 event.respondWith(caches.open(BUILD).then(async cache=>{const path=(relative===''||relative==='index.html')?'index.html':relative;return await cache.match(new URL(path,base))||fetch(event.request);}));
});
