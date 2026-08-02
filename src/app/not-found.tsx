import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "页面未找到", robots: { index: false, follow: false } };

export default function NotFound() {
  return <main className="not-found"><div className="container narrow"><div className="eyebrow">404</div><h1>这个页面没有找到。</h1><p className="lead detail-lead">链接可能已经调整，或产品页面尚未公开。</p><div className="actions"><Link className="btn" href="/">返回首页</Link><Link className="btn secondary" href="/on">浏览 ON 专区</Link></div></div></main>;
}
