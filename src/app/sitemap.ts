import type { MetadataRoute } from "next";
import { catalog } from "@/data/catalog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/products", "/on", "/authenticity", "/versions", "/faq", "/about", "/contact", "/privacy"];
  const pages = routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : .8 }));
  const products = catalog.map((product) => ({ url: `${siteUrl}/products/${product.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 }));
  return [...pages, ...products];
}
