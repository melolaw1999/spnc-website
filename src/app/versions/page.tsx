import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "版本说明", description: "了解运动营养产品不同进口、跨境与销售版本在包装、标签和订单信息上的基础差异。", alternates: { canonical: "/versions" } };

export default function Versions() {
  return <main className="section"><article className="container narrow prose"><div className="eyebrow">Product Versions</div><h1 className="page-title">版本不同，核验方法不变。</h1><p className="lead detail-lead">同一品牌产品可能因销售地区、法规要求和批次更新出现包装差异。版本说明用于帮助核对，不作为真伪的单一判断依据。</p><h2>一般贸易商品</h2><p>通常按照境内销售要求完成进口与标签等流程。请以实物中文标签、订单信息和可核验资料为准。</p><h2>跨境进口商品</h2><p>通常通过跨境电商渠道交易，包装和标签可能保留境外销售版本特征。具体版本需结合订单渠道和实物批次确认。</p><h2>其他销售版本</h2><p>品牌可能针对不同市场调整包装、标签语言、规格表达或配方信息。不要仅凭包装颜色或单一细节判断真伪。</p><h2>购买前后如何确认</h2><ol><li>购买前核对商品页标注的规格和口味。</li><li>到货后对照淘宝订单、封口、批次与保质期。</li><li>营养成分、过敏原和食用建议以实物标签为准。</li><li>如有不一致，保留完整包装并联系售后。</li></ol><div className="notice">页面不承诺所有批次包装完全一致，也不会通过修改产品图片来掩盖版本差异。</div><p><Link className="text-link" href="/authenticity">继续查看防伪溯源说明 →</Link></p></article></main>;
}
