import type { Metadata } from "next";
import Link from "next/link";
import { MembershipCard } from "@/components/membership/MembershipCard";
import { MembershipPreviewNav } from "@/components/membership/MembershipPreviewNav";
import styles from "./membership.module.css";

export const metadata: Metadata = { title: "黑卡会员预览", robots: { index: false, follow: false } };

const rebateExamples = [
  ["跨境商品", "买家实付 ÷ 1.091", "再返 2%"],
  ["国产 / 一般贸易", "买家实付 ÷ 1.13", "再返 2%"],
] as const;

export default function MembershipPage() {
  return <main className={styles.membershipPage}>
    <MembershipPreviewNav current="/membership" />
    <section className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>SPNC BLACK MEMBERSHIP</p>
          <h1>每一次长期选择，<br />都有回报。</h1>
          <p className={styles.heroLead}>¥299 / 年。黑卡会员在会籍有效期内购买指定商品，可按未税实付金额获得2%返利。</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href="/membership/activate">已有CDKEY，立即开卡</Link><Link className={styles.textButton} href="/membership/account">预览会员中心 <span>→</span></Link></div>
          <div className={styles.heroFinePrint}>会员服务于淘宝店铺购买 · 从成功兑换日起365天有效</div>
        </div>
        <div className={styles.heroCardWrap}><MembershipCard /><div className={styles.cardPrice}><span>ANNUAL</span><strong>¥299</strong><small>一年会籍</small></div></div>
      </div>
    </section>

    <section className={styles.benefitsSection}>
      <div className="container">
        <header className={styles.sectionHeader}><span>MEMBERSHIP BENEFITS</span><h2>简单、透明、按月兑现。</h2></header>
        <div className={styles.benefitGrid}>
          <article><small>01</small><strong>2%</strong><h3>指定商品返利</h3><p>按规则剔除对应税费，以未税实付金额计算。</p></article>
          <article><small>02</small><strong>1<em>st</em></strong><h3>每月核对</h3><p>每月1日导入上月宝贝销售明细，自动匹配规格与订单。</p></article>
          <article><small>03</small><strong>15<em>th</em></strong><h3>集中打款</h3><p>审核通过的返利，于每月15日通过企业支付宝批量发放。</p></article>
        </div>
      </div>
    </section>

    <section className={styles.calculationSection}>
      <div className={`container ${styles.calculationGrid}`}>
        <div className={styles.calculationIntro}><span>HOW IT WORKS</span><h2>只登记订单，<br />不用自己算金额。</h2><p>买家只选择已购买商品并填写订单号。订单实付、税类、退款状态与确认收货时间，全部以淘宝月度明细为准。</p></div>
        <div className={styles.formulaPanel}>{rebateExamples.map(([name, formula, result], index) => <article key={name}><small>0{index + 1}</small><div><span>{name}</span><strong>{formula}</strong></div><i>×</i><b>{result}</b></article>)}<footer><span>退款与运费</span><p>运费和会员费不参与返利；全额退款取消，部分退款按实际保留金额重算。</p></footer></div>
      </div>
    </section>

    <section className={styles.flowSection}>
      <div className="container">
        <header className={styles.sectionHeaderDark}><span>MONTHLY SETTLEMENT</span><h2>一条看得见的结算路径。</h2></header>
        <div className={styles.flowGrid}>
          {[
            ["01", "淘宝购买会籍", "获得一次性CDKEY"],
            ["02", "官网注册开卡", "CDKEY + 会员订单号"],
            ["03", "登记消费订单", "选择后台已配置商品"],
            ["04", "每月自动核对", "规格、实付、退款、收货"],
            ["05", "支付宝收款", "每月15日集中发放"],
          ].map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
        </div>
      </div>
    </section>

    <section className={styles.ctaSection}><div className={`container ${styles.ctaCard}`}><div><span>READY WHEN YOU ARE</span><h2>拿到CDKEY后，<br />从这里开始。</h2></div><div><p>开卡时间即会籍开始时间。续费会籍将在原到期日之后顺延365天。</p><Link className={styles.lightButton} href="/membership/activate">注册并兑换黑卡</Link></div></div></section>
  </main>;
}

