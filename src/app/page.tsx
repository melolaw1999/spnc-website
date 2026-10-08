import Link from "next/link";
import { TaobaoServiceButton } from "@/components/TaobaoServiceButton";
import { HomeProductMotion } from "@/components/HomeProductMotion";
import { publicSalesVersions } from "@/data/catalog";
import { publicContactEmail, serviceEmail, mailto } from "@/data/contacts";
import styles from "./home.module.css";

const onVersionAnchors = {
  "跨境进口": "on-imported-title",
  "国产版本": "on-domestic-title",
  "一般贸易": "on-general-trade-title",
} as const;

export default function Home() {
  return <main className="apple-home">
    <HomeProductMotion />

    <nav className={`container ${styles.quickLinks}`} aria-label="商品与选购帮助">
      <Link href="/on"><span>ON 商品</span><small>按版本选规格与口味</small><b aria-hidden="true">↗</b></Link>
      <Link href="/versions"><span>版本说明</span><small>了解三种销售版本</small><b aria-hidden="true">↗</b></Link>
      <Link href="/authenticity"><span>防伪溯源</span><small>查看包装与查验方式</small><b aria-hidden="true">↗</b></Link>
    </nav>

    <section className={styles.onExplore} aria-labelledby="on-gallery-title">
      <div className={`container ${styles.onExploreInner}`}>
        <div>
          <p className={styles.onExploreEyebrow}>OPTIMUM NUTRITION</p>
          <h2 id="on-gallery-title">探索 ON 全系列</h2>
          <p className={styles.onExploreDescription}>按销售版本，查看规格与口味。</p>
          <Link className={styles.onExploreLink} href="/on">进入 ON 商品专区 <span aria-hidden="true">↗</span></Link>
        </div>
        <nav className={styles.onVersionLinks} aria-label="按版本探索 ON 商品">
          {publicSalesVersions.map((version) => <Link key={version} href={`/on#${onVersionAnchors[version]}`}><span>{version}</span><b aria-hidden="true">↗</b></Link>)}
        </nav>
      </div>
    </section>

    <section className="home-billboard home-billboard-contact">
      <div className="container billboard-inner contact-billboard">
        <div className="billboard-copy">
          <h2>联系我们</h2>
          <div className={styles.contactService}>
            <TaobaoServiceButton />
          </div>
          <div className="mail-strip mail-strip-two">
            <a href={mailto(publicContactEmail)}><span>{publicContactEmail}</span><small>品牌合作 / 通用联系</small></a>
            <a href={mailto(serviceEmail)}><span>{serviceEmail}</span><small>售后客服 / 消费者咨询</small></a>
          </div>
        </div>
      </div>
    </section>
  </main>;
}
