import Link from "next/link";
import { TaobaoButton } from "@/components/TaobaoButton";
import { enterpriseContacts, mailto } from "@/data/contacts";

const brands = ["ON", "YAVA", "Yamamoto", "BPJ", "Arla", "King Caesar"] as const;

const billboards = [
  {
    tone: "blue",
    title: "版本说明",
    subtitle: "把国产、跨境与一般贸易讲清楚。",
    text: "不同流通方式下的包装、标签与渠道信息，一页看明白。",
    href: "/versions",
    cta: "查看版本说明",
  },
  {
    tone: "silver",
    title: "防伪溯源",
    subtitle: "提供防伪标、溯源码与收货检查指引。",
    text: "在购买前后，帮助用户快速判断商品信息与版本来源。",
    href: "/authenticity",
    cta: "查看防伪溯源",
  },
  {
    tone: "white",
    title: "售后 FAQ",
    subtitle: "购买、退款与售后问题，提前说清楚。",
    text: "售后处理与购买行为仍通过淘宝店完成。",
    href: "/faq",
    cta: "查看售后 FAQ",
  },
] as const;

export default function Home() {
  return <main className="apple-home">
    <section className="apple-hero-screen">
      <div className="container apple-hero-inner">
        <div className="apple-copy">
          <div className="eyebrow">SPNC</div>
          <h1><span>SPNC</span><span>理想营养</span></h1>
          <p className="apple-subtitle">正品源自正道</p>
          <p className="apple-desc">全球运动营养品牌精选渠道。</p>
          <p className="apple-desc apple-desc-small">提供商品信息、版本说明、防伪溯源与售后指引。</p>
          <div className="actions"><Link className="btn" href="/products">查看商品矩阵</Link><Link className="btn secondary" href="/authenticity">查看防伪溯源</Link><TaobaoButton label="进入淘宝店" secondary /></div>
        </div>
        <div className="apple-visual" aria-hidden="true">
          <div className="visual-ring visual-ring-one" />
          <div className="visual-ring visual-ring-two" />
          <div className="visual-orb"><span>SPNC</span></div>
          <div className="visual-pill visual-pill-left">Protein</div>
          <div className="visual-pill visual-pill-right">Traceable</div>
        </div>
      </div>
    </section>

    <section className="home-billboard home-billboard-soft">
      <div className="container billboard-inner">
        <div className="billboard-copy">
          <h2>商品矩阵</h2>
          <p className="billboard-subtitle">覆盖蛋白粉、肌酸、饮品与功能补剂。</p>
          <div className="brand-cloud" aria-label="品牌矩阵">{brands.map((brand) => <span key={brand}>{brand}</span>)}</div>
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

    <section className="home-billboard home-billboard-contact">
      <div className="container billboard-inner contact-billboard">
        <div className="billboard-copy">
          <h2>联系我们</h2>
          <p className="billboard-subtitle">如有合作、咨询或售后问题，可通过以下邮箱联系。</p>
          <div className="mail-strip">{enterpriseContacts.map((contact) => <a href={mailto(contact.email)} key={contact.email}><span>{contact.email}</span><small>{contact.role}</small></a>)}</div>
        </div>
      </div>
    </section>
  </main>;
}
