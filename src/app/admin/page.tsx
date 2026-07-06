import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/security";
import { db } from "@/lib/db";
import { Simulator } from "@/components/Simulator";
import { RuleForm } from "@/components/RuleForm";
import { OrderGenerator } from "@/components/OrderGenerator";

export const dynamic="force-dynamic";
export default async function Admin(){
 const u=await currentUser();if(!u)redirect('/login');if(u.role!=="ADMIN")redirect('/member');
 const[users,orders,bound,ledgers,syncs,audits,products,rule,os]=await Promise.all([
  db.user.count(),db.externalOrder.count(),db.externalOrder.count({where:{boundUserId:{not:null}}}),db.pointLedger.findMany(),db.syncJob.findMany({orderBy:{startedAt:'desc'},take:6}),db.auditLog.findMany({orderBy:{createdAt:'desc'},take:6}),db.product.findMany({include:{variants:true}}),db.pointRule.findUniqueOrThrow({where:{id:'default'}}),db.externalOrder.findMany({orderBy:{externalOrderId:'asc'}})
 ]);
 const issued=ledgers.filter(x=>x.amount>0).reduce((s,x)=>s+x.amount,0),pending=ledgers.filter(x=>x.status==='PENDING').reduce((s,x)=>s+x.amount,0),deducted=Math.abs(ledgers.filter(x=>x.amount<0).reduce((s,x)=>s+x.amount,0));
 return <main className="section"><div className="container">
  <div className="eyebrow">Admin</div><div className="section-head"><h1 style={{fontSize:52,margin:'8px 0 28px'}}>运营控制台</h1><Link className="btn" href="/admin/assets">审核网站素材</Link></div>
  <div className="dashboard"><div className="metric">会员数量<strong>{users}</strong></div><div className="metric">模拟订单 / 已绑定<strong>{orders} / {bound}</strong></div><div className="metric">累计发放 / 待生效<strong>{issued} / {pending}</strong></div><div className="metric">已扣回积分<strong>{deducted}</strong></div></div>
  <section className="section"><div className="section-head"><div><h2 style={{fontSize:34}}>淘宝订单模拟器</h2><p className="muted">每个按钮都会经过服务端管理员校验、幂等积分引擎和审计日志。</p></div></div>
   <div className="table-wrap"><table><thead><tr><th>订单号</th><th>状态</th><th>绑定</th><th>退款</th><th>模拟操作</th></tr></thead><tbody>{os.map(o=><tr key={o.id}><td>{o.externalOrderId}</td><td>{o.status}</td><td>{o.boundUserId?'是':'否'}</td><td>¥{(o.refundAmount/100).toFixed(2)}</td><td><Simulator orderId={o.externalOrderId}/></td></tr>)}</tbody></table></div>
  </section>
  <div className="grid"><RuleForm points={rule.pointsPerYuan} days={rule.activationDays}/><OrderGenerator/><div className="card"><h3>最近同步记录</h3>{syncs.map(x=><p key={x.id}>{x.kind} · {x.status} · {x.processed} 条</p>)}{!syncs.length&&<p className="muted">暂无记录</p>}</div><div className="card"><h3>最近异常 / 审计</h3>{audits.map(x=><p key={x.id}>{x.action} · {x.targetType}</p>)}{!audits.length&&<p className="muted">暂无异常</p>}</div></div>
  <section className="section"><h2 style={{fontSize:34}}>商品管理</h2><div className="grid">{products.map(p=><div className="card" key={p.id}><span className="tag">{p.active?'上架':'下架'}</span><h3>{p.name}</h3><p className="muted">{p.brand} · {p.variants.length} 个 SKU</p></div>)}</div></section>
 </div></main>
}
