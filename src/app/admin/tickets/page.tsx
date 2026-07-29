import { TicketAdminActions } from "@/components/TicketAdminActions";
import { isTicketStorageConfigured, listTickets } from "@/lib/ticket-store";
import { maskContact, maskOrderNumber, ticketKindLabel, ticketStatusLabel } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "工单管理｜SPNC", robots: { index: false, follow: false } };

export default async function TicketAdminPage() {
  if (!isTicketStorageConfigured()) return <main className="section"><div className="container narrow"><h1 className="page-title">工单管理</h1><div className="notice">尚未连接私密工单存储。</div></div></main>;
  const tickets = await listTickets();
  return <main className="section admin-tickets"><div className="container"><div className="section-head"><div><div className="eyebrow">SPNC Admin</div><h1 className="page-title">工单管理</h1><p className="muted">当前共 {tickets.length} 条工单。公开列表默认遮挡订单号和联系方式。</p></div></div>
    <div className="ticket-list">{tickets.map((ticket) => <article className="card ticket-card" key={ticket.id}>
      <div className="ticket-card-head"><div><span className="tag">{ticketStatusLabel(ticket.status)}</span><h2>{ticket.id}</h2></div><time>{new Date(ticket.createdAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</time></div>
      <dl className="ticket-summary"><div><dt>问题</dt><dd>{ticketKindLabel(ticket.kind)}</dd></div><div><dt>商品</dt><dd>{ticket.productName}{ticket.variant ? ` · ${ticket.variant}` : ""}</dd></div><div><dt>订单</dt><dd>{maskOrderNumber(ticket.orderNumber)}</dd></div><div><dt>联系</dt><dd>{maskContact(ticket.contactValue, ticket.contactMethod)}</dd></div></dl>
      <details className="ticket-details"><summary>查看工单详情</summary><div className="ticket-detail-body"><p><strong>完整订单号：</strong>{ticket.orderNumber}</p><p><strong>购买日期：</strong>{ticket.orderDate}</p><p><strong>联系方式：</strong>{ticket.contactValue}</p>{ticket.campaignCode && <p><strong>活动：</strong>{ticket.campaignCode}</p>}<p><strong>描述：</strong>{ticket.description}</p>{ticket.evidence.length > 0 && <div className="ticket-evidence">{ticket.evidence.map((file, index) => <a target="_blank" rel="noreferrer" href={`/api/admin/files?pathname=${encodeURIComponent(file.pathname)}`} key={file.pathname}>证据图片 {index + 1}</a>)}</div>}{ticket.internalNotes.length > 0 && <div className="ticket-notes"><strong>内部记录</strong>{ticket.internalNotes.map((note) => <p key={`${note.at}-${note.actor}`}>{note.at} · {note.actor}：{note.note}</p>)}</div>}</div></details>
      <TicketAdminActions ticketId={ticket.id} currentStatus={ticket.status} />
    </article>)}{tickets.length === 0 && <div className="card">暂无工单。</div>}</div>
  </div></main>;
}
