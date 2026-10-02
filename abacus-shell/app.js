/* Black Abacus: private server is authoritative; IndexedDB is an ACK-only replica. */
(() => {
  'use strict';
  if(location.pathname==='/abacus')window.history.replaceState(null,'','/abacus/'+location.search+location.hash);
  const DB = 'spnc-abacus-offline-v1', KEY = 'confirmed', LOCK = 'spnc-abacus-locked-v1';
  const keys = ['black-abacus-sku-plans-v1','black-abacus-sku-archives-v1','black-abacus-fifo-v1'];
  const $ = id => document.getElementById(id), clone = x => JSON.parse(JSON.stringify(x));
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('spnc-abacus-security-v1') : null;
  let confirmed, working, online = false, pending = false, busy = false, stopped = false, timer, loaded = false;
  let generation = 0, cacheReady = true, probing = false, reloading = false;
  let workerSetup = Promise.resolve();
  const freshConnection = new URLSearchParams(location.search).has('connect');
  const locked = () => {try{return new URLSearchParams(location.search).has('locked') || localStorage.getItem(LOCK) === '1';}catch{return true;}};
  const active = token => token===generation && !stopped && !reloading && !locked();
  function notice(message) {try{sessionStorage.setItem('spnc-abacus-notice',message);}catch{}}
  function dbOp(action, value) {
    return new Promise((resolve,reject) => {
      const request=indexedDB.open(DB,1);
      request.onupgradeneeded=()=>request.result.createObjectStore('replica');
      request.onerror=()=>reject(request.error);
      request.onsuccess=()=>{const db=request.result,tx=db.transaction('replica',action==='get'?'readonly':'readwrite'),s=tx.objectStore('replica');
        const r=action==='get'?s.get(KEY):action==='put'?s.put(value,KEY):s.clear();
        let result;r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>{db.close();resolve(result);};
        tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error);};};
    });
  }
  function valid(x) { return x?.schema===1 && Number.isInteger(x.revision) && x.revision>0 && typeof x.updatedAt==='string' && Number.isFinite(Date.parse(x.updatedAt)) && Array.isArray(x.data?.products) && x.data.products.length>0 && Array.isArray(x.data.sfRates) && x.data.sfRates.length>0 && x.data.fifoReference && x.data.defaultPlans && Array.isArray(x.data.procurement?.orders) && keys.every(k=>x.data.stores?.[k] && typeof x.data.stores[k]==='object' && !Array.isArray(x.data.stores[k])); }
  function status(message) {
    $('syncStatus').textContent=message;
    $('syncTime').textContent=confirmed ? '上次同步成功：'+new Date(confirmed.syncedAt).toLocaleString('zh-CN',{hour12:false})+' · 数据版本 '+confirmed.revision+(cacheReady?'':' · 本机无法保存离线副本') : '尚无已确认的离线副本';
    document.querySelector('.sync-bar').dataset.state=online?'online':'offline';
  }
  const canWrite=()=>online && navigator.onLine && !busy && !stopped && !reloading && !locked();
  function readableControl(el) {return el.matches('#searchInput,#procurementSearch,.filter-btn,.sku-btn,[data-orders-open],#procurementClose') || el.closest('.sku-btn');}
  function applyGuard(){
    const block=!canWrite();
    document.querySelectorAll('#workspace input,#workspace select,#workspace textarea,#workspace button').forEach(el=>{
      if(readableControl(el))return;
      if(block && !el.disabled){el.disabled=true;el.dataset.syncDisabled='1';}
      else if(!block && el.dataset.syncDisabled){el.disabled=false;delete el.dataset.syncDisabled;}
    });
  }
  for(const type of ['beforeinput','input','change','click','submit','keydown']) document.addEventListener(type,e=>{
    if(canWrite() || !e.target.closest?.('#workspace') || readableControl(e.target))return;
    if(e.target.closest('input,select,textarea,button,form')){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  const observer=new MutationObserver(applyGuard);
  observer.observe($('workspace'),{childList:true,subtree:true});
  window.AbacusSync={canWrite,effectiveDate:()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(confirmed.syncedAt))};
  window.AbacusStore={
    getItem(k){if(!keys.includes(k))throw Error('Unknown store');return JSON.stringify(working[k]);},
    setItem(k,value){if(!canWrite() || !keys.includes(k))throw Error('Read only');working[k]=JSON.parse(value);pending=true;status('有更改，等待服务器确认…');clearTimeout(timer);timer=setTimeout(save,600);}
  };
  async function api(path,options={}) {
    const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);
    try {const r=await fetch(path,{cache:'no-store',credentials:'same-origin',...options,signal:c.signal});
      if(r.status===401||r.status===403){const e=Error('auth');e.auth=true;throw e;}
      if(!r.ok){const e=Error('HTTP '+r.status);e.conflict=r.status===409;throw e;}
      return r.status===204?null:await r.json();
    }finally{clearTimeout(t);}
  }
  async function accept(x,token){
    if(!valid(x))throw Error('Invalid snapshot');
    if(!active(token))throw Error('Session closed');
    const next={...x,syncedAt:new Date().toISOString()};
    try{await dbOp('put',next);cacheReady=true;}catch{cacheReady=false;}
    if(!active(token)){if(stopped||locked())await dbOp('clear').catch(()=>{});throw Error('Session closed');}
    confirmed=next;working=clone(next.data.stores);return next;
  }
  function failReload(message){
    if(stopped||reloading)return;
    notice(message);reloading=true;generation++;online=false;pending=false;clearTimeout(timer);applyGuard();location.reload();
  }
  async function save(){
    if(!pending||busy||!canWrite())return;
    busy=true;applyGuard();status('正在保存，等待服务器确认…');const token=generation;
    try{const x=await api('/api/abacus/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({operationId:crypto.randomUUID(),revision:confirmed.revision,stores:working})});if(!active(token))return;await accept(x,token);pending=false;status('在线 · 已同步');}
    catch(e){if(e.auth)return logout(false);if(!active(token))return;return failReload(e.conflict?'其他设备已更新。未覆盖服务器，已重新加载最新数据。':'此次更改未确认保存，已回到服务器确认的数据。');}
    finally{busy=false;applyGuard();}
  }
  function loadScript(src,token){return new Promise((resolve,reject)=>{if(!active(token))return reject(Error('Session closed'));const s=document.createElement('script');s.src='/abacus/'+src;s.onload=()=>active(token)?resolve():reject(Error('Session closed'));s.onerror=reject;document.body.append(s);});}
  async function boot(){
    if(locked())return gate(sessionStorage.getItem('spnc-abacus-notice') || '此设备已退出。重新连接后才可读取数据。');
    const token=generation;let x;
    try{x=await api('/api/abacus/snapshot');await accept(x,token);online=true;if(freshConnection)window.history?.replaceState(null,'','/abacus/');}
    catch(e){if(e.auth)return logout(false);if(stopped)return;
      if(freshConnection)return gate('重新连接尚未成功。请连接原服务器后重试；退出前残留的副本不会重新打开。');
      try{x=await dbOp('get');}catch{}
      if(!active(token))return;
      if(!valid(x)||typeof x.syncedAt!=='string'||!Number.isFinite(Date.parse(x.syncedAt)))return gate('无法连接，且本机没有同步成功的数据。请连接原服务器后重试。');
      confirmed=x;working=clone(x.data.stores);online=false;
    }
    if(stopped||locked())return;
    window.AbacusData=clone(confirmed.data);window.ProcurementData=window.AbacusData.procurement;
    $('startGate').hidden=true;
    try{await loadScript('fifo-inventory.js',token);await loadScript('calculator.js',token);await loadScript('procurement-history.js',token);if(!active(token))return;loaded=true;}
    catch{if(!active(token))return;online=false;applyGuard();return gate('程序文件未完整加载，请联网后刷新。');}
    $('workspace').hidden=false;document.querySelector('.mobile-nav').hidden=false;
    status(online?'在线 · 已同步':'离线只读 · 正在查看上次同步的数据');applyGuard();
    const note=sessionStorage.getItem('spnc-abacus-notice');if(note){status(note);sessionStorage.removeItem('spnc-abacus-notice');}
  }
  function gate(message){$('workspace').hidden=true;document.querySelector('.mobile-nav').hidden=true;$('startGate').hidden=false;$('gateMessage').textContent=message;status('尚未连接数据');}
  async function clearWorkers(){
    if(!('serviceWorker' in navigator))return;
    await workerSetup;
    const script=new URL('/abacus/sw.js',location.href).href;
    const registrations=await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter(reg=>reg.scope===new URL('/abacus/',location.href).href&&[reg.active,reg.installing,reg.waiting].some(worker=>worker?.scriptURL===script)).map(reg=>reg.unregister()));
  }
  async function logout(tellServer=true){
    if(stopped)return;stopped=true;generation++;online=false;pending=false;clearTimeout(timer);
    let cleared=true,serverEnded=false;
    try{localStorage.setItem(LOCK,'1');}catch{cleared=false;}
    document.getElementById('procurementDialog')?.remove();
    $('workspace').replaceChildren();$('workspace').hidden=true;document.querySelector('.mobile-nav').hidden=true;
    window.AbacusData=null;window.ProcurementData=null;confirmed=null;working=null;
    channel?.postMessage({type:'logout'});status('正在退出并清理本机副本…');
    try{await dbOp('clear');}catch{cleared=false;}
    // Business stores remain server schema keys; this website never writes or clears legacy localStorage copies.
    try{await clearWorkers();}catch{cleared=false;}
    try{await Promise.all((await caches.keys()).filter(k=>k.startsWith('spnc-abacus-shell-')).map(k=>caches.delete(k)));}catch{cleared=false;}
    if(tellServer)try{await api('/api/abacus/logout',{method:'POST'});serverEnded=true;}catch{}
    const message=(cleared?'本机副本已清除。':'本机数据已锁定，但缓存清理失败，请关闭本应用并联系管理员处理本机副本。')+(serverEnded?'服务器会话已注销。':'未确认服务器会话注销，请联网后完成。');
    notice(message);
    location.replace('/abacus/access?locked=1');
  }
  channel && (channel.onmessage=e=>{if(e.data?.type==='logout')logout(false);});
  window.addEventListener('storage',e=>{if(e.key===LOCK && e.newValue==='1')logout(false);});
  window.addEventListener('offline',()=>{online=false;applyGuard();if(pending)failReload('连接已中断；未确认的更改不进入离线副本。');else status('离线只读 · 正在查看上次同步的数据');});
  window.addEventListener('online',()=>{if(!locked()&&!stopped&&!pending&&!busy)location.reload();});
  $('syncNow').onclick=()=>{if(!pending&&!busy)location.reload();};
  $('enterApp').onclick=()=>location.replace('/abacus/access?locked=1');
  $('logoutApp').onclick=()=>logout();
  window.addEventListener('beforeunload',e=>{if(pending||busy){e.preventDefault();e.returnValue='';}});
  async function checkLatest(){
    if(!loaded||pending||busy||probing||stopped||reloading||locked()||!navigator.onLine)return;
    probing=true;const token=generation,revision=confirmed.revision;
    try{
      const x=await api('/api/abacus/snapshot');if(!active(token)||pending||busy||confirmed.revision!==revision)return;
      if(!valid(x))throw Error('Invalid snapshot');
      if(!online||x.revision!==confirmed.revision)failReload('数据版本已更新，正在读取服务器确认的数据。');
    }catch(e){
      if(e.auth)return logout(false);if(!active(token))return;
      if(pending)return failReload('连接已中断；未确认的更改不进入离线副本。');
      online=false;applyGuard();status('连接不可用 · 已切换只读');
    }finally{probing=false;}
  }
  setInterval(checkLatest,30000);
  window.addEventListener('pageshow',e=>{if(e.persisted){if(locked())logout(false);else checkLatest();}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkLatest();});
  let installPrompt;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installApp').hidden=false;});
  $('installApp').onclick=async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installApp').hidden=true;}};
  if('serviceWorker' in navigator && !locked())workerSetup=navigator.serviceWorker.register('/abacus/sw.js',{scope:'/abacus/',updateViaCache:'none'}).then(async reg=>{
    if(stopped||locked()){await reg.unregister();return;}
    reg.update().catch(()=>{});reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(!stopped&&!locked()&&worker.state==='installed'&&navigator.serviceWorker.controller)status('新版本已下载，关闭本应用所有窗口后重新打开以升级');});});
  }).catch(()=>{if(!stopped&&!locked())status('当前浏览器无法启用离线入口');});
  boot();
})();
