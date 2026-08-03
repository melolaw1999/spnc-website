import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  complianceBatchHash,
  createComplianceAccessToken,
  maskBatchCode,
  normalizeBatchCode,
  validateComplianceLookup,
  verifyComplianceAccessToken,
} from "@/lib/compliance";

describe("合规资料批次验证", () => {
  const originalSecret = process.env.COMPLIANCE_ACCESS_SECRET;

  beforeEach(() => {
    process.env.COMPLIANCE_ACCESS_SECRET = "compliance-unit-test-secret";
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.COMPLIANCE_ACCESS_SECRET;
    else process.env.COMPLIANCE_ACCESS_SECRET = originalSecret;
  });

  it("统一清理 Batch 格式并只显示遮挡后的批次", () => {
    expect(normalizeBatchCode(" lot-24 07/a01 ")).toBe("LOT2407A01");
    expect(maskBatchCode("LOT2407A01")).toBe("LOT••••A01");
  });

  it("按商品与 Batch 生成不可逆匹配摘要", () => {
    const first = complianceBatchHash("on-gold-standard-isolate:on-isolate-2-36kg-chocolate", "LOT-2407-A01");
    const same = complianceBatchHash("on-gold-standard-isolate:on-isolate-2-36kg-chocolate", "lot 2407 a01");
    const other = complianceBatchHash("on-gold-standard-isolate:on-isolate-2-36kg-chocolate", "LOT-2407-A02");
    expect(first).toBe(same);
    expect(first).not.toBe(other);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("签发短时文件凭证并拒绝篡改", () => {
    const token = createComplianceAccessToken({ documentId: "DOC-1", batchHash: "hash", expiresAt: Date.now() + 60_000 });
    expect(verifyComplianceAccessToken(token)?.documentId).toBe("DOC-1");
    expect(verifyComplianceAccessToken(`${token}x`)).toBeNull();
  });

  it("只接受收录商品、文件类型和完整 Batch", () => {
    const valid = validateComplianceLookup({
      productKey: "on-gold-standard-isolate:on-isolate-2-36kg-chocolate",
      documentType: "customs-declaration",
      batchCode: "LOT-2407-A01",
    });
    expect(valid.errors).toEqual([]);
    expect(valid.data?.batchCode).toBe("LOT2407A01");

    const invalid = validateComplianceLookup({ productKey: "unknown", documentType: "unknown", batchCode: "12" });
    expect(invalid.errors).toHaveLength(3);
  });
});
