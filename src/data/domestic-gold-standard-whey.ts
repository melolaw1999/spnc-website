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

const domesticVariants = domesticSizes.flatMap((size) => domesticFlavors.map((flavor) => {
  const reference = officialVariant(size.assetSize === "2lb" ? "2lb" : "5lb", flavor.slug);
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
    sourceStatus: `中国制造在售组合已核对；正面图对应 ${size.sizeLabel} ${flavor.zh}。营养与配料采用 ON 官网同口味资料，仅供参考。`,
    servingSize: reference.servingSize
      ? `${reference.servingSize.replace("g", " 克").replace("(About 1 Scoop)", "（约 1 勺）")}（官网同口味参考）`
      : "请以实际中国包装背标为准",
    servingsPerContainer: `${servings}（中国包装正面）`,
    proteinPerServing: "约 24 g（中国包装正面）",
    bcaaInformation: "5.5 g（官网同口味参考）",
    calories: reference.calories,
    ingredients: reference.ingredients,
    nutritionReference: {
      ...reference.nutritionReference,
      servingsPerContainerZh: `${servings}（中国包装正面）`,
      referenceNoteZh: `所选中国制造包装正面已核对规格、口味、每份约 24 克蛋白质及约 ${servings.replace("约 ", "")}；营养表、BCAA、配料与过敏原采用 ON 官网当前 ${flavor.zh}同口味资料，仅供阅读参考，不作为中国制造版本背标。`,
      dailyValueNoteZh: "表中每日参考值为所引用官网标签体系，仅用于阅读同口味资料，不等同于中国营养标签 NRV%。",
    },
    frontImage: {
      src: `/assets/optimized/products/on/domestic/gold-standard-whey/selector/${size.assetSize}/${flavor.slug}/product-cutout.webp`,
      width: flavor.slug === "double-rich-chocolate" && size.assetSize !== "2lb" ? 1254 : 1200,
      height: flavor.slug === "double-rich-chocolate" && size.assetSize !== "2lb" ? 1254 : 1200,
    },
    nutritionImage: null,
  };
}));

const generalTradeVariants = generalTradeFlavors.map((flavor) => {
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
    ...reference,
    id: `on-general-trade-gsw-5lb-${flavor.slug}`,
    variantId: `general-trade-5lb-${flavor.slug}`,
    sku: "public-channel-verified",
    sizeGroup: "general-trade-5lb",
    sizeGroupLabel: "一般贸易进口 · 5 磅",
    size: "2.27 千克",
    sizeLabel: "5 磅（2.27 千克）",
    flavorZh: flavor.zh,
    availableOnOfficialSite: true,
    sourceStatus: `一般贸易进口 5 磅 ${flavor.zh}在售组合已核对；营养标签与中文对照采用 ON 官网当前同口味资料，仅供参考。`,
    nutritionReference: {
      ...reference.nutritionReference,
      referenceNoteZh: `当前展示一般贸易进口 5 磅 ${flavor.zh}产品图；营养表、配料和过敏原采用 ON 官网当前同口味 5 磅标签资料，仅供参考，最终以实际到货中文背标为准。`,
    },
  };
});

export const domesticGoldStandardData = {
  productName: "GOLD STANDARD WHEY 金标乳清蛋白粉｜中国制造 / 一般贸易进口",
  retrievedAt: "2026-07-31T00:00:00.000Z",
  variants: [...domesticVariants, ...generalTradeVariants],
};
