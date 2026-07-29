import { mailto, serviceEmail } from "@/data/contacts";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("隐私说明", "SPNC 理想营养官网、淘宝店跳转与售后工单信息处理说明。", "/privacy");

export default function Privacy() {
  return <main className="section"><article className="container narrow prose"><div className="eyebrow">Privacy</div><h1 className="page-title">隐私说明</h1><p>官网用于展示 SPNC 理想营养、ON 商品、版本与售后信息，不提供站内购物车或支付，也不采集支付凭证或账户密码。</p><h2>淘宝店购买</h2><p>点击购买按钮会离开官网并进入淘宝店。淘宝页面上的账户、订单、付款、退款和隐私处理适用淘宝平台及店铺相应规则。</p><h2>售后工单收集的信息</h2><p>买家主动提交工单时，官网会处理为核验订单和联系买家所必需的信息，包括问题类型、淘宝订单号、购买日期、商品与规格、问题描述、买家选择的一种联系方式，以及买家主动上传的证据图片。</p><p>上述信息仅用于本次售后、商品核验或活动权益登记，不用于与本次工单无关的营销。证据图片存放在非公开存储中，只有经授权的工作人员能够查看。</p><h2>活动权益</h2><p>活动权益只按公开活动条件与订单信息核验，不以好评、五星、追评、修改评价或删除评价为条件。实际退款、退货和交易调整仍通过原淘宝订单完成。</p><h2>请勿提交的信息</h2><p>请勿提交淘宝密码、支付密码、短信验证码、身份证、银行卡、完整收货地址或其他与工单无关的信息。上传面单图片前建议遮挡姓名、手机号和详细地址。</p><h2>保存与删除</h2><p>工单信息仅在处理售后、争议核验和防止重复领取所需的期限内保存；超出必要期限后将删除证据图片或对记录进行必要的去标识化处理。如需查询、更正或申请删除，可联系 <a className="text-link inline-link" href={mailto(serviceEmail)}>{serviceEmail}</a>。</p><h2>网站运行信息</h2><p>网站托管与安全服务可能为正常运行、故障排查和防止恶意提交处理必要的访问日志与安全验证信息，具体范围以实际服务配置为准。</p></article></main>;
}
