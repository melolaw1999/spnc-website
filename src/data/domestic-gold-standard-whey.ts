import goldStandardData from "@/data/gold-standard-whey.json";

type GoldStandardOfficialVariant = (typeof goldStandardData.variants)[number];

const domesticFlavors = [
  { slug: "double-rich-chocolate", en: "Double Rich Chocolate", zh: "双重巧克力" },
  { slug: "extreme-milk-chocolate", en: "Extreme Milk Chocolate", zh: "牛奶巧克力" },
  { slug: "delicious-strawberry", en: "Delicious Strawberry", zh: "草莓" },
  { slug: "vanilla-ice-cream", en: "Vanilla Ice Cream", zh: "香草冰激凌" },
] as const;

const domesticSizes = [
  {
    group: "domestic-5lb",
    groupLabel: "中国制造 · 5 磅",
    assetSize: "5lb",
    size: "2.27 千克",
    sizeLabel: "5 磅（2.27 千克）",
    servings: { "double-rich-chocolate": "约 74 份", "extreme-milk-chocolate": "约 70 份", "delicious-strawberry": "约 73 份", "vanilla-ice-cream": "约 73 份" },
  },
  {
    group: "domestic-4lb",
    groupLabel: "中国制造 · 4 磅",
    assetSize: "4lb",
    size: "1.8 千克",
    sizeLabel: "4 磅（1.8 千克）",
    servings: { "double-rich-chocolate": "约 59 份", "extreme-milk-chocolate": "约 56 份", "delicious-strawberry": "约 58 份", "vanilla-ice-cream": "约 58 份" },
  },
  {
    group: "domestic-2lb",
    groupLabel: "中国制造 · 2 磅",
    assetSize: "2lb",
    size: "907 克",
    sizeLabel: "2 磅（907 克）",
    servings: { "double-rich-chocolate": "约 29 份", "extreme-milk-chocolate": "约 28 份", "delicious-strawberry": "约 29 份", "vanilla-ice-cream": "约 29 份" },
  },
] as const;

const generalTradeFlavors = [
  { slug: "salted-caramel", en: "Salted Caramel", zh: "咸焦糖" },
  { slug: "mocha-cappuccino", en: "Mocha Cappuccino", zh: "摩卡卡布奇诺" },
  { slug: "chocolate-mint", en: "Chocolate Mint", zh: "巧克力薄荷" },
  { slug: "chocolate-coconut", en: "Chocolate Coconut", zh: "巧克力椰子" },
  { slug: "banana-cream", en: "Banana Cream", zh: "奶油香蕉" },
] as const;

const officialVariant = (size: "2lb" | "5lb", slug: string) => {
  const variant = goldStandardData.variants.find((item) => item.id === `on-gsw-${size}-${slug}`);
  if (!variant) throw new Error(`Missing official Gold Standard reference: ${size}/${slug}`);
  return variant as GoldStandardOfficialVariant;
};

export const chinaMadeGoldStandardVariants = domesticSizes.flatMap((size) => domesticFlavors.map((flavor) => {
  const servings = size.servings[flavor.slug];
  return {
    id: `on-domestic-gsw-${size.assetSize}-${flavor.slug}`,
    variantId: `china-made-${size.assetSize}-${flavor.slug}`,
    sku: "public-channel-verified",
    sizeGroup: size.group,
    sizeGroupLabel: size.groupLabel,
    size: size.size,
    sizeLabel: size.sizeLabel,
    flavor: flavor.en,
    flavorZh: flavor.zh,
    availableOnOfficialSite: true,
    sourceStatus: `中国制造包装正面对应 ${size.sizeLabel} ${flavor.zh}；未取得对应背标，不使用其他销售地区的营养与配料数据。`,
    servingSize: null,
    servingsPerContainer: `${servings}（中国包装正面）`,
    proteinPerServing: "约 24 g（中国包装正面）",
    bcaaInformation: "以实际包装标签为准",
    calories: null,
    ingredients: null,
    nutritionReference: null,
    facts: [
      { label: "每份蛋白质", value: "约 24 g" },
      { label: "每桶份数", value: servings },
      { label: "净含量", value: size.size },
      { label: "口味", value: flavor.zh },
    ],
    frontImage: {
      src: `/assets/optimized/products/on/domestic/gold-standard-whey/selector/${size.assetSize}/${flavor.slug}/product-cutout.webp`,
      width: flavor.slug === "double-rich-chocolate" && size.assetSize !== "2lb" ? 1254 : 1200,
      height: flavor.slug === "double-rich-chocolate" && size.assetSize !== "2lb" ? 1254 : 1200,
    },
    nutritionImage: null,
  };
}));

