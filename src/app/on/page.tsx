import { ProductCard } from "@/components/ProductCard";
import { OnFeaturedCarousel } from "@/components/OnFeaturedCarousel";
import { catalog } from "@/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("ON 商品专区", "理想营养售卖品牌 ON 商品整理：查看乳清、分离乳清、水解乳清、肌酸等商品与版本说明。本页不代表所售品牌主体。", "/on");

export default function OnZone() {
  const domesticProducts = catalog.filter((product) => product.salesVersion === "国产版本");
  const importedProducts = catalog.filter((product) => product.salesVersion === "跨境进口");
  const generalTradeProducts = catalog.filter((product) => product.salesVersion === "一般贸易");

  return <main>
    <h1 className="sr-only">ON 商品专区</h1>
    <OnFeaturedCarousel />
    <section className="section" id="on-products"><div className="container">
      <section className="catalog-family" aria-labelledby="on-imported-title">
        <div className="catalog-family-head"><div><h2 id="on-imported-title">跨境进口系列</h2></div><p className="muted">境内保税仓发货的跨境进口商品，规格与实时库存以淘宝商品页为准。</p></div>
        <div className="grid">{importedProducts.map((product) => <ProductCard p={product} key={product.id} />)}</div>
      </section>
      <section className="catalog-family" aria-labelledby="on-general-trade-title">
        <div className="catalog-family-head"><div><h2 id="on-general-trade-title">一般贸易进口系列</h2></div><p className="muted">原装进口、附中文标签，购买前请核对订单中的销售版本与口味。</p></div>
        <div className="grid">{generalTradeProducts.map((product) => <ProductCard p={product} key={product.id} />)}</div>
      </section>
      <section className="catalog-family" aria-labelledby="on-domestic-title">
        <div className="catalog-family-head"><div><h2 id="on-domestic-title">ON 国产系列</h2></div><p className="muted">中国生产与中文包装系列，规格与实时库存以淘宝商品页为准。</p></div>
        <div className="grid">{domesticProducts.map((product) => <ProductCard p={product} key={product.id} />)}</div>
      </section>
    </div></section>
  </main>;
}
