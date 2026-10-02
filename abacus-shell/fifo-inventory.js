/* FIFO is a local planning ledger. Historical order quantities never double as remaining stock. */
(function () {
  'use strict';
  const key = 'black-abacus-fifo-v1';
  const reference = window.AbacusData.fifoReference;
  let saved = {};
  let storageError = '';
  try { saved = JSON.parse(window.AbacusStore.getItem(key) || '{}') || {}; } catch(e) { storageError='本地记录读取失败，正在显示原始参考数据。'; }
  const copy = x => JSON.parse(JSON.stringify(x));
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cash = n => (product().costType === 'usd' ? '$' : '¥') + Number(n).toFixed(2);
  const unit = () => product().cases ? (product().cases === 1 ? '箱' : '组（2箱）') : /蛋白棒/.test(product().name) ? '盒' : '罐';
  function inferBatches(p, today = window.AbacusSync.effectiveDate()) {
    if(!window.ProcurementData || p.legacy || (p.cases && p.cases!==1))return [];
    return window.ProcurementData.orders.flatMap(o=>{
      if(/取消|建议单|履约待核|结算汇总/.test(o.status))return [];
      const cross=o.currency==='USD';
      if(!cross && /待.*调拨|待提交|待发货/.test(o.status))return [];
      const arrival=new Date(o.date+'T00:00:00Z');
      if(!Number.isFinite(arrival.getTime()))return [];
      if(cross)arrival.setUTCDate(arrival.getUTCDate()+4);
      const date=arrival.toISOString().slice(0,10);
      if(date>today)return [];
      return o.rows.filter(r=>r.barcode===p.barcode && r.currency===(p.costType==='usd'?'USD':'CNY') && !r.excluded && r.cost>0 &&
        (p.group==='clearance'?r.kind!=='常规':r.kind==='常规')).map(r=>({date,name:o.name+(cross?' · 开单＋4日默认上架':' · 按采购顺序推算'),qty:r.qty,cost:r.cost}));
    });
  }
  function model() {
    const id=product().id;
    if (!saved[id]) saved[id]=copy(reference[id] || {stock:null,batches:[],asOf:'待录入'});
    if((!saved[id].batches.length && !reference[id]) || (saved[id].inferred && !saved[id].manualBatches)) {
      const inferred=inferBatches(product());
      if(inferred.length || saved[id].inferred)Object.assign(saved[id],{batches:inferred,inferred:true,asOf:product().costType==='usd'?'跨境开单＋4自然日默认上架':'采购顺序推算（非入库核实）'});
    }
    return saved[id];
  }
  function save() {
    try { window.AbacusStore.setItem(key,JSON.stringify(saved)); storageError=''; }
    catch(e) { storageError='浏览器未能保存，本次修改仅在当前页面有效。'; }
  }
  // Qty is the remaining quantity at the baseline, not an original procurement quantity.
  function bands(batches, stock) {
    const sorted=batches.map((b,i)=>({...b,index:i})).filter(b=>b.qty>0).sort((a,b)=>a.date.localeCompare(b.date)||a.index-b.index);
    let newer=0;
    const rows=sorted.slice().reverse().map(b=>{
      const low=newer+1,high=newer+b.qty;
      const remaining=stock==null?null:Math.max(0,Math.min(b.qty,stock-newer));
      newer=high;
      return {...b,low,high,remaining,active:stock!=null&&stock>=low&&stock<=high};
    }).reverse();
    const valid=stock!==null&&Number.isInteger(stock)&&stock>=0&&stock<=newer;
    return {rows,total:newer,valid,active:valid?rows.find(b=>b.active):null};
  }
  let lastAutoSignature='';
  function syncIfChanged() {
    const m=model(),r=bands(m.batches,m.stock);
    const signature=JSON.stringify([product().id,m.stock,m.batches]);
    if(signature===lastAutoSignature)return;
    lastAutoSignature=signature;
    if(r.active){setValue('cost',r.active.cost);syncInputs();}
  }
  window.FifoModel={bands,inferBatches,syncIfChanged};
  function results() {
    const m=model(), p=product(), report=bands(m.batches,m.stock), active=report.active;
    const node=document.getElementById('fifoResults');
    if(!node)return;
    let headline='';
    if(!m.batches.length) headline='<div class="fifo-callout">待录入现存批次<br><span class="fifo-tiny">填每批剩余数量及成本，即可计算切换点。</span></div>';
    else if(!report.valid) headline='<div class="fifo-callout fifo-warning">'+(m.stock==null?'请输入剩余库存。':'库存超过已登记批次的 '+esc(report.total)+' 罐，请先补齐批次。')+'</div>';
    else if(m.stock===0) headline='<div class="fifo-callout">库存已售完，等待下一批补货。</div>';
    else {
      const index=report.rows.indexOf(active), next=report.rows[index+1];
      headline='<div class="fifo-callout">下一罐使用成本<b>'+cash(active.cost)+'</b><span class="fifo-tiny">'+esc(active.name)+'</span></div>';
      if(next) headline+='<p>再售 <strong>'+esc(active.remaining)+' 罐</strong>，库存剩 <strong>'+esc(active.low-1)+' 罐</strong> 时，切换为 <strong>'+cash(next.cost)+'</strong>。</p>';
      else headline+='<p>目前已到最后一批；这 '+esc(active.remaining)+' 罐售完后，已登记库存归零。</p>';
    }
    const cards=report.rows.map((b,i)=>'<div class="fifo-band '+(b.active&&report.valid?'active':'')+' '+(b.remaining===0?'sold':'')+'"><span class="fifo-price">'+cash(b.cost)+'</span><strong>剩 '+esc(b.low)+'–'+esc(b.high)+' 罐</strong><p>'+esc(b.name)+(b.active&&report.valid?'<span class="fifo-badge">当前</span>':'')+'</p><span class="fifo-tiny">'+esc(b.date)+' · 基准余量 '+esc(b.qty)+' 罐'+(report.valid?' · 推演剩 '+esc(b.remaining)+' 罐':'')+'</span></div>').join('');
    const match=active&&Math.abs(getValues().cost-active.cost)<.000001;
    node.innerHTML=(m.inferred?'<p class="fifo-callout fifo-warning">FIFO 推算：跨境按开单日期＋4个自然日默认上架，到期后参与；国产沿用采购顺序假设。取消、仅锁库、预存及不同货况不参与。此规则不代表仓库实查。</p>':'')+headline+'<div id="fifoBands">'+cards+'</div>'+(active?'<p class="fifo-tiny">'+(match?'已自动同步基础采购成本 '+cash(active.cost)+'，利润已重算。':'基础成本已手动修改；再次改变库存会重新自动匹配。')+'</p>':'<p class="fifo-tiny">尚未匹配有效批次，基础参数保留原成本，不代表当前FIFO成本。</p>');
    if(m.inferred)node.innerHTML=node.innerHTML.replace(/基准余量/g,'原采购量');
    if(unit()!=='罐')node.innerHTML=node.innerHTML.replace(/罐/g,unit());
    const err=document.getElementById('fifoStorageError');if(err)err.textContent=storageError;
  }
  let updatingStockInput=false;
  window.renderFifo=function() {
    // Keep the live input node (and its caret) while recalculating on keystrokes.
    if(updatingStockInput){results();return;}
    const p=product(),m=model(),ref=reference[p.id],root=document.getElementById('fifoPanel');
    const open=Array.from(root.querySelectorAll('details[open]')).map(d=>d.id);
    const history=ref&&ref.history?ref.history.map(r=>'<div class="fifo-history"><strong>'+esc(r[0])+'</strong>'+esc(r[1])+' 罐 · '+cash(r[2])+' / 罐</div>').join(''):'<p class="fifo-muted">此SKU尚未整理采购批次，可在右侧登记已入库货物。</p>';
    document.getElementById('fifoReference').innerHTML='<div class="fifo-eyebrow">PURCHASE RECORD</div><h3>采购与库存依据</h3><p class="fifo-muted">'+esc(p.name)+'</p>'+history+'<p class="fifo-tiny">以上是采购数量；右侧使用现存余量计算。</p>'+(ref?'<hr><p>'+esc(ref.note)+'</p>'+(ref.reserve?'<div class="fifo-callout fifo-warning">'+esc(ref.reserve)+'</div>':'')+'<details><summary>查看数据来源</summary><p class="fifo-muted">'+esc(ref.source)+'</p></details>':'')+'<hr><strong>先进先出怎么读</strong><p class="fifo-muted">先卖早入库的货。最新补货落在最底部库存区间；余量跨过分界点时，下一罐成本切换。</p><details><summary>150罐示例（非真实账目）</summary><p class="fifo-muted">最早30罐成本60，中间60罐成本80，最新60罐成本100。<br>剩121–150罐 → 成本60<br>剩61–120罐 → 成本80<br>剩1–60罐 → 成本100</p></details>';
    const edits=m.batches.map((b,i)=>'<div class="fifo-edit-row" data-row="'+i+'"><label>批次名称<input data-field="name" value="'+esc(b.name)+'" maxlength="80"></label><label>入库日期<input data-field="date" type="date" value="'+esc(b.date)+'"></label><div class="fifo-pair"><label>基准剩余量<input data-field="qty" type="number" min="0" step="1" value="'+esc(b.qty)+'"></label><label>成本 '+(p.costType==='usd'?'USD':'RMB')+'<input data-field="cost" type="number" min="0.01" step="0.01" value="'+esc(b.cost)+'"></label></div></div>').join('');
    root.innerHTML='<div class="fifo-eyebrow">INVENTORY · FIRST IN FIRST OUT</div><h3>库存走到哪，成本就到哪</h3><label for="fifoStock" class="fifo-tiny">剩余库存 / 出库推演（含已锁定未出库）</label><div class="fifo-stock"><input id="fifoStock" type="number" min="0" step="1" placeholder="待填写" value="'+esc(m.stock==null?'':m.stock)+'"><span>罐</span></div><p class="fifo-muted">基准：'+esc(m.asOf)+'<br>手动调整用于推演；非实时同步仓库。</p><div id="fifoResults"></div><hr><details id="fifoAdd"><summary>＋ 登记已入库补货</summary><form id="fifoAddForm" class="fifo-form"><label>批次 / 订单名<input name="batchName" required maxlength="80" placeholder="例如：10月水解补货"></label><label>实际入库日期<input name="batchDate" type="date" required></label><div class="fifo-pair"><label>补货数量<input name="batchQty" type="number" min="1" step="1" required></label><label>成本 '+(p.costType==='usd'?'USD':'RMB')+'<input name="batchCost" type="number" min="0.01" step="0.01" required></label></div><button type="submit">加入库存，重算区间</button><p class="fifo-tiny">以当前推演余量为起点加入；仅锁库、待调拨的数量请勿计入。</p></form></details><details id="fifoEdit"><summary>校准现存批次</summary><div class="fifo-form">'+(edits||'<p class="fifo-tiny">暂未登记批次。</p>')+'<button id="fifoSaveBatches" type="button">保存批次并回到基准总库存</button><p class="fifo-tiny">填基准日各批尚余数量。日期相同时按登记顺序先后出库；多批同成本也保留记录。</p></div></details><p id="fifoError" class="fifo-error" role="status"></p><p id="fifoStorageError" class="fifo-error" role="status"></p><p class="fifo-tiny">在线更改由服务器确认保存；离线只读。实际仓库若按效期出库或发生退货调拨，请先校准批次。这里只做成本提醒。</p>';
    if(unit()!=='罐')root.innerHTML=root.innerHTML.replace(/罐/g,unit());
    open.forEach(id=>{const d=document.getElementById(id);if(d)d.open=true;});
    results();
  };
  (function bindFifo(){
    const panel=document.getElementById('fifoPanel');
    panel.addEventListener('input',function(e){
      if (!window.AbacusSync.canWrite()) return;
      if(e.target.id!=='fifoStock')return;
      const n=e.target.value===''?null:Number(e.target.value);
      if(n!==null&&(!Number.isInteger(n)||n<0)) {document.getElementById('fifoError').textContent='库存请输入非负整数。';return;}
      document.getElementById('fifoError').textContent='';model().stock=n;save();
      updatingStockInput=true;
      try{render();}finally{updatingStockInput=false;}
    });
    panel.addEventListener('click',function(e){
      if (!window.AbacusSync.canWrite()) return;
      if(e.target.id==='fifoApply'){
        const a=bands(model().batches,model().stock).active;
        if(a){setValue('cost',a.cost);syncInputs();render();}
      }
      if(e.target.id==='fifoSaveBatches'){
        const rows=Array.from(panel.querySelectorAll('[data-row]')).map(node=>{
          const val=k=>node.querySelector('[data-field="'+k+'"]').value;
          return {name:val('name').trim(),date:val('date'),qty:val('qty')===''?NaN:Number(val('qty')),cost:val('cost')===''?NaN:Number(val('cost'))};
        });
        if(rows.some(b=>!b.name||!b.date||!Number.isInteger(b.qty)||b.qty<0||!Number.isFinite(b.cost)||b.cost<=0)){
          document.getElementById('fifoError').textContent='请补齐批次名称、日期、非负整数余量及大于0的成本。';return;
        }
        if(!rows.length)return;
        const m=model();m.inferred=false;m.batches=rows;m.stock=rows.reduce((n,b)=>n+b.qty,0);m.asOf='手动校准 '+new Date().toLocaleString('zh-CN');save();render();
      }
    });
    panel.addEventListener('submit',function(e){
      if (!window.AbacusSync.canWrite()) { e.preventDefault(); return; }
      if(e.target.id!=='fifoAddForm')return;e.preventDefault();
      const f=new FormData(e.target),qty=Number(f.get('batchQty')),cost=Number(f.get('batchCost')),date=String(f.get('batchDate')),name=String(f.get('batchName')).trim();
      if(!name||!date||!Number.isInteger(qty)||qty<=0||!Number.isFinite(cost)||cost<=0)return;
      const m=model(),r=bands(m.batches,m.stock);
      if(m.batches.length&&!r.valid){document.getElementById('fifoError').textContent='请先校准剩余库存与现存批次数量，再加入补货。';return;}
      if(m.batches.some(b=>date<b.date)){document.getElementById('fifoError').textContent='补货日期早于现存批次，请核实实际入库日期。';return;}
      m.batches=r.rows.filter(b=>b.remaining>0).map(b=>({name:b.name,date:b.date,qty:b.remaining,cost:b.cost}));
      m.batches.push({name,date,qty,cost});m.manualBatches=true;m.stock=m.batches.reduce((n,b)=>n+b.qty,0);m.asOf='手动登记 '+new Date().toLocaleString('zh-CN');save();render();
    });
  })();
})();
