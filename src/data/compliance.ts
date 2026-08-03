export const complianceDocumentTypes = [
  { value: "customs-declaration", label: "进口报关单" },
  { value: "inspection-certificate", label: "入境检验检疫证明" },
  { value: "quality-report", label: "批次质量检验报告" },
  { value: "other", label: "其他合规资料" },
] as const;

export type ComplianceDocumentType = typeof complianceDocumentTypes[number]["value"];

export type ComplianceProductOption = {
  key: string;
  skuCode: string;
  productId: string;
  productName: string;
  category: string;
  variantId: string;
  variantLabel: string;
  size: string;
  flavor: string;
  label: string;
};

export type ComplianceProductGroup = {
  label: string;
  options: ComplianceProductOption[];
};

type ProductSeed = {
  code: string;
  productId: string;
  productName: string;
  category: string;
  size: string;
  flavor: string;
};

const option = (seed: ProductSeed): ComplianceProductOption => ({
  key: `sku:${seed.code}`,
  skuCode: seed.code,
  productId: seed.productId,
  productName: seed.productName,
  category: seed.category,
  variantId: seed.code,
  variantLabel: `${seed.size}－${seed.flavor}`,
  size: seed.size,
  flavor: seed.flavor,
  label: `${seed.code}－${seed.productName}－${seed.size}－${seed.flavor}`,
});

