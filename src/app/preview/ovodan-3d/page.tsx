import type { Metadata } from "next";
import Link from "next/link";
import { OvodanRotateDemo } from "@/components/OvodanRotateDemo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "欧福单品三维旋转样品",
  description: "欧福草莓味与百香果味225mL真实三面包装旋转预览，瓶形及接缝按照片比例制作。",
  robots: { index: false, follow: false },
  alternates: { canonical: "/preview/ovodan-3d" },
};

export default function Ovodan3DPreviewPage() {
  return <main className={styles.page}>
    <header className={styles.head}><div><p>SPNC · 独立预览</p><h1>欧福单品三维旋转样品</h1></div><Link href="/">返回首页 <span aria-hidden="true">↗</span></Link></header>
    <OvodanRotateDemo />
  </main>;
}
