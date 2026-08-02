import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import "@/features/gold-standard/gold-standard.css";
import "@/features/official-protein/official-protein.css";
import { catalog } from "@/data/catalog";
import { TaobaoButton } from "@/components/TaobaoButton";
import { GoldStandardShowcase } from "@/features/gold-standard/GoldStandardShowcase";
import { DomesticGoldStandardShowcase, GoldStandardIsolateShowcase, PlatinumHydrowheyShowcase } from "@/features/official-protein/ProductShowcases";
import { getProduct } from "@/lib/products";
import { siteName } from "@/lib/site";

export function generateStaticParams() {
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.images[0]?.asset.projectPath || "/assets/brand/spnc-share.jpg";
  return {
    title: product.name,
    description: `${product.brand} ${product.name}：${product.summary} 规格、版本与购买信息。`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name}｜${siteName}`, description: product.summary, images: [image] },
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  if (product.id === "on-gold-standard-whey") {
    return <main className="gold-standard-page"><GoldStandardShowcase /></main>;
  }
  if (product.id === "on-gold-standard-isolate") {
    return <main className="gold-standard-page official-protein-page isolate-page"><GoldStandardIsolateShowcase /></main>;
  }
  if (product.id === "on-platinum-hydrowhey") {
    return <main className="gold-standard-page official-protein-page hydrowhey-page"><PlatinumHydrowheyShowcase /></main>;
  }
  if (product.id === "on-domestic-gold-standard-whey") {
    return <main className="gold-standard-page official-protein-page domestic-gold-standard-page"><DomesticGoldStandardShowcase /></main>;
  }
  return <main className="section"><div className="container detail">
    <div className="product-gallery">{product.images.length > 0 ? <div className={`product-gallery-images${product.images.length > 1 ? " is-multiple" : ""}`}>{product.images.map((item, index) => <figure className="product-gallery-item" key={item.asset.projectPath}><div className="product-gallery-main"><Image src={item.asset.projectPath} alt={item.altText} width={item.asset.width} height={item.asset.height} {...(index === 0 ? { priority: true } : { loading: "lazy" as const })} sizes={product.images.length > 1 ? "(max-width: 860px) 92vw, 26vw" : "(max-width: 860px) 92vw, 52vw"} /></div><figcaption>{item.caption}</figcaption></figure>)}</div> : <div className="placeholder">真实产品图待确认<br />不会生成、重绘或修改包装</div>}<p className="muted">产品图来自真实素材复制件，保持原始宽高比并完整展示包装。</p></div>
    <div><div className="eyebrow">{product.brand} · {product.type}{product.salesVersion ? ` · ${product.salesVersion}` : ""}</div><h1>{product.name}</h1><p className="lead detail-lead">{product.summary}</p><ul className="list">{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul>{product.variants.length > 0 && <><h2 className="minor-title">当前展示规格与口味</h2><div className="filters">{product.variants.map((variant) => <span className="tag" key={variant.id}>{variant.size} · {variant.flavor}</span>)}</div></>}<p className="store-role">品牌名称用于识别商品。理想营养为销售店铺，本页面不代表所售品牌主体。</p><div className="actions actions-left"><TaobaoButton label="前往淘宝店查看在售商品" /></div><div className="prose"><h2>选购说明</h2><p>{product.audience}</p><h2>商品信息</h2><p>{product.formula}</p><h2>版本说明</h2><p>{product.versionInfo}</p><h2>使用提示</h2><p>{product.usage}</p><h2>过敏原及注意事项</h2><p>{product.allergen}</p><div className="notice">膳食补充剂不能替代均衡饮食。商品信息以实物包装标签及淘宝订单页面为准。</div></div></div>
  </div></main>;
}
