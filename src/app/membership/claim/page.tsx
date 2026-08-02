import type { Metadata } from "next";
import { ClaimDemo } from "@/components/membership/ClaimDemo";
import { MembershipPreviewNav } from "@/components/membership/MembershipPreviewNav";
import styles from "../membership.module.css";

export const metadata: Metadata = { title: "黑卡返利申请预览", robots: { index: false, follow: false } };

export default function MembershipClaimPage() {
  return <main className={styles.membershipPage}>
    <MembershipPreviewNav current="/membership/claim" />
    <section className={styles.claimPage}><div className={`container ${styles.claimGrid}`}><aside className={styles.claimAside}><span>BEFORE YOU START</span><h2>准备好两样信息。</h2><ol><li><b>01</b><div><strong>淘宝订单号</strong><p>主订单号或子订单号均可。</p></div></li><li><b>02</b><div><strong>支付宝账号与姓名</strong><p>第一次提交返利时填写。</p></div></li></ol><div className={styles.claimAsideNote}><strong>金额无需填写</strong><p>系统每月从宝贝销售明细读取买家实付金额，并按商品税类自动剔税。</p></div></aside><ClaimDemo /></div></section>
  </main>;
}

