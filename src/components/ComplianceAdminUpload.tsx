"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { complianceDocumentTypes, complianceProductGroups } from "@/data/compliance";
import styles from "@/app/admin/compliance/admin.module.css";

export function ComplianceAdminUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "uploading") return;
    setStatus("uploading");
    setMessage("正在写入强制水印并归档…");
    try {
      const response = await fetch("/api/admin/compliance", { method: "POST", body: new FormData(event.currentTarget) });
      const result = await response.json() as { error?: string; id?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "回传失败，请稍后重试。");
      event.currentTarget.reset();
      setStatus("done");
      setMessage("回传完成。公开端只有在商品、文件类型和 Batch 完全匹配时才能调取。原始文件未对外保存。");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "回传失败，请稍后重试。");
    }
  }

  return <form className={styles.uploadForm} onSubmit={submit}>
    <div className={styles.twoColumns}>
      <label>商品与规格<select className="field" name="productKey" required defaultValue=""><option value="" disabled>请选择商品</option>{complianceProductGroups.map((group) => <optgroup label={group.label} key={group.label}>{group.options.map((product) => <option value={product.key} key={product.key}>{product.label}</option>)}</optgroup>)}</select></label>
      <label>文件类型<select className="field" name="documentType" required defaultValue=""><option value="" disabled>请选择类型</option>{complianceDocumentTypes.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}</select></label>
      <label>对应 Batch / Lot<input className="field" name="batchCode" autoCapitalize="characters" minLength={5} maxLength={48} required placeholder="按桶底喷码原样填写" /></label>
      <label>公开文件标题<input className="field" name="title" maxLength={120} placeholder="留空则自动生成" /></label>
    </div>
    <label>回传文件<input className="field" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /><small>支持 PDF、JPG、PNG、WebP，单个不超过 4 MB。系统只保存加水印后的版本。</small></label>
    <div className={styles.watermarkRule}><strong>强制水印</strong><span>禁止二次传播 · 仅供个人备份参考</span></div>
    <button className="btn" type="submit" disabled={status === "uploading"}>{status === "uploading" ? "正在处理…" : "加水印并回传"}</button>
    {message && <p className={status === "error" ? styles.error : styles.message}>{message}</p>}
  </form>;
}
