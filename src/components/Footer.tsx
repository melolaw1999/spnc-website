import Link from "next/link";
import { mailto, publicContactEmail, serviceEmail } from "@/data/contacts";
import { companyNameEn, companyNameZh } from "@/data/company";
import { BackToTop } from "@/components/BackToTop";
import { SouthernLogo } from "@/components/SouthernLogo";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return <>
    <footer className="footer">
      <div className={`container ${styles.grid}`}>
        <div className={styles.identity}>
          <SouthernLogo className={styles.logo} />
          <p className={styles.companyName} lang="en">{companyNameEn}</p>
          <p className={styles.companyNameZh}>{companyNameZh}</p>
        </div>
        <nav className="footer-links" aria-label="页脚导航"><Link href="/on">ON 专区</Link><Link href="/authenticity">防伪溯源</Link><Link href="/compliance">合规与资质</Link><Link href="/versions">版本说明</Link><Link href="/articles">文章</Link><Link href="/support">售后登记</Link><Link href="/careers">诚聘英才</Link><Link href="/contact">联系我们</Link><Link href="/privacy">隐私说明</Link></nav>
        <div className={`footer-note ${styles.note}`}><p>膳食补充剂不能替代均衡饮食。商品信息以实物包装标签为准。购买与支付均在淘宝店内完成。</p><p>联系邮箱：<a href={mailto(publicContactEmail)}>{publicContactEmail}</a><br />售后邮箱：<a href={mailto(serviceEmail)}>{serviceEmail}</a></p></div>
      </div>
      <div className={styles.legalBar}>
        <p>© {year} SPNC · 理想营养 <span aria-hidden="true">·</span> <span>All Rights Reserved.</span></p>
      </div>
    </footer>
    <BackToTop />
  </>;
}
