import type { MetadataRoute } from "next";
import { catalog } from "@/data/catalog";
import { articles } from "@/data/articles";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/products", "/on", "/authenticity", "/versions", "/articles", "/knowledge", "/faq", "/support", "/about", "/contact", "/privacy"];
  const pages = routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : .8 }));
  const products = catalog.map((product) => ({ url: `${siteUrl}/products/${product.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 }));
  const articlePages = articles.map((article) => ({ url: `${siteUrl}/articles/${article.slug}`, lastModified: new Date(article.publishedAt.replace(" ", "T") + ":00+08:00"), changeFrequency: "yearly" as const, priority: .65 }));
  return [...pages, ...products, ...articlePages];
}
