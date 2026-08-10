import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/data/catalog";

export function ProductCard({ p }: { p: CatalogProduct }) {
  const image = p.images[0];
  return <article className="card product-card">
    <Link className="product-card-link" href={`/products/${p.slug}`} aria-label={`查看${p.name}详情`}>
      {image ? <div className="product-media"><Image src={image.asset.projectPath} alt={image.altText} width={image.asset.width} height={image.asset.height} loading="lazy" sizes="(max-width: 560px) 90vw, (max-width: 860px) 45vw, 360px" /></div> : <div className="placeholder">产品图片待补充</div>}
      <div className="product-card-copy"><div className="product-card-labels"><span className="tag">{p.type}</span>{p.salesVersion && <span className="tag version-tag">{p.salesVersion}</span>}</div><h3>{p.name}</h3><div className="product-card-brand">{p.brand}</div>{p.variants.length > 0 && <div className="product-meta">{p.cardMeta ?? [...new Set(p.variants.map((variant) => variant.size))].join(" · ")}</div>}</div>
    </Link>
    <Link className="text-link" href={`/products/${p.slug}`}>查看商品详情 →</Link>
  </article>;
}
