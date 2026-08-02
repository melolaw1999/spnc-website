import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import isolateData from "@/data/gold-standard-isolate.json";
import hydrowheyData from "@/data/platinum-hydrowhey.json";
import { hydrowheyPageContent, isolatePageContent } from "@/features/official-protein/content";

const publicAssetExists = (assetPath: string) => existsSync(path.join(process.cwd(), "public", assetPath));

describe("金标分离乳清完整产品页", () => {
  it("收录中国在售 5 磅档与 3 磅档共 4 个组合", () => {
    expect(isolateData.variants).toHaveLength(4);
    expect(isolateData.variants.filter((item) => item.sizeGroup === "large")).toHaveLength(2);
    expect(isolateData.variants.filter((item) => item.sizeGroup === "small")).toHaveLength(2);
    expect(isolateData.variants.map((item) => item.size)).toEqual(["5.2 lb", "5.02 lb", "3 lb", "3 lb"]);
  });

  it("每个组合均有独立产品图、营养图与中文参考数据", () => {
    expect(new Set(isolateData.variants.map((item) => item.frontImage.src)).size).toBe(4);
    expect(new Set(isolateData.variants.map((item) => item.nutritionImage.src)).size).toBe(4);
    for (const variant of isolateData.variants) {
      expect(publicAssetExists(variant.frontImage.src)).toBe(true);
      expect(publicAssetExists(variant.nutritionImage.src)).toBe(true);
      expect(variant.nutritionReference.nutrientRows.map((row) => row.labelZh)).toContain("蛋白质");
    }
  });
});

describe("白金水解乳清完整产品页", () => {
  it("收录 5 个大小桶与口味组合", () => {
    expect(hydrowheyData.variants).toHaveLength(5);
    expect(hydrowheyData.variants.filter((item) => item.sizeGroup === "large")).toHaveLength(2);
    expect(hydrowheyData.variants.filter((item) => item.sizeGroup === "small")).toHaveLength(3);
  });

  it("每个组合都有独立产品图，缺失标签不套用其他图片", () => {
    expect(new Set(hydrowheyData.variants.map((item) => item.frontImage.src)).size).toBe(5);
    for (const variant of hydrowheyData.variants) {
      expect(publicAssetExists(variant.frontImage.src)).toBe(true);
      if (variant.nutritionImage) expect(publicAssetExists(variant.nutritionImage.src)).toBe(true);
    }
    expect(hydrowheyData.variants.filter((item) => !item.nutritionImage).map((item) => item.id)).toEqual([
      "on-hydro-large-turbo-chocolate",
    ]);
  });
});

describe("两张产品页的路由与说明", () => {
  it("使用独立交互式产品页组件", () => {
    const route = readFileSync(path.join(process.cwd(), "src/app/products/[slug]/page.tsx"), "utf8");
    expect(route).toContain("GoldStandardIsolateShowcase");
    expect(route).toContain("PlatinumHydrowheyShowcase");
  });

  it.each([isolatePageContent, hydrowheyPageContent])("$slug 提供完整 FAQ", (content) => {
    expect(content.faqs).toHaveLength(10);
    expect(content.faqs.find((item) => item.question.includes("验证真伪"))?.href).toBe("/authenticity");
  });
});
