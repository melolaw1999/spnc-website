import { createHmac, timingSafeEqual } from "node:crypto";
import {
  complianceDocumentTypes,
  getComplianceDocumentType,
  getComplianceProduct,
  type ComplianceDocumentType,
} from "@/data/compliance";

export const complianceWatermarkText = "禁止二次传播 · 仅供个人备份参考";

export const normalizeBatchCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 48);

export const maskBatchCode = (value: string) => {
  const normalized = normalizeBatchCode(value);
  if (normalized.length <= 6) return `${normalized.slice(0, 2)}••${normalized.slice(-2)}`;
  return `${normalized.slice(0, 3)}••••${normalized.slice(-3)}`;
};

export function validateComplianceLookup(input: {
  productKey: string;
  documentType: string;
  batchCode: string;
}) {
  const product = getComplianceProduct(input.productKey);
  const documentType = getComplianceDocumentType(input.documentType);
  const batchCode = normalizeBatchCode(input.batchCode);
  const errors: string[] = [];

  if (!product) errors.push("请选择正确的商品与规格。");
  if (!documentType) errors.push("请选择需要调取的文件类型。");
  if (batchCode.length < 5) errors.push("请按桶底喷码原样填写完整 Batch / Lot 批次代码。");

  if (errors.length || !product || !documentType) return { errors };
  return {
    errors,
    data: {
      product,
      documentType: documentType.value as ComplianceDocumentType,
      batchCode,
    },
  };
}

export const complianceDocumentTypeLabel = (value: ComplianceDocumentType) =>
  complianceDocumentTypes.find((option) => option.value === value)?.label ?? value;

const complianceSecret = () => process.env.COMPLIANCE_ACCESS_SECRET || process.env.TICKET_HASH_SALT || "";

export const isComplianceAccessConfigured = () => Boolean(complianceSecret());

export const complianceBatchHash = (productKey: string, batchCode: string) => {
  const secret = complianceSecret();
  if (!secret) throw new Error("COMPLIANCE_ACCESS_SECRET is not configured");
  return createHmac("sha256", secret)
    .update(`compliance-batch:${productKey}:${normalizeBatchCode(batchCode)}`)
    .digest("hex");
};

type DocumentAccessPayload = {
  documentId: string;
  batchHash: string;
  expiresAt: number;
};

const sign = (payload: string) => createHmac("sha256", complianceSecret()).update(payload).digest("base64url");

export function createComplianceAccessToken(payload: DocumentAccessPayload) {
  if (!complianceSecret()) throw new Error("COMPLIANCE_ACCESS_SECRET is not configured");
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyComplianceAccessToken(token: string): DocumentAccessPayload | null {
  if (!complianceSecret()) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const value = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<DocumentAccessPayload>;
    if (typeof value.documentId !== "string" || typeof value.batchHash !== "string" || typeof value.expiresAt !== "number") return null;
    if (value.expiresAt < Date.now()) return null;
    return value as DocumentAccessPayload;
  } catch {
    return null;
  }
}
