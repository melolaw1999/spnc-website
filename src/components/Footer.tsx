import Image from "next/image";
import Link from "next/link";
import { mailto, publicContactEmail, serviceEmail } from "@/data/contacts";

export function Footer() {
  return <footer className="footer"><div className="container footer-grid">
    <div className="footer-brand"><Image src="/assets/brand/spnc-logo-blue.png" width={1326} height={700} alt="SPNC 理想营养 Logo" loading="lazy" sizes="180px" /><p>SPNC</p></div>
    <nav className="footer-links" aria-label="页脚导航"><Link href="/on">ON 专区</Link><Link href="/authenticity">防伪溯源</Link><Link href="/versions">版本说明</Link><Link href="/articles">文章</Link><Link href="/support">售后登记</Link><Link href="/about">关于我们</Link><Link href="/contact">联系我们</Link><Link href="/privacy">隐私说明</Link></nav>
    <div className="footer-note"><p>膳食补充剂不能替代均衡饮食。商品信息以实物包装标签为准。购买与支付均在淘宝店内完成。</p><p>联系邮箱：<a href={mailto(publicContactEmail)}>{publicContactEmail}</a><br />售后邮箱：<a href={mailto(serviceEmail)}>{serviceEmail}</a></p></div>
  </div></footer>;
}
