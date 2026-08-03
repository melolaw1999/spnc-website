import { NextResponse } from "next/server";
import { verifyComplianceAccessToken } from "@/lib/compliance";
import { getComplianceDocument, readComplianceDocument } from "@/lib/compliance-store";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const access = verifyComplianceAccessToken(token);
  if (!access || access.documentId !== id) return NextResponse.json({ error: "访问凭证已失效，请重新验证 Batch。" }, { status: 401 });

  const document = await getComplianceDocument(id);
  if (!document || document.batchHash !== access.batchHash) return NextResponse.json({ error: "文件不存在。" }, { status: 404 });
  const blob = await readComplianceDocument(document.pathname);
  if (!blob) return NextResponse.json({ error: "文件不存在。" }, { status: 404 });

  const extension = document.contentType === "application/pdf" ? "pdf" : document.contentType.split("/")[1] || "file";
  const filename = `${document.title}.${extension}`.replace(/[\\/\r\n]/g, "-");
  return new Response(blob.stream, {
    headers: {
      "content-type": document.contentType,
      "cache-control": "private, no-store, max-age=0",
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, noarchive, nosnippet",
      "referrer-policy": "no-referrer",
    },
  });
}
