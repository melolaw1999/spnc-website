import { ProductCard } from "@/components/ProductCard";
import { TaobaoButton } from "@/components/TaobaoButton";
import { catalog } from "@/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("ON 商品专区", "理想营养售卖品牌 ON 商品整理：查看乳清、分离乳清、水解乳清、肌酸等商品与版本说明。本页不代表所售品牌主体。", "/on");

export default function OnZone() {
  const domesticProducts = catalog.filter((product) => product.salesVersion === "国产版本");
  const importedProducts = catalog.filter((product) => product.salesVersion !== "国产版本");

  return <main>
    <section className="hero compact-hero"><div className="container">
      <div className="eyebrow">Selected Brand · Optimum Nutrition</div>
      <h1>ON 商品专区</h1>
      <p className="lead">查看 ON 跨境进口、中国制造与一般贸易进口商品，按销售版本选择适合的规格与口味。</p>
      <div className="actions"><TaobaoButton label="前往淘宝店查看 ON 商品" /></div>
    </div></section>
    <section className="section"><div className="container">
      <section className="catalog-family" aria-labelledby="on-imported-title">
        <div className="catalog-family-head"><div><div className="eyebrow">Cross-Border Import Series</div><h2 id="on-imported-title">跨境进口系列</h2></div><p className="muted">境内保税仓发货的跨境进口商品，规格与实时库存以淘宝商品页为准。</p></div>
        <div className="grid">{importedProducts.map((product) => <ProductCard p={product} key={product.id} />)}</div>
      </section>
      <section className="catalog-family" aria-labelledby="on-domestic-title">
        <div className="catalog-family-head"><div><div className="eyebrow">Domestic Series</div><h2 id="on-domestic-title">ON 国产系列</h2></div><p className="muted">中国生产与中文包装系列，规格与实时库存以淘宝商品页为准。</p></div>
        <div className="grid">{domesticProducts.map((product) => <ProductCard p={product} key={product.id} />)}</div>
      </section>
    </div></section>
  </main>;
}
