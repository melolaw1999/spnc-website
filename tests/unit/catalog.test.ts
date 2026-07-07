import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import { siteUrl, taobaoStoreUrl } from "@/lib/site";

describe("生产商品目录", () => {
  it("商品 slug 唯一且公开目录完整", () => {
    expect(catalog).toHaveLength(7);
    expect(new Set(catalog.map((product) => product.slug)).size).toBe(catalog.length);
  });

  it("已采用商品图只读取 public/assets 下的压缩副本", () => {
    const paths = catalog.flatMap((product) => product.images.map((image) => image.asset.projectPath));
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.startsWith("/assets/optimized/"))).toBe(true);
  });

  it("购买入口始终使用淘宝店地址", () => {
    expect(new URL(taobaoStoreUrl).hostname).toMatch(/taobao\.com$/);
  });

  it("SEO 使用正式 www 域名", () => {
    expect(siteUrl).toBe("https://www.spnc.cn");
  });

  it("公开商品均有真实图片，不保留占位商品", () => {
    expect(catalog.every((product) => product.images.length > 0)).toBe(true);
    expect(catalog.flatMap((product) => product.variants).some((variant) => variant.size === "标准装" || variant.flavor === "多种风味")).toBe(false);
  });
});
