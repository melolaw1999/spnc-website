import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { catalog } from "@/data/catalog";
import { getProduct } from "@/lib/products";
import { siteName, taobaoStoreUrl } from "@/lib/site";

export function generateStaticParams() {
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.images[0]?.asset.projectPath || "/assets/brand/ideal-nutrition-share.jpg";
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
  const hero = product.images[0];
  return <main className="section"><div className="container detail">
    <div className="product-gallery">{hero ? <div className="product-gallery-main"><Image src={hero.asset.projectPath} alt={hero.altText} width={hero.asset.width} height={hero.asset.height} priority sizes="(max-width: 860px) 92vw, 52vw" /></div> : <div className="placeholder">真实产品图待确认<br />不会生成、重绘或修改包装</div>}<p className="muted">产品图来自真实素材复制件，保持原始宽高比并完整展示包装。</p></div>
    <div><div className="eyebrow">{product.brand} · {product.type}</div><h1>{product.name}</h1><p className="lead detail-lead">{product.summary}</p><ul className="list">{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul><h2 className="minor-title">规格与风味</h2><div className="filters">{product.variants.map((variant) => <span className="tag" key={variant.id}>{variant.size} · {variant.flavor}</span>)}</div><div className="actions actions-left"><a className="btn" target="_blank" rel="noopener noreferrer" href={taobaoStoreUrl}>前往淘宝店购买</a></div><div className="prose"><h2>适用人群</h2><p>{product.audience}</p><h2>配方信息</h2><p>{product.formula}</p><h2>版本说明</h2><p>{product.versionInfo}</p><h2>食用建议</h2><p>{product.usage}</p><h2>过敏原及注意事项</h2><p>{product.allergen}</p><div className="notice">膳食补充剂不能替代均衡饮食。产品信息以实物包装标签为准。</div></div></div>
  </div></main>;
}
