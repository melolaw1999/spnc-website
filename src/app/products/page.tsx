import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/site";
import { publicSalesVersions } from "@/data/catalog";

export const metadata = pageMetadata("ON 商品矩阵", "浏览 SPNC 理想营养当前公开的 ON 商品资料，了解跨境进口、国产版本与一般贸易说明，并前往淘宝店确认实时在售信息。", "/products");

export default async function Products({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const all = await getProducts();
  const products = all.filter((product) => (!query.type || product.type === query.type) && (!query.search || `${product.name}${product.brand}${product.summary}`.toLowerCase().includes(query.search.toLowerCase())));
  const types = [...new Set(all.map((product) => product.type))];
  return <main className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">ON Product Library</div><h1 className="page-title">ON 商品矩阵</h1><p className="muted">当前官网只公开已有真实素材并完成身份核对的 ON 商品。价格、库存和在售 SKU 以淘宝店为准。</p><div className="version-scope" aria-label="官网收录销售版本">{publicSalesVersions.map((version) => <span key={version}>{version}</span>)}</div></div></div><form className="filters"><input className="field filter-search" name="search" defaultValue={query.search} placeholder="搜索 ON 商品" /><select className="field filter-select" name="type" defaultValue={query.type || ""}><option value="">全部类别</option>{types.map((type) => <option key={type}>{type}</option>)}</select><button className="btn">筛选</button></form><div className="grid">{products.map((product) => <ProductCard key={product.id} p={product} />)}</div>{!products.length && <div className="card">没有匹配商品，请调整筛选条件。</div>}</div></main>;
}
