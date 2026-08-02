import type { Metadata } from "next";
import { AccessForm } from "./AccessForm";
import styles from "./access.module.css";
import { sanitizeMembershipPreviewNextPath } from "@/lib/membership-preview-auth";

export const metadata: Metadata = {
  title: "黑卡团队预览",
  robots: { index: false, follow: false, nocache: true },
};

type AccessPageProps = {
  searchParams: Promise<{ next?: string; unavailable?: string }>;
};

export default async function MembershipPreviewAccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  return <main className={styles.accessPage}>
    <section className={styles.accessPanel}>
      <div className={styles.accessCard} aria-hidden="true">
        <div className={styles.cardTop}><strong>SPNC</strong><span>BLACK</span></div>
        <div className={styles.cardMark}>2<small>%</small></div>
        <div className={styles.cardBottom}><span>INVITATION ONLY</span><b>TEAM PREVIEW</b></div>
      </div>
      <div className={styles.accessCopy}>
        <span>SPNC BLACK · INVITED PREVIEW</span>
        <h1>受邀访问。</h1>
        <p>黑卡会员目前处于内部方案核对阶段。请输入团队邀请密码，查看会籍、开卡、返利和结算演示。</p>
        <AccessForm
          nextPath={sanitizeMembershipPreviewNextPath(params.next)}
          unavailable={params.unavailable === "1"}
        />
      </div>
    </section>
    <p className={styles.previewNotice}>此页面不是正式会员入口 · 演示资料不会生成真实会籍或返利</p>
  </main>;
}
