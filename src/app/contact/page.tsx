import Link from "next/link";
import { TaobaoButton } from "@/components/TaobaoButton";
import { enterpriseContacts, mailto } from "@/data/contacts";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("联系我们", "SPNC 理想营养企业邮箱与淘宝店联系入口：品牌合作、售后客服与商务沟通。", "/contact");

export default function Contact() {
  return <main className="section"><div className="container narrow"><div className="eyebrow">Contact</div><h1 className="page-title">联系我们</h1><p className="lead detail-lead">品牌合作、售后咨询与商务沟通，请按事项选择邮箱。购买仍在淘宝店完成。</p><div className="contact-grid">{enterpriseContacts.map((contact) => <a className="card contact-card" href={mailto(contact.email)} key={contact.email}><h2 className="minor-title">{contact.role}</h2><strong>{contact.email}</strong><p className="muted">{contact.note}</p></a>)}</div><div className="contact-grid"><div className="card"><h2 className="minor-title">购买咨询</h2><p className="muted">在淘宝店查看实时在售规格、口味、价格与库存。</p><TaobaoButton label="打开理想营养淘宝店" /></div><div className="card"><h2 className="minor-title">订单售后</h2><p className="muted">可先登记订单、问题描述和图片；退款与交易处理仍回到原淘宝订单。</p><Link className="btn secondary" href="/support">提交售后工单</Link></div></div><div className="notice contact-notice">理想营养不会索取淘宝密码、支付密码或短信验证码，也不会要求脱离淘宝订单私下转账。</div></div></main>;
}
