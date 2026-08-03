import { NextResponse } from "next/server";
import { complianceBatchHash, createComplianceAccessToken, isComplianceAccessConfigured, validateComplianceLookup } from "@/lib/compliance";
import { isComplianceStorageConfigured, listComplianceDocuments } from "@/lib/compliance-store";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

const formString = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

export async function POST(request: Request) {
  if (!isComplianceStorageConfigured() || !isComplianceAccessConfigured() || !process.env.TURNSTILE_SECRET_KEY) {
    return NextResponse.json({ error: "合规资料服务正在完成安全配置，请稍后再试。" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "提交内容无法读取，请刷新后重试。" }, { status: 400 });
  }
  if (formString(form, "website")) return NextResponse.json({ error: "提交未通过安全检查。" }, { status: 400 });

  const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (!await verifyTurnstileToken(formString(form, "cf-turnstile-response"), remoteIp)) {
    return NextResponse.json({ error: "安全验证已失效，请刷新页面后重试。" }, { status: 400 });
  }

  const validation = validateComplianceLookup({
    productKey: formString(form, "productKey"),
    documentType: formString(form, "documentType"),
    batchCode: formString(form, "batchCode"),
  });
  if (!validation.data) return NextResponse.json({ error: validation.errors[0] }, { status: 400 });

  const batchHash = complianceBatchHash(validation.data.product.key, validation.data.batchCode);
  const documents = (await listComplianceDocuments()).filter((record) =>
    record.productKey === validation.data?.product.key
    && record.documentType === validation.data?.documentType
    && record.batchHash === batchHash,
  );

  if (!documents.length) {
    return NextResponse.json({
      error: "暂未找到与该商品、文件类型和 Batch 完全匹配的资料。请核对桶底喷码，或在下方提交申请。",
      matched: false,
    }, { status: 404 });
  }

  const expiresAt = Date.now() + 10 * 60 * 1000;
  return NextResponse.json({
    matched: true,
    expiresAt,
    documents: documents.map((document) => ({
      id: document.id,
      title: document.title,
      contentType: document.contentType,
      uploadedAt: document.uploadedAt,
      url: `/api/compliance/files/${encodeURIComponent(document.id)}?token=${encodeURIComponent(createComplianceAccessToken({ documentId: document.id, batchHash, expiresAt }))}`,
    })),
  }, { headers: { "cache-control": "private, no-store" } });
}
