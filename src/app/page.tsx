import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/products";
import { taobaoStoreUrl } from "@/lib/site";

export default async function Home() {
  const products = await getProducts();
  return <main>
    <section className="hero"><div className="container"><div className="eyebrow">Ideal Performance Nutrition</div><h1>为认真训练的人，提供可靠的营养选择</h1><p className="lead">稳定供应链、透明版本说明、专业产品支持。我们相信，信任来自把每一件事讲清楚。</p><div className="actions"><Link className="btn" href="/products">浏览商品矩阵</Link><a className="btn secondary" href={taobaoStoreUrl} target="_blank" rel="noopener noreferrer">前往淘宝店</a></div></div></section>
    <section className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">Featured</div><h2>真实产品，清楚地选</h2></div><p className="muted">规格、口味与版本信息集中呈现，不用在促销话术里找答案。</p></div><div className="grid">{products.filter((product) => product.featured).slice(0, 3).map((product) => <ProductCard key={product.id} p={product} />)}</div></div></section>
    <section className="section soft"><div className="container"><div className="section-head"><h2>为什么选择理想营养</h2></div><div className="grid"><div className="card"><span className="tag">01</span><h3>正品源自正道</h3><p className="muted">重视采购路径、订单核验和批次信息，不使用无法证明的授权或背书。</p></div><div className="card"><span className="tag">02</span><h3>版本解释透明</h3><p className="muted">不同销售版本在包装和标签上可能不同，我们把基础区别讲清楚。</p></div><div className="card"><span className="tag">03</span><h3>专业而克制</h3><p className="muted">补剂不是药品，也不是训练捷径。选择应回到饮食、训练与真实需要。</p></div></div></div></section>
    <section className="section"><div className="container"><div className="grid"><Link className="card feature-link" href="/on"><div className="eyebrow">Optimum Nutrition</div><h2>ON 专区</h2><p className="muted">集中查看金标乳清、分离乳清、水解乳清和训练补剂。</p></Link><Link className="card feature-link" href="/authenticity"><div className="eyebrow">Authenticity</div><h2>防伪与溯源</h2><p className="muted">了解防伪标签、溯源码和包装批次变化。</p></Link><Link className="card feature-link" href="/versions"><div className="eyebrow">Versions</div><h2>版本说明</h2><p className="muted">理解一般贸易、跨境与其他销售版本的基础差异。</p></Link></div></div></section>
  </main>;
}
