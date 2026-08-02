import type { Metadata } from "next";
import { ActivationDemo } from "@/components/membership/ActivationDemo";
import { MembershipCard } from "@/components/membership/MembershipCard";
import { MembershipPreviewNav } from "@/components/membership/MembershipPreviewNav";
import styles from "../membership.module.css";

export const metadata: Metadata = { title: "黑卡注册开卡预览", robots: { index: false, follow: false } };

export default function ActivateMembershipPage() {
  return <main className={styles.membershipPage}>
    <MembershipPreviewNav current="/membership/activate" />
    <section className={styles.authPage}>
      <div className={`container ${styles.authGrid}`}>
        <div className={styles.authCardColumn}><MembershipCard compact /><div className={styles.securityNote}><span>ONE KEY · ONE ACCOUNT</span><p>一个CDKEY仅能兑换一次。兑换后绑定手机号与会员服务订单号。</p></div></div>
        <ActivationDemo />
      </div>
    </section>
  </main>;
}

