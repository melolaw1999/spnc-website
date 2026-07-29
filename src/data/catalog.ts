export type CatalogImage = {
  asset: { projectPath: string; width: number; height: number };
  altText: string;
  sourceType: "local-verified-copy" | "brand-official-copy";
  humanConfirmed: boolean;
};

export type CatalogVariant = {
  id: string;
  size: string;
  flavor: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  brand: "OPTIMUM NUTRITION";
  name: string;
  type: string;
  summary: string;
  highlights: string[];
  audience: string;
  formula: string;
  versionInfo: string;
  usage: string;
  allergen: string;
  featured: boolean;
  variants: CatalogVariant[];
  images: CatalogImage[];
};

export const publicSalesVersions = ["跨境进口", "国产版本", "一般贸易"] as const;

const image = (
  projectPath: string,
  altText: string,
  width = 800,
  height = 800,
): CatalogImage => ({
  asset: { projectPath, width, height },
  altText,
  sourceType: "local-verified-copy",
  humanConfirmed: true,
});

const shared = {
  audience: "适合希望根据日常饮食与训练安排补充运动营养的成年人。",
  formula: "商品类别与包装信息仅用于选购核对；配料、营养成分和净含量以实际到货商品标签为准。",
  versionInfo: "官网当前收录跨境进口、国产版本与一般贸易商品。具体商品对应版本以淘宝订单页面和实际到货标签为准。",
  usage: "请遵循实际到货商品包装标签，并结合个人饮食与训练安排使用。",
  allergen: "请阅读实物过敏原和注意事项标签；特殊人群使用前应先咨询专业人士。",
};

/**
 * 首版目录只公开已有真实素材、且商品身份能够确认的 ON 商品。
 * 淘宝在售规格与销售版本尚未完成可靠导出，因此不在这里推测或补全 SKU。
 */
export const catalog: CatalogProduct[] = [
  {
    ...shared,
    id: "on-gold-standard-whey",
    slug: "on-gold-standard-whey",
    brand: "OPTIMUM NUTRITION",
    name: "金标乳清蛋白粉",
    type: "乳清蛋白",
    summary: "ON 金标乳清蛋白粉。购买前请在淘宝商品页核对规格、口味与销售版本。",
    highlights: ["真实白底产品图", "不同版本分别核对"],
    featured: true,
    variants: [
      { id: "on-whey-5lb-chocolate", size: "5 磅", flavor: "双重巧克力" },
      { id: "on-whey-5lb-vanilla", size: "5 磅", flavor: "香草冰激凌" },
      { id: "on-whey-2lb-strawberry", size: "2 磅", flavor: "草莓味" },
    ],
    images: [
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front.webp", "ON 金标乳清蛋白粉 5 磅双重巧克力正面白底图"),
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-5lb-vanilla-ice-cream-front.webp", "ON 金标乳清蛋白粉 5 磅香草冰激凌正面白底图"),
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-2lb-strawberry-front.webp", "ON 金标乳清蛋白粉 2 磅草莓味正面白底图"),
    ],
  },
  {
    ...shared,
    id: "on-gold-standard-isolate",
    slug: "on-gold-standard-isolate",
    brand: "OPTIMUM NUTRITION",
    name: "金标分离乳清",
    type: "分离乳清",
    summary: "ON 金标分离乳清。具体配方、规格与销售版本以淘宝商品页及实物标签为准。",
    highlights: ["分离乳清类别", "规格与版本分别核对"],
    featured: true,
    variants: [
      { id: "on-isolate-3lb-chocolate-bliss", size: "3 磅", flavor: "巧克力" },
    ],
    images: [
      image("/assets/optimized/products/on/isolate/on-gold-standard-isolate-3lb-chocolate-bliss-front.webp", "ON 金标分离乳清 3 磅巧克力正面白底图", 1000, 1000),
    ],
  },
  {
    ...shared,
    id: "on-platinum-hydrowhey",
    slug: "on-platinum-hydrowhey",
    brand: "OPTIMUM NUTRITION",
    name: "白金水解乳清",
    type: "水解乳清",
    summary: "ON 白金水解乳清。包装可能因市场和批次变化，购买前请核对淘宝商品页。",
    highlights: ["水解乳清类别", "包装批次可能变化"],
    featured: true,
    variants: [
      { id: "on-hydrowhey-3-5lb-chocolate", size: "3.5 磅", flavor: "巧克力" },
    ],
    images: [
      image("/assets/optimized/products/on/hydro-whey/on-platinum-hydrowhey-3-5lb-front.webp", "ON 白金水解乳清 3.5 磅正面白底图"),
    ],
  },
  {
    ...shared,
    id: "on-micronized-creatine",
    slug: "on-micronized-creatine",
    brand: "OPTIMUM NUTRITION",
    name: "微粉化肌酸粉",
    type: "肌酸",
    summary: "ON 微粉化肌酸粉。当前仅展示已有真实素材对应的 300 克商品。",
    highlights: ["无味", "购买前核对实际规格"],
    featured: true,
    variants: [
      { id: "on-creatine-300g-unflavored", size: "300 克", flavor: "无味" },
    ],
    images: [
      image("/assets/optimized/products/on/creatine/on-micronized-creatine-300g-front.webp", "ON 微粉化肌酸粉 300 克无味正面白底图"),
    ],
  },
  {
    ...shared,
    id: "on-glutamine-powder",
    slug: "on-glutamine-powder",
    brand: "OPTIMUM NUTRITION",
    name: "谷氨酰胺粉",
    type: "氨基酸补充剂",
    summary: "ON 谷氨酰胺粉。包装和规格可能因市场与批次变化，购买前请核对淘宝商品页。",
    highlights: ["无味粉剂", "包装批次可能变化"],
    featured: false,
    variants: [
      { id: "on-glutamine-300g-unflavored", size: "300 克", flavor: "无味" },
    ],
    images: [
      image("/assets/optimized/products/on/glutamine/on-glutamine-front.webp", "ON 谷氨酰胺粉 300 克无味正面白底图"),
    ],
  },
];

export const getCatalogProduct = (slug: string) => catalog.find((product) => product.slug === slug);
