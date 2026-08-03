import { serviceEmail } from "@/data/contacts";
import { siteUrl } from "@/lib/site";
import type { TicketRecord } from "@/lib/ticket-store";
import { ticketKindLabel } from "@/lib/tickets";

export async function notifyTicketCreated(ticket: TicketRecord) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.TICKET_NOTIFICATION_FROM;
  if (!apiKey || !from) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [serviceEmail],
      subject: `新工单 ${ticket.id}`,
      text: [
        `工单编号：${ticket.id}`,
        `问题类型：${ticketKindLabel(ticket.kind)}`,
        `商品：${ticket.productName}`,
        ticket.batchCode ? `Batch：${ticket.batchCode}` : "",
        ticket.documentTypes ? `申请文件：${ticket.documentTypes}` : "",
        `提交时间：${ticket.createdAt}`,
        `后台查看：${siteUrl}/admin/tickets`,
        "订单号与联系方式请登录受保护的后台查看。",
      ].join("\n"),
    }),
  });
}
