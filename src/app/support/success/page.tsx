import Link from "next/link";
import { TaobaoButton } from "@/components/TaobaoButton";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("工单提交成功", "SPNC 理想营养售后工单提交结果。", "/support/success");

export default async function SupportSuccess({ searchParams }: { searchParams: Promise<{ ticket?: string }> }) {
  const { ticket = "" } = await searchParams;
  const validTicket = /^SPNC-\d{8}-[A-Z0-9]{6}$/.test(ticket) ? ticket : "";
  return <main className="support-success"><div className="container narrow"><div className="success-mark" aria-hidden="true">✓</div><div className="eyebrow">Ticket Received</div><h1>资料已收到</h1>{validTicket && <p className="ticket-number">工单编号 <strong>{validTicket}</strong></p>}<p className="lead detail-lead">请保存工单编号。工作人员核验后会通过你填写的联系方式沟通；涉及退款、退货或交易调整时，仍需回到原淘宝订单处理。</p><div className="actions"><TaobaoButton label="打开淘宝店" /><Link className="btn secondary" href="/">返回首页</Link></div></div></main>;
}
