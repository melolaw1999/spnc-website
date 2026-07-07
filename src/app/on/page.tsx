import { ProductCard } from "@/components/ProductCard";
import { TaobaoButton } from "@/components/TaobaoButton";
import { catalog } from "@/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("ON 商品专区", "理想营养售卖品牌 ON 商品整理：查看乳清、分离乳清、水解乳清、肌酸等商品与版本说明。本页不代表所售品牌主体。", "/on");

export default function OnZone() {
  const products = catalog.filter((product) => product.brand === "OPTIMUM NUTRITION");
  return <main><section className="hero compact-hero"><div className="container"><div className="eyebrow">Selected Brand · Optimum Nutrition</div><h1>ON 商品专区</h1><p className="lead">ON 是理想营养售卖品牌之一。本页按商品类别整理在售相关产品，不代表所售品牌主体。</p><div className="actions"><TaobaoButton label="前往淘宝店查看 ON 商品" /></div></div></section><section className="section"><div className="container"><div className="section-head"><div><h2>ON 商品矩阵</h2><p className="muted">包装、规格、口味与营养信息以淘宝订单页面及实际到货商品为准。</p></div></div><div className="grid">{products.map((product) => <ProductCard p={product} key={product.id} />)}</div></div></section></main>;
}
