import Link from "next/link";
import { SupportTicketForm } from "@/components/SupportTicketForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("售后工单登记", "提交 SPNC 理想营养淘宝订单相关的瘪桶、破损、版本疑问与活动权益登记资料。退款与交易处理仍在淘宝订单内完成。", "/support");
export const dynamic = "force-dynamic";

export default function SupportPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const configured = Boolean(turnstileSiteKey && process.env.TURNSTILE_SECRET_KEY && process.env.BLOB_READ_WRITE_TOKEN && process.env.TICKET_HASH_SALT);
  return <main className="section support-page"><div className="container support-container">
    <div className="support-intro"><div className="eyebrow">SPNC Support</div><h1 className="page-title">售后工单登记</h1><p className="lead detail-lead">一次提交订单信息、问题描述和必要图片，便于售后核验。退款、退货和交易沟通仍通过原淘宝订单完成。</p><div className="notice support-boundary">请勿提交淘宝密码、支付密码、短信验证码、身份证、银行卡或完整收货地址。返现登记不得与好评或五星评价挂钩。</div></div>
    <SupportTicketForm configured={configured} turnstileSiteKey={turnstileSiteKey} />
    <p className="support-after"><Link className="text-link" href="/privacy">查看隐私与工单信息处理说明 →</Link></p>
  </div></main>;
}
