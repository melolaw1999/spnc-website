export const enterpriseContacts = [
  {
    role: "品牌合作 / 通用联系",
    email: "contact@spnc.cn",
    note: "适用于官网咨询、品牌合作、渠道资料与一般商务沟通。",
  },
  {
    role: "售后客服 / 消费者咨询",
    email: "service@spnc.cn",
    note: "适用于订单售后、商品核验、破损反馈与消费者咨询。",
  },
  {
    role: "商务合作 / 负责人联系",
    email: "melolaw@spnc.cn",
    note: "适用于需要负责人直联的长期合作与重要事项沟通。",
  },
  {
    role: "财务对账 / 付款沟通",
    email: "finance@spnc.cn",
    note: "适用于已确认合作后的对账、发票与付款沟通。",
  },
] as const;

export const publicContactEmail = "contact@spnc.cn";
export const serviceEmail = "service@spnc.cn";

export const mailto = (email: string) => `mailto:${email}`;
