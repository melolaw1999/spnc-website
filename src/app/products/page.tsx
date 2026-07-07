import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("商品矩阵", "浏览理想营养精选运动营养商品，按品牌与类别查看商品、版本说明，并前往淘宝店确认实时在售信息。", "/products");

export default async function Products({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const all = await getProducts();
  const products = all.filter((product) => (!query.brand || product.brand === query.brand) && (!query.type || product.type === query.type) && (!query.search || `${product.name}${product.brand}${product.summary}`.toLowerCase().includes(query.search.toLowerCase())));
  const brands = [...new Set(all.map((product) => product.brand))];
  const types = [...new Set(all.map((product) => product.type))];
  return <main className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">Selected Products</div><h1 className="page-title">理想营养商品矩阵</h1><p className="muted">这里展示精选品牌商品。价格、库存、规格与口味请以淘宝店实时页面为准。</p></div></div><form className="filters"><input className="field filter-search" name="search" defaultValue={query.search} placeholder="搜索商品或品牌" /><select className="field filter-select" name="brand" defaultValue={query.brand || ""}><option value="">全部品牌</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select><select className="field filter-select" name="type" defaultValue={query.type || ""}><option value="">全部类别</option>{types.map((type) => <option key={type}>{type}</option>)}</select><button className="btn">筛选</button></form><div className="grid">{products.map((product) => <ProductCard key={product.id} p={product} />)}</div>{!products.length && <div className="card">没有匹配商品，请调整筛选条件。</div>}</div></main>;
}
