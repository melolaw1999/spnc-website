import type { Metadata } from "next";
import Link from "next/link";
import { OnRotateDemo } from "@/components/OnRotateDemo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "ON金标乳清旋转样品",
  description: "ON金标乳清双重巧克力味5.05磅74份，宝尊完整包装展开稿的独立三维效果预览。",
  robots: { index: false, follow: false },
  alternates: { canonical: "/preview/on-3d" },
};

export default function On3DPreviewPage() {
  return <main className={styles.page}><header className={styles.head}><div><p>SPNC · 独立预览</p><h1>ON 金标乳清</h1></div><Link href="/">返回首页 ↗</Link></header><OnRotateDemo /></main>;
}
