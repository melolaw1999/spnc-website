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
      <div><span className={styles.eyebrow}>BLACK CARD · TASTING ROOM</span><h1>先尝一口，<br />再选一整桶。</h1><p className={styles.lead}>每月认真尝一款，每款给你三次体验。<br />内测开卡首 3 个月，每月额外加赠 2 款。</p><a className={membershipStyles.lightButton} href="#tasting-menu">看看试喝菜单 <span>↓</span></a><p className={styles.heroNote}>基础每月 1 款 · 首 3 月每月 3 款 · 每款 3 袋 × 20g</p></div>
      <div className={styles.heroNumbers}><span>YOUR FIRST THREE MONTHS</span><div><strong>9</strong><p>首 3 个月，每月<br /><b>3 款口味 · 9 袋</b></p></div><footer><span>试喝装 <b>¥0</b></span><small>首盒免运费 · 第4个月起每月3袋</small></footer></div>
    </div></section>
    <section className={styles.section}><div className="container"><header className={styles.heading}><span className={styles.eyebrow}>A MENU WORTH EXPLORING</span><h2>从熟悉的经典，<br />尝到下一款心头好。</h2><p>我们从市面上自购选品，包括店里没有在卖的热门产品。先帮你验证心动的口味，再由你决定是否买整桶；具体可选项以每期菜单为准。</p></header>
      <div className={styles.collectionGrid}><article><span>01 / ON EXPLORER</span><h3>ON 口味探索</h3><p>以 ON 全系全口味为探索方向，逐步轮换收录；不要求一次买齐大包装。</p></article><article><span>02 / THE CLASSICS</span><h3>经典常青款</h3><p>从经典口味和畅销产品中选样，找到适合长期喝的那一款。</p></article><article><span>03 / TREND WATCH</span><h3>热门尝鲜款</h3><p>把想试的网红口味放进轮换计划，先亲口感受，再决定是否回购。</p></article></div>
    </div></section>
    <section id="tasting-menu" className={styles.menuSection}><div className="container"><header className={styles.heading}><span className={styles.eyebrow}>MENU PREVIEW · 内测选味</span><h2>这次，想认真尝哪一款？</h2><p>先用已收录的 ON 金标乳清口味体验组合。以下为候选菜单，并非现货清单；每期开放前会确认实际品项、批次与数量。</p></header><TastingMenuPreview /></div></section>
    <section className={styles.section}><div className={`container ${styles.rulesGrid}`}><header className={styles.heading}><span className={styles.eyebrow}>GOOD TO KNOW</span><h2>小份尝新，<br />规则也简单。</h2><Link className={membershipStyles.textButton} href="/membership">查看全部黑卡权益 →</Link></header><div className={styles.rules}>
      <article><h3>基础权益：每月 1 款，每款 3 袋</h3><p>每个 365 天会籍年度共 12 期，开卡当日开放首期，之后每满一个日历月开放下一期。基础每期任选 1 款口味，每款 3 袋，每袋 20g；每款合计 60g，分三次认真体验。</p></article>
      <article><h3>内测加赠：首次开卡的前 3 期，每期再加 2 款</h3><p>参与本轮内测的新会员，第 1–3 期均为基础 1 款 + 加赠 2 款，即每期任选 3 款、共 9 袋 / 180g。第 4 期起恢复每期 1 款、3 袋。加赠是否延续另行公告；已确认的首 3 期加赠不受后续调整影响，续费不自动重复享受开卡加赠。</p></article>
      <article><h3>试喝免费，首盒也免运费</h3><p>首次开卡的首期试喝盒独立寄送免运费，无需先买整桶。后续随同一会员的店铺实物订单寄送免试喝装运费，单独寄送每个包裹收取 ¥6 运费，仅寄中国大陆。开卡礼由首期加赠和首盒免运费组成，不再叠加一套重复试喝礼。</p></article>
      <article><h3>不用赶着领，可以合并寄送</h3><p>当年度未使用的额度可在会籍有效期内累计、合并寄送，不折现、不转赠，到期失效。加赠按额度所属期计算，合并寄送不重复增加额度；续费开启新会籍年度，基础权益继续按月发放。</p></article>
      <article><h3>同一个口味，给自己三次机会</h3><p>建议分几天、按平时习惯的比例与喝法重复体验，看看是否愿意长期喝。也可以尝试冰水、常温水或牛奶，记下更喜欢的搭配；冲泡比例以对应产品说明为准，不强制完成评价或购买整桶。</p></article>
      <article><h3>菜单轮换，缺货先沟通</h3><p>ON 全系全口味为逐步收录计划，并非每期全部在列。以当期实际菜单为准；选中口味缺货时可改选，未经确认不替换。因我们缺货导致整期无法领取的，保留该期补领资格。</p></article>
      <article><h3>每份都要知道自己在喝什么</h3><p>领取前展示实际产品的配料、过敏原、批次及效期信息。含乳等致敏成分的产品，请按实际标签判断；分装试喝会明确标注，不作为品牌原厂试用装宣传。20g 仅用于品尝，不等同于产品建议食用量。</p></article>
    </div></div></section>
  </main>;
}
