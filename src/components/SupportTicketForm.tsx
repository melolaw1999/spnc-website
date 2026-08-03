"use client";

import { useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { catalog } from "@/data/catalog";
import { contactMethodOptions, ticketKindOptions } from "@/lib/tickets";

const maxEvidenceFiles = 3;
const maxOutputBytes = 980_000;

const canvasBlob = (canvas: HTMLCanvasElement, quality: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

async function compressEvidence(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("请选择图片文件。");
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
  if (!output || output.size > 1_050_000) throw new Error("图片仍然过大，请先截图或裁掉无关区域后再上传。");
  return new File([output], `${file.name.replace(/\.[^.]+$/, "").slice(0, 70) || "evidence"}.jpg`, { type: "image/jpeg" });
}

export function SupportTicketForm({ configured, turnstileSiteKey }: { configured: boolean; turnstileSiteKey: string }) {
  const submissionId = useRef<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!submissionId.current && typeof crypto !== "undefined") submissionId.current = crypto.randomUUID();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || status === "submitting") return;
    setStatus("submitting");
    setMessage("正在压缩并安全提交图片…");

    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      form.set("submissionId", submissionId.current || crypto.randomUUID());
      form.delete("evidence");
      if (!form.has("batchCode")) form.set("batchCode", "");
      if (!form.has("documentTypes")) form.set("documentTypes", "");
      const fileInput = formElement.elements.namedItem("evidence") as HTMLInputElement | null;
      const files = Array.from(fileInput?.files ?? []);
      if (files.length > maxEvidenceFiles) throw new Error(`最多上传 ${maxEvidenceFiles} 张图片。`);
      const compressed = await Promise.all(files.map(compressEvidence));
      compressed.forEach((file) => form.append("evidence", file));

      const response = await fetch("/api/tickets", { method: "POST", body: form });
      const result = await response.json() as { ticketId?: string; error?: string };
      if (!response.ok || !result.ticketId) throw new Error(result.error || "提交失败，请稍后重试。");
      window.location.assign(`/support/success?ticket=${encodeURIComponent(result.ticketId)}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试。");
      (window as Window & { turnstile?: { reset: () => void } }).turnstile?.reset();
    }
  }

  return <>
    {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
    {!configured && <div className="notice support-config-notice">工单入口正在完成私密存储和安全验证配置。目前请先从淘宝订单联系售后，或发送邮件至 service@spnc.cn。</div>}
    <form className="support-form" onSubmit={submit}>
      <div className="support-form-section">
        <div className="support-step">01</div>
        <div><h2>订单与问题</h2><p>用于核对购买记录，不在官网处理付款或退款。</p></div>
      </div>
      <div className="support-fields two-columns">
        <label>问题类型<select className="field" name="kind" required defaultValue=""><option value="" disabled>请选择</option>{ticketKindOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
        <label>淘宝订单号<input className="field" name="orderNumber" inputMode="numeric" autoComplete="off" minLength={8} maxLength={48} required placeholder="请复制订单号" /></label>
        <label>购买日期<input className="field" name="orderDate" type="date" required /></label>
        <label>ON 商品<select className="field" name="productName" required defaultValue=""><option value="" disabled>请选择商品</option>{catalog.map((product) => <option value={product.name} key={product.id}>{product.name}</option>)}</select></label>
        <label>规格 / 口味<input className="field" name="variant" maxLength={120} placeholder="例如：5 磅 / 双重巧克力" /></label>
        <label>活动名称或代码<input className="field" name="campaignCode" maxLength={80} placeholder="仅活动权益登记需要填写" /></label>
      </div>

      <div className="support-form-section">
        <div className="support-step">02</div>
        <div><h2>问题说明与图片</h2><p>瘪桶或破损建议上传产品全图、问题近照及外箱情况。</p></div>
      </div>
      <div className="support-fields">
        <label>问题描述<textarea className="field support-textarea" name="description" minLength={10} maxLength={1200} required placeholder="请说明到货情况、发现时间和希望核验的问题。" /></label>
        <label>证据图片<input className="field support-file" name="evidence" type="file" accept="image/*" multiple /><small>最多 3 张。提交前会在手机或电脑中压缩并移除照片定位信息；如 HEIC 无法读取，请上传截图。</small></label>
      </div>

      <div className="support-form-section">
        <div className="support-step">03</div>
        <div><h2>联系方式</h2><p>只需留一种联系方式，仅用于本次工单。</p></div>
      </div>
      <div className="support-fields two-columns">
        <label>联系方法<select className="field" name="contactMethod" required defaultValue=""><option value="" disabled>请选择</option>{contactMethodOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
        <label>联系方式<input className="field" name="contactValue" maxLength={120} required autoComplete="off" placeholder="手机号、微信号或邮箱" /></label>
      </div>

      <label className="honeypot" aria-hidden="true">网站<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="support-consent"><input type="checkbox" name="consent" required /><span>我已阅读隐私说明，同意 SPNC 仅为核验和处理本次工单使用上述订单信息与联系方式。活动权益不与好评、五星或评价内容挂钩。</span></label>
      {configured && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />}
      <button className="btn support-submit" type="submit" disabled={!configured || status === "submitting"}>{status === "submitting" ? "正在提交…" : "提交工单"}</button>
      {message && <p className={status === "error" ? "form-message form-message-error" : "form-message"} role="status">{message}</p>}
    </form>
  </>;
}
