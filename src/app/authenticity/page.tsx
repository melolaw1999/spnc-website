import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "防伪码与溯源码",
  "看懂 ON 防伪码与跨境进口商品溯源码：标签在哪里、如何扫码刮开验证，以及怎样结合 ON 官网包装说明判断结果。",
  "/authenticity",
);

const resultGuide = [
  {
    index: "01",
    title: "查询成功，先核对页面",
    text: "以扫码后实际页面为准，核对页面显示的商品信息与手中实物是否对应。不要只因为“能打开一个网页”就结束判断。",
  },
  {
    index: "02",
    title: "提示异常，立即保留证据",
    text: "若验证失败、页面异常，或页面信息与实物不一致，请停止破坏其余包装，保存标签、批次、桶底与订单截图。",
  },
  {
    index: "03",
    title: "仍有疑问，回原订单售后",
    text: "从原淘宝订单联系理想营养，提交商品正反面、两种码、批次与效期照片，便于按同一件商品继续核对。",
  },
];

const officialNotes = [
  {
    title: "颈封与金色全息贴正在逐步取消",
    text: "ON 官网说明，出于可持续性考虑，部分产品正逐步移除塑料颈封和金色全息贴。收到有颈封或无颈封的批次，都不能仅凭这一点判断真假。",
  },
  {
    title: "桶底形态会因生产地区不同",
    text: "美国生产桶与英国生产桶的桶底凹痕、模具线可能不同。正常的模具痕不是防伪结论，应回到标签验证和订单信息。",
  },
  {
    title: "批次、日期与内封用于辅助核对",
    text: "ON 官网建议检查桶底或桶侧的日期与批次喷码，并确认白色保护内封未被异常打开；内封上可能存在用于运输泄压的通气特征。",
  },
  {
    title: "不同地区的包装本来就可能不同",
    text: "包装设计、配方表达和验证特征可能因销售地区而变化。请按购买版本核对，不拿其他国家的一张包装图直接判定手中商品。",
  },
];

