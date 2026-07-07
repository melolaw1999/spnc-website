import Link from "next/link";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("知识中心", "理想营养知识中心：乳清、分离乳清、水解乳清区别，蛋白粉包装现象、肌酸基础知识与版本选择指南。", "/knowledge");

const articles = [
  {
    title: "乳清 / 分离 / 水解区别",
    text: "三类产品的加工方式、蛋白含量表达和适用场景可能不同。选购时先看配料表、营养成分表、规格和实际饮食需求，不用单纯按名称判断高低。",
  },
  {
    title: "为什么会有白色颗粒",
    text: "粉体中出现颗粒或颜色差异，可能与配方、原料批次、香精甜味剂、受潮程度和储存条件有关。若伴随异味、结块严重或封口异常，应停止使用并联系售后核验。",
  },
  {
    title: "蛋白粉桶软说明",
    text: "不同批次桶体、运输温差和仓储环境会影响外包装触感。判断时应结合封膜、内盖、批号、标签、气味与订单渠道，不把桶身软硬作为唯一依据。",
  },
  {
    title: "肌酸基础知识",
    text: "肌酸属于常见运动营养补充品。购买时重点核对产品名称、净含量、配料表、建议用量和适用提示，实际使用应遵循包装标签并结合个人情况。",
  },
  {
    title: "版本选择指南",
    text: "国产、跨境、一般贸易、海外渠道或 Sam’s 版本可能在标签语言、法规标识、规格表达和防伪方式上不同。建议按订单页面、实物标签和溯源信息一起核对。",
  },
] as const;

export default function Knowledge() {
  return <main>
    <section className="hero compact-hero"><div className="container"><div className="eyebrow">Knowledge Center</div><h1>知识中心</h1><p className="lead">用简单、可核对的方式解释运动营养商品选择、包装现象和版本差异。</p></div></section>
    <section className="section"><div className="container"><div className="knowledge-grid">{articles.map((article) => <article className="card knowledge-card" key={article.title}><h2>{article.title}</h2><p className="muted">{article.text}</p></article>)}</div><div className="notice knowledge-notice">以上内容用于基础认知和选购核对，不构成医疗建议，也不替代产品实物标签、品牌公开说明或专业人士建议。</div><div className="actions"><Link className="btn" href="/versions">查看版本说明</Link><Link className="btn secondary" href="/authenticity">查看防伪溯源</Link></div></div></section>
  </main>;
}
