export type CatalogImage = {
  asset: { projectPath: string; width: number; height: number };
  altText: string;
};

export type CatalogVariant = { id: string; size: string; flavor: string };

export type CatalogProduct = {
  id: string;
  slug: string;
  brand: string;
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

const image = (projectPath: string, altText: string, width = 800, height = 800): CatalogImage => ({
  asset: { projectPath, width, height },
  altText,
});

const variants = (slug: string, sizes: string[], flavors: string[]): CatalogVariant[] =>
  sizes.flatMap((size) => flavors.map((flavor, index) => ({ id: `${slug}-${size}-${index}`, size, flavor })));

const shared = {
  audience: "希望根据日常饮食与训练安排补充蛋白质或运动营养的人群。",
  formula: "仅展示已确认的产品类别信息；营养成分请以实物包装标签为准。",
  versionInfo: "不同进口与销售版本的包装、标签可能随地区和批次调整，请按订单与实物信息核验。",
  usage: "请遵循实物包装标签建议，并结合个人饮食和训练安排。",
  allergen: "请阅读实物过敏原标签；孕期、哺乳期、未成年人或有特殊健康状况者应先咨询专业人士。",
};

export const catalog: CatalogProduct[] = [
  {
    ...shared,
    id: "on-gold-standard-whey",
    slug: "on-gold-standard-whey",
    brand: "OPTIMUM NUTRITION",
    name: "金标乳清蛋白粉",
    type: "乳清蛋白",
    summary: "经典乳清产品，多种规格与风味可选。",
    highlights: ["规格选择清晰", "适合日常运动营养补充"],
    featured: true,
    variants: variants("on-gold-standard-whey", ["2 磅", "5 磅"], ["双重巧克力", "香草冰激凌", "牛奶巧克力", "草莓味"]),
    images: [
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front.webp", "ON 金标乳清蛋白粉 5 磅双重巧克力正面图"),
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-5lb-vanilla-ice-cream-front.webp", "ON 金标乳清蛋白粉 5 磅香草冰激凌正面图"),
      image("/assets/optimized/products/on/gold-standard-whey/on-gold-standard-whey-2lb-strawberry-front.webp", "ON 金标乳清蛋白粉 2 磅草莓味正面图"),
    ],
  },
  {
    ...shared,
    id: "on-gold-standard-isolate",
    slug: "on-gold-standard-isolate",
    brand: "OPTIMUM NUTRITION",
    name: "金标分离乳清",
    type: "分离乳清",
    summary: "以水解分离乳清与分离乳清组合为配方卖点。",
    highlights: ["每份约 25g 分离蛋白", "购买前核对版本标签"],
    featured: true,
    variants: variants("on-gold-standard-isolate", ["3 磅", "5 磅"], ["巧克力", "香草"]),
    images: [image("/assets/optimized/products/on/isolate/on-gold-standard-isolate-3lb-chocolate-bliss-front.webp", "ON 金标分离乳清 3 磅巧克力正面图", 1000, 1000)],
  },
  {
    ...shared,
    id: "on-hydro-whey",
    slug: "on-hydro-whey",
    brand: "OPTIMUM NUTRITION",
    name: "水解乳清",
    type: "水解乳清",
    summary: "面向重视配方类型的训练者。",
    highlights: ["水解乳清类别", "购买前请核对版本标签"],
    featured: false,
    variants: variants("on-hydro-whey", ["3.5 磅"], ["巧克力"]),
    images: [image("/assets/optimized/products/on/hydro-whey/on-platinum-hydrowhey-3-5lb-front.webp", "ON 铂金水解乳清 3.5 磅正面图")],
  },
  {
    ...shared,
    id: "on-creatine-glutamine",
    slug: "on-creatine-glutamine",
    brand: "OPTIMUM NUTRITION",
    name: "肌酸和谷氨酰胺",
    type: "训练补剂",
    summary: "训练营养产品组合展示。",
    highlights: ["按标签建议使用", "补剂不能替代均衡饮食"],
    featured: false,
    variants: variants("on-creatine-glutamine", ["标准装"], ["原味"]),
    images: [
      image("/assets/optimized/products/on/creatine/on-micronized-creatine-300g-front.webp", "ON 微粉化肌酸 300 克正面图"),
      image("/assets/optimized/products/on/glutamine/on-glutamine-front.webp", "ON 谷氨酰胺产品正面图"),
    ],
  },
  {
    ...shared,
    id: "yamamoto-iso-fuji",
    slug: "yamamoto-iso-fuji",
    brand: "YAMAMOTO",
    name: "ISO-FUJI",
    type: "分离乳清",
    summary: "YAMAMOTO 分离乳清产品。",
    highlights: ["分离乳清类别", "版本随实际批次说明"],
    featured: true,
    variants: variants("yamamoto-iso-fuji", ["标准装"], ["巧克力"]),
    images: [image("/assets/optimized/products/yamamoto/yamamoto-iso-fuji-2kg-gourmet-chocolate-front.webp", "YAMAMOTO ISO-FUJI 2 千克巧克力正面图")],
  },
  {
    ...shared,
    id: "yava-labs-range",
    slug: "yava-labs-range",
    brand: "YAVA LABS",
    name: "乳清、分离乳清和肌酸",
    type: "运动营养",
    summary: "YAVA LABS 运动营养系列。",
    highlights: ["覆盖多类训练需求", "按产品标签选择"],
    featured: false,
    variants: variants("yava-labs-range", ["标准装"], ["多种风味"]),
    images: [
      image("/assets/optimized/products/yava/yava-premium-whey-front.webp", "YAVA LABS 乳清蛋白正面图"),
      image("/assets/optimized/products/yava/yava-pure-iso-whey-2kg-raspberry-ice-cream-front.webp", "YAVA LABS PURE ISO WHEY 正面图"),
      image("/assets/optimized/products/yava/yava-creapure-front.webp", "YAVA LABS CreaPure 肌酸正面图"),
    ],
  },
  {
    ...shared,
    id: "bpj-protein-drink",
    slug: "bpj-protein-drink",
    brand: "BPJ",
    name: "高蛋白饮料",
    type: "即饮蛋白",
    summary: "便携即饮高蛋白饮料。",
    highlights: ["即饮形式", "口味选择直观"],
    featured: true,
    variants: variants("bpj-protein-drink", ["单瓶"], ["可可熔岩", "咖啡拿铁"]),
    images: [
      image("/assets/optimized/products/bpj/bpj-cocoa-lava-box-and-bottle-front.webp", "BPJ 可可熔岩高蛋白饮料包装与单瓶正面图"),
      image("/assets/optimized/products/bpj/bpj-coffee-latte-box-front.webp", "BPJ 咖啡拿铁高蛋白饮料整箱正面图", 1080, 564),
    ],
  },
  {
    ...shared,
    id: "arla-isolate-shake",
    slug: "arla-isolate-shake",
    brand: "ARLA",
    name: "分离蛋白奶昔",
    type: "即饮蛋白",
    summary: "Arla 分离蛋白奶昔。",
    highlights: ["即饮奶昔", "实际营养信息以包装为准"],
    featured: false,
    variants: variants("arla-isolate-shake", ["单瓶"], ["原味"]),
    images: [],
  },
];

export const getCatalogProduct = (slug: string) => catalog.find((product) => product.slug === slug);
