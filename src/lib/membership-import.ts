import * as XLSX from "xlsx";
import {
  calculateMembershipRebate,
  formatFen,
  maskOrderNumber,
  matchEligibleProduct,
  parseMoneyToFen,
} from "@/lib/membership";

const requiredHeaders = [
  "子订单编号",
  "主订单编号",
  "商品标题",
  "商品属性",
  "购买数量",
  "买家实付金额",
  "退款状态",
  "退款金额",
  "订单状态",
  "订单付款时间",
  "确认收货时间",
] as const;

const activeRefundStatuses = new Set([
  "买家已经申请退款，等待卖家同意",
  "卖家已经同意退款，等待买家退货",
  "买家已经退货，等待卖家确认收货",
]);

type SalesDetailRow = Record<string, unknown>;

export type MembershipImportPreview = {
  fileName: string;
  sheetName: string;
  totalRows: number;
  mainOrderCount: number;
  eligibleRows: number;
  orderEligibleRows: number;
  heldRows: number;
  refundedRows: number;
  unmatchedRows: number;
  totalPaidFen: number;
  totalUntaxedFen: number;
  totalRebateFen: number;
  totals: { paid: string; untaxed: string; rebate: string };
  statusCounts: Record<string, number>;
  previewLines: Array<{
    orderNumber: string;
    product: string;
    status: string;
    paid: string;
    untaxed: string;
    rebate: string;
  }>;
};

const text = (value: unknown) => value === null || value === undefined ? "" : String(value).trim();

export function parseMembershipSalesDetail(buffer: ArrayBuffer | Uint8Array, fileName = "宝贝销售明细报表.xlsx"): MembershipImportPreview {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("工作簿中没有可读取的工作表。");
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<SalesDetailRow>(sheet, { defval: "", raw: false });
  if (rows.length > 100_000) throw new Error("单次最多导入 100,000 条商品明细。");

  const headers = new Set(Object.keys(rows[0] ?? {}));
  const missingHeaders = requiredHeaders.filter((header) => !headers.has(header));
  if (missingHeaders.length) throw new Error(`这不是宝贝销售明细报表，缺少字段：${missingHeaders.join("、")}`);

  const mainOrders = new Set<string>();
  const statusCounts: Record<string, number> = {};
  const previewLines: MembershipImportPreview["previewLines"] = [];
  let eligibleRows = 0;
  let orderEligibleRows = 0;
  let heldRows = 0;
  let refundedRows = 0;
  let unmatchedRows = 0;
  let totalPaidFen = 0;
  let totalUntaxedFen = 0;
  let totalRebateFen = 0;

  for (const row of rows) {
    const mainOrderNumber = text(row["主订单编号"]);
    const childOrderNumber = text(row["子订单编号"]);
    if (mainOrderNumber) mainOrders.add(mainOrderNumber);

    const orderStatus = text(row["订单状态"]) || "未知状态";
    const refundStatus = text(row["退款状态"]) || "未知退款状态";
    statusCounts[orderStatus] = (statusCounts[orderStatus] ?? 0) + 1;

    const rule = matchEligibleProduct(text(row["商品属性"]));
    if (!rule) {
      unmatchedRows += 1;
      continue;
    }
    eligibleRows += 1;

    const paidFen = parseMoneyToFen(row["买家实付金额"]);
    const refundFen = refundStatus === "退款关闭" ? 0 : parseMoneyToFen(row["退款金额"]);
    const calculation = calculateMembershipRebate({ paidFen, refundFen, taxCategory: rule.taxCategory });
    const refundPending = activeRefundStatuses.has(refundStatus);
    const confirmed = Boolean(text(row["确认收货时间"]));
    const settlementReady = orderStatus === "交易成功" && confirmed && !refundPending && calculation.eligiblePaidFen > 0;

    if (refundPending) heldRows += 1;
    if (refundFen > 0) refundedRows += 1;
    if (!settlementReady) continue;

    orderEligibleRows += 1;
    totalPaidFen += calculation.eligiblePaidFen;
    totalUntaxedFen += calculation.untaxedFen;
    totalRebateFen += calculation.rebateFen;

    if (previewLines.length < 8) {
      previewLines.push({
        orderNumber: maskOrderNumber(mainOrderNumber || childOrderNumber),
        product: rule.shortName,
        status: "待会员申请匹配",
        paid: formatFen(calculation.eligiblePaidFen),
        untaxed: formatFen(calculation.untaxedFen),
        rebate: formatFen(calculation.rebateFen),
      });
    }
  }

  return {
    fileName,
    sheetName,
    totalRows: rows.length,
    mainOrderCount: mainOrders.size,
    eligibleRows,
    orderEligibleRows,
    heldRows,
    refundedRows,
    unmatchedRows,
    totalPaidFen,
    totalUntaxedFen,
    totalRebateFen,
    totals: {
      paid: formatFen(totalPaidFen),
      untaxed: formatFen(totalUntaxedFen),
      rebate: formatFen(totalRebateFen),
    },
    statusCounts,
    previewLines,
  };
}
