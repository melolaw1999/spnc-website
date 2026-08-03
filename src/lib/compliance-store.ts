import { get, list, put } from "@vercel/blob";
import type { ComplianceDocumentType } from "@/data/compliance";
import { readPrivateJson } from "@/lib/ticket-store";

export type ComplianceDocumentRecord = {
  id: string;
  productKey: string;
  productName: string;
  variantLabel: string;
  documentType: ComplianceDocumentType;
  title: string;
  batchHash: string;
  batchMask: string;
  pathname: string;
  originalName: string;
  contentType: string;
  size: number;
  watermarkText: string;
  uploadedAt: string;
};

const indexPath = "compliance/documents/index.json";

export const isComplianceStorageConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function listComplianceDocuments() {
  return await readPrivateJson<ComplianceDocumentRecord[]>(indexPath) ?? [];
}

export async function saveComplianceDocument(record: ComplianceDocumentRecord) {
  const records = await listComplianceDocuments();
  const next = [record, ...records.filter((item) => item.id !== record.id)].slice(0, 500);
  await put(indexPath, JSON.stringify(next), {
    access: "private",
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
    allowOverwrite: true,
  });
}

export const getComplianceDocument = async (id: string) =>
  (await listComplianceDocuments()).find((record) => record.id === id) ?? null;

export async function readComplianceDocument(pathname: string) {
  if (!pathname.startsWith("compliance/files/") || pathname.includes("..")) return null;
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return result;
}

export async function countComplianceRequests() {
  const result = await list({ prefix: "tickets/records/", limit: 250 });
  const records = await Promise.all(result.blobs.map((blob) => readPrivateJson<{ kind?: string }>(blob.pathname)));
  return records.filter((record) => record?.kind === "compliance-document").length;
}
