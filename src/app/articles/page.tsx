import ArticleTimeline from "./ArticleTimeline";
import styles from "./articles.module.css";
import { articleSeries, articles } from "@/data/articles";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "文章",
  "理想营养微信公众号文章：按公众号原始发布日期排列，并按答网友问、运动营养科普、饮食与健康及行业与消费分类。",
  "/articles",
);

export default function ArticlesPage() {
  const oldestYear = articles.at(-1)?.publishedAt.slice(0, 4);
  const newestYear = articles[0]?.publishedAt.slice(0, 4);
  const timelineArticles = articles.map(({ slug, title, summary, publishedAt, series, coverImage }) => ({ slug, title, summary, publishedAt, series, coverImage }));

  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroEyebrow}>理想营养 · 文章</div>
        <div className={styles.heroGrid}>
          <div>
            <h1>公众号文章，<br />按时间阅读。</h1>
            <p>这里收录理想营养微信公众号文章。每篇标明公众号原始发布日期，并归入对应系列。</p>
          </div>
          <div className={styles.heroFacts} aria-label="文章数据">
            <div><strong>{articles.length}</strong><span>篇文章</span></div>
            <div><strong>{articleSeries.length}</strong><span>个系列</span></div>
            <div><strong>{oldestYear}—{newestYear}</strong><span>发布时间</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.content}>
      <div className="container">
        <ArticleTimeline articles={timelineArticles} series={articleSeries} />
      </div>
    </section>
  </main>;
}
