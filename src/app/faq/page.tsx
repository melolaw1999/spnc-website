import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "售后 FAQ", description: "理想营养售后常见问题：订单、版本差异、包装破损、退款和产品核验处理方式。", alternates: { canonical: "/faq" } };

const questions = [
  ["在哪里购买？", "官网暂不提供购物车和支付。所有购买、付款、退款与订单沟通均在理想营养淘宝店完成。"],
  ["收到的包装和网页图片不完全一样怎么办？", "品牌可能更新包装或按市场提供不同版本。请先核对订单、规格、口味、批次和封口；仍有疑问时通过淘宝订单联系售后。"],
  ["包装破损或漏粉如何处理？", "请暂停使用，保留商品、外箱、面单和完整开箱证据，并从对应淘宝订单发起售后沟通。"],
  ["如何核验防伪信息？", "按照品牌官方公开方式核验，并结合购买渠道、订单、包装完整性与批次信息综合判断。不要把单一防伪码当作全部供应链证明。"],
  ["可以在官网申请退款吗？", "暂不可以。退款与售后必须通过原淘宝订单处理，官网不收款也不保存支付信息。"],
  ["产品效果如何保证？", "运动营养产品不能替代均衡饮食和训练，也不作治疗、减脂或增肌结果承诺。请以产品标签和个人实际需要为准。"],
] as const;

export default function Faq() {
  return <main className="section"><div className="container narrow"><div className="eyebrow">After-sales FAQ</div><h1 className="page-title">售后问题，先把路径讲清楚。</h1><div className="faq-list">{questions.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div><div className="actions actions-left"><Link className="btn" href="/contact">联系售后</Link></div></div></main>;
}
