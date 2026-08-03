"use client";

import Script from "next/script";
import { useRef, useState, type FormEvent } from "react";
import { complianceDocumentTypes, complianceProductGroups, getComplianceProduct } from "@/data/compliance";
import { contactMethodOptions } from "@/lib/tickets";
import styles from "@/app/compliance/compliance.module.css";

type VerifiedDocument = {
  id: string;
  title: string;
  contentType: string;
  uploadedAt: string;
  url: string;
};

const maxOutputBytes = 980_000;
const canvasBlob = (canvas: HTMLCanvasElement, quality: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

async function compressBatchPhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("桶底照片请选择图片文件。");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("图片无法处理，请改用 JPG 或 PNG。");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let output: Blob | null = null;
  for (const quality of [0.82, 0.7, 0.58, 0.46]) {
    output = await canvasBlob(canvas, quality);
    if (output && output.size <= maxOutputBytes) break;
  }
  if (!output || output.size > 1_050_000) throw new Error("桶底照片仍然过大，请截图或裁掉无关区域后再上传。");
  return new File([output], "batch-bottom.jpg", { type: "image/jpeg" });
}

const resetTurnstile = () => (window as Window & { turnstile?: { reset: () => void } }).turnstile?.reset();

export function CompliancePortal({ configured, turnstileSiteKey }: { configured: boolean; turnstileSiteKey: string }) {
  const submissionId = useRef("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [lookupMessage, setLookupMessage] = useState("");
  const [documents, setDocuments] = useState<VerifiedDocument[]>([]);
  const [requestStatus, setRequestStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [requestMessage, setRequestMessage] = useState("");
  if (!submissionId.current && typeof crypto !== "undefined") submissionId.current = crypto.randomUUID();

  async function verifyBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || lookupStatus === "loading") return;
    setLookupStatus("loading");
    setLookupMessage("正在核对产品、文件类型与 Batch…");
    setDocuments([]);
    try {
      const response = await fetch("/api/compliance/verify", { method: "POST", body: new FormData(event.currentTarget) });
      const result = await response.json() as { error?: string; documents?: VerifiedDocument[] };
      if (!response.ok || !result.documents?.length) throw new Error(result.error || "暂未找到匹配资料。");
      setDocuments(result.documents);
      setLookupStatus("found");
      setLookupMessage("Batch 验证通过。以下链接将在 10 分钟后失效。");
    } catch (error) {
      setLookupStatus("error");
      setLookupMessage(error instanceof Error ? error.message : "验证失败，请稍后重试。");
      resetTurnstile();
    }
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || requestStatus === "submitting") return;
    setRequestStatus("submitting");
    setRequestMessage("正在安全提交申请与桶底照片…");
    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const product = getComplianceProduct(String(form.get("productKey") || ""));
      if (!product) throw new Error("请选择正确的商品与规格。");
      if (!form.getAll("documentTypes").length) throw new Error("请至少选择一种需要申请的文件。");
      form.set("kind", "compliance-document");
      form.set("productName", product.productName);
      form.set("variant", product.variantLabel);
      form.set("campaignCode", "");
      form.set("description", "申请核验并回传所选商品与 Batch 对应的合规资料。");
      form.set("submissionId", submissionId.current || crypto.randomUUID());
      form.delete("evidence");
      const photoInput = formElement.elements.namedItem("batchPhoto") as HTMLInputElement | null;
      const photo = photoInput?.files?.[0];
      if (photo) form.append("evidence", await compressBatchPhoto(photo));
      form.delete("batchPhoto");

      const response = await fetch("/api/tickets", { method: "POST", body: form });
      const result = await response.json() as { ticketId?: string; error?: string };
      if (!response.ok || !result.ticketId) throw new Error(result.error || "申请提交失败，请稍后重试。");
      window.location.assign(`/support/success?ticket=${encodeURIComponent(result.ticketId)}`);
    } catch (error) {
      setRequestStatus("error");
      setRequestMessage(error instanceof Error ? error.message : "申请提交失败，请稍后重试。");
      resetTurnstile();
    }
  }

  return <>
    {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
    {!configured && <div className={`notice ${styles.configNotice}`}>资料调取与申请入口正在完成安全配置，请暂时从淘宝订单联系售后。</div>}

    <section className={styles.lookupSection} aria-labelledby="compliance-lookup-title">
      <div className={styles.sectionCopy}><span>01 · BATCH ACCESS</span><h2 id="compliance-lookup-title">按桶底 Batch 调取。</h2><p>选择商品与文件类型，输入桶底喷码中的完整 Batch / Lot 代码。系统只返回完全匹配且已加水印的资料。</p></div>
      <form className={styles.formCard} onSubmit={verifyBatch}>
        <label>商品与规格<select className="field" name="productKey" required defaultValue=""><option value="" disabled>请选择商品</option>{complianceProductGroups.map((group) => <optgroup label={group.label} key={group.label}>{group.options.map((product) => <option value={product.key} key={product.key}>{product.label}</option>)}</optgroup>)}</select></label>
        <label>文件类型<select className="field" name="documentType" required defaultValue=""><option value="" disabled>请选择文件</option>{complianceDocumentTypes.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}</select></label>
        <label>桶底 Batch / Lot<input className="field" name="batchCode" autoCapitalize="characters" autoComplete="off" minLength={5} maxLength={48} required placeholder="请按桶底喷码原样输入" /><small>不要只填写 EXP 有效期；字母 O / 数字 0、字母 I / L 请仔细核对。</small></label>
        <label className="honeypot" aria-hidden="true">网站<input name="website" tabIndex={-1} autoComplete="off" /></label>
        {configured && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />}
        <button className="btn" type="submit" disabled={!configured || lookupStatus === "loading"}>{lookupStatus === "loading" ? "正在验证…" : "验证 Batch 并调取"}</button>
        {lookupMessage && <p className={lookupStatus === "error" ? styles.error : styles.message} role="status">{lookupMessage}</p>}
        {documents.length > 0 && <div className={styles.documentList}>{documents.map((document) => <a href={document.url} target="_blank" rel="noreferrer" key={document.id}><span>{document.contentType === "application/pdf" ? "PDF" : "IMAGE"}</span><strong>{document.title}</strong><small>打开带水印文件 ↗</small></a>)}</div>}
      </form>
    </section>

    <section className={styles.requestSection} aria-labelledby="compliance-request-title">
      <div className={styles.sectionCopy}><span>02 · REQUEST</span><h2 id="compliance-request-title">没有找到，提交申请。</h2><p>提交商品、Batch 与订单信息。我们核对后通常在 1 个工作日内回传，并按对应产品和文件类型归档。</p></div>
      <form className={styles.formCard} onSubmit={submitRequest}>
        <label>商品与规格<select className="field" name="productKey" required defaultValue=""><option value="" disabled>请选择商品</option>{complianceProductGroups.map((group) => <optgroup label={group.label} key={group.label}>{group.options.map((product) => <option value={product.key} key={product.key}>{product.label}</option>)}</optgroup>)}</select></label>
        <fieldset><legend>需要的文件</legend><div className={styles.checkGrid}>{complianceDocumentTypes.map((type) => <label key={type.value}><input type="checkbox" name="documentTypes" value={type.value} />{type.label}</label>)}</div></fieldset>
        <div className={styles.twoColumns}>
          <label>桶底 Batch / Lot<input className="field" name="batchCode" autoCapitalize="characters" autoComplete="off" minLength={5} maxLength={48} required placeholder="完整批次代码" /></label>
          <label>桶底照片<input className="field" name="batchPhoto" type="file" accept="image/*" /><small>建议上传清晰近照，便于核对易混淆字符。</small></label>
          <label>淘宝订单号<input className="field" name="orderNumber" inputMode="numeric" autoComplete="off" minLength={8} maxLength={48} required placeholder="请复制订单号" /></label>
          <label>购买日期<input className="field" name="orderDate" type="date" required /></label>
          <label>联系方法<select className="field" name="contactMethod" required defaultValue=""><option value="" disabled>请选择</option>{contactMethodOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
          <label>联系方式<input className="field" name="contactValue" maxLength={120} required autoComplete="off" placeholder="手机号、微信号或邮箱" /></label>
        </div>
        <label className="honeypot" aria-hidden="true">网站<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <label className={styles.consent}><input type="checkbox" name="consent" required /><span>我同意理想营养仅为订单核验、批次匹配和资料回传使用上述信息。回传文件仅供本人备份参考，不作二次传播。</span></label>
        {configured && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />}
        <button className="btn" type="submit" disabled={!configured || requestStatus === "submitting"}>{requestStatus === "submitting" ? "正在提交…" : "提交资料申请"}</button>
        {requestMessage && <p className={requestStatus === "error" ? styles.error : styles.message} role="status">{requestMessage}</p>}
      </form>
    </section>
  </>;
}
