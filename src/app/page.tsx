import Link from "next/link";
import { TaobaoButton } from "@/components/TaobaoButton";
import { enterpriseContacts, mailto } from "@/data/contacts";

const capabilities = [
  {
    name: "Performance Nutrition",
    title: "运动营养商品矩阵",
    text: "围绕乳清、分离乳清、水解乳清、肌酸、即饮蛋白等类别，整理在售商品与基础信息。",
  },
  {
    name: "Version Clarity",
    title: "国产 / 跨境 / 一般贸易版本说明",
    text: "用克制、可核对的方式说明不同销售版本在标签、渠道与包装表达上的差异。",
  },
  {
    name: "Traceability",
    title: "防伪验证 / 跨境溯源",
    text: "提供防伪标、溯源码、封膜、标签和收货检查的基础核验路径。",
  },
  {
    name: "Retail Channel",
    title: "淘宝成交 / 售后支持",
    text: "官网负责信息说明与信任建立，购买、付款、退款与售后仍回到淘宝订单完成。",
  },
] as const;

const brandMatrix = [
  ["ON", "Optimum Nutrition 相关乳清、分离乳清与训练补剂信息。"],
  ["YAVA", "YAVA LABS 乳清、分离乳清与肌酸类商品资料。"],
  ["Yamamoto", "Yamamoto ISO-FUJI 等分离乳清商品资料。"],
  ["BPJ", "即饮高蛋白饮料与便携营养场景。"],
  ["Arla", "乳品原料与相关营养商品资料整理方向。"],
  ["King Caesar", "后续纳入商品矩阵与版本资料的品牌方向。"],
] as const;

const onTopics = ["金标乳清", "金标分离", "白金水解", "肌酸", "谷氨酰胺"] as const;
const versionTopics = ["国产版本", "跨境进口", "一般贸易", "海外渠道", "Sam’s 版本"] as const;
const traceabilityTopics = ["防伪标", "溯源码", "封膜", "标签", "收货检查"] as const;
const knowledgeTopics = ["乳清 / 分离 / 水解区别", "为什么会有白色颗粒", "蛋白粉桶软说明", "肌酸基础知识", "版本选择指南"] as const;

export default function Home() {
  return <main>
    <section className="corporate-hero">
      <div className="container corporate-hero-grid">
        <div>
          <div className="eyebrow">Ideal Performance Nutrition</div>
          <h1>理想营养</h1>
          <p className="hero-slogan">正品源自正道</p>
          <p className="lead hero-lead">全球运动营养品牌精选渠道。专注全球运动营养品牌商品的正品供应、版本说明、防伪溯源与售后服务。</p>
          <div className="actions actions-left"><Link className="btn" href="/products">查看商品矩阵</Link><Link className="btn secondary" href="/authenticity">查看防伪溯源</Link><TaobaoButton label="进入淘宝店" secondary /></div>
        </div>
        <div className="hero-info-card" aria-label="官网定位说明">
          <span className="tag">Brand trust website</span>
          <h2>运动营养正品供应与版本说明中心</h2>
          <p>官网用于提供商品信息、版本说明、防伪溯源和售后指引。理想营养不代表所售品牌主体，也不承担排他渠道身份；所有购买行为继续跳转淘宝店完成。</p>
          <div className="hero-info-list"><span>商品矩阵</span><span>版本说明</span><span>防伪溯源</span><span>售后指引</span></div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head corporate-head"><div><div className="eyebrow">Core Capabilities</div><h2>从商品到售后，把关键信息讲清楚。</h2></div><p className="muted">企业官网式的信息结构，不做促销页，也不把官网变成独立商城。</p></div>
        <div className="grid four capability-grid">{capabilities.map((item) => <article className="card capability-card" key={item.name}><div className="capability-name">{item.name}</div><h3>{item.title}</h3><p className="muted">{item.text}</p></article>)}</div>
      </div>
    </section>

    <section className="section soft">
      <div className="container">
        <div className="section-head corporate-head"><div><div className="eyebrow">Brand Matrix</div><h2>商品 / 品牌矩阵预览</h2></div><Link className="text-link" href="/products">查看完整商品矩阵</Link></div>
        <div className="brand-matrix">{brandMatrix.map(([brand, text]) => <article className="brand-card" key={brand}><strong>{brand}</strong><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className="section">
      <div className="container split-section">
        <Link className="card feature-link panel-link" href="/on">
          <div className="eyebrow">ON Zone</div>
          <h2>ON 专区入口</h2>
          <p className="muted">集中查看 ON 相关商品资料。规格、口味、库存与价格以淘宝店实时页面为准。</p>
          <div className="topic-row">{onTopics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        </Link>
        <Link className="card feature-link panel-link" href="/versions">
          <div className="eyebrow">Version Clarity</div>
          <h2>版本说明入口</h2>
          <p className="muted">了解不同销售版本可能出现的标签、包装与渠道表达差异。</p>
          <div className="topic-row">{versionTopics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        </Link>
      </div>
    </section>

    <section className="section soft">
      <div className="container split-section">
        <Link className="card feature-link panel-link" href="/authenticity">
          <div className="eyebrow">Traceability</div>
          <h2>防伪溯源入口</h2>
          <p className="muted">把防伪核验、跨境溯源与收货检查拆成可执行步骤，减少误判。</p>
          <div className="topic-row">{traceabilityTopics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        </Link>
        <Link className="card feature-link panel-link" href="/knowledge">
          <div className="eyebrow">Knowledge Center</div>
          <h2>知识中心入口</h2>
          <p className="muted">以常见问题为起点，解释运动营养商品选择、包装现象与版本核对方法。</p>
          <div className="topic-row">{knowledgeTopics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        </Link>
      </div>
    </section>

    <section className="section">
      <div className="container contact-panel">
        <div><div className="eyebrow">Contact</div><h2>联系我们</h2><p className="muted">购买前请先查看商品矩阵、版本说明与防伪溯源；需要沟通时，可按事项选择企业邮箱。</p></div>
        <div className="contact-list">{enterpriseContacts.map((contact) => <a className="contact-row" href={mailto(contact.email)} key={contact.email}><span>{contact.role}</span><strong>{contact.email}</strong></a>)}</div>
      </div>
    </section>
  </main>;
}
