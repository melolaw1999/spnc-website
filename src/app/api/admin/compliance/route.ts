import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getComplianceDocumentType, getComplianceProduct } from "@/data/compliance";
import { applyComplianceWatermark } from "@/lib/compliance-watermark";
import { complianceBatchHash, complianceWatermarkText, isComplianceAccessConfigured, maskBatchCode, normalizeBatchCode } from "@/lib/compliance";
import { saveComplianceDocument, type ComplianceDocumentRecord } from "@/lib/compliance-store";
import { isAdminAuthorized, isSameOriginRequest } from "@/lib/ticket-server";

export const runtime = "nodejs";

const maxFileSize = 4 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const formString = (form: FormData, name: string) => typeof form.get(name) === "string" ? String(form.get(name)) : "";

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) return NextResponse.json({ error: "未授权。" }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN || !isComplianceAccessConfigured()) {
    return NextResponse.json({ error: "合规资料存储尚未配置。" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "上传内容无法读取。" }, { status: 400 });
  }

  const product = getComplianceProduct(formString(form, "productKey"));
  const documentType = getComplianceDocumentType(formString(form, "documentType"));
  const batchCode = normalizeBatchCode(formString(form, "batchCode"));
  const title = formString(form, "title").trim().slice(0, 120);
  const file = form.get("file");
  if (!product) return NextResponse.json({ error: "请选择正确的商品与规格。" }, { status: 400 });
  if (!documentType) return NextResponse.json({ error: "请选择文件类型。" }, { status: 400 });
  if (batchCode.length < 5) return NextResponse.json({ error: "请填写完整的 Batch / Lot 批次代码。" }, { status: 400 });
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "请选择要回传的文件。" }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "文件只支持 PDF、JPG、PNG 或 WebP。" }, { status: 400 });
  if (file.size > maxFileSize) return NextResponse.json({ error: "单个文件不能超过 4 MB。" }, { status: 400 });

  let watermarked;
  try {
    watermarked = await applyComplianceWatermark(file);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "文件水印处理失败。" }, { status: 400 });
  }

  const id = `SPNC-COMP-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const batchHash = complianceBatchHash(product.key, batchCode);
  const pathname = `compliance/files/${product.productId}/${product.variantId}/${documentType.value}/${batchHash.slice(0, 16)}/${id}.${watermarked.extension}`;
  let uploaded = false;
  try {
    await put(pathname, Buffer.from(watermarked.bytes), {
      access: "private",
      contentType: watermarked.contentType,
      cacheControlMaxAge: 60,
    });
    uploaded = true;
    const record: ComplianceDocumentRecord = {
      id,
      productKey: product.key,
      productName: product.productName,
      variantLabel: product.variantLabel,
      documentType: documentType.value,
      title: title || `${product.productName} · ${documentType.label}`,
      batchHash,
      batchMask: maskBatchCode(batchCode),
      pathname,
      originalName: file.name.replace(/[\\/]/g, "-").slice(0, 120),
      contentType: watermarked.contentType,
      size: watermarked.bytes.byteLength,
      watermarkText: complianceWatermarkText,
      uploadedAt: new Date().toISOString(),
    };
    await saveComplianceDocument(record);
    return NextResponse.json({ id, title: record.title, batchMask: record.batchMask }, { status: 201 });
  } catch {
    if (uploaded) await del(pathname).catch(() => undefined);
    return NextResponse.json({ error: "文件暂时无法保存，请稍后重试。" }, { status: 500 });
  }
}
