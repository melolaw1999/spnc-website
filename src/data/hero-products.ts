import { catalog } from "@/data/catalog";

export const homeSlogan = "为你的下一次突破做好准备";

export type HeroProduct = {
  id: string;
  name: string;
  brand: string;
  version: string;
  href: string;
  image: { src: string; alt: string; width: number; height: number };
};

// 预览只使用已核验的官网目录，不把历史素材视为店铺当前在售清单。
// 全店在售来源核准后，在此加入有真实素材与明确购买地址的商品家族。
export const heroProducts: HeroProduct[] = catalog.map((product) => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  version: product.salesVersion ?? "",
  href: `/products/${product.slug}`,
  image: {
    src: product.images[0].asset.projectPath,
    alt: product.images[0].altText,
    width: product.images[0].asset.width,
    height: product.images[0].asset.height,
  },
}));