export const generalTradeGoldStandardVariants = generalTradeFlavors.map((flavor) => {
  if (flavor.slug === "salted-caramel") {
    return {
      id: "on-general-trade-gsw-5lb-salted-caramel",
      variantId: "general-trade-5lb-salted-caramel",
      sku: "public-channel-verified",
      sizeGroup: "general-trade-5lb",
      sizeGroupLabel: "一般贸易进口 · 5 磅",
      size: "2.27 千克",
      sizeLabel: "5 磅（2.27 千克）",
      flavor: flavor.en,
      flavorZh: flavor.zh,
      availableOnOfficialSite: true,
      sourceStatus: "一般贸易进口在售组合已核对；包装正面可确认 2.27 千克、约 72 份及每份约 24 克蛋白质。独立背标资料待补。",
      servingSize: null,
      servingsPerContainer: "约 72 份（在售包装正面）",
      proteinPerServing: "约 24 g（在售包装正面）",
      bcaaInformation: "以实际背标为准",
      calories: null,
      ingredients: null,
      nutritionReference: null,
      facts: [
        { label: "每份蛋白质", value: "约 24 g" },
        { label: "每桶份数", value: "约 72 份" },
        { label: "净含量", value: "2.27 千克" },
        { label: "口味", value: flavor.zh },
      ],
      frontImage: {
        src: "/assets/optimized/products/on/gold-standard-whey/selector/5lb/salted-caramel/product-cutout.webp",
        width: 800,
        height: 800,
      },
      nutritionImage: null,
    };
  }

  const reference = officialVariant("5lb", flavor.slug);
  return {
    id: `on-general-trade-gsw-5lb-${flavor.slug}`,
    variantId: `general-trade-5lb-${flavor.slug}`,
    sku: "public-channel-verified",
    sizeGroup: "general-trade-5lb",
    sizeGroupLabel: "一般贸易进口 · 5 磅",
    size: "2.27 千克",
    sizeLabel: "5 磅（2.27 千克）",
    flavor: flavor.en,
    flavorZh: flavor.zh,
    availableOnOfficialSite: true,
    sourceStatus: `一般贸易进口 5 磅 ${flavor.zh}在售组合已核对；保留品牌产品图，未取得对应中文背标，不使用其他销售地区的营养与配料数据。`,
    servingSize: null,
    servingsPerContainer: "以实际包装标签为准",
    proteinPerServing: "以实际包装标签为准",
    bcaaInformation: "以实际包装标签为准",
    calories: null,
    ingredients: null,
    nutritionReference: null,
    nutritionImage: null,
    frontImage: reference.frontImage,
    facts: [
      { label: "净含量", value: "2.27 千克" },
      { label: "口味", value: flavor.zh },
    ],
  };
});

export const domesticGoldStandardData = {
  productName: "GOLD STANDARD WHEY 金标乳清蛋白粉｜中国制造 / 一般贸易进口",
  retrievedAt: "2026-07-31T00:00:00.000Z",
  variants: [...chinaMadeGoldStandardVariants, ...generalTradeGoldStandardVariants],
};
