import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import {
  calculateMembershipRebate,
  isMembershipKey,
  isTaobaoOrderNumber,
  matchEligibleProduct,
  membershipExpiryDate,
} from "@/lib/membership";
import { parseMembershipSalesDetail } from "@/lib/membership-import";

describe("membership rebate rules", () => {
  it("removes 9.1% from cross-border paid amount before applying 2%", () => {
    expect(calculateMembershipRebate({ paidFen: 72_800, taxCategory: "cross-border" })).toEqual({
      eligiblePaidFen: 72_800,
      untaxedFen: 66_728,
      rebateFen: 1_335,
    });
  });

  it("removes 13% from domestic/general-trade amount and accounts for refunds", () => {
    expect(calculateMembershipRebate({ paidFen: 22_600, refundFen: 11_300, taxCategory: "domestic-general-trade" })).toEqual({
      eligiblePaidFen: 11_300,
      untaxedFen: 10_000,
      rebateFen: 200,
    });
  });

  it("recognizes only configured cross-border attributes", () => {
    expect(matchEligibleProduct("口味:双重巧克力味;颜色分类:金标2磅")?.id).toBe("gold-standard-whey-2lb-cross-border");
    expect(matchEligibleProduct("口味:香草味;颜色分类:金标乳清5磅")?.id).toBe("gold-standard-whey-5lb-cross-border");
    expect(matchEligibleProduct("颜色分类:其他规格")).toBeNull();
  });

  it("validates activation identifiers and extends membership by 365 days", () => {
    expect(isMembershipKey("SPNC-2026-BLCK-0001")).toBe(true);
    expect(isTaobaoOrderNumber("12345678901234567890")).toBe(true);
    expect(membershipExpiryDate(new Date("2026-08-02T00:00:00.000Z")).toISOString()).toBe("2027-08-02T00:00:00.000Z");
  });
});

describe("Taobao sales-detail import", () => {
  it("matches eligible rows and excludes active refunds and unmatched products", () => {
    const rows = [
      {
        子订单编号: "10000000000000000001",
        主订单编号: "20000000000000000001",
        商品标题: "ON 金标乳清",
        商品属性: "口味:双重巧克力味;颜色分类:金标乳清5磅",
        购买数量: "1",
        买家实付金额: "728.00",
        退款状态: "没有申请退款",
        退款金额: "无退款申请",
        订单状态: "交易成功",
        订单付款时间: "2026-07-01 10:00:00",
        确认收货时间: "2026-07-05 10:00:00",
      },
      {
        子订单编号: "10000000000000000002",
        主订单编号: "20000000000000000002",
        商品标题: "ON 金标乳清",
        商品属性: "口味:双重巧克力味;颜色分类:金标2磅",
        购买数量: "1",
        买家实付金额: "308.00",
        退款状态: "买家已经申请退款，等待卖家同意",
        退款金额: "0.00",
        订单状态: "交易成功",
        订单付款时间: "2026-07-02 10:00:00",
        确认收货时间: "2026-07-06 10:00:00",
      },
      {
        子订单编号: "10000000000000000003",
        主订单编号: "20000000000000000003",
        商品标题: "未配置商品",
        商品属性: "颜色分类:其他规格",
        购买数量: "1",
        买家实付金额: "100.00",
        退款状态: "没有申请退款",
        退款金额: "无退款申请",
        订单状态: "交易成功",
        订单付款时间: "2026-07-03 10:00:00",
        确认收货时间: "2026-07-07 10:00:00",
      },
    ];
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "export");
    const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const result = parseMembershipSalesDetail(bytes, "test.xlsx");

    expect(result.totalRows).toBe(3);
    expect(result.eligibleRows).toBe(2);
    expect(result.orderEligibleRows).toBe(1);
    expect(result.heldRows).toBe(1);
    expect(result.unmatchedRows).toBe(1);
    expect(result.totalRebateFen).toBe(1_335);
  });
});
