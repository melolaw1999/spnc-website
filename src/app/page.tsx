import Image from "next/image";
import Link from "next/link";
import { catalog, publicSalesVersions } from "@/data/catalog";
import { publicContactEmail, serviceEmail, mailto } from "@/data/contacts";
import styles from "./home.module.css";

const bestSellerTaobaoUrl = "https://item.taobao.com/item.htm?id=794493827958&mi_id=0000-9V2LcrTfxjJgXjEcUmo8aM2EtipRAyJ6fZTVLQyMow&spm=a21xtw.29178619.0.0&xxc=shop&sku_properties=1627207%3A10026360243";

const billboards = [
  {
    tone: "silver",
    title: "防伪溯源",
    subtitle: "从防伪标到收货检查。",
    text: "结合订单、包装、封口与批次信息进行核验。",
    href: "/authenticity",
    cta: "查看防伪溯源",
  },
] as const;

const versionHighlights = [
  {
    number: "01",
    eyebrow: "Cross-border",
    title: "跨境进口",
    route: "保税仓发货",
    packaging: "英文包装为主",
    codes: ["防伪码", "溯源码"],
    image: "/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front-transparent-v2.png",
    imageAlt: "ON 金标乳清跨境进口版英文包装",
  },
  {
    number: "02",
    eyebrow: "General trade",
    title: "一般贸易",
    route: "原装进口",
    packaging: "中文标签",
    codes: ["防伪码"],
    image: "/assets/optimized/products/on/gold-standard-whey/selector/5lb/salted-caramel/product-cutout.webp",
    imageAlt: "ON 金标乳清一般贸易进口版中文包装",
  },
  {
    number: "03",
    eyebrow: "Made in China",
    title: "国产版本",
    route: "中国制造",
    packaging: "中文包装",
    codes: ["防伪码"],
    image: "/assets/optimized/products/on/domestic/gold-standard-whey/selector/5lb/double-rich-chocolate/product-cutout.webp",
    imageAlt: "ON 金标乳清国产版本中文包装",
  },
] as const;

export default function Home() {
  const featured = catalog.filter((product) => product.featured).slice(0, 4);
  return <main className="apple-home">
    <section className="home-hero" aria-label="为你的下一次突破做好准备">
      <div className="home-hero-visual">
        <Image
          src="/assets/hero/spnc-finish-line-rain.png"
          alt="雨中冲过终点线的跑者高举双臂"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 58vw"
        />
      </div>
      <div className="container home-hero-content">
        <h1>为你的下一次突破做好准备</h1>
      </div>
    </section>

    <section className="home-billboard" aria-labelledby="best-seller-title">
      <div className={`container billboard-inner ${styles.bestSeller}`}>
        <h2 className={styles.bestSellerTitle} id="best-seller-title">BEST SELLER</h2>
        <div className={styles.bestSellerVisual}>
          <Image
            className={styles.bestSellerProduct}
            src="/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front-transparent-v2.png"
            alt="ON 金标乳清蛋白粉 5 磅双重巧克力跨境版"
            width={1254}
            height={1254}
            sizes="(max-width: 560px) 88vw, 620px"
          />
        </div>
        <div className={styles.bestSellerActions}>
          <Link className="btn" href="/products/on-gold-standard-whey">官网产品详情</Link>
          <a className="btn secondary" href={bestSellerTaobaoUrl} target="_blank" rel="noopener noreferrer">淘宝店购买</a>
        </div>
      </div>
    </section>

    <section className={`home-billboard ${styles.versionHomeSection}`} aria-labelledby="home-versions-title">
      <div className={`container billboard-inner ${styles.versionHome}`}>
        <header className={styles.versionHomeHeader}>
          <p>ON PRODUCT VERSIONS</p>
          <h2 id="home-versions-title">同是 ON，<br />版本路径不同。</h2>
          <span>先看订单，再看包装与码。版本来自生产、进口与发货链路的不同。</span>
        </header>

        <div className={styles.versionHomeGrid}>
          {versionHighlights.map((version) => <article className={styles.versionHomeCard} key={version.number}>
            <div className={styles.versionHomeCardTop}>
              <span>{version.number}</span>
              <small>{version.eyebrow}</small>
            </div>
            <div className={styles.versionHomeProduct}>
              <Image src={version.image} alt={version.imageAlt} fill sizes="(max-width: 760px) 72vw, 27vw" />
            </div>
            <h3>{version.title}</h3>
            <p>{version.route}<i aria-hidden="true">·</i>{version.packaging}</p>
            <div>{version.codes.map((code) => <b key={code}>{code}</b>)}</div>
          </article>)}
        </div>

        <footer className={styles.versionHomeFooter}>
          <p>三个版本均有 ON 品牌防伪码；跨境版本另有溯源码。</p>
          <Link className="btn" href="/versions">看懂三个版本</Link>
        </footer>
      </div>
    </section>

    <section className="home-billboard home-billboard-products">
      <div className="container billboard-inner product-billboard">
        <div className="billboard-copy">
          <h2 className={styles.teamOn} aria-label="TEAM ON">
            <span aria-hidden="true">TEAM</span>
            <Image className={styles.teamOnLogo} src="/assets/brand/on-swoosh-logo.png" width={4096} height={1696} alt="" aria-hidden="true" sizes="(max-width: 560px) 150px, 220px" />
          </h2>
          <div className="version-scope version-scope-centered">{publicSalesVersions.map((version) => <span key={version}>{version}</span>)}</div>
          <div className="home-product-row">
            {featured.map((product) => <Link href={`/products/${product.slug}`} key={product.id} className="home-product-item">
              <Image src={product.images[0].asset.projectPath} alt={product.images[0].altText} width={product.images[0].asset.width} height={product.images[0].asset.height} loading="lazy" sizes="(max-width: 560px) 42vw, 210px" />
              <span>{product.name}</span>
            </Link>)}
          </div>
          <Link className="btn" href="/products">浏览商品矩阵</Link>
        </div>
      </div>
    </section>

    {billboards.map((item) => <section className={`home-billboard home-billboard-${item.tone}`} key={item.title}>
      <div className="container billboard-inner">
        <div className="billboard-copy">
          <h2>{item.title}</h2>
          <p className="billboard-subtitle">{item.subtitle}</p>
          <p className="billboard-text">{item.text}</p>
          <Link className="btn" href={item.href}>{item.cta}</Link>
        </div>
      </div>
    </section>)}

    <section className="home-billboard home-billboard-service">
      <div className="container billboard-inner">
        <div className="billboard-copy">
          <h2>售后登记</h2>
          <p className="billboard-subtitle">订单问题，先把资料一次提交清楚。</p>
          <p className="billboard-text">瘪桶、破损、版本疑问与活动权益均可登记；退款与交易处理仍回到淘宝订单完成。</p>
          <div className="actions"><Link className="btn" href="/support">提交工单</Link><Link className="btn secondary" href="/faq">查看售后 FAQ</Link></div>
        </div>
      </div>
    </section>

    <section className="home-billboard home-billboard-contact">
      <div className="container billboard-inner contact-billboard">
        <div className="billboard-copy">
          <h2>联系我们</h2>
          <p className="billboard-subtitle">合作与售后，分别找到正确入口。</p>
          <div className="mail-strip mail-strip-two">
            <a href={mailto(publicContactEmail)}><span>{publicContactEmail}</span><small>品牌合作 / 通用联系</small></a>
            <a href={mailto(serviceEmail)}><span>{serviceEmail}</span><small>售后客服 / 消费者咨询</small></a>
          </div>
        </div>
      </div>
    </section>
  </main>;
}
