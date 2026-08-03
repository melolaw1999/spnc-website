import { ComplianceAdminUpload } from "@/components/ComplianceAdminUpload";
import { complianceDocumentTypeLabel } from "@/lib/compliance";
import { listComplianceDocuments } from "@/lib/compliance-store";
import { isTicketStorageConfigured, listTickets } from "@/lib/ticket-store";
import { ticketStatusLabel } from "@/lib/tickets";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function ComplianceAdminPage() {
  const configured = isTicketStorageConfigured();
  const [documents, tickets] = configured
    ? await Promise.all([listComplianceDocuments(), listTickets()])
    : [[], []];
  const requests = tickets.filter((ticket) => ticket.kind === "compliance-document");

  return <main className={styles.page}>
    <section className={styles.hero}><div className="container"><span>SPNC ADMIN · COMPLIANCE</span><h1>批次资料回传。</h1><p>核对申请后，按产品、规格、文件类型和 Batch 归档。上传时自动写入强制水印，原始文件不对外保存。</p></div></section>
    <div className={`container ${styles.content}`}>
      {!configured && <div className="notice">私密文件存储尚未配置。</div>}
      <section className={styles.panel}><header><div><span>UPLOAD</span><h2>加水印并归档</h2></div><p>Batch 必须与桶底喷码一致。公开端不会展示批次目录。</p></header><ComplianceAdminUpload /></section>

      <section className={styles.panel}><header><div><span>REQUESTS</span><h2>买家申请</h2></div><p>{requests.length} 条合规资料申请。</p></header>
        <div className={styles.requestList}>{requests.map((ticket) => <article key={ticket.id}><div><span>{ticketStatusLabel(ticket.status)}</span><strong>{ticket.productName} · {ticket.variant}</strong><small>{ticket.id} · {new Date(ticket.createdAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</small></div><dl><div><dt>Batch</dt><dd>{ticket.batchCode || "未填写"}</dd></div><div><dt>申请文件</dt><dd>{ticket.documentTypes || "未填写"}</dd></div><div><dt>订单</dt><dd>{ticket.orderNumber}</dd></div><div><dt>联系</dt><dd>{ticket.contactValue}</dd></div></dl>{ticket.evidence.length > 0 && <a href={`/api/admin/files?pathname=${encodeURIComponent(ticket.evidence[0].pathname)}`} target="_blank" rel="noreferrer">查看桶底照片 ↗</a>}</article>)}{requests.length === 0 && <div className={styles.empty}>暂无合规资料申请。</div>}</div>
      </section>

      <section className={styles.panel}><header><div><span>ARCHIVE</span><h2>已归档文件</h2></div><p>{documents.length} 份带水印资料。</p></header>
        <div className={styles.tableWrap}><table><thead><tr><th>产品</th><th>规格</th><th>文件</th><th>Batch</th><th>回传时间</th></tr></thead><tbody>{documents.map((document) => <tr key={document.id}><td>{document.productName}</td><td>{document.variantLabel}</td><td>{complianceDocumentTypeLabel(document.documentType)}<small>{document.title}</small></td><td><code>{document.batchMask}</code></td><td>{new Date(document.uploadedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</td></tr>)}</tbody></table>{documents.length === 0 && <div className={styles.empty}>暂无已归档文件。</div>}</div>
      </section>
    </div>
  </main>;
}
