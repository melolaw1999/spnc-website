(function(){
 'use strict';
 const today=window.AbacusSync.effectiveDate();
 const data={...window.ProcurementData,excluded:window.ProcurementData.excluded||[],orders:window.ProcurementData.orders.map(o=>{
   if(o.currency!=='USD'||/取消|建议单|履约待核|结算汇总/.test(o.status))return o;
   const d=new Date(o.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+4);const date=d.toISOString().slice(0,10);
   return {...o,status:date<=today?'默认已上架 · '+date:'预计上架 · '+date,note:(o.note||'')+' 按用户规则：开单＋4自然日默认上架，非仓库实查。原单状态：'+o.status};
 })};
 const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=(n,c)=>(c==='USD'?'$':'¥')+Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:4});
 const all=data.orders.flatMap(o=>o.rows.map(r=>({...r,order:o})));
 function matches(p,r){return r.barcode===p.barcode && r.currency===(p.costType==='usd'?'USD':'CNY');}
 function records(p){return all.filter(r=>matches(p,r));}
 window.ProcurementHistory={records};
 function card(r){const o=r.order;return '<div class="fifo-history"><strong>'+esc(o.date+' '+o.name)+'</strong><div>'+esc(r.qty)+' '+esc(r.unit)+' × '+money(r.cost,r.currency)+'</div><div class="fifo-tiny">'+esc(r.kind+' · '+(r.excluded?'已取消／转预存，不计入库存':o.status))+'</div><details><summary>来源与明细</summary><p class="fifo-tiny">'+esc(r.name+' '+r.spec)+'<br>'+esc(r.note)+'<br>'+esc(o.file.split('/').pop()+' / '+r.sheet+' 第'+r.row+'行')+(r.priceSource?'<br>订正来源：'+esc(r.priceSource.split('/').slice(-3).join(' / ')):'')+'</p></details></div>';}
 function renderHistory(){
   const p=product(),rows=records(p),el=document.getElementById('fifoReference');
   const old=el.innerHTML;const anchor=old.indexOf('<hr>');
   el.innerHTML='<div class="fifo-eyebrow">PURCHASE RECORD</div><h3>采购批次记录</h3><p class="fifo-muted">'+esc(p.name)+'</p><button class="fifo-full" data-orders-open>查看全部订单</button><p class="fifo-tiny">同条码、同币种历史，按时间排列。效期品与常规货分别标注；数量不是当前库存。</p>'+(rows.length?'<div class="procurement-scroll">'+rows.map(card).join('')+'</div>':'<p class="fifo-muted">现有订单未找到此条码。</p>')+(p.cases?'<p class="fifo-callout">采购记录以箱计；当前测价为 '+esc(p.cases)+' 箱装。库存登记请按销售组合数量校准，勿直接把箱数当组合数。</p>':'')+(anchor>=0?old.slice(anchor):'');
 }
 const base=window.renderFifo;
 window.renderFifo=function(){base();renderHistory();};
 const modal=document.createElement('dialog');modal.id='procurementDialog';modal.setAttribute('aria-label','全部采购订单');
 modal.innerHTML='<div class="procurement-heading"><div><h2>全部采购订单</h2><p class="fifo-muted">同步至 '+esc(data.asOf)+' · 采购原单保留不改写</p></div><button id="procurementClose">关闭</button></div><input id="procurementSearch" placeholder="搜索山名、条码或商品" aria-label="搜索订单"><p class="fifo-tiny">采购金额不是未回款余额；未付款不等于未入库。跨境按开单＋4个自然日默认上架参与 FIFO；默认上架不代表仓库实查。</p><div id="procurementOrders"></div><details><summary>已合并的旧版本（'+data.excluded.length+'份）</summary>'+data.excluded.map(x=>'<p class="fifo-tiny">'+esc(x.file)+'：'+esc(x.reason)+'</p>').join('')+'</details>';
 document.body.append(modal);
 function catalog(q=''){
   q=q.trim().toLowerCase();const os=data.orders.filter(o=>[o.name,o.date,o.file,...o.rows.map(r=>r.barcode+' '+r.name+' '+r.note)].join(' ').toLowerCase().includes(q)).slice().reverse();
   document.getElementById('procurementOrders').innerHTML='<p>共 '+os.length+' 条记录（含取消单、待核单及结算汇总）</p>'+os.map(o=>'<details class="procurement-order"><summary><strong>'+esc(o.date+' '+o.name)+'</strong><span>'+esc(o.status)+'</span><b>'+money(o.settlementAmount??o.lineAmount,o.currency)+'</b></summary><p class="fifo-tiny">'+esc(o.note||'明细按原采购单位；赠品、取消及预存行单独标注。')+'</p><div class="procurement-table-wrap"><table><thead><tr><th>商品 / 条码</th><th>数量</th><th>单价</th><th>金额</th><th>说明</th></tr></thead><tbody>'+o.rows.map(r=>'<tr><td>'+esc(r.name+' '+r.spec)+'<small>'+esc(r.barcode)+'</small></td><td>'+esc(r.qty)+esc(r.unit)+'</td><td>'+money(r.cost,o.currency)+'</td><td>'+money(r.amount,o.currency)+'</td><td>'+esc((r.excluded?'不计入采购库存；':'')+r.kind+'；'+r.note)+'</td></tr>').join('')+'</tbody></table></div><p class="fifo-tiny">来源：'+esc(o.file)+'</p></details>').join('');
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-orders-open]')){catalog();modal.showModal();}if(e.target.id==='procurementClose')modal.close();});
 document.getElementById('procurementSearch').addEventListener('input',e=>catalog(e.target.value));
 const button=document.createElement('button');button.textContent='全部采购订单';button.setAttribute('data-orders-open','');document.querySelector('.topbar').append(button);
 render();
})();
