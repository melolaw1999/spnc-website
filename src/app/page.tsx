import Image from "next/image";
import Link from "next/link";
import { TaobaoButton } from "@/components/TaobaoButton";
import { catalog, publicSalesVersions } from "@/data/catalog";
import { publicContactEmail, serviceEmail, mailto } from "@/data/contacts";

const billboards = [
  {
    tone: "blue",
    title: "版本说明",
    subtitle: "把跨境、国产与一般贸易讲清楚。",
    text: "核对包装、标签与订单中的销售版本。",
    href: "/versions",
    cta: "查看版本说明",
  },
  {
    tone: "silver",
    title: "防伪溯源",
    subtitle: "从防伪标到收货检查。",
    text: "结合订单、包装、封口与批次信息进行核验。",
    href: "/authenticity",
    cta: "查看防伪溯源",
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

    <section className="home-billboard home-billboard-identity">
      <div className="container billboard-inner identity-inner">
        <div className="billboard-copy">
          <div className="eyebrow">SPNC · 理想营养</div>
          <h2>长期训练，<br />需要可靠的选择。</h2>
          <p className="billboard-text">提供 ON 商品信息、版本说明、防伪溯源与售后指引。</p>
          <div className="actions"><Link className="btn" href="/products">查看 ON 商品</Link><TaobaoButton label="进入淘宝店" secondary /></div>
        </div>
      </div>
    </section>

    <section className="home-billboard home-billboard-products">
      <div className="container billboard-inner product-billboard">
        <div className="billboard-copy">
          <div className="eyebrow">ON Product Library</div>
          <h2>ON 商品矩阵</h2>
          <p className="billboard-subtitle">只展示已经确认的真实商品素材。</p>
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
