import { describe, expect, it } from "vitest";
import { anonymousRequestHash, createTicketId, isSameOriginRequest } from "@/lib/ticket-server";
import { maskContact, maskOrderNumber, validateTicketInput } from "@/lib/tickets";

const validInput = {
  kind: "package-damage",
  orderNumber: "123456789012345678",
  orderDate: "2026-07-29",
  productName: "金标乳清蛋白粉",
  variant: "5 磅 / 双重巧克力",
  campaignCode: "",
  batchCode: "",
  documentTypes: "",
  description: "收到商品后发现桶身明显变形，希望核验并登记。",
  contactMethod: "mobile",
  contactValue: "13800138000",
  consent: true,
};

describe("售后工单业务规则", () => {
  it("接受完整的普通售后工单", () => {
    const result = validateTicketInput(validInput);
    expect(result.errors).toEqual([]);
    expect(result.data?.kind).toBe("package-damage");
  });

  it("活动权益必须填写活动名称或代码", () => {
    const result = validateTicketInput({ ...validInput, kind: "activity-benefit" });
    expect(result.errors).toContain("活动权益登记需要填写活动名称或活动代码。");
  });

  it("合规资料申请必须填写 Batch 与文件类型", () => {
    const missing = validateTicketInput({ ...validInput, kind: "compliance-document" });
    expect(missing.errors).toContain("请填写完整的桶底 Batch / Lot 批次代码。");
    expect(missing.errors).toContain("请至少选择一种需要申请的合规文件。");

    const valid = validateTicketInput({
      ...validInput,
      kind: "compliance-document",
      batchCode: "L2407A01",
      documentTypes: "customs-declaration,quality-report",
    });
    expect(valid.errors).toEqual([]);
  });

  it("拒绝无效订单号、短描述和未同意隐私说明", () => {
    const result = validateTicketInput({ ...validInput, orderNumber: "123", description: "破损", consent: false });
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("拒绝商品库外的商品和未来购买日期", () => {
    const result = validateTicketInput({ ...validInput, productName: "未收录商品", orderDate: "2099-01-01" });
    expect(result.errors).toContain("请选择官网收录的 ON 商品。");
    expect(result.errors).toContain("购买日期不能晚于今天。");
  });

  it("公开列表遮挡订单号和联系方式", () => {
    expect(maskOrderNumber("123456789012345678")).toBe("1234••••5678");
    expect(maskContact("13800138000", "mobile")).toBe("138••••00");
    expect(maskContact("buyer@spnc.cn", "email")).toBe("bu***@spnc.cn");
  });

  it("工单编号稳定包含日期和六位熵", () => {
    expect(createTicketId(new Date("2026-07-29T00:00:00.000Z"), "A1B2C3")).toBe("SPNC-20260729-A1B2C3");
  });

  it("网络标识使用带密钥摘要且后台更新只接受同源请求", () => {
    const originalSalt = process.env.TICKET_HASH_SALT;
    process.env.TICKET_HASH_SALT = "unit-test-secret";
    expect(anonymousRequestHash("203.0.113.10")).toMatch(/^[a-f0-9]{16}$/);
    if (originalSalt === undefined) delete process.env.TICKET_HASH_SALT;
    else process.env.TICKET_HASH_SALT = originalSalt;

    expect(isSameOriginRequest(new Request("https://www.spnc.cn/api/admin/tickets/1", { headers: { origin: "https://www.spnc.cn" } }))).toBe(true);
    expect(isSameOriginRequest(new Request("https://www.spnc.cn/api/admin/tickets/1", { headers: { origin: "https://malicious.example" } }))).toBe(false);
  });
});
