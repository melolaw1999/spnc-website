"use client";

import { ChangeEvent, useState } from "react";
import styles from "@/app/membership/membership.module.css";

type ImportPreview = {
  fileName: string;
  totalRows: number;
  mainOrderCount: number;
  eligibleRows: number;
  orderEligibleRows: number;
  heldRows: number;
  refundedRows: number;
  unmatchedRows: number;
  totals: { paid: string; untaxed: string; rebate: string };
  previewLines: Array<{ orderNumber: string; product: string; status: string; paid: string; untaxed: string; rebate: string }>;
};

export function AdminImportDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportPreview | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/membership/preview-import", { method: "POST", body: form });
      const body = await response.json() as ImportPreview & { error?: string };
      if (!response.ok) throw new Error(body.error || "导入失败。");
      setResult(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "导入失败。");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return <div className={styles.importDemo}>
    <label className={styles.dropzone}>
      <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFile} disabled={loading} />
      <span>{loading ? "正在核对明细…" : "选择宝贝销售明细报表"}</span>
      <small>只读取汇总，不保存原始文件 · 最大30MB</small>
    </label>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    {result && <div className={styles.importResult}>
      <div className={styles.importFile}><span>IMPORT COMPLETE</span><strong>{result.fileName}</strong><p>{result.totalRows.toLocaleString("zh-CN")} 条商品明细 · {result.mainOrderCount.toLocaleString("zh-CN")} 个主订单</p></div>
      <div className={styles.adminMetrics}>
        <article><span>命中返利规格</span><strong>{result.eligibleRows.toLocaleString("zh-CN")}</strong></article>
        <article><span>订单侧满足条件</span><strong>{result.orderEligibleRows.toLocaleString("zh-CN")}</strong></article>
        <article><span>退款中暂缓</span><strong>{result.heldRows.toLocaleString("zh-CN")}</strong></article>
        <article><span>未配置规格</span><strong>{result.unmatchedRows.toLocaleString("zh-CN")}</strong></article>
      </div>
      <div className={styles.settlementTotals}>
        <div><span>订单侧符合条件实付</span><strong>{result.totals.paid}</strong></div>
        <div><span>剔税后金额</span><strong>{result.totals.untaxed}</strong></div>
        <div className={styles.totalAccent}><span>理论返利参考</span><strong>{result.totals.rebate}</strong></div>
      </div>
      {result.previewLines.length > 0 && <div className={styles.adminTableWrap}><table><thead><tr><th>订单</th><th>商品</th><th>状态</th><th>实付</th><th>未税</th><th>返利</th></tr></thead><tbody>{result.previewLines.map((line) => <tr key={`${line.orderNumber}-${line.product}`}><td>{line.orderNumber}</td><td>{line.product}</td><td><span className={styles.statusGreen}>{line.status}</span></td><td>{line.paid}</td><td>{line.untaxed}</td><td><strong>{line.rebate}</strong></td></tr>)}</tbody></table></div>}
      <div className={styles.importFootnote}><span>重要说明</span><p>以上金额是报表内命中规格的订单侧参考，不是实际打款批次。只有与会员主动提交订单匹配并审核通过后，才会进入待结算；本预览不保存、不中转任何订单数据。</p></div>
    </div>}
  </div>;
}
