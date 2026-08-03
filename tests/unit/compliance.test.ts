import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  complianceBatchHash,
  createComplianceAccessToken,
  maskBatchCode,
  normalizeBatchCode,
  validateComplianceLookup,
  verifyComplianceAccessToken,
} from "@/lib/compliance";
import { complianceProductOptions } from "@/data/compliance";

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
    const first = complianceBatchHash("sku:748927061260", "LOT-2407-A01");
    const same = complianceBatchHash("sku:748927061260", "lot 2407 a01");
    const other = complianceBatchHash("sku:748927061260", "LOT-2407-A02");
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
      productKey: "sku:748927061260",
      documentType: "customs-declaration",
      batchCode: "LOT-2407-A01",
    });
    expect(valid.errors).toEqual([]);
    expect(valid.data?.batchCode).toBe("LOT2407A01");

    const invalid = validateComplianceLookup({ productKey: "unknown", documentType: "unknown", batchCode: "12" });
    expect(invalid.errors).toHaveLength(3);
  });

  it("商品选择器统一显示编码、商品名、规格和口味", () => {
    expect(complianceProductOptions.length).toBeGreaterThan(40);
    expect(new Set(complianceProductOptions.map((product) => product.skuCode)).size).toBe(complianceProductOptions.length);
    expect(complianceProductOptions.every((product) => product.label === [product.skuCode, product.productName, product.size, product.flavor].join("－"))).toBe(true);
    expect(complianceProductOptions.some((product) => product.label.includes("大金分离"))).toBe(false);
  });

  it("完整收录已确认编码的跨境金标乳清大小规格", () => {
    const crossBorderWhey = complianceProductOptions.filter((product) =>
      product.productId === "on-gold-standard-whey"
      && product.productName.includes("跨境进口"),
    );
    expect(crossBorderWhey.filter((product) => product.size.startsWith("2 磅"))).toHaveLength(7);
    expect(crossBorderWhey.filter((product) => product.size.startsWith("5 磅"))).toHaveLength(11);
    expect(crossBorderWhey.map((product) => product.skuCode)).toContain("748927028669");
    expect(crossBorderWhey.map((product) => product.skuCode)).toContain("748927028614");
  });
});
