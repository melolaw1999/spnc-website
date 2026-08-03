import { CompliancePortal } from "@/components/CompliancePortal";
import { isComplianceAccessConfigured } from "@/lib/compliance";
import { pageMetadata } from "@/lib/site";
import styles from "./compliance.module.css";

export const metadata = pageMetadata("合规与资质", "按 ON 商品与桶底 Batch 申请或调取带水印的报关、检验与批次质量资料。", "/compliance");

export default function CompliancePage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN && process.env.TURNSTILE_SECRET_KEY && turnstileSiteKey && isComplianceAccessConfigured());
  return <main className={styles.page}>
    <section className={styles.hero}><div className="container"><span>COMPLIANCE &amp; DOCUMENTS</span><h1>一桶，一批，一份对应资料。</h1><p>报关、检验与批次质量文件不公开散发。先核对商品，再用桶底 Batch 调取对应的带水印版本。</p></div></section>
    <div className={`container ${styles.content}`}>
      <div className={styles.principles}>{[
        ["01", "对应产品归档", "按商品、规格与文件类型归类。"],
        ["02", "Batch 精确匹配", "不公开批次目录，不返回近似结果。"],
        ["03", "文件强制水印", "禁止二次传播，仅供个人备份参考。"],
      ].map(([number, title, copy]) => <article key={number}><span>{number}</span><strong>{title}</strong><small>{copy}</small></article>)}</div>
      <CompliancePortal configured={configured} turnstileSiteKey={turnstileSiteKey} />
    </div>
  </main>;
}
