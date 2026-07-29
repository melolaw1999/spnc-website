import { ProductCard } from "@/components/ProductCard";
import { publicSalesVersions } from "@/data/catalog";
import { getProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "ON 商品矩阵",
  "浏览 SPNC 理想营养当前公开的 ON 商品资料，了解跨境进口、国产版本与一般贸易说明，并前往淘宝店确认实时在售信息。",
  "/products",
);

export default async function Products({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const all = await getProducts();
  const products = all.filter((product) =>
    (!query.type || product.type === query.type)
    && (!query.version || product.salesVersion === query.version)
    && (!query.search || `${product.name}${product.brand}${product.summary}`.toLowerCase().includes(query.search.toLowerCase())),
  );
  const types = [...new Set(all.map((product) => product.type))];
  const showFamilies = !query.search && !query.type && !query.version;
  const domesticProducts = products.filter((product) => product.salesVersion === "国产版本");
  const otherProducts = products.filter((product) => product.salesVersion !== "国产版本");

  return <main className="section"><div className="container">
    <div className="section-head"><div>
      <div className="eyebrow">ON Product Library</div>
      <h1 className="page-title">ON 商品矩阵</h1>
      <p className="muted">当前官网只公开已有真实素材并完成身份核对的 ON 商品。价格、库存和在售 SKU 以淘宝店为准。</p>
      <div className="version-scope" aria-label="官网收录销售版本">{publicSalesVersions.map((version) => <span key={version}>{version}</span>)}</div>
    </div></div>
    <form className="filters">
      <input className="field filter-search" name="search" defaultValue={query.search} placeholder="搜索 ON 商品" />
      <select className="field filter-select" name="type" defaultValue={query.type || ""}><option value="">全部类别</option>{types.map((type) => <option key={type}>{type}</option>)}</select>
      <select className="field filter-select" name="version" defaultValue={query.version || ""}><option value="">全部版本</option>{publicSalesVersions.map((version) => <option key={version}>{version}</option>)}</select>
      <button className="btn">筛选</button>
    </form>
    {showFamilies ? <>
      <section className="catalog-family" aria-labelledby="domestic-family-title">
        <div className="catalog-family-head"><div><div className="eyebrow">Domestic Series</div><h2 id="domestic-family-title">ON 国产系列</h2></div><p className="muted">按国产包装独立登记规格与图片，不与跨境版本混用。</p></div>
        <div className="grid">{domesticProducts.map((product) => <ProductCard key={product.id} p={product} />)}</div>
      </section>
      <section className="catalog-family" aria-labelledby="other-products-title">
        <div className="catalog-family-head"><div><div className="eyebrow">More ON Products</div><h2 id="other-products-title">其他 ON 商品</h2></div></div>
        <div className="grid">{otherProducts.map((product) => <ProductCard key={product.id} p={product} />)}</div>
      </section>
    </> : <div className="grid">{products.map((product) => <ProductCard key={product.id} p={product} />)}</div>}
    {!products.length && <div className="card">没有匹配商品，请调整筛选条件。</div>}
  </div></main>;
}
