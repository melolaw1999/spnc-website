import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import goldStandardData from "@/data/gold-standard-whey.json";
import { goldStandardTaobaoItemId, goldStandardTaobaoUrl } from "@/features/gold-standard/constants";
import { goldProductBenefits, goldProductFaqs, goldProductOverview, goldSuggestedUseNotes } from "@/features/gold-standard/content";

describe("金标乳清规格与营养标签映射", () => {
  it("完整收录 ON 官网 2 磅与 5 磅组合", () => {
    expect(goldStandardData.variants).toHaveLength(32);
    expect(goldStandardData.variants.filter((item) => item.size === "2 lb")).toHaveLength(15);
    expect(goldStandardData.variants.filter((item) => item.size === "5 lb")).toHaveLength(17);
    expect(new Set(goldStandardData.variants.map((item) => item.id)).size).toBe(goldStandardData.variants.length);
    expect(new Set(goldStandardData.variants.map((item) => item.variantId)).size).toBe(goldStandardData.variants.length);
  });

  it("每个组合都有独立官网产品图和项目内原图", () => {
    for (const variant of goldStandardData.variants) {
      expect(existsSync(path.join(process.cwd(), "public", variant.frontImage.src))).toBe(true);
      expect(existsSync(path.join(process.cwd(), "public", variant.frontOriginal))).toBe(true);
      expect(variant.frontImage.width).toBeGreaterThan(0);
      expect(variant.frontImage.height).toBeGreaterThan(0);
    }
  });

  it("营养标签严格绑定到同一规格与口味，不套用其他标签", () => {
    const missing = goldStandardData.variants.filter((item) => !item.nutritionImage);
    expect(missing.map((item) => `${item.size}/${item.flavor}`)).toEqual(["5 lb/Rocky Road"]);

    for (const variant of goldStandardData.variants.filter((item) => item.nutritionImage)) {
      expect(existsSync(path.join(process.cwd(), "public", variant.nutritionImage!.src))).toBe(true);
      expect(existsSync(path.join(process.cwd(), "public", variant.nutritionOriginal!))).toBe(true);
    }
  });

  it("选择器所需的每份信息齐全并保留官网来源", () => {
    for (const variant of goldStandardData.variants) {
      expect(variant.proteinPerServing).toMatch(/g$/i);
      expect(variant.bcaaInformation).toContain("5.5 g");
      expect(variant.servingsPerContainer).toContain("Servings");
      expect(new URL(variant.officialUrl).hostname).toBe("www.optimumnutrition.com");
    }
    expect(goldStandardData.variants.filter((item) => !item.servingSize).map((item) => `${item.size}/${item.flavor}`)).toEqual(["5 lb/Rocky Road"]);
    expect(goldStandardData.variants.filter((item) => !item.ingredients).map((item) => `${item.size}/${item.flavor}`)).toEqual(["5 lb/Rocky Road"]);
  });

  it("每张英文营养标签都有随口味联动的中文参考翻译", () => {
    const missing = goldStandardData.variants.filter((item) => !item.nutritionReference);
    expect(missing.map((item) => `${item.size}/${item.flavor}`)).toEqual(["5 lb/Rocky Road"]);

    for (const variant of goldStandardData.variants.filter((item) => item.nutritionReference)) {
      const reference = variant.nutritionReference!;
      expect(reference.servingSizeZh).toMatch(/克/);
      expect(reference.servingsPerContainerZh).toMatch(/份$/);
      expect(reference.nutrientRows.length).toBeGreaterThanOrEqual(8);
      expect(reference.nutrientRows.map((row) => row.labelZh)).toContain("蛋白质");
      expect(reference.ingredientsZh).not.toMatch(/[A-Za-z]/);
      expect(reference.allergensZh).toContain("牛奶");
      expect(reference.allergensZh).toContain("大豆");
      expect(reference.dailyValueNoteZh).toContain("2,000 千卡");
    }
  });

  it("淘宝按钮绑定指定商品 ID", () => {
    const url = new URL(goldStandardTaobaoUrl);
    expect(url.hostname).toBe("item.taobao.com");
    expect(url.searchParams.get("id")).toBe(goldStandardTaobaoItemId);
    expect(goldStandardTaobaoItemId).toBe("794493827958");
  });

  it("产品概览、产品特点与建议食用方式使用金标乳清数据", () => {
    const content = JSON.stringify({ goldProductOverview, goldProductBenefits, goldSuggestedUseNotes });
    expect(goldProductOverview).toHaveLength(3);
    expect(goldProductBenefits).toHaveLength(6);
    expect(goldSuggestedUseNotes).toHaveLength(3);
    expect(content).toContain("24 克");
    expect(content).toContain("5.5 克");
    expect(content).toContain("2 磅、5 磅");
    expect(content).not.toContain("25 克");
    expect(content).not.toContain("3 磅");
  });

  it("提供 10 个购买与收货 FAQ，并绑定关键站内入口", () => {
    expect(goldProductFaqs).toHaveLength(10);
    expect(goldProductFaqs.slice(0, 4).map((item) => item.question)).toEqual([
      "附带的量勺在哪里？",
      "为什么桶没有装满？",
      "为什么收到的桶有凹陷？",
      "应该去哪里验证真伪？",
    ]);
    expect(goldProductFaqs.find((item) => item.question.includes("验证真伪"))?.href).toBe("/authenticity");
    expect(goldProductFaqs.filter((item) => item.href === "/support").length).toBeGreaterThanOrEqual(3);
    expect(new Set(goldProductFaqs.map((item) => item.question)).size).toBe(10);
  });
});
