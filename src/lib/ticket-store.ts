import { del, get, list, put } from "@vercel/blob";
import type { ContactMethod, TicketKind, TicketStatus } from "@/lib/tickets";

export type TicketEvidence = {
  pathname: string;
  originalName: string;
  contentType: string;
  size: number;
};

export type TicketRecord = {
  id: string;
  kind: TicketKind;
  status: TicketStatus;
  orderNumber: string;
  orderDate: string;
  productName: string;
  variant: string;
  campaignCode: string;
  batchCode?: string;
  documentTypes?: string;
  description: string;
  contactMethod: ContactMethod;
  contactValue: string;
  evidence: TicketEvidence[];
  internalNotes: Array<{ at: string; actor: string; note: string }>;
  createdAt: string;
  updatedAt: string;
  requestHash: string;
};

export type TicketAuditEvent = {
  ticketId: string;
  at: string;
  actor: string;
  action: "created" | "status-changed" | "note-added";
  fromStatus?: TicketStatus;
  toStatus?: TicketStatus;
};

const jsonOptions = {
  access: "private" as const,
  contentType: "application/json; charset=utf-8",
  cacheControlMaxAge: 60,
};

export const isTicketStorageConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function readPrivateJson<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return await new Response(result.stream).json() as T;
}

export async function reservePrivateMarker(pathname: string, value: object): Promise<{ created: true } | { created: false; existing: Record<string, unknown> | null }> {
  try {
    await put(pathname, JSON.stringify(value), jsonOptions);
    return { created: true };
  } catch (error) {
    const existing = await readPrivateJson<Record<string, unknown>>(pathname);
    if (existing) return { created: false, existing };
    throw error;
  }
}

export async function saveTicket(ticket: TicketRecord) {
  await put(`tickets/records/${ticket.id}.json`, JSON.stringify(ticket), {
    ...jsonOptions,
    allowOverwrite: true,
  });
}

export const getTicket = (ticketId: string) => readPrivateJson<TicketRecord>(`tickets/records/${ticketId}.json`);

export async function listTickets() {
  const result = await list({ prefix: "tickets/records/", limit: 250 });
  const tickets = await Promise.all(result.blobs.map((blob) => readPrivateJson<TicketRecord>(blob.pathname)));
  return tickets.filter((ticket): ticket is TicketRecord => Boolean(ticket)).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function writeAuditEvent(event: TicketAuditEvent) {
  const stamp = event.at.replaceAll(":", "-");
  await put(`tickets/audit/${event.ticketId}/${stamp}-${crypto.randomUUID()}.json`, JSON.stringify(event), jsonOptions);
}

export const removePrivateBlobs = async (pathnames: string[]) => {
  if (pathnames.length) await del(pathnames);
};
