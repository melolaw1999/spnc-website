import { ProductCard } from "@/components/ProductCard";
import { TaobaoButton } from "@/components/TaobaoButton";
import { catalog } from "@/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("ON 商品专区", "理想营养售卖品牌 ON 商品整理：查看乳清、分离乳清、水解乳清、肌酸等商品与版本说明。本页不代表所售品牌主体。", "/on");

export default function OnZone() {
  const products = catalog;
  return <main><section className="hero compact-hero"><div className="container"><div className="eyebrow">Selected Brand · Optimum Nutrition</div><h1>ON 商品专区</h1><p className="lead">当前官网只展示 ON 商品资料，覆盖跨境进口、国产版本与一般贸易说明。本页不代表品牌主体。</p><div className="actions"><TaobaoButton label="前往淘宝店查看 ON 商品" /></div></div></section><section className="section"><div className="container"><div className="section-head"><div><h2>已确认商品</h2><p className="muted">只展示已有真实白底图且商品身份可以确认的条目；在售规格、口味与版本以淘宝订单页面为准。</p></div></div><div className="grid">{products.map((product) => <ProductCard p={product} key={product.id} />)}</div></div></section></main>;
}
