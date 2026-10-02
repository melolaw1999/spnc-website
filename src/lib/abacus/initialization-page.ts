import type { AuthPort } from './handlers';
import { errorResponse } from './handlers';
import { services } from './runtime';
import { assertInitializationEnabled } from './bootstrap';

// This page is deliberately outside the offline shell manifest. Its selected
// File and digest live only in this document's memory, never in browser storage.
export const INITIALIZATION_HTML = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>黑算盘 · 初始化手机版账本</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f5f4f0;color:#253029;font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;padding:32px 20px}main{max-width:600px;margin:0 auto;background:#fff;border:1px solid #dfdfd8;border-radius:14px;padding:32px}a{color:#334d3d}h1{font-size:26px;line-height:1.35;margin:24px 0 16px}p{margin:12px 0}label{display:block;margin:22px 0 8px}input[type=file]{display:block;max-width:100%;padding:12px 0}button{min-height:48px;padding:12px 18px;border:1px solid #334d3d;border-radius:7px;background:#334d3d;color:white;font:inherit;cursor:pointer}button.secondary{background:white;color:#334d3d}button:disabled{opacity:.5;cursor:default}input[type=checkbox]{width:20px;height:20px;flex:none;margin-top:4px}label.check{display:flex;gap:10px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.7 ui-monospace,monospace;background:#f5f4f0;padding:14px;border-radius:7px}#status{min-height:28px;color:#795322;overflow-wrap:anywhere}.muted{font-size:13px;color:#657167}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}[hidden]{display:none!important}:focus-visible{outline:3px solid #849d8b;outline-offset:3px}@media(max-width:480px){body{padding:max(20px,env(safe-area-inset-top)) 16px max(20px,env(safe-area-inset-bottom))}main{padding:24px 20px}.actions button{width:100%}}
</style><script src="/abacus/initialize/client.js" defer></script></head><body><main>
<a href="/abacus/">黑算盘 · 工作台</a><h1>初始化手机版账本</h1>
<p>将已核对完整的本地导入包，复制到手机版的独立账本。电脑版记录保持原样，手机版不会自动写回电脑版。</p>
<p class="muted">仅接受本次已批准、完整核验的手机版账本快照；原始浏览器备份须先在本机核验转换。已有其他账本时会拒绝覆盖；同一个快照文件可以安全重试。本页须联网使用。</p>
<label for="bundle">选择已核验的手机版 JSON 快照</label><input id="bundle" type="file" accept=".json,application/json" autocomplete="off">
<pre id="fingerprint" hidden></pre>
<label class="check"><input id="confirmed" type="checkbox" disabled><span>我已核对备份完整性和上方 SHA-256，确认将此包复制到独立手机版账本。</span></label>
<div class="actions"><button id="upload" type="button" disabled>确认复制并核验</button><button id="clear" class="secondary" type="button">清除本页选择</button></div>
<p id="status" role="status" aria-live="polite"></p><pre id="receipt" hidden></pre>
<p id="complete" hidden><a href="/abacus/?connect=1">打开手机版账本</a></p>
<p class="muted">本页不展示财务明细，也不保存所选文件到浏览器存储。文件仅保留在当前页面内存中；清除选择或离开页面后释放。</p>
<noscript><p>请启用 JavaScript 后选择并提交导入包。</p></noscript></main></body></html>`;

export const INITIALIZATION_JS = `(() => {
  'use strict';
  const MAX_BYTES=2*1024*1024;
  const $=id=>document.getElementById(id),input=$('bundle'),confirm=$('confirmed'),upload=$('upload'),clear=$('clear');
  let selected=null,digest='',generation=0,busy=false,controller=null;
  const hex=bytes=>Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
  const status=message=>{$('status').textContent=message;};
  const controls=()=>{input.disabled=busy;clear.disabled=busy;confirm.disabled=busy||!selected||!digest;upload.disabled=busy||!selected||!digest||!confirm.checked;};
  function release(){
    generation++;if(controller)controller.abort();controller=null;selected=null;digest='';busy=false;
    input.value='';confirm.checked=false;$('fingerprint').textContent='';$('fingerprint').hidden=true;
    $('receipt').textContent='';$('receipt').hidden=true;$('complete').hidden=true;controls();
  }
  release();
  window.addEventListener('pagehide',()=>{release();status('');});
  window.addEventListener('pageshow',event=>{if(event.persisted){release();status('请重新选择已核验的导入包。');}});
  clear.addEventListener('click',()=>{release();status('已清除本页选择，本地备份文件保持原样。');});
  confirm.addEventListener('change',controls);
  input.addEventListener('change',async()=>{
    const file=input.files&&input.files[0];release();if(!file){status('');return;}
    const ticket=generation;
    if(!Number.isSafeInteger(file.size)||file.size<1||file.size>MAX_BYTES){status('文件大小不符合导入要求，请核对已批准的导入包。');return;}
    status('正在本页计算文件摘要…');
    try{
      const bytes=await file.arrayBuffer();
      if(ticket!==generation)return;
      const computed=hex(await crypto.subtle.digest('SHA-256',bytes));
      if(ticket!==generation)return;
      selected=file;digest=computed;
      $('fingerprint').textContent='SHA-256: '+digest+'\\n文件大小: '+file.size+' 字节';$('fingerprint').hidden=false;
      status('请与核验记录核对摘要，然后确认复制。');controls();
    }catch{if(ticket===generation){release();status('无法读取文件或计算摘要，请重新选择本地导入包。');}}
  });
  upload.addEventListener('click',async()=>{
    if(busy||!selected||!digest||!confirm.checked)return;
    const file=selected,expected=digest,ticket=generation;
    busy=true;controls();status('正在复制并读取核验，请保持本页打开…');
    const pending=new AbortController();controller=pending;
    const timeout=setTimeout(()=>pending.abort(),30000);
    try{
      const response=await fetch('/api/abacus/initialize',{method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',
        headers:{'Content-Type':'application/json'},body:file,signal:pending.signal});
      if(ticket!==generation)return;
      if(response.status===401||response.status===403){release();location.replace('/abacus/access?next=initialize');return;}
      if(!response.ok){
        status(response.status===409?'已有其他账本或核验状态冲突，未执行覆盖。请停止导入并核对现有账本。':
          response.status===400?'导入包未通过校验。请核对本地文件及本次批准的摘要。':
          '暂时无法确认复制结果。请保留此包，恢复连接后以同一文件重试核验；不要改换或重建导入包。');
        return;
      }
      const result=await response.json();
      if(ticket!==generation)return;
      if(!['initialized','already_initialized'].includes(result.status)||result.snapshotSha256!==expected||result.operationId!=='bootstrap-'+expected||
         !/^[a-f0-9]{64}$/.test(result.receiptSha256)||result.revision!==1||!Number.isSafeInteger(result.currentRevision)||result.currentRevision<1){
        status('返回的核验凭据不匹配，尚不能确认复制结果。请保留同一文件重试或联系管理员核对。');return;
      }
      release();
      $('receipt').textContent='导入包 SHA-256: '+expected+'\\n核验凭据 SHA-256: '+result.receiptSha256+'\\n当前账本修订: '+result.currentRevision;
      $('receipt').hidden=false;$('complete').hidden=false;status('此导入包已完成复制及服务端读回核验。已释放本页文件。');
    }catch{if(ticket===generation)status('连接中断，复制结果待核验。请保留此包，以同一文件重试；不要改换或重建导入包。');}
    finally{clearTimeout(timeout);if(ticket===generation){controller=null;busy=false;controls();}}
  });
})();`;

type PageDependencies = {
  env: Readonly<Record<string, string | undefined>>;
  auth: () => Pick<AuthPort, 'requireSession'>;
};

export function createInitializationPageHandler({ env, auth }: PageDependencies) {
  return async (request: Request, asset: 'page' | 'script'): Promise<Response> => {
    try {
      assertInitializationEnabled(env);
      const url = new URL(request.url);
      const expected = asset === 'page' ? '/abacus/initialize' : '/abacus/initialize/client.js';
      if (request.method !== 'GET' || url.search || url.pathname !== expected) throw { status: 400 };
      const session = await auth().requireSession(request);
      if (!/^admin:[a-f0-9]{24}$/.test(session.actor)) throw { status: 403 };
      return new Response(asset === 'page' ? INITIALIZATION_HTML : INITIALIZATION_JS, { headers: {
        'Content-Type': asset === 'page' ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0', 'Pragma': 'no-cache', 'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
      } });
    } catch (error) {
      const code = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
      if (asset === 'page' && code === 401) return new Response(null, { status: 303, headers: {
        Location: '/abacus/access?next=initialize', 'Cache-Control': 'no-store, max-age=0',
        Pragma: 'no-cache', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow, noarchive',
      } });
      return errorResponse(error);
    }
  };
}

export function initializationPageRoute(request: Request, asset: 'page' | 'script') {
  return createInitializationPageHandler({ env: process.env, auth: () => services().auth })(request, asset);
}
