import type { Metadata } from "next";

export const metadata: Metadata = { title: "隐私说明", description: "理想营养官网的隐私与外部购买说明。", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return <main className="section"><article className="container narrow prose"><div className="eyebrow">Privacy</div><h1 className="page-title">隐私说明</h1><p>公开官网用于展示品牌、产品、版本与售后信息，不提供站内注册、购物车或支付，也不采集支付信息。</p><h2>外部购买</h2><p>点击购买按钮会离开官网并进入淘宝店。淘宝页面上的账户、订单、付款、退款和隐私处理适用淘宝平台及店铺相应规则。</p><h2>最少收集</h2><p>官网不要求提供淘宝密码、支付密码、短信验证码或银行卡信息。请不要通过非官方渠道发送上述敏感信息。</p><h2>技术日志</h2><p>托管和安全服务可能为网站运行、故障排查与安全防护处理必要的访问日志。正式上线时应根据实际使用的托管、统计和客服服务补充完整隐私政策与数据保留规则。</p><h2>联系我们</h2><p>与具体订单相关的问题，请从对应淘宝订单联系售后，以便保留完整交易记录。</p></article></main>;
}
