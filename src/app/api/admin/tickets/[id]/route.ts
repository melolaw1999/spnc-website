import { NextResponse } from "next/server";
import { isAdminAuthorized, isSameOriginRequest } from "@/lib/ticket-server";
import { getTicket, saveTicket, writeAuditEvent } from "@/lib/ticket-store";
import { isTicketStatus } from "@/lib/tickets";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(request)) return NextResponse.json({ error: "未授权。" }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  const { id } = await params;
  if (!/^SPNC-\d{8}-[A-Z0-9]{6}$/.test(id)) return NextResponse.json({ error: "工单编号无效。" }, { status: 400 });

  const payload = await request.json().catch(() => null) as { status?: string; note?: string } | null;
  const status = payload?.status?.trim() ?? "";
  const note = payload?.note?.trim().slice(0, 500) ?? "";
  if (!isTicketStatus(status)) return NextResponse.json({ error: "状态无效。" }, { status: 400 });

  const ticket = await getTicket(id);
  if (!ticket) return NextResponse.json({ error: "未找到工单。" }, { status: 404 });
  const previousStatus = ticket.status;
  const actor = process.env.ADMIN_USERNAME ?? "admin";
  const now = new Date().toISOString();
  ticket.status = status;
  ticket.updatedAt = now;
  if (note) ticket.internalNotes.push({ at: now, actor, note });
  await saveTicket(ticket);
  await writeAuditEvent({ ticketId: id, at: now, actor, action: previousStatus === status && note ? "note-added" : "status-changed", fromStatus: previousStatus, toStatus: status });
  return NextResponse.json({ ok: true, status });
}
