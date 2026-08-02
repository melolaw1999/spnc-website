import type { Metadata } from "next";
import { AdminImportDemo } from "@/components/membership/AdminImportDemo";
import { MembershipPreviewNav } from "@/components/membership/MembershipPreviewNav";
import styles from "../../membership/membership.module.css";

export const metadata: Metadata = { title: "黑卡返利管理预览", robots: { index: false, follow: false } };

export default function MembershipAdminPreviewPage() {
  return <main className={styles.membershipPage}>
    <MembershipPreviewNav current="/admin/membership" />
    <section className={styles.adminHero}><div className="container"><span>SPNC MEMBERSHIP ADMIN</span><h1>月度返利结算。</h1><p>内部预览页。正式上线前将接入管理员权限、数据库与完整审计日志。</p></div></section>
    <section className={styles.adminPage}><div className="container">
      <div className={styles.adminWorkflow}>{[["01","导入订单","每月1日"],["02","自动匹配","订单 + SKU"],["03","异常复核","退款 / 未配置"],["04","生成批次","每月15日"]].map(([number,title,copy]) => <article key={number}><span>{number}</span><strong>{title}</strong><small>{copy}</small></article>)}</div>
      <section className={styles.adminSection}><header><div><span>MONTHLY IMPORT</span><h2>导入宝贝销售明细</h2></div><p>已锁定的正式模板：包含主订单、子订单、商品属性、买家实付、退款和确认收货状态。</p></header><AdminImportDemo /></section>
      <section className={styles.adminSection}><header><div><span>RULES</span><h2>当前返利商品规则</h2></div><p>未命中规则的规格不会自动返利，只进入异常队列。</p></header><div className={styles.rulesTable}><div className={styles.rulesHead}><span>匹配文字</span><span>商品</span><span>税类</span><span>计算</span><span>状态</span></div>{[["金标2磅","金标乳清 2 磅","跨境","实付 ÷ 1.091 × 2%"],["金标乳清5磅","金标乳清 5 磅","跨境","实付 ÷ 1.091 × 2%"]].map((row) => <div className={styles.rulesRow} key={row[0]}>{row.map((cell,index) => <span key={cell}>{index === 0 ? <code>{cell}</code> : cell}</span>)}<span className={styles.statusGreen}>启用</span></div>)}</div></section>
      <section className={styles.auditPanel}><span>AUDIT TRAIL PREVIEW</span><div><p><time>08-01 09:12</time><strong>系统</strong>完成7月明细导入，生成批次 2026-07</p><p><time>08-01 09:14</time><strong>系统</strong>识别返利规格并冻结收款信息</p><p><time>08-03 16:20</time><strong>管理员</strong>复核退款异常订单，保留处理记录</p></div></section>
    </div></section>
  </main>;
}

