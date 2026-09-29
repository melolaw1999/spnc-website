import type { Metadata } from "next";
import Link from "next/link";
import { MembershipPreviewNav } from "@/components/membership/MembershipPreviewNav";
import { TastingMenuPreview } from "@/components/membership/TastingMenuPreview";
import membershipStyles from "../membership.module.css";
import styles from "./tasting.module.css";

export const metadata: Metadata = { title: "黑卡口味试饮室", robots: { index: false, follow: false } };

export default function TastingPage() {
  return <main className={membershipStyles.membershipPage}>
    <MembershipPreviewNav current="/membership/tasting" />
    <section className={styles.hero}><div className={`container ${styles.heroGrid}`}>
      <div><span className={styles.eyebrow}>BLACK CARD · TASTING ROOM</span><h1>先尝一口，<br />再选一整桶。</h1><p className={styles.lead}>每 3 个月，给味蕾一点新鲜感。<br />黑卡会员看菜单任选 3 份，试喝装免费。</p><a className={membershipStyles.lightButton} href="#tasting-menu">看看试喝菜单 <span>↓</span></a><p className={styles.heroNote}>我们自购选品 · 每份 15g · 一年最多 12 份</p></div>
      <div className={styles.heroNumbers}><span>YOUR QUARTERLY TREAT</span><div><strong>3</strong><p>个月一次<br /><b>任选 3 份</b></p></div><footer><span>试喝装 <b>¥0</b></span><small>随单免运费 / 单独寄 ¥6</small></footer></div>
    </div></section>
    <section className={styles.section}><div className="container"><header className={styles.heading}><span className={styles.eyebrow}>A MENU WORTH EXPLORING</span><h2>从熟悉的经典，<br />尝到下一款心头好。</h2><p>我们从市面上自购选品，轮换呈现不同品牌、系列与口味。具体可选项以每期菜单为准。</p></header>
      <div className={styles.collectionGrid}><article><span>01 / ON EXPLORER</span><h3>ON 口味探索</h3><p>以 ON 全系全口味为探索方向，逐步轮换收录；不要求一次买齐大包装。</p></article><article><span>02 / THE CLASSICS</span><h3>经典常青款</h3><p>从经典口味和畅销产品中选样，找到适合长期喝的那一款。</p></article><article><span>03 / TREND WATCH</span><h3>热门尝鲜款</h3><p>把想试的网红口味放进轮换计划，先亲口感受，再决定是否回购。</p></article></div>
    </div></section>
    <section id="tasting-menu" className={styles.menuSection}><div className="container"><header className={styles.heading}><span className={styles.eyebrow}>MENU PREVIEW · 内测选味</span><h2>这次，想试哪三味？</h2><p>先用已收录的 ON 金标乳清口味体验组合。以下为候选菜单，并非现货清单；每期开放前会确认实际品项、批次与数量。</p></header><TastingMenuPreview /></div></section>
    <section className={styles.section}><div className={`container ${styles.rulesGrid}`}><header className={styles.heading}><span className={styles.eyebrow}>GOOD TO KNOW</span><h2>小份尝新，<br />规则也简单。</h2><Link className={membershipStyles.textButton} href="/membership">查看全部黑卡权益 →</Link></header><div className={styles.rules}>
      <article><h3>每 3 个月一次，从开卡日算起</h3><p>每个 365 天会籍年度共 4 期：开卡当日及满 3、6、9 个日历月各开放一期。每期可领取 1 次、任选 3 款不同口味，每款 1 份；首期无需等满 3 个月。</p></article>
      <article><h3>3 份免费，寄送方式自己选</h3><p>每份 15g，为口味体验份量。与同一会员的店铺实物订单合并寄送，免试喝装运费；单独寄送收取 ¥6 运费，每期合并为一个包裹，仅寄中国大陆。</p></article>
      <article><h3>当期选，当期领</h3><p>须在会籍有效期内领取；本期资格在下一期开始时失效，末期至会籍到期日截止。不累积、不折现、不转赠，续费按新的会籍年度重新计算。</p></article>
      <article><h3>菜单轮换，缺货先沟通</h3><p>ON 全系全口味为逐步收录计划，并非每期全部在列。以当期实际菜单为准；选中口味缺货时可改选，未经确认不替换。因我们缺货导致整期无法领取的，保留该期补领资格。</p></article>
      <article><h3>每份都要知道自己在喝什么</h3><p>领取前展示实际产品的配料、过敏原、批次及效期信息。含乳等致敏成分的产品，请按实际标签判断；分装试喝会明确标注，不作为品牌原厂试用装宣传。15g 仅用于品尝，不等同于产品建议食用量。</p></article>
    </div></div></section>
  </main>;
}
