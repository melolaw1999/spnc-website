import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/ticket-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) return NextResponse.json({ error: "未授权。" }, { status: 401 });
  const pathname = new URL(request.url).searchParams.get("pathname") ?? "";
  if (!pathname.startsWith("tickets/evidence/") || pathname.includes("..")) return NextResponse.json({ error: "文件路径无效。" }, { status: 400 });
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return NextResponse.json({ error: "文件不存在。" }, { status: 404 });
  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
    },
  });
}
