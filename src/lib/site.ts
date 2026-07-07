import type { Metadata } from "next";

export const siteName = "SPNC｜理想营养正品供应与版本说明";
export const siteDescription = "SPNC 运营理想营养，提供全球运动营养品牌商品信息、版本说明、防伪溯源与售后指引，购买跳转淘宝店完成。";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spnc.cn";
export const taobaoStoreUrl = process.env.NEXT_PUBLIC_TAOBAO_STORE_URL || "https://spnc.taobao.com";

export const pageMetadata = (title: string, description: string, path: string): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: { title: `${title}｜SPNC`, description, url: path, images: ["/assets/brand/spnc-share.jpg"] },
  twitter: { card: "summary_large_image", title: `${title}｜SPNC`, description, images: ["/assets/brand/spnc-share.jpg"] },
});