const crossBorderGoldStandardWhey: ProductSeed[] = [
  { code: "748927022322", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "巧克力麦芽糖味" },
  { code: "748927060676", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "巧克力榛子味" },
  { code: "748927028614", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "2 磅（899 克）", flavor: "双重巧克力味" },
  { code: "748927028638", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "2 磅（837 克）", flavor: "奶油曲奇味" },
  { code: "748927028645", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "美味草莓味" },
  { code: "748927028652", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "2 磅（899 克）", flavor: "香草冰激凌味" },
  { code: "748927029192", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "巧克力花生味" },
  { code: "748927059120", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "巧克力花生味" },
  { code: "748927029574", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "香蕉奶油味" },
  { code: "748927028683", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.10 千克）", flavor: "奶油曲奇味" },
  { code: "748927028690", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.26 千克）", flavor: "美味草莓味" },
  { code: "748927028706", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "香草冰激凌味" },
  { code: "748927028669", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.29 千克）", flavor: "双重巧克力味" },
  { code: "748927027211", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "咖啡味" },
  { code: "748927027068", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "巧克力椰子味" },
  { code: "748927022346", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "巧克力麦芽糖味" },
  { code: "748927024142", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "牛奶巧克力味" },
  { code: "748927026238", productId: "on-gold-standard-whey", productName: "ON 奥普蒂蒙金标乳清蛋白粉（跨境进口）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "摩卡卡布奇诺味" },
];

const chinaMadeGoldStandardWhey: ProductSeed[] = [
  { code: "6974913170010", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "双重巧克力味" },
  { code: "6974913170027", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "香草冰激凌味" },
  { code: "6974913170157", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "牛奶巧克力味" },
  { code: "6974913170171", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "5 磅（2.27 千克）", flavor: "草莓味" },
  { code: "6974913170317", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "4 磅（1.8 千克）", flavor: "双重巧克力味" },
  { code: "6974913170324", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "4 磅（1.8 千克）", flavor: "香草冰激凌味" },
  { code: "6974913170331", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "4 磅（1.8 千克）", flavor: "牛奶巧克力味" },
  { code: "6974913170348", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "4 磅（1.8 千克）", flavor: "草莓味" },
  { code: "6974913170188", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "草莓味" },
  { code: "6974913170164", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "牛奶巧克力味" },
  { code: "6974913170096", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "香草冰激凌味" },
  { code: "6974913170065", productId: "on-domestic-gold-standard-whey", productName: "ON 金标乳清蛋白粉（中国制造）", category: "乳清蛋白", size: "2 磅（907 克）", flavor: "双重巧克力味" },
];

const generalTradeGoldStandardWhey: ProductSeed[] = [
  { code: "748927060232", productId: "on-general-trade-gold-standard-whey", productName: "ON 金标乳清蛋白粉（一般贸易进口）", category: "乳清蛋白", size: "2.27 千克", flavor: "巧克力椰子味" },
  { code: "748927059656", productId: "on-general-trade-gold-standard-whey", productName: "ON 金标乳清蛋白粉（一般贸易进口）", category: "乳清蛋白", size: "2.27 千克", flavor: "巧克力薄荷味" },
  { code: "748927059687", productId: "on-general-trade-gold-standard-whey", productName: "ON 金标乳清蛋白粉（一般贸易进口）", category: "乳清蛋白", size: "2.27 千克", flavor: "摩卡卡布奇诺味" },
  { code: "748927060201", productId: "on-general-trade-gold-standard-whey", productName: "ON 金标乳清蛋白粉（一般贸易进口）", category: "乳清蛋白", size: "2.27 千克", flavor: "咸焦糖味" },
  { code: "748927050981", productId: "on-general-trade-gold-standard-whey", productName: "ON 金标乳清蛋白粉（一般贸易进口）", category: "乳清蛋白", size: "2.27 千克", flavor: "香蕉味" },
];

const isolateAndHydroWhey: ProductSeed[] = [
  { code: "748927060751", productId: "on-gold-standard-isolate", productName: "ON 奥普蒂蒙金标分离乳清蛋白粉（跨境进口）", category: "分离乳清", size: "1.32 千克", flavor: "香草味" },
  { code: "748927060928", productId: "on-gold-standard-isolate", productName: "ON 奥普蒂蒙金标分离乳清蛋白粉（跨境进口）", category: "分离乳清", size: "1.36 千克", flavor: "巧克力味" },
  { code: "748927061239", productId: "on-gold-standard-isolate", productName: "ON 奥普蒂蒙金标分离乳清蛋白粉（跨境进口）", category: "分离乳清", size: "2.28 千克", flavor: "香草味" },
  { code: "748927061260", productId: "on-gold-standard-isolate", productName: "ON 奥普蒂蒙金标分离乳清蛋白粉（跨境进口）", category: "分离乳清", size: "2.36 千克", flavor: "巧克力味" },
  { code: "6974913170287", productId: "on-domestic-gold-standard-isolate", productName: "ON 金标分离乳清蛋白粉（中国制造）", category: "分离乳清", size: "1.8 千克", flavor: "巧克力味" },
  { code: "6974913170294", productId: "on-domestic-gold-standard-isolate", productName: "ON 金标分离乳清蛋白粉（中国制造）", category: "分离乳清", size: "800 克", flavor: "巧克力味" },
  { code: "748927026382", productId: "on-platinum-hydrowhey", productName: "ON 奥普蒂蒙铂金水解乳清蛋白粉（跨境进口）", category: "水解乳清", size: "1.64 千克", flavor: "巧克力味" },
  { code: "748927026399", productId: "on-platinum-hydrowhey", productName: "ON 奥普蒂蒙铂金水解乳清蛋白粉（跨境进口）", category: "水解乳清", size: "1.6 千克", flavor: "香草味" },
  { code: "748927026412", productId: "on-platinum-hydrowhey", productName: "ON 奥普蒂蒙铂金水解乳清蛋白粉（跨境进口）", category: "水解乳清", size: "800 克", flavor: "香草味" },
  { code: "748927026429", productId: "on-platinum-hydrowhey", productName: "ON 奥普蒂蒙铂金水解乳清蛋白粉（跨境进口）", category: "水解乳清", size: "820 克", flavor: "巧克力味" },
];

const trainingNutrition: ProductSeed[] = [
  { code: "6974913170195", productId: "on-domestic-creatine", productName: "ON 肌酸粉（中国制造）", category: "肌酸", size: "100 克", flavor: "无味" },
  { code: "6974913170102", productId: "on-domestic-creatine", productName: "ON 肌酸粉（中国制造）", category: "肌酸", size: "200 克", flavor: "无味" },
  { code: "748927023848", productId: "on-micronized-creatine", productName: "ON 奥普蒂蒙绿标肌酸粉（跨境进口）", category: "肌酸", size: "300 克", flavor: "无味" },
  { code: "748927069808", productId: "on-flavored-creatine", productName: "ON 奥普蒂蒙肌酸粉（跨境进口）", category: "肌酸", size: "360 克", flavor: "蓝莓柠檬味" },
  { code: "6974913170119", productId: "on-domestic-glutamine", productName: "ON 谷氨酰胺粉（中国制造）", category: "谷氨酰胺", size: "300 克", flavor: "无味" },
  { code: "748927052961", productId: "on-gold-standard-pre-workout", productName: "ON 奥普蒂蒙金标氨泵粉（跨境进口）", category: "训练前配方", size: "300 克", flavor: "蓝莓柠檬味" },
];

const group = (label: string, seeds: ProductSeed[]): ComplianceProductGroup => ({
  label,
  options: seeds.map(option),
});

export const complianceProductGroups: ComplianceProductGroup[] = [
  group("跨境进口｜金标乳清蛋白粉", crossBorderGoldStandardWhey),
  group("中国制造｜金标乳清蛋白粉", chinaMadeGoldStandardWhey),
  group("一般贸易进口｜金标乳清蛋白粉", generalTradeGoldStandardWhey),
  group("分离乳清与水解乳清", isolateAndHydroWhey),
  group("肌酸、谷氨酰胺与训练前配方", trainingNutrition),
];

export const complianceProductOptions = complianceProductGroups.flatMap((item) => item.options);

export const getComplianceProduct = (key: string) => complianceProductOptions.find((item) => item.key === key);

export const getComplianceDocumentType = (value: string) => complianceDocumentTypes.find((item) => item.value === value);
