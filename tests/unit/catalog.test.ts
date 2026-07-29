import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { catalog, publicSalesVersions } from "@/data/catalog";
import { siteUrl, taobaoStoreUrl } from "@/lib/site";

describe("生产商品目录", () => {
  it("商品 slug 唯一且公开目录完整", () => {
    expect(catalog).toHaveLength(7);
    expect(new Set(catalog.map((product) => product.slug)).size).toBe(catalog.length);
  });

  it("当前公开目录只展示 ON 商品", () => {
    expect(new Set(catalog.map((product) => product.brand))).toEqual(new Set(["OPTIMUM NUTRITION"]));
    expect(catalog.map((product) => product.name)).toEqual([
      "金标乳清蛋白粉",
      "金标分离乳清",
      "白金水解乳清",
      "微粉化肌酸粉",
      "谷氨酰胺粉",
      "双层香脆乳清蛋白棒",
      "金标训练前配方",
    ]);
  });

  it("版本说明范围只保留跨境、国产和一般贸易", () => {
    expect(publicSalesVersions).toEqual(["跨境进口", "国产版本", "一般贸易"]);
  });

  it("已采用商品图只读取 public/assets 下的压缩副本", () => {
    const paths = catalog.flatMap((product) => product.images.map((image) => image.asset.projectPath));
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.startsWith("/assets/optimized/"))).toBe(true);
    expect(paths.every((assetPath) => existsSync(path.join(process.cwd(), "public", assetPath)))).toBe(true);
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

  it("每张已绑定图片只引用同一商品内的规格", () => {
    for (const product of catalog) {
      const variantIds = new Set(product.variants.map((variant) => variant.id));
      expect(product.images.flatMap((item) => item.variantIds).every((id) => variantIds.has(id))).toBe(true);
    }
  });
});
