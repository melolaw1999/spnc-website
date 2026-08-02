export type MembershipTaxCategory = "cross-border" | "domestic-general-trade";

export type EligibleProductRule = {
  id: string;
  name: string;
  shortName: string;
  attributeMatchers: readonly string[];
  taxCategory: MembershipTaxCategory;
  taxRateLabel: string;
};

export type RebateCalculation = {
  eligiblePaidFen: number;
  untaxedFen: number;
  rebateFen: number;
};

export type MembershipClaimStatus =
  | "submitted"
  | "waiting-match"
  | "verified"
  | "settlement-ready"
  | "paid"
  | "rejected";

export const membershipPriceYuan = 299;
export const membershipDurationDays = 365;
export const membershipRebateRate = 0.02;

export const eligibleProductRules: readonly EligibleProductRule[] = [
  {
    id: "gold-standard-whey-2lb-cross-border",
    name: "ON 金标乳清蛋白粉 2 磅（跨境）",
    shortName: "金标乳清 2 磅",
    attributeMatchers: ["金标2磅"],
    taxCategory: "cross-border",
    taxRateLabel: "跨境电商零售进口综合税 9.1%",
  },
  {
    id: "gold-standard-whey-5lb-cross-border",
    name: "ON 金标乳清蛋白粉 5 磅（跨境）",
    shortName: "金标乳清 5 磅",
    attributeMatchers: ["金标乳清5磅"],
    taxCategory: "cross-border",
    taxRateLabel: "跨境电商零售进口综合税 9.1%",
  },
] as const;

export const claimStatusLabel: Record<MembershipClaimStatus, string> = {
  submitted: "已提交",
  "waiting-match": "待订单匹配",
  verified: "已核验",
  "settlement-ready": "待结算",
  paid: "已打款",
  rejected: "未通过",
};

export function matchEligibleProduct(attribute: string) {
  const normalized = attribute.replaceAll(" ", "").toLowerCase();
  return eligibleProductRules.find((rule) =>
    rule.attributeMatchers.some((matcher) => normalized.includes(matcher.replaceAll(" ", "").toLowerCase())),
  ) ?? null;
}

export function parseMoneyToFen(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value * 100);
  if (typeof value !== "string") return 0;
  const normalized = value.replaceAll(",", "").replace(/[￥¥元\s]/g, "").trim();
  if (!normalized || normalized === "无退款申请") return 0;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function calculateMembershipRebate({
  paidFen,
  refundFen = 0,
  taxCategory,
}: {
  paidFen: number;
  refundFen?: number;
  taxCategory: MembershipTaxCategory;
}): RebateCalculation {
  const eligiblePaidFen = Math.max(0, Math.round(paidFen) - Math.max(0, Math.round(refundFen)));
  const divisor = taxCategory === "cross-border" ? 1.091 : 1.13;
  const untaxedFen = Math.round(eligiblePaidFen / divisor);
  const rebateFen = Math.round(untaxedFen * membershipRebateRate);
  return { eligiblePaidFen, untaxedFen, rebateFen };
}

export function formatFen(fen: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(fen / 100);
}

export function membershipExpiryDate(activatedAt: Date, currentExpiry?: Date | null) {
  const base = currentExpiry && currentExpiry.getTime() > activatedAt.getTime() ? currentExpiry : activatedAt;
  return new Date(base.getTime() + membershipDurationDays * 24 * 60 * 60 * 1000);
}

export function isTaobaoOrderNumber(value: string) {
  return /^\d{16,32}$/.test(value.trim());
}

export function isMembershipKey(value: string) {
  return /^[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/i.test(value.trim());
}

export function maskOrderNumber(value: string) {
  const normalized = value.trim();
  if (normalized.length < 10) return normalized;
  return `${normalized.slice(0, 5)}••••••${normalized.slice(-5)}`;
}

export function maskAlipayAccount(value: string) {
  const normalized = value.trim();
  if (normalized.includes("@")) {
    const [name, domain] = normalized.split("@");
    return `${name.slice(0, 2)}•••@${domain}`;
  }
  if (normalized.length >= 7) return `${normalized.slice(0, 3)}••••${normalized.slice(-4)}`;
  return "••••••";
}

