import type { Metadata } from "next";
import Link from "next/link";
import { MembershipCard } from "@/components/membership/MembershipCard";
import { MembershipPreviewNav } from "@/components/membership/MembershipPreviewNav";
import styles from "../membership.module.css";

export const metadata: Metadata = { title: "黑卡会员中心预览", robots: { index: false, follow: false } };

const claims = [
  ["202607•••••••9812", "金标乳清 5 磅", "2026-07-18", "¥13.35", "待结算", "gold"],
  ["202606•••••••2769", "金标乳清 2 磅", "2026-06-09", "¥5.65", "已打款", "green"],
  ["202605•••••••6143", "金标乳清 5 磅", "2026-05-21", "¥12.47", "已打款", "green"],
] as const;

export default function MembershipAccountPage() {
  return <main className={styles.membershipPage}>
    <MembershipPreviewNav current="/membership/account" />
    <section className={styles.accountHero}>
      <div className={`container ${styles.accountHeroGrid}`}>
        <div className={styles.accountGreeting}><span>WELCOME BACK</span><h1>晚上好，林先生。</h1><p>你的黑卡会籍状态正常。下一次返利批量打款日为8月15日。</p><div className={styles.accountActions}><Link className={styles.primaryButton} href="/membership/claim">登记返利订单</Link><button className={styles.secondaryButton} type="button">管理收款信息</button></div></div>
        <MembershipCard compact memberName="LIN **" memberNumber="SPNC •••• 0128" validThrough="2027.08.02" />
      </div>
    </section>

    <section className={styles.accountContent}>
      <div className="container">
        <div className={styles.balanceGrid}>
          <article className={styles.balancePrimary}><span>累计返利</span><strong>¥126.84</strong><p>已打款 ¥94.17</p></article>
          <article><span>本期待结算</span><strong>¥32.67</strong><p>预计8月15日打款</p></article>
          <article><span>本期已核验</span><strong>3<small>笔</small></strong><p>截至8月1日</p></article>
          <article><span>会籍剩余</span><strong>365<small>天</small></strong><p>2027年8月2日到期</p></article>
        </div>

        <div className={styles.accountGrid}>
          <section className={styles.activityPanel}>
            <header><div><span>REBATE ACTIVITY</span><h2>返利记录</h2></div><button type="button">查看全部</button></header>
            <div className={styles.activityList}>{claims.map(([order, product, date, amount, status, tone]) => <article key={order}><div className={styles.activityIcon}>{product.includes("5") ? "5" : "2"}<small>LB</small></div><div><strong>{product}</strong><span>{order} · {date}</span></div><div><b>{amount}</b><em className={tone === "green" ? styles.statusGreen : styles.statusGold}>{status}</em></div></article>)}</div>
          </section>
          <aside className={styles.accountSide}>
            <div className={styles.payoutCard}><span>PAYOUT METHOD</span><h3>支付宝</h3><strong>138••••8000</strong><p>林*</p><button type="button">修改收款信息</button></div>
            <div className={styles.cycleCard}><span>当前结算周期</span><strong>2026年7月</strong><div><i style={{ width: "72%" }} /></div><p><b>8月1日</b> 已完成订单核对</p><p><b>8月15日</b> 企业支付宝打款</p></div>
          </aside>
        </div>
      </div>
    </section>
  </main>;
}

