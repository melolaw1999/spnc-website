import type { Metadata } from "next";

export const siteName = "理想营养｜正品供应与版本说明中心";
export const siteDescription = "理想营养专注全球运动营养品牌商品的正品供应、版本说明、防伪溯源与售后服务，购买行为跳转淘宝店完成。";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spnc.cn";
export const taobaoStoreUrl = process.env.NEXT_PUBLIC_TAOBAO_STORE_URL || "https://spnc.taobao.com";

export const pageMetadata = (title: string, description: string, path: string): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: { title: `${title}｜理想营养`, description, url: path, images: ["/assets/brand/ideal-nutrition-share.jpg"] },
  twitter: { card: "summary_large_image", title: `${title}｜理想营养`, description, images: ["/assets/brand/ideal-nutrition-share.jpg"] },
});
