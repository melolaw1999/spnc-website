import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { catalog, publicSalesVersions } from "@/data/catalog";
import { siteUrl, taobaoStoreUrl } from "@/lib/site";

describe("生产商品目录", () => {
  it("商品 slug 唯一且公开目录完整", () => {
    expect(catalog).toHaveLength(9);
    expect(new Set(catalog.map((product) => product.slug)).size).toBe(catalog.length);
  });

  it("当前公开目录只展示 ON 商品", () => {
    expect(new Set(catalog.map((product) => product.brand))).toEqual(new Set(["OPTIMUM NUTRITION"]));
    expect(catalog.map((product) => product.name)).toEqual([
      "金标乳清蛋白粉",
      "金标分离乳清",
      "金标乳清蛋白粉（中国制造 / 一般贸易进口）",
      "国产肌酸粉",
      "国产谷氨酰胺粉",
      "国产双层香脆乳清蛋白棒",
      "白金水解乳清",
      "微粉化肌酸粉",
      "金标训练前配方",
    ]);
  });

  it("版本说明范围只保留跨境、国产和一般贸易", () => {
    expect(publicSalesVersions).toEqual(["跨境进口", "国产版本", "一般贸易"]);
  });

  it("国产系列按版本独立登记并绑定对应图片", () => {
    const domesticProducts = catalog.filter((product) => product.salesVersion === "国产版本");
    expect(domesticProducts.map((product) => product.name)).toEqual([
      "金标乳清蛋白粉（中国制造 / 一般贸易进口）",
      "国产肌酸粉",
      "国产谷氨酰胺粉",
      "国产双层香脆乳清蛋白棒",
    ]);
    const domesticImages = domesticProducts
      .flatMap((product) => product.images)
      .filter((item) => item.asset.projectPath.includes("/products/on/domestic/"));
    expect(domesticImages.every((item) => item.sourceType === "user-confirmed-copy")).toBe(true);

    for (const product of domesticProducts) {
      expect(product.images.flatMap((item) => item.variantIds).sort()).toEqual(product.variants.map((variant) => variant.id).sort());
    }
  });

  it("谷氨酰胺只保留当前在售的国产版本", () => {
    const glutamineProducts = catalog.filter((product) => product.name.includes("谷氨酰胺"));
    expect(glutamineProducts.map((product) => product.id)).toEqual(["on-domestic-glutamine"]);
    expect(glutamineProducts.every((product) => product.salesVersion === "国产版本")).toBe(true);
  });

  it("蛋白棒只保留国产系列", () => {
    const proteinBars = catalog.filter((product) => product.type === "蛋白棒");
    expect(proteinBars.map((product) => product.id)).toEqual(["on-domestic-double-layer-crispy-whey-protein-bar"]);
    expect(proteinBars.every((product) => product.salesVersion === "国产版本")).toBe(true);
  });

  it("已采用商品图只读取 public/assets 下的压缩副本", () => {
    const paths = catalog.flatMap((product) => product.images.map((image) => image.asset.projectPath));
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.startsWith("/assets/optimized/"))).toBe(true);
    expect(paths.every((assetPath) => existsSync(path.join(process.cwd(), "public", assetPath)))).toBe(true);
  });

  it("国产网页图均保留未经修改的项目内 PNG 原图", () => {
    const domesticImages = catalog
      .filter((product) => product.salesVersion === "国产版本")
      .flatMap((product) => product.images)
      .filter((item) => item.asset.projectPath.includes("/products/on/domestic/"));
    for (const item of domesticImages) {
      const originalPath = item.asset.projectPath.replace("/assets/optimized/", "/assets/").replace(/\.webp$/, ".png");
      expect(existsSync(path.join(process.cwd(), "public", originalPath))).toBe(true);
    }
  });

  it("跨境肌酸与训练前配方主图保留原图并读取压缩副本", () => {
    const expectedSuffixes = new Map([
      ["on-micronized-creatine", "-blueberry-lemonade-front-transparent.webp"],
      ["on-gold-standard-pre-workout", "-user.webp"],
    ]);
    for (const [id, expectedSuffix] of expectedSuffixes) {
      const item = catalog.find((product) => product.id === id)?.images[0];
      expect(item?.sourceType).toBe("user-confirmed-copy");
      expect(item?.asset.projectPath.endsWith(expectedSuffix)).toBe(true);
      const originalPath = item?.asset.projectPath.replace("/assets/optimized/", "/assets/").replace(/\.webp$/, ".png") ?? "";
      expect(existsSync(path.join(process.cwd(), "public", originalPath))).toBe(true);
    }
  });

  it("购买入口始终使用淘宝店地址", () => {
    expect(new URL(taobaoStoreUrl).hostname).toMatch(/taobao\.com$/);
  });

  it("SEO 使用正式 www 域名", () => {
    expect(siteUrl).toBe("https://www.spnc.cn");
  });

  it("公开商品均有真实图片，不保留占位商品", () => {
    expect(catalog.every((product) => product.images.length > 0)).toBe(true);
    expect(catalog.flatMap((product) => product.images).every((image) => image.humanConfirmed)).toBe(true);
    expect(catalog.flatMap((product) => product.variants).some((variant) => variant.size === "标准装" || variant.flavor === "多种风味")).toBe(false);
  });

  it("大小水解分别绑定对应规格图片", () => {
    const hydrowhey = catalog.find((product) => product.id === "on-platinum-hydrowhey");
    expect(hydrowhey?.variants.map((variant) => variant.size)).toEqual([
      "3.61 磅（1.64 千克）",
      "1.8 磅（820 克）",
    ]);
    expect(hydrowhey?.images).toHaveLength(2);
    expect(hydrowhey?.images.flatMap((item) => item.variantIds).sort()).toEqual(hydrowhey?.variants.map((variant) => variant.id).sort());
  });

  it("优先使用已核对规格的品牌透明主图", () => {
    const officialMainImages = [
      "on-gold-standard-whey",
      "on-gold-standard-isolate",
      "on-platinum-hydrowhey",
    ].map((id) => catalog.find((product) => product.id === id)?.images[0]);

    expect(officialMainImages.every((item) => item?.sourceType === "brand-official-copy")).toBe(true);
    expect(officialMainImages.every((item) => item?.asset.projectPath.endsWith("-official.webp"))).toBe(true);
  });

  it("每张已绑定图片只引用同一商品内的规格", () => {
    for (const product of catalog) {
      const variantIds = new Set(product.variants.map((variant) => variant.id));
      expect(product.images.flatMap((item) => item.variantIds).every((id) => variantIds.has(id))).toBe(true);
    }
  });
});
