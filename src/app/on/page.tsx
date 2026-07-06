import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { catalog } from "@/data/catalog";
import { taobaoStoreUrl } from "@/lib/site";

export const metadata: Metadata = { title: "ON 专区", description: "理想营养 ON 专区：查看 Optimum Nutrition 金标乳清、分离乳清、水解乳清、肌酸等真实产品素材与版本说明。", alternates: { canonical: "/on" } };

export default function OnZone() {
  const products = catalog.filter((product) => product.brand === "OPTIMUM NUTRITION");
  return <main><section className="hero compact-hero"><div className="container"><div className="eyebrow">Optimum Nutrition</div><h1>ON 专区</h1><p className="lead">按产品类别、规格和版本清楚选择。产品包装与营养信息以实际到货批次为准。</p><div className="actions"><a className="btn" href={taobaoStoreUrl} target="_blank" rel="noopener noreferrer">前往淘宝店购买</a></div></div></section><section className="section"><div className="container"><div className="grid">{products.map((product) => <ProductCard p={product} key={product.id} />)}</div></div></section></main>;
}
