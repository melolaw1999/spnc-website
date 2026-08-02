import { describe, expect, it } from "vitest";
import { articles } from "@/data/articles";

describe("公众号文章档案", () => {
  it("文章标识、日期和本地封面完整，并按原始日期倒序排列", () => {
    const slugs = articles.map((article) => article.slug);
    const dates = articles.map((article) => article.publishedAt);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(dates).toEqual([...dates].sort().reverse());

    articles.forEach((article) => {
      expect(article.title.trim().length).toBeGreaterThan(0);
      expect(article.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(article.coverImage).toMatch(/^\/assets\/articles\//);
      expect(["理想营养", "Manluo"]).toContain(article.author);
      article.contentImages?.forEach((image) => {
        expect(image.src).toMatch(/^\/assets\/articles\//);
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
      });
    });
  });

  it("公众号正文仅引用本地图片，不保留可执行内容", () => {
    articles.filter((article) => article.contentMode === "html").forEach((article) => {
      expect(article.originalUrl).toContain("https://mp.weixin.qq.com/");
      expect(article.contentHtml).not.toMatch(/<script|javascript:|\son[a-z]+=/i);
      expect(article.contentHtml).not.toMatch(/mmbiz\.qpic\.cn|data-src=/i);
      expect(article.contentHtml).toContain("/assets/articles/");
    });
  });
});
