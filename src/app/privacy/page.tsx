import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("隐私说明", "理想营养官网的隐私、淘宝店跳转与订单信息处理说明。", "/privacy");

export default function Privacy() {
  return <main className="section"><article className="container narrow prose"><div className="eyebrow">Privacy</div><h1 className="page-title">隐私说明</h1><p>官网用于展示店铺品牌、商品、版本与售后信息，不提供站内注册、购物车或支付，也不采集支付信息。</p><h2>淘宝店购买</h2><p>点击购买按钮会离开官网并进入淘宝店。淘宝页面上的账户、订单、付款、退款和隐私处理适用淘宝平台及店铺相应规则。</p><h2>敏感信息</h2><p>理想营养不会通过官网索取淘宝密码、支付密码、短信验证码或银行卡信息。请不要脱离淘宝订单发送上述信息或进行私下转账。</p><h2>网站运行信息</h2><p>网站托管与安全服务可能为正常运行、故障排查和安全防护处理必要的访问日志，具体范围以实际服务配置为准。</p><h2>订单问题</h2><p>与具体订单相关的问题，请从原淘宝订单联系售后，以便核对交易并保留完整处理记录。</p></article></main>;
}
