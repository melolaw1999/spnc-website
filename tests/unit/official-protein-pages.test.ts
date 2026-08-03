import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import isolateData from "@/data/gold-standard-isolate.json";
import hydrowheyData from "@/data/platinum-hydrowhey.json";
import { domesticGoldStandardData } from "@/data/domestic-gold-standard-whey";
import { goldStandardPreWorkoutData, micronizedCreatineData } from "@/data/official-supplements";
import {
  domesticGoldStandardPageContent,
  goldStandardPreWorkoutPageContent,
  hydrowheyPageContent,
  isolatePageContent,
  micronizedCreatinePageContent,
} from "@/features/official-protein/content";

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

describe("中国制造与一般贸易金标乳清完整产品页", () => {
  it("按销售版本收录 12 个中国制造组合与 5 个一般贸易组合", () => {
    expect(domesticGoldStandardData.variants).toHaveLength(17);
    expect(domesticGoldStandardData.variants.filter((item) => item.sizeGroup.startsWith("domestic-"))).toHaveLength(12);
    expect(domesticGoldStandardData.variants.filter((item) => item.sizeGroup === "general-trade-5lb")).toHaveLength(5);
  });

  it("每个组合都有对应产品图，5 磅与 4 磅双重巧克力规格信息不混用", () => {
    for (const variant of domesticGoldStandardData.variants) {
      expect(publicAssetExists(variant.frontImage.src)).toBe(true);
    }
    const fivePound = domesticGoldStandardData.variants.find((item) => item.id === "on-domestic-gsw-5lb-double-rich-chocolate");
    const fourPound = domesticGoldStandardData.variants.find((item) => item.id === "on-domestic-gsw-4lb-double-rich-chocolate");
    expect([fivePound?.size, fivePound?.servingsPerContainer]).toEqual(["2.27 千克", "约 74 份（中国包装正面）"]);
    expect([fourPound?.size, fourPound?.servingsPerContainer]).toEqual(["1.8 千克", "约 59 份（中国包装正面）"]);
  });

  it("买家页面不展示内部素材来源和制作过程说明", () => {
    const publicCopy = [...domesticGoldStandardPageContent.overview, ...domesticGoldStandardPageContent.benefits].join(" ");
    expect(publicCopy).not.toMatch(/用户提供|公开缓存|按你确认|素材|AI 重绘|像素抠图/);
  });
});

describe("微粉化肌酸与金标训练前配方完整产品页", () => {
  it("两款商品只绑定已确认的 300 克实物规格与原图", () => {
    expect(micronizedCreatineData.variants).toHaveLength(1);
    expect(goldStandardPreWorkoutData.variants).toHaveLength(1);
    for (const variant of [...micronizedCreatineData.variants, ...goldStandardPreWorkoutData.variants]) {
      expect(variant.size).toBe("300 g");
      expect(publicAssetExists(variant.frontImage.src)).toBe(true);
      expect(variant.nutritionImage).not.toBeNull();
      expect(publicAssetExists(variant.nutritionImage?.src ?? "")).toBe(true);
    }
  });

  it("核心数字按实际包装分别登记，不混用 ON 当前官网差异值", () => {
    expect(micronizedCreatineData.variants[0].facts).toEqual([
      { label: "每份一水肌酸", value: "5 g" },
      { label: "每桶份数", value: "约 60 份" },
      { label: "净含量", value: "300 g" },
      { label: "口味", value: "无味" },
    ]);
    expect(goldStandardPreWorkoutData.variants[0].facts).toContainEqual({ label: "每份一水肌酸", value: "3.3 g" });
    expect(goldStandardPreWorkoutPageContent.factsNote).toContain("ON 当前美国官网标签写 3 克和 1.5 克");
  });
});

describe("五张产品页的路由与说明", () => {
  it("使用独立交互式产品页组件", () => {
    const route = readFileSync(path.join(process.cwd(), "src/app/products/[slug]/page.tsx"), "utf8");
    expect(route).toContain("GoldStandardIsolateShowcase");
    expect(route).toContain("PlatinumHydrowheyShowcase");
    expect(route).toContain("DomesticGoldStandardShowcase");
    expect(route).toContain("MicronizedCreatineShowcase");
    expect(route).toContain("GoldStandardPreWorkoutShowcase");
  });

  it.each([
    isolatePageContent,
    hydrowheyPageContent,
    domesticGoldStandardPageContent,
    micronizedCreatinePageContent,
    goldStandardPreWorkoutPageContent,
  ])("$slug 提供完整 FAQ", (content) => {
    expect(content.faqs).toHaveLength(10);
    expect(content.faqs.find((item) => item.question.includes("验证真伪"))?.href).toBe("/authenticity");
  });
});
