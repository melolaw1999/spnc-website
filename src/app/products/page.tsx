import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "商品矩阵",
  description: "浏览理想营养在售运动营养商品，按品牌、类别、规格与风味查找产品。",
  alternates: { canonical: "/products" },
};

export default async function Products({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const all = await getProducts();
  const products = all.filter((product) => (!query.brand || product.brand === query.brand) && (!query.type || product.type === query.type) && (!query.search || `${product.name}${product.brand}${product.summary}`.toLowerCase().includes(query.search.toLowerCase())));
  const brands = [...new Set(all.map((product) => product.brand))];
  const types = [...new Set(all.map((product) => product.type))];
  return <main className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">Products</div><h1 className="page-title">找到适合你的产品</h1><p className="muted">产品信息以实物包装标签为准；购买与支付均在淘宝店完成。</p></div></div><form className="filters"><input className="field filter-search" name="search" defaultValue={query.search} placeholder="搜索产品或品牌" /><select className="field filter-select" name="brand" defaultValue={query.brand || ""}><option value="">全部品牌</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select><select className="field filter-select" name="type" defaultValue={query.type || ""}><option value="">全部类型</option>{types.map((type) => <option key={type}>{type}</option>)}</select><button className="btn">筛选</button></form><div className="grid">{products.map((product) => <ProductCard key={product.id} p={product} />)}</div>{!products.length && <div className="card">没有匹配产品，请调整筛选条件。</div>}</div></main>;
}
