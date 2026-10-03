import { catalog } from "@/data/catalog";

export const motionMediaRoot = "/assets/media/product-motion-20261002";
export const ovodanFlavors = [
  // 瓶盖实体部分的基色取自对应原图瓶盖中心区域的RGB中位数，图片本身不改。
  { id: "passionfruit", name: "百香果味", image: `${motionMediaRoot}/passionfruit-front.jpg`, color: "#67aedc" },
  { id: "strawberry", name: "草莓味", image: `${motionMediaRoot}/strawberry-front.png`, color: "#d6382f" },
] as const;

// 沿用已核验的官网图与详情页，不根据历史在售快照猜规格、库存或价格。
const selectedIds = ["on-gold-standard-whey", "on-gold-standard-isolate", "on-platinum-hydrowhey", "on-micronized-creatine"];
export const motionOnProducts = selectedIds.map((id) => {
  const product = catalog.find((item) => item.id === id);
  if (!product) throw new Error(`缺少已核验的商品：${id}`);
  // 实际标签已核验为5lb/2.26kg/73份香草，与本轮iHerb参考同版。
  // 旧front-official文件实际为Rocky Road，不以文件名判断包装口味。
  const image = id === "on-gold-standard-whey" ? {
    ...product.images[0],
    asset: { projectPath: "/assets/optimized/products/on/gold-standard-whey/selector/5lb/vanilla-ice-cream/product-front.webp", width: 1400, height: 1400 },
    altText: "ON 金标乳清蛋白粉 5磅香草冰淇淋味真实正面",
    caption: "5磅 · 香草冰淇淋味", variantIds: ["on-whey-5lb-vanilla"],
  } : product.images[0];
  return { id, name: product.name, href: `/products/${product.slug}`, image };
});

export const motionChapterLabels = ["ON 金标乳清", "ON 训练营养", "欧福蛋清蛋白饮"] as const;
