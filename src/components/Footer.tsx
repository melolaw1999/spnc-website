import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return <footer className="footer"><div className="container footer-grid">
    <div className="footer-brand"><Image src="/assets/brand/ideal-nutrition-logo-blue.png" width={1326} height={700} alt="理想营养，正品源自正道" loading="lazy" sizes="180px" /><p>Provide goods what’s good.</p></div>
    <nav className="footer-links" aria-label="页脚导航"><Link href="/products">商品矩阵</Link><Link href="/on">ON 专区</Link><Link href="/authenticity">防伪溯源</Link><Link href="/versions">版本说明</Link><Link href="/faq">售后 FAQ</Link><Link href="/about">关于我们</Link><Link href="/contact">联系我们</Link><Link href="/privacy">隐私说明</Link></nav>
    <p className="footer-note">膳食补充剂不能替代均衡饮食。产品信息以实物包装标签为准。购买与支付均在淘宝店内完成。</p>
  </div></footer>;
}
