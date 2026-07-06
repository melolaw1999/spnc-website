import type { Metadata } from "next";
import { taobaoStoreUrl } from "@/lib/site";

export const metadata: Metadata = { title: "联系我们", description: "通过理想营养淘宝店联系购买咨询与订单售后。官网不处理付款，不索取淘宝密码或验证码。", alternates: { canonical: "/contact" } };

export default function Contact() {
  return <main className="section"><div className="container narrow"><div className="eyebrow">Contact</div><h1 className="page-title">联系我们</h1><p className="lead detail-lead">购买咨询、订单核验和售后处理，请从淘宝店或对应淘宝订单进入，便于保留完整交易记录。</p><div className="contact-grid"><div className="card"><h2 className="minor-title">购买咨询</h2><p className="muted">查看在售规格、口味与实时库存。</p><a className="btn" href={taobaoStoreUrl} target="_blank" rel="noopener noreferrer">打开淘宝店</a></div><div className="card"><h2 className="minor-title">订单售后</h2><p className="muted">请从对应淘宝订单联系卖家，并保留商品包装、批次和必要的开箱证据。</p><a className="btn secondary" href={taobaoStoreUrl} target="_blank" rel="noopener noreferrer">前往淘宝订单渠道</a></div></div><div className="notice contact-notice">理想营养不会索取淘宝密码、支付密码、短信验证码或私下转账。官网当前不提供付款功能。</div></div></main>;
}
