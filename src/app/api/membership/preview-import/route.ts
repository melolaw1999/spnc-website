import { NextResponse } from "next/server";
import { parseMembershipSalesDetail } from "@/lib/membership-import";

export const runtime = "nodejs";

const maxFileSize = 30 * 1024 * 1024;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "无法读取上传文件。" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "请选择宝贝销售明细报表。" }, { status: 400 });
  if (!file.name.toLowerCase().endsWith(".xlsx")) return NextResponse.json({ error: "只支持淘宝导出的 .xlsx 文件。" }, { status: 400 });
  if (file.size <= 0 || file.size > maxFileSize) return NextResponse.json({ error: "文件大小需在 30 MB 以内。" }, { status: 400 });

  try {
    const preview = parseMembershipSalesDetail(await file.arrayBuffer(), file.name);
    return NextResponse.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "表格解析失败。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
