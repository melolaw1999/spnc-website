import { enterpriseContacts, mailto } from "@/data/contacts";
import { TaobaoServiceButton } from "@/components/TaobaoServiceButton";
import { pageMetadata } from "@/lib/site";
import styles from "./page.module.css";

export const metadata = pageMetadata("联系我们", "通过淘宝旺旺客服或 SPNC 理想营养企业邮箱联系我们。", "/contact");

export default function Contact() {
  return <main className={styles.main}><div className={`container narrow ${styles.content}`}>
    <h1 className="sr-only">联系我们</h1>
    <div className={styles.serviceRow}>
      <TaobaoServiceButton />
      <p>商品、订单与售后问题，建议优先从淘宝店联系旺旺客服。</p>
    </div>
    <div className={styles.grid}>{enterpriseContacts.map((contact) => <a className={`card contact-card ${styles.card}`} href={mailto(contact.email)} key={contact.email}><h2 className="minor-title">{contact.role}</h2><strong>{contact.email}</strong><p className="muted">{contact.note}</p></a>)}</div>
    <div className={`notice ${styles.notice}`}>理想营养不会索取淘宝密码、支付密码或短信验证码，也不会要求脱离淘宝订单私下转账。</div>
  </div></main>;
}
