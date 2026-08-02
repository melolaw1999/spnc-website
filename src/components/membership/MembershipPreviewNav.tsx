import Link from "next/link";
import styles from "@/app/membership/membership.module.css";

const links = [
  ["会籍介绍", "/membership"],
  ["注册开卡", "/membership/activate"],
  ["会员中心", "/membership/account"],
  ["申请返利", "/membership/claim"],
  ["管理预览", "/admin/membership"],
] as const;

export function MembershipPreviewNav({ current }: { current: string }) {
  return <div className={styles.previewBar}>
    <div className={`container ${styles.previewBarInner}`}>
      <span>BLACK CARD PREVIEW</span>
      <nav aria-label="黑卡会员预览导航">
        {links.map(([label, href]) => <Link className={current === href ? styles.previewActive : ""} href={href} key={href}>{label}</Link>)}
      </nav>
    </div>
  </div>;
}

