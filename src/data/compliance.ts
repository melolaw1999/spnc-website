import { catalog } from "@/data/catalog";

export const complianceDocumentTypes = [
  { value: "customs-declaration", label: "进口报关单" },
  { value: "inspection-certificate", label: "入境检验检疫证明" },
  { value: "quality-report", label: "批次质量检验报告" },
  { value: "other", label: "其他合规资料" },
] as const;

export type ComplianceDocumentType = typeof complianceDocumentTypes[number]["value"];

export type ComplianceProductOption = {
  key: string;
  productId: string;
  productName: string;
  category: string;
  variantId: string;
  variantLabel: string;
  label: string;
};

const catalogOptions: ComplianceProductOption[] = catalog.flatMap((product) =>
  product.variants.map((variant) => ({
    key: `${product.id}:${variant.id}`,
    productId: product.id,
    productName: product.name,
    category: product.type,
    variantId: variant.id,
    variantLabel: `${variant.size} · ${variant.flavor}`,
    label: `${product.name}｜${variant.size} · ${variant.flavor}`,
  })),
);

const confirmedAdditionalOptions: ComplianceProductOption[] = [
  {
    key: "on-gold-standard-isolate:on-isolate-2-36kg-chocolate",
    productId: "on-gold-standard-isolate",
    productName: "金标分离乳清",
    category: "分离乳清",
    variantId: "on-isolate-2-36kg-chocolate",
    variantLabel: "2.36 千克 · 巧克力",
    label: "大金分离乳清｜2.36 千克 · 巧克力",
  },
];

export const complianceProductOptions = [...confirmedAdditionalOptions, ...catalogOptions]
  .filter((option, index, options) => options.findIndex((candidate) => candidate.key === option.key) === index);

export const getComplianceProduct = (key: string) => complianceProductOptions.find((option) => option.key === key);

export const getComplianceDocumentType = (value: string) => complianceDocumentTypes.find((option) => option.value === value);
