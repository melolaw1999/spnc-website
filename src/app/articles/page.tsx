import Image from "next/image";
import Link from "next/link";
import { articleYears, articles, formatArticleDate } from "@/data/articles";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "文章",
  "理想营养公众号文章存档：保留原文、原图和首发日期，记录长期有效的运动营养知识与买家答疑。",
  "/articles",
);

export default function ArticlesPage() {
  const [featured, ...remaining] = articles;

  return <main className="article-index">
    <section className="article-index-hero"><div className="container article-index-hero-grid">
      <div className="article-index-intro">
        <div className="eyebrow">SPNC Journal · 理想营养</div>
        <h1>文章会变旧，<br />认真不会。</h1>
        <p>这里保存理想营养公众号的原文、原图和首发时间。多年前写下的科普，只要事实仍然成立，就值得继续被看见。</p>
        <div className="article-index-meta"><span><strong>{articles.length}</strong> 篇已迁移</span><span><strong>{articleYears.length}</strong> 个年份</span><span>按原发布时间归档</span></div>
      </div>
      {featured && <Link className="article-feature" href={`/articles/${featured.slug}`}>
        <div className="article-feature-media"><Image src={featured.coverImage} alt="" fill priority sizes="(max-width: 860px) 92vw, 48vw" /></div>
        <div className="article-feature-copy"><span>{featured.series} · 最新迁移</span><h2>{featured.title}</h2><p>{featured.summary}</p><time dateTime={featured.publishedAt}>{formatArticleDate(featured.publishedAt)}</time></div>
      </Link>}
    </div></section>

    <section className="article-archive-section"><div className="container">
      <header className="article-archive-head"><div><span>Archive</span><h2>按首发时间阅读</h2></div><p>不是重新包装后的营销稿，而是理想营养自己写下、自己负责的内容。</p></header>
      <div className="article-year-groups">{articleYears.map((year) => {
        const yearArticles = remaining.filter((article) => article.publishedAt.startsWith(year));
        if (!yearArticles.length) return null;
        return <section className="article-year" key={year}><div className="article-year-label"><strong>{year}</strong><span>{yearArticles.length} 篇</span></div><div className="article-list">{yearArticles.map((article) => <Link className="article-row" href={`/articles/${article.slug}`} key={article.slug}>
          <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, true).slice(5)}</time>
          <div><span>{article.series}</span><h3>{article.title}</h3><p>{article.summary}</p></div>
          <div className="article-row-cover"><Image src={article.coverImage} alt="" fill sizes="(max-width: 560px) 38vw, 180px" /></div>
          <i aria-hidden="true">↗</i>
        </Link>)}</div></section>;
      })}</div>
      <div className="article-archive-note"><span>From the archive</span><p>早期文章将继续按原始发布时间补入。官网只负责整理与保存，不把旧文章伪装成今天新写的内容。</p></div>
    </div></section>
  </main>;
}
