import Image from "next/image";
import Link from "next/link";
import { HomeCarousel } from "@/components/HomeCarousel";
import { TaobaoButton } from "@/components/TaobaoButton";
import styles from "./OnFeaturedCarousel.module.css";

const brandStatementProducts = [
  {
    src: "/assets/optimized/products/on/creatine/on-micronized-creatine-360g-blueberry-lemonade-front-transparent.webp",
    alt: "ON 微粉化肌酸粉 360 克蓝莓柠檬味",
  },
  {
    src: "/assets/products/on/hydro-whey/on-platinum-hydrowhey-1-8lb-turbo-chocolate-front.png",
    alt: "ON 水解乳清蛋白粉",
  },
  {
    src: "/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front-transparent-v2.png",
    alt: "ON 金标乳清蛋白粉",
  },
  {
    src: "/assets/products/on/isolate/on-gold-standard-isolate-3lb-chocolate-bliss-front-official.png",
    alt: "ON 金标分离乳清蛋白粉",
  },
  {
    src: "/assets/products/on/gold-standard-whey/selector/2lb/delicious-strawberry/product-front.png",
    alt: "ON 金标乳清蛋白粉草莓味",
  },
] as const;

const versionHighlights = [
  {
    number: "01",
    title: "跨境进口",
    route: "保税仓发货",
    packaging: "英文包装为主",
    codes: ["防伪码", "溯源码"],
    image: "/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front-transparent-v2.png",
    imageAlt: "ON 金标乳清跨境进口版英文包装",
  },
  {
    number: "02",
    title: "一般贸易",
    route: "原装进口",
    packaging: "中文标签",
    codes: ["防伪码"],
    image: "/assets/optimized/products/on/gold-standard-whey/selector/5lb/salted-caramel/product-cutout.webp",
    imageAlt: "ON 金标乳清一般贸易进口版中文包装",
  },
  {
    number: "03",
    title: "国产版本",
    route: "中国制造",
    packaging: "中文包装",
    codes: ["防伪码"],
    image: "/assets/optimized/products/on/domestic/gold-standard-whey/selector/5lb/double-rich-chocolate/product-cutout.webp",
    imageAlt: "ON 金标乳清国产版本中文包装",
  },
] as const;

export function OnFeaturedCarousel() {
  return <div className={styles.featured}>
    <HomeCarousel label="ON 专区精选内容" labels={["理想营养", "三个版本", "防伪溯源"]}>
    <section className="home-billboard" aria-labelledby="brand-statement-title">
      <div className={`container billboard-inner ${styles.brandStatement}`}>
        <div className={styles.brandStatementCopy}>
          <p className={styles.brandStatementEyebrow}>SPNC · 理想营养</p>
          <h2 id="brand-statement-title"><span>立足全球，</span><span>耕耘中国大陆。</span></h2>
          <div className={styles.brandStatementRule} aria-hidden="true" />
          <p className={styles.brandStatementLead}>为中国超 <strong>10,000</strong> 位用户</p>
          <p className={styles.brandStatementBody}>持续供应不可替代的<br />专业运动营养品。</p>
          <div className={styles.brandStatementActions}>
            <Link className="btn" href="#on-products">浏览 ON 商品</Link>
            <TaobaoButton label="淘宝店购买" secondary />
          </div>
        </div>

        <div className={styles.brandStatementProducts} aria-label="理想营养供应的 ON 专业运动营养产品">
          {brandStatementProducts.map((product) => <Image
            className={styles.brandStatementProduct}
            src={product.src}
            alt={product.alt}
            width={1254}
            height={1254}
            sizes="(max-width: 760px) 31vw, 21vw"
            key={product.src}
          />)}
        </div>
      </div>
    </section>

    <section className={`home-billboard ${styles.versionHomeSection}`} aria-labelledby="home-versions-title">
      <div className={`container billboard-inner ${styles.versionHome}`}>
        <header className={styles.versionHomeHeader}>
          
          <h2 id="home-versions-title">同是 ON，<br />版本路径不同。</h2>
          <span>先看订单，再看包装与码。版本来自生产、进口与发货链路的不同。</span>
        </header>

        <div className={styles.versionHomeGrid}>
          {versionHighlights.map((version) => <article className={styles.versionHomeCard} key={version.number}>
            <div className={styles.versionHomeCardTop}>
              <span>{version.number}</span>
              
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

    <section className={`home-billboard ${styles.authHomeSection}`} aria-labelledby="home-auth-title">
      <div className={`container billboard-inner ${styles.authHome}`}>
        <div className={styles.authHomeCopy}>
          
          <h2 id="home-auth-title">两种码，<br />各有用途。</h2>
          <span>国产与一般贸易核对 ON 防伪码；跨境进口还要核对进口商品溯源码。</span>

          <div className={styles.authHomeRules}>
            <div><small>01</small><p>国产 / 一般贸易</p><strong>防伪码</strong></div>
            <div><small>02</small><p>跨境进口</p><strong>防伪码 <i aria-hidden="true">＋</i> 溯源码</strong></div>
          </div>

          <Link className="btn" href="/authenticity">看懂两种码</Link>
        </div>

        <div className={styles.authHomeVisual} aria-label="ON 防伪码与进口商品溯源码标签示意">
          <figure className={styles.authHomeTrace}>
            <Image src="/assets/authenticity/import-traceability-label-crop.png" width={810} height={1190} alt="进口商品防伪溯源码标签示意" sizes="(max-width: 560px) 37vw, 260px" />
            <figcaption><span>02</span>进口商品溯源码</figcaption>
          </figure>
          <figure className={styles.authHomeOn}>
            <Image src="/assets/authenticity/on-authentication-label-transparent.png" width={1035} height={1035} alt="ON 百分百防伪验证标签示意" sizes="(max-width: 560px) 68vw, 430px" />
            <figcaption><span>01</span>ON 防伪码</figcaption>
          </figure>
        </div>

        <div className={styles.authHomeSteps} aria-label="防伪溯源核对步骤">
          <span><b>01</b>扫描实物标签</span>
          <span><b>02</b>按提示刮开验证</span>
          <span><b>03</b>核对订单与商品</span>
        </div>
      </div>
    </section>
    </HomeCarousel>
  </div>;
}
