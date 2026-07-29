export type CatalogImage = {
  asset: { projectPath: string; width: number; height: number };
  altText: string;
  caption: string;
  variantIds: string[];
  sourceType: "local-verified-copy" | "brand-official-copy" | "user-confirmed-copy";
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
  options: {
    caption?: string;
    variantIds?: string[];
    width?: number;
    height?: number;
    sourceType?: CatalogImage["sourceType"];
  } = {},
): CatalogImage => ({
  asset: { projectPath, width: options.width ?? 800, height: options.height ?? 800 },
  altText,
  caption: options.caption ?? altText,
  variantIds: options.variantIds ?? [],
  sourceType: options.sourceType ?? "local-verified-copy",
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
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front.webp", "ON 金标乳清蛋白粉 5 磅双重巧克力正面白底图", { variantIds: ["on-whey-5lb-chocolate"], caption: "5 磅 · 双重巧克力" }),
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-5lb-vanilla-ice-cream-front.webp", "ON 金标乳清蛋白粉 5 磅香草冰激凌正面白底图", { variantIds: ["on-whey-5lb-vanilla"], caption: "5 磅 · 香草冰激凌" }),
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-2lb-strawberry-front.webp", "ON 金标乳清蛋白粉 2 磅草莓味正面白底图", { variantIds: ["on-whey-2lb-strawberry"], caption: "2 磅 · 草莓味" }),
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
      image("/assets/optimized/products/on/isolate/on-gold-standard-isolate-3lb-chocolate-bliss-front.webp", "ON 金标分离乳清 3 磅巧克力正面白底图", { width: 1000, height: 1000, variantIds: ["on-isolate-3lb-chocolate-bliss"], caption: "3 磅 · 巧克力" }),
    ],
  },
  {
    ...shared,
    id: "on-platinum-hydrowhey",
    slug: "on-platinum-hydrowhey",
    brand: "OPTIMUM NUTRITION",
    name: "白金水解乳清",
    type: "水解乳清",
    summary: "ON 白金水解乳清当前确认在售大小两个规格，购买前请在淘宝商品页核对版本与库存。",
    highlights: ["大小规格分别展示", "Turbo Chocolate（巧克力）"],
    featured: true,
    variants: [
      { id: "on-hydrowhey-3-61lb-turbo-chocolate", size: "3.61 磅（1.64 千克）", flavor: "Turbo Chocolate（巧克力）" },
      { id: "on-hydrowhey-1-8lb-turbo-chocolate", size: "1.8 磅（820 克）", flavor: "Turbo Chocolate（巧克力）" },
    ],
    images: [
      image("/assets/optimized/products/on/hydro-whey/on-platinum-hydrowhey-3-61lb-turbo-chocolate-front.webp", "ON 白金水解乳清大规格 3.61 磅 Turbo Chocolate 正面透明背景图", { width: 1200, height: 1200, variantIds: ["on-hydrowhey-3-61lb-turbo-chocolate"], caption: "大规格 · 3.61 磅（1.64 千克）", sourceType: "user-confirmed-copy" }),
      image("/assets/optimized/products/on/hydro-whey/on-platinum-hydrowhey-1-8lb-turbo-chocolate-front.webp", "ON 白金水解乳清小规格 1.8 磅 Turbo Chocolate 正面透明背景图", { width: 1200, height: 1200, variantIds: ["on-hydrowhey-1-8lb-turbo-chocolate"], caption: "小规格 · 1.8 磅（820 克）", sourceType: "user-confirmed-copy" }),
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
      image("/assets/optimized/products/on/creatine/on-micronized-creatine-300g-front.webp", "ON 微粉化肌酸粉 300 克无味正面白底图", { variantIds: ["on-creatine-300g-unflavored"], caption: "300 克 · 无味" }),
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
      image("/assets/optimized/products/on/glutamine/on-glutamine-front.webp", "ON 谷氨酰胺粉 300 克无味正面白底图", { variantIds: ["on-glutamine-300g-unflavored"], caption: "300 克 · 无味" }),
    ],
  },
  {
    ...shared,
    id: "on-double-layer-crispy-whey-protein-bar",
    slug: "on-double-layer-crispy-whey-protein-bar",
    brand: "OPTIMUM NUTRITION",
    name: "双层香脆乳清蛋白棒",
    type: "蛋白棒",
    summary: "ON 双层香脆乳清蛋白棒。图片展示当前确认在售包装，具体口味、单支净含量与装数以淘宝商品页为准。",
    highlights: ["两款包装同图展示", "具体口味与装数购买前核对"],
    featured: false,
    variants: [],
    images: [
      image("/assets/optimized/products/on/protein-bar/on-double-layer-crispy-whey-protein-bar-assortment.webp", "ON 双层香脆乳清蛋白棒两款包装与独立包装展示图", { width: 429, height: 307, caption: "双层香脆乳清蛋白棒 · 两款包装", sourceType: "user-confirmed-copy" }),
    ],
  },
  {
    ...shared,
    id: "on-gold-standard-pre-workout",
    slug: "on-gold-standard-pre-workout",
    brand: "OPTIMUM NUTRITION",
    name: "金标训练前配方",
    type: "训练前配方",
    summary: "ON 金标训练前配方。当前确认展示 300 克蓝莓柠檬味包装，购买前请核对在售版本与标签。",
    highlights: ["300 克", "蓝莓柠檬味"],
    featured: false,
    variants: [
      { id: "on-pre-workout-300g-blueberry-lemonade", size: "300 克", flavor: "蓝莓柠檬味" },
    ],
    images: [
      image("/assets/optimized/products/on/pre-workout/on-gold-standard-pre-workout-300g-blueberry-lemonade-front.webp", "ON 金标训练前配方 300 克蓝莓柠檬味正面商品图", { width: 463, height: 576, variantIds: ["on-pre-workout-300g-blueberry-lemonade"], caption: "300 克 · 蓝莓柠檬味", sourceType: "user-confirmed-copy" }),
    ],
  },
];

export const getCatalogProduct = (slug: string) => catalog.find((product) => product.slug === slug);
