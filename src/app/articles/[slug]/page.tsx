import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, formatArticleDate, getArticle } from "@/data/articles";
import { siteName } from "@/lib/site";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: { title: `${article.title}｜${siteName}`, description: article.summary, type: "article", publishedTime: article.publishedAt.replace(" ", "T") + ":00+08:00", images: [article.coverImage] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return <main className="article-detail">
    <header className="article-detail-header"><div className="container article-detail-header-inner">
      <Link href="/articles" className="article-back">← 全部文章</Link>
      <div className="eyebrow">{article.series}</div>
      <h1>{article.title}</h1>
      <p>{article.summary}</p>
      <div className="article-byline"><span>{article.author}</span><time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time><span>首发于微信公众号</span></div>
    </div></header>

    <section className="article-detail-section"><div className="container article-detail-grid">
      <article className="wechat-article-frame">
        {article.contentMode === "html" ? <div className="wechat-content" dangerouslySetInnerHTML={{ __html: article.contentHtml }} /> : article.contentImage ? <Image className="wechat-long-image" src={article.contentImage} alt={article.title} width={1588} height={11266} priority sizes="(max-width: 820px) 100vw, 760px" /> : null}
      </article>
      <aside className="article-source-rail"><div className="article-source-card">
        <span>原始档案</span>
        <dl><div><dt>作者</dt><dd>{article.author}</dd></div><div><dt>首发日期</dt><dd>{formatArticleDate(article.publishedAt)}</dd></div><div><dt>栏目</dt><dd>{article.series}</dd></div></dl>
        <p>{article.sourceStatus}</p>
        {article.originalUrl && <a href={article.originalUrl} target="_blank" rel="noreferrer">查看公众号原文 ↗</a>}
      </div><div className="article-pride-note"><strong>时间是内容最好的脚注。</strong><p>旧文章保留旧日期。今天依然有效的判断，才是长期内容真正的价值。</p></div></aside>
    </div></section>
  </main>;
}
