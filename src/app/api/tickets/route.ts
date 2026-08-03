import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { notifyTicketCreated } from "@/lib/ticket-notification";
import { anonymousRequestHash, createTicketId, markerHash } from "@/lib/ticket-server";
import {
  removePrivateBlobs,
  reservePrivateMarker,
  saveTicket,
  writeAuditEvent,
  type TicketEvidence,
  type TicketRecord,
} from "@/lib/ticket-store";
import { validateTicketInput } from "@/lib/tickets";

export const runtime = "nodejs";

const maxEvidenceFiles = 3;
const maxEvidenceSize = 1_050_000;
const allowedEvidenceTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const formString = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

async function verifyTurnstile(token: string, remoteIp: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
    cache: "no-store",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.TICKET_HASH_SALT || !process.env.TURNSTILE_SECRET_KEY) {
    return NextResponse.json({ error: "工单服务正在完成安全配置，请暂时通过淘宝订单联系售后。" }, { status: 503 });
  }

  const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "提交内容无法读取，请刷新后重试。" }, { status: 400 });
  }

  if (formString(form, "website")) return NextResponse.json({ error: "提交未通过安全检查。" }, { status: 400 });
  const turnstileValid = await verifyTurnstile(formString(form, "cf-turnstile-response"), remoteIp);
  if (!turnstileValid) return NextResponse.json({ error: "安全验证已失效，请刷新页面后重试。" }, { status: 400 });

  const validation = validateTicketInput({
    kind: formString(form, "kind"),
    orderNumber: formString(form, "orderNumber"),
    orderDate: formString(form, "orderDate"),
    productName: formString(form, "productName"),
    variant: formString(form, "variant"),
    campaignCode: formString(form, "campaignCode"),
    batchCode: formString(form, "batchCode"),
    documentTypes: form.getAll("documentTypes").filter((value): value is string => typeof value === "string").join(","),
    description: formString(form, "description"),
    contactMethod: formString(form, "contactMethod"),
    contactValue: formString(form, "contactValue"),
    consent: formString(form, "consent") === "on",
  });
  if (!validation.data) return NextResponse.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });

  const submissionId = formString(form, "submissionId");
  if (!/^[a-f0-9-]{20,64}$/i.test(submissionId)) return NextResponse.json({ error: "提交标识无效，请刷新页面重试。" }, { status: 400 });

  const evidenceFiles = form.getAll("evidence").filter((value): value is File => value instanceof File && value.size > 0);
  if (evidenceFiles.length > maxEvidenceFiles) return NextResponse.json({ error: `最多上传 ${maxEvidenceFiles} 张图片。` }, { status: 400 });
  for (const file of evidenceFiles) {
    if (!allowedEvidenceTypes.has(file.type)) return NextResponse.json({ error: "证据图片只支持 JPG、PNG 或 WebP。" }, { status: 400 });
    if (file.size > maxEvidenceSize) return NextResponse.json({ error: "单张图片压缩后需小于 1 MB。" }, { status: 400 });
  }

  const ticketId = createTicketId();
  const submissionMarker = `tickets/submissions/${markerHash(`submission:${submissionId}`)}.json`;
  const marker = await reservePrivateMarker(submissionMarker, { ticketId, createdAt: new Date().toISOString() });
  if (!marker.created) {
    const existingTicketId = typeof marker.existing?.ticketId === "string" ? marker.existing.ticketId : ticketId;
    return NextResponse.json({ ticketId: existingTicketId, duplicate: true });
  }

  const cleanupPaths = [submissionMarker];
  const evidence: TicketEvidence[] = [];
  let saved = false;

  try {
    if (validation.data.kind === "activity-benefit") {
      const claimMarker = `tickets/claims/${markerHash(`claim:${validation.data.orderNumber}:${validation.data.campaignCode.toLowerCase()}`)}.json`;
      const claim = await reservePrivateMarker(claimMarker, { ticketId, createdAt: new Date().toISOString() });
      if (!claim.created) {
        await removePrivateBlobs([submissionMarker]);
        return NextResponse.json({ error: "这个订单已经登记过相同活动权益，请勿重复提交。" }, { status: 409 });
      }
      cleanupPaths.push(claimMarker);
    }

    for (const file of evidenceFiles) {
      const pathname = `tickets/evidence/${ticketId}/${crypto.randomUUID()}.${extensionByType[file.type]}`;
      await put(pathname, file, {
        access: "private",
        contentType: file.type,
        cacheControlMaxAge: 60,
      });
      cleanupPaths.push(pathname);
      evidence.push({
        pathname,
        originalName: file.name.replace(/[\\/]/g, "-").slice(0, 100),
        contentType: file.type,
        size: file.size,
      });
    }

    const now = new Date().toISOString();
    const ticket: TicketRecord = {
      id: ticketId,
      kind: validation.data.kind,
      status: "submitted",
      orderNumber: validation.data.orderNumber,
      orderDate: validation.data.orderDate,
      productName: validation.data.productName,
      variant: validation.data.variant,
      campaignCode: validation.data.campaignCode,
      batchCode: validation.data.batchCode,
      documentTypes: validation.data.documentTypes,
      description: validation.data.description,
      contactMethod: validation.data.contactMethod,
      contactValue: validation.data.contactValue,
      evidence,
      internalNotes: [],
      createdAt: now,
      updatedAt: now,
      requestHash: anonymousRequestHash(remoteIp || submissionId),
    };
    await saveTicket(ticket);
    saved = true;
    await writeAuditEvent({ ticketId, at: now, actor: "public-form", action: "created", toStatus: "submitted" }).catch(() => undefined);
    await notifyTicketCreated(ticket).catch(() => undefined);
    return NextResponse.json({ ticketId }, { status: 201 });
  } catch {
    if (!saved) await removePrivateBlobs(cleanupPaths).catch(() => undefined);
    return NextResponse.json({ error: "工单暂时无法保存，请稍后重试或从淘宝订单联系售后。" }, { status: 500 });
  }
}
