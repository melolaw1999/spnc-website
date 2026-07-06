import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s｜${siteName}` },
  description: siteDescription,
  applicationName: "理想营养",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico", apple: "/assets/brand/ideal-nutrition-share.jpg" },
  openGraph: { type: "website", locale: "zh_CN", siteName: "理想营养", title: siteName, description: siteDescription, url: "/", images: [{ url: "/assets/brand/ideal-nutrition-share.jpg", width: 800, height: 800, alt: "理想营养品牌 Logo" }] },
  twitter: { card: "summary_large_image", title: siteName, description: siteDescription, images: ["/assets/brand/ideal-nutrition-share.jpg"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body><Header />{children}<Footer /></body></html>;
}
