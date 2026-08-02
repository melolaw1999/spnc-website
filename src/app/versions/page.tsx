import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/site";
import styles from "./versions.module.css";

export const metadata = pageMetadata(
  "版本说明",
  "看懂 ON 跨境进口、一般贸易进口与国产版本在生产进口方式、发货链路、包装标签及防伪溯源码上的区别。",
  "/versions",
);

const versions = [
  {
    id: "cross-border",
    number: "01",
    eyebrow: "Cross-border import",
    title: "跨境进口版",
    short: "保税仓发货",
    summary: "原装进口的跨境销售版本，下单后由境内保税仓发出，通常以英文包装为主。",
    image: "/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front-transparent-v2.png",
    imageAlt: "ON 金标乳清跨境进口版英文包装示例",
    facts: ["原装进口", "境内保税仓发货", "通常以英文包装为主"],
    codes: ["ON 品牌防伪码", "进口商品溯源码"],
    recognition: "订单页通常会注明跨境、保税或跨境进口；实物除 ON 防伪码外，另有进口商品溯源码。",
  },
  {
    id: "general-trade",
    number: "02",
    eyebrow: "General trade import",
    title: "一般贸易进口版",
    short: "原装进口 · 境内流通",
    summary: "原装进口后按一般贸易链路在境内销售，正面或背面通常可见中文标签信息。",
    image: "/assets/optimized/products/on/gold-standard-whey/selector/5lb/salted-caramel/product-cutout.webp",
    imageAlt: "ON 金标乳清一般贸易进口版中文包装示例",
    facts: ["原装进口", "一般贸易链路", "中文标签信息"],
    codes: ["ON 品牌防伪码"],
    recognition: "重点查看订单中的销售版本，以及实物中文标签上的进口商、代理商、原产国等信息。",
  },
  {
    id: "domestic",
    number: "03",
    eyebrow: "Made in China",
    title: "国产版本",
    short: "中国制造",
    summary: "ON 品牌体系下的中国生产版本，包装以中文信息为主，可见中国制造或受托生产相关信息。",
    image: "/assets/optimized/products/on/domestic/gold-standard-whey/selector/5lb/double-rich-chocolate/product-cutout.webp",
    imageAlt: "ON 金标乳清国产版本中文包装示例",
    facts: ["ON 品牌体系产品", "中国生产", "中文包装信息"],
    codes: ["ON 品牌防伪码"],
    recognition: "重点查看实物标签中的产地、生产商或受托生产信息，并与订单中的国产版本说明核对。",
  },
] as const;

export default function Versions() {
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p>ON PRODUCT VERSIONS</p>
          <h1>同是 ON，<br />版本路径不同。</h1>
          <span>先看订单，再看包装与码。版本区别来自生产、进口和发货链路，不应只凭桶身外观判断。</span>
          <div className={styles.heroActions}>
            <a className="btn" href="#compare">快速对比</a>
            <Link className="btn secondary" href="/authenticity">查看防伪溯源</Link>
          </div>
        </div>

        <div className={styles.heroProducts} aria-label="跨境进口、一般贸易进口与国产版本包装示例">
          {versions.map((version, index) => <figure className={styles.heroProduct} key={version.id} data-position={index}>
            <Image src={version.image} alt={version.imageAlt} fill priority={index === 0} sizes="(max-width: 760px) 42vw, 25vw" />
            <figcaption>{version.title}</figcaption>
          </figure>)}
        </div>

        <div className={styles.heroCodeRule}>
          <div><span>三个版本</span><strong>均有防伪码</strong></div>
          <i aria-hidden="true">＋</i>
          <div><span>跨境进口</span><strong>另有溯源码</strong></div>
        </div>
      </div>
    </section>

    <section className={styles.versionSection} aria-labelledby="version-detail-title">
      <div className="container">
        <header className={styles.sectionHead}>
          <div><p>THREE ROUTES</p><h2 id="version-detail-title">三条路径，一次看懂。</h2></div>
          <span>包装示例用于帮助识别，具体文字、排版和细节可能随产品与批次更新。</span>
        </header>

        <div className={styles.versionList}>
          {versions.map((version) => <article className={styles.versionCard} id={version.id} key={version.id}>
            <div className={styles.versionNumber}><span>{version.number}</span><small>{version.eyebrow}</small></div>
            <div className={styles.versionImage}>
              <Image src={version.image} alt={version.imageAlt} fill sizes="(max-width: 760px) 72vw, 31vw" />
            </div>
            <div className={styles.versionCopy}>
              <span>{version.short}</span>
              <h3>{version.title}</h3>
              <p>{version.summary}</p>
              <ul>{version.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
              <div className={styles.codeRow}>{version.codes.map((code) => <b key={code}>{code}</b>)}</div>
              <div className={styles.recognition}><small>识别重点</small><p>{version.recognition}</p></div>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className={styles.compareSection} id="compare" aria-labelledby="compare-title">
      <div className="container">
        <header className={styles.compareHead}>
          <p>QUICK COMPARISON</p>
          <h2 id="compare-title">只记住这四项。</h2>
        </header>

        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>版本</th><th>生产 / 进口</th><th>发货 / 流通</th><th>包装识别</th><th>码</th></tr></thead>
            <tbody>
              <tr><th>跨境进口</th><td>原装进口</td><td>境内保税仓发货</td><td>通常英文包装为主</td><td><b>防伪码</b><b>溯源码</b></td></tr>
              <tr><th>一般贸易</th><td>原装进口</td><td>一般贸易链路境内销售</td><td>中文标签信息</td><td><b>防伪码</b></td></tr>
              <tr><th>国产版本</th><td>中国生产</td><td>境内生产与销售</td><td>中文包装及生产信息</td><td><b>防伪码</b></td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.checkSteps}>
          <article><span>01</span><h3>先看订单</h3><p>核对商品页或订单中标注的销售版本，不靠记忆判断。</p></article>
          <article><span>02</span><h3>再看实物</h3><p>查看包装语言、产地、进口商、生产商与批次信息。</p></article>
          <article><span>03</span><h3>最后验码</h3><p>三个版本均验证防伪码；跨境进口再扫描溯源码。</p></article>
        </div>

        <div className={styles.finalNote}>
          <div><span>重要说明</span><p>同一商品可能因销售地区、规格和批次更新出现包装差异。版本说明用于核对销售链路，不是真伪的单一判断依据；最终以淘宝订单和实际到货标签为准。</p></div>
          <Link className="btn" href="/authenticity">继续查看防伪溯源</Link>
        </div>
      </div>
    </section>
  </main>;
}
