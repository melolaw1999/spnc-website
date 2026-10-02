/* Access is verified by the server. No credentials are persisted by this page. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),form=$('accessForm'),username=$('username'),password=$('password'),submit=$('accessSubmit');
  let busy=false;
  const reset=()=>{username.value='';password.value='';};
  reset();
  window.addEventListener('pagehide',reset);
  window.addEventListener('pageshow',event=>{if(event.persisted)reset();});
  try {
    const message=sessionStorage.getItem('spnc-abacus-notice');
    if(message){$('accessNotice').textContent=message;$('accessNotice').hidden=false;sessionStorage.removeItem('spnc-abacus-notice');}
  } catch {}
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!form.reportValidity())return;
    busy=true;submit.disabled=true;username.disabled=true;password.disabled=true;
    $('accessStatus').textContent='正在验证访问权限…';
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
    try {
      const response=await fetch('/api/abacus/access',{method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',
        headers:{'Content-Type':'application/json'},signal:controller.signal,
        body:JSON.stringify({username:username.value.trim(),password:password.value})});
      if(!response.ok){
        $('accessStatus').textContent=response.status===429?'尝试次数较多，请稍后再试。':response.status===503?'登录服务尚未配置，请联系管理员。':response.status===401||response.status===403?'账号或密码不正确，或暂未获授权。':'暂时无法登录，请稍后重试。';
        return;
      }
      try {localStorage.removeItem('spnc-abacus-locked-v1');sessionStorage.removeItem('spnc-abacus-notice');}
      catch {$('accessStatus').textContent='验证已通过，但浏览器禁止本站存储。请允许存储后重新登录。';return;}
      reset();$('accessStatus').textContent='验证通过，正在连接工作台…';
      location.replace('/abacus/?connect=1');
    } catch {$('accessStatus').textContent='连接失败，请联网后重试。';}
    finally {clearTimeout(timeout);password.value='';busy=false;submit.disabled=false;username.disabled=false;password.disabled=false;}
  });
})();
