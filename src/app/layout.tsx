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
  applicationName: "SPNC",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico", apple: "/assets/brand/spnc-share.jpg" },
  openGraph: { type: "website", locale: "zh_CN", siteName: "SPNC", title: siteName, description: siteDescription, url: "/", images: [{ url: "/assets/brand/spnc-share.jpg", width: 800, height: 800, alt: "SPNC 理想营养 Logo" }] },
  twitter: { card: "summary_large_image", title: siteName, description: siteDescription, images: ["/assets/brand/spnc-share.jpg"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body><Header />{children}<Footer /></body></html>;
}