export default function Authenticity() {
  return <main className="auth-page">
    <section className="auth-hero"><div className="container auth-hero-grid">
      <div className="auth-hero-copy">
        <div className="eyebrow">Authenticity & Traceability</div>
        <h1>两种码，<br />两种作用。</h1>
        <p>先确认购买版本：国产和一般贸易商品核对防伪码；跨境商品同时核对防伪码与进口商品溯源码。再按实物提示扫码、刮开、验证。</p>
        <div className="auth-hero-tags"><span>国产 / 一般贸易 · 防伪码</span><span>跨境 · 防伪码 + 溯源码</span></div>
      </div>
      <div className="auth-hero-visual" aria-label="两种验证标签示意">
        <figure className="auth-visual-card auth-visual-card-trace"><Image src="/assets/authenticity/import-traceability-label-crop.png" width={810} height={1190} alt="宁波跨境贸易电子商务进口商品防伪溯源码标签示意" priority sizes="(max-width: 760px) 46vw, 280px" /><figcaption><span>02</span>进口商品溯源码</figcaption></figure>
        <figure className="auth-visual-card auth-visual-card-on"><Image src="/assets/authenticity/on-authentication-label-crop.png" width={1035} height={1035} alt="ON 百分百防伪验证标签示意" priority sizes="(max-width: 760px) 56vw, 330px" /><figcaption><span>01</span>ON 防伪码</figcaption></figure>
      </div>
    </div></section>

    <section className="auth-code-section"><div className="container">
      <header className="auth-section-head"><div><span>Check the version</span><h2>先看版本，再找标签</h2></div><p>不是每一个版本都有两张码。以订单标注的销售版本和手中实物为准。</p></header>
      <div className="auth-version-map">
        <article><div><span>01</span><strong>国产 / 一般贸易</strong></div><p>应核对</p><b>防伪码</b></article>
        <article><div><span>02</span><strong>跨境</strong></div><p>应同时核对</p><b>防伪码 <i>+</i> 溯源码</b></article>
      </div>
      <header className="auth-section-head"><div><span>Start here</span><h2>先认清你扫的是哪一种码</h2></div><p>两张标签都可能出现在进口商品上，但它们回答的不是同一个问题。</p></header>
      <div className="auth-demo-warning"><strong>请扫描你收到的实物标签</strong><p>下方图片只用于辨认标签外观，不用于代替实物防伪或溯源验证。</p></div>
      <div className="auth-code-grid">
        <article className="auth-code-card auth-code-card-dark">
          <div className="auth-code-card-head"><span>01 · Product authentication</span><strong>防伪码</strong></div>
          <div className="auth-code-media auth-code-media-round"><Image src="/assets/authenticity/on-authentication-label-crop.png" width={1035} height={1035} alt="ON 防伪码标签：扫码后刮开验证" sizes="(max-width: 820px) 80vw, 520px" /></div>
          <div className="auth-code-copy">
            <p className="auth-code-answer">负责回答：这张 ON 防伪标签能否通过对应验证。</p>
            <ol><li><span>1</span><div><strong>先扫码</strong><p>使用手机扫描标签右侧二维码，进入标签对应的验证入口。</p></div></li><li><span>2</span><div><strong>再刮开</strong><p>刮开银色覆盖层，按照实物标签与页面提示完成验证。</p></div></li><li><span>3</span><div><strong>读结果</strong><p>查看页面给出的验证结果；异常、失败或信息不一致时不要继续丢弃包装。</p></div></li></ol>
            <div className="auth-code-caution">二维码外观可以被复制。真正要看的，是实物标签、刮开后的信息和验证页面共同给出的结果。</div>
          </div>
        </article>

        <article className="auth-code-card auth-code-card-warm">
          <div className="auth-code-card-head"><span>02 · Import traceability</span><strong>溯源码</strong></div>
          <div className="auth-code-media auth-code-media-tall"><Image src="/assets/authenticity/import-traceability-label-crop.png" width={810} height={1190} alt="进口商品防伪溯源码标签：扫码查询并刮开验证" sizes="(max-width: 820px) 72vw, 430px" /></div>
          <div className="auth-code-copy">
            <p className="auth-code-answer">负责回答：这件跨境商品能否查询到相应的进口溯源信息。</p>
            <ol><li><span>1</span><div><strong>扫描标签二维码</strong><p>通过溯源码标签进入查询页面，不通过搜索结果里陌生的第三方入口验证。</p></div></li><li><span>2</span><div><strong>按标签提示刮开验证</strong><p>标签明确写有“扫码查询、刮开验证”时，依照实物步骤操作。</p></div></li><li><span>3</span><div><strong>核对商品与实物</strong><p>检查查询页面显示的信息是否与手中商品、规格和订单相符。</p></div></li></ol>
            <div className="auth-code-caution">溯源码用于追溯进口商品信息；它和品牌防伪码作用不同，不能互相替代。</div>
          </div>
        </article>
      </div>
    </div></section>

    <section className="auth-refit-section"><div className="container">
      <header className="auth-section-head"><div><span>Common question</span><h2>看到双层防伪码，先别慌</h2></div><p>个别商品可能在工厂贴码质检时重新覆盖防伪码，这是贴附返工，不等于商品被二次使用。</p></header>
      <div className="auth-refit-layout">
        <div className="auth-refit-flow">
          <article><span>01</span><div><strong>产品出厂贴码</strong><p>正常情况下，防伪码应完整贴附在包装指定位置。</p></div></article>
          <article><span>02</span><div><strong>质检发现贴附问题</strong><p>未骑缝、翘边、破损或粘贴不完整，都可能触发重新贴码。</p></div></article>
          <article><span>03</span><div><strong>新防伪码覆盖返工</strong><p>新码可能直接覆盖旧码；移除旧码后，也可能留下明显撕除或损毁痕迹。</p></div></article>
          <article><span>04</span><div><strong>两层分别验证</strong><p>两张防伪码均可刮开，建议分别输入验证码并核对结果。</p></div></article>
        </div>
        <aside className="auth-code-reader">
          <span>How to read the code</span>
          <h3>验证码这样分段看</h3>
          <div className="auth-code-format"><div><small>前 6 位</small><strong>日期数字</strong><em>仅数字</em></div><i aria-hidden="true">+</i><div><small>后 4 位</small><strong>字符组合</strong><em>字母＋数字，或纯字母</em></div></div>
          <div className="auth-character-title"><strong>容易看错的 3 组字符</strong><p>若第一次输入未通过，先放大验证码，再分别尝试这些可能的字符。</p></div>
          <div className="auth-character-grid"><div><b>rn</b><span>可能看成</span><b>m</b></div><div><b>O</b><span>注意区分</span><b>0</b></div><div><b>I</b><span>注意区分</span><b>l</b></div></div>
          <p className="auth-reader-note">请以刮开后的实物字符为准，不根据网页示意图猜码。双层防伪码请分开验证。</p>
        </aside>
      </div>
      <div className="auth-refit-conclusion"><strong>买家结论</strong><p>双层码、旧码撕除痕迹或局部损毁，可能属于工厂重新贴附防伪码后的正常返工痕迹。重点不是只看贴纸外观，而是把两张码分别刮开并完成验证。</p></div>
    </div></section>

    <section className="auth-results-section"><div className="container">
      <header className="auth-section-head auth-section-head-light"><div><span>Read the result</span><h2>扫完以后，结果这样处理</h2></div><p>验证不是“扫一下就放心”，而是把结果、实物和原订单放在一起核对。</p></header>
      <div className="auth-result-grid">{resultGuide.map((item) => <article key={item.index}><span>{item.index}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      <div className="auth-result-action"><div><strong>准备好这 6 张照片</strong><p>商品正面、商品背面、防伪码、溯源码、批次/效期、淘宝订单。</p></div><Link className="btn" href="/support">从原订单继续售后</Link></div>
    </div></section>

    <section className="auth-official-section"><div className="container">
      <header className="auth-section-head"><div><span>From ON</span><h2>再配合 ON 官网说明判断</h2></div><p>包装细节只能辅助判断。两种码的验证结果和购买订单，优先级更高。</p></header>
      <div className="auth-official-grid">{officialNotes.map((note, index) => <article key={note.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{note.title}</h3><p>{note.text}</p></article>)}</div>
      <div className="auth-source-row"><p>以上包装说明依据 ON 的 Product authentication tips 整理；不同地区及后续批次可能更新，请以品牌当前页面和商品实物为准。</p><a href="https://www.optimumnutrition.com/en-us/pages/authentic-products" target="_blank" rel="noreferrer">查看 ON 官网说明 ↗</a></div>
    </div></section>

    <section className="auth-final-section"><div className="container auth-final-card"><span>One last rule</span><h2>没有任何一张包装照片，<br />能替代你手里的验证结果。</h2><p>保留订单和完整包装；防伪码、溯源码、批次与商品信息一起核对。遇到异常，从原订单继续沟通。</p><div><Link className="btn" href="/support">售后登记</Link><Link className="btn secondary" href="/articles/authenticity-and-supply-chain">阅读正品与供应链文章</Link></div></div></section>
  </main>;
}
