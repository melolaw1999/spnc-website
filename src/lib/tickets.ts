import { catalog } from "@/data/catalog";

export const ticketKindOptions = [
  { value: "package-damage", label: "瘪桶 / 包装变形" },
  { value: "leak-or-breakage", label: "漏粉 / 破损" },
  { value: "wrong-or-missing", label: "错发 / 少发" },
  { value: "version-or-authenticity", label: "版本 / 防伪疑问" },
  { value: "activity-benefit", label: "活动权益登记" },
  { value: "other", label: "其他订单问题" },
] as const;

export const contactMethodOptions = [
  { value: "mobile", label: "手机号" },
  { value: "wechat", label: "微信号" },
  { value: "email", label: "邮箱" },
] as const;

export const ticketStatusOptions = [
  { value: "submitted", label: "已提交" },
  { value: "reviewing", label: "待核验" },
  { value: "needs-information", label: "待补充资料" },
  { value: "confirmed", label: "已确认" },
  { value: "resolved", label: "已处理" },
  { value: "closed", label: "已关闭" },
] as const;

export const complianceTicketKind = "compliance-document" as const;

export type TicketKind = typeof ticketKindOptions[number]["value"] | typeof complianceTicketKind;
export type ContactMethod = typeof contactMethodOptions[number]["value"];
export type TicketStatus = typeof ticketStatusOptions[number]["value"];

export type TicketInput = {
  kind: string;
  orderNumber: string;
  orderDate: string;
  productName: string;
  variant: string;
  campaignCode: string;
  batchCode: string;
  documentTypes: string;
  description: string;
  contactMethod: string;
  contactValue: string;
  consent: boolean;
};

export type ValidatedTicketInput = Omit<TicketInput, "kind" | "contactMethod"> & {
  kind: TicketKind;
  contactMethod: ContactMethod;
};

const ticketKinds = new Set<string>([...ticketKindOptions.map((option) => option.value), complianceTicketKind]);
const contactMethods = new Set(contactMethodOptions.map((option) => option.value));
const catalogProductNames = new Set(catalog.map((product) => product.name));

const clean = (value: string, maxLength: number) => value.trim().replace(/\s+/g, " ").slice(0, maxLength);

export function validateTicketInput(input: TicketInput): { data?: ValidatedTicketInput; errors: string[] } {
  const data = {
    kind: clean(input.kind, 40),
    orderNumber: clean(input.orderNumber, 48),
    orderDate: clean(input.orderDate, 10),
    productName: clean(input.productName, 120),
    variant: clean(input.variant, 120),
    campaignCode: clean(input.campaignCode, 80),
    batchCode: clean(input.batchCode, 48).toUpperCase(),
    documentTypes: clean(input.documentTypes, 160),
    description: input.description.trim().slice(0, 1200),
    contactMethod: clean(input.contactMethod, 20),
    contactValue: clean(input.contactValue, 120),
    consent: input.consent,
  };
  const errors: string[] = [];

  if (!ticketKinds.has(data.kind as TicketKind)) errors.push("请选择正确的问题类型。");
  if (!/^[A-Za-z0-9-]{8,48}$/.test(data.orderNumber)) errors.push("请填写 8 至 48 位淘宝订单号，只使用数字、字母或连字符。");
  const orderDateTimestamp = Date.parse(`${data.orderDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.orderDate) || Number.isNaN(orderDateTimestamp) || new Date(orderDateTimestamp).toISOString().slice(0, 10) !== data.orderDate) errors.push("请选择有效的购买日期。");
  else if (orderDateTimestamp > Date.now() + 86_400_000) errors.push("购买日期不能晚于今天。");
  if (!catalogProductNames.has(data.productName)) errors.push("请选择官网收录的 ON 商品。");
  if (data.description.length < 10) errors.push("请用至少 10 个字描述问题。");
  if (!contactMethods.has(data.contactMethod as ContactMethod)) errors.push("请选择一种联系方式。");
  if (data.contactValue.length < 3) errors.push("请填写可用于本次工单联系的信息。");
  if (data.contactMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactValue)) errors.push("请填写有效邮箱。");
  if (data.kind === "activity-benefit" && data.campaignCode.length < 2) errors.push("活动权益登记需要填写活动名称或活动代码。");
  if (data.kind === complianceTicketKind) {
    if (!/^[A-Z0-9._/ -]{5,48}$/.test(data.batchCode)) errors.push("请填写完整的桶底 Batch / Lot 批次代码。");
    if (!data.documentTypes) errors.push("请至少选择一种需要申请的合规文件。");
  }
  if (!data.consent) errors.push("提交前请确认隐私与处理说明。");

  if (errors.length) return { errors };
  return { data: data as ValidatedTicketInput, errors };
}

export const ticketKindLabel = (kind: TicketKind) => kind === complianceTicketKind
  ? "合规文件 / 批次资料申请"
  : ticketKindOptions.find((option) => option.value === kind)?.label ?? kind;
export const ticketStatusLabel = (status: TicketStatus) => ticketStatusOptions.find((option) => option.value === status)?.label ?? status;

export const maskOrderNumber = (value: string) => value.length < 10 ? "********" : `${value.slice(0, 4)}••••${value.slice(-4)}`;

export const maskContact = (value: string, method: ContactMethod) => {
  if (method === "email") {
    const [name, domain] = value.split("@");
    if (!domain) return "***";
    return `${name.slice(0, 2)}***@${domain}`;
  }
  if (value.length <= 5) return `${value.slice(0, 1)}***`;
  return `${value.slice(0, 3)}••••${value.slice(-2)}`;
};

export const isTicketStatus = (value: string): value is TicketStatus => ticketStatusOptions.some((option) => option.value === value);
