"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./articles.module.css";

type TimelineArticle = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  series: string;
  coverImage: string;
};

const descriptions: Record<string, string> = {
  "理想营养答网友问": "产品、使用、恢复与维权中的高频问题",
  "运动营养科普": "蛋白质、补剂与训练表现的基础知识",
  "饮食与健康": "代餐、咖啡、睡眠与日常饮食话题",
  "行业与消费": "产品真伪、供应链与行业变化观察",
};

const fullDate = (date: string) => date.slice(0, 10).replaceAll("-", ".");

export default function ArticleTimeline({ articles, series }: { articles: TimelineArticle[]; series: string[] }) {
  const [selectedSeries, setSelectedSeries] = useState("全部文章");
  const visibleArticles = useMemo(
    () => selectedSeries === "全部文章" ? articles : articles.filter((article) => article.series === selectedSeries),
    [articles, selectedSeries],
  );
  const years = Array.from(new Set(visibleArticles.map((article) => article.publishedAt.slice(0, 4))));

  return <>
    <div className={styles.seriesGrid} aria-label="文章系列">
      {series.map((name, index) => {
        const count = articles.filter((article) => article.series === name).length;
        const selected = selectedSeries === name;
        return <button type="button" className={styles.seriesCard} data-selected={selected} onClick={() => setSelectedSeries(selected ? "全部文章" : name)} key={name}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{name}</strong>
          <p>{descriptions[name]}</p>
          <small>{count} 篇</small>
        </button>;
      })}
    </div>

    <div className={styles.timelineToolbar}>
      <div>
        <span>文章时间线</span>
        <h2>{selectedSeries}</h2>
      </div>
      <nav aria-label="按系列筛选文章">
        {["全部文章", ...series].map((name) => <button type="button" aria-pressed={selectedSeries === name} onClick={() => setSelectedSeries(name)} key={name}>{name}</button>)}
      </nav>
      <p aria-live="polite">{visibleArticles.length} 篇 · 按公众号发布日期倒序</p>
    </div>

    <div className={styles.yearGroups}>{years.map((year) => {
      const yearArticles = visibleArticles.filter((article) => article.publishedAt.startsWith(year));
      return <section className={styles.year} key={year}>
        <div className={styles.yearLabel}><strong>{year}</strong><span>{yearArticles.length} 篇</span></div>
        <div className={styles.articleList}>{yearArticles.map((article) => <Link className={styles.articleRow} href={`/articles/${article.slug}`} key={article.slug}>
          <time dateTime={article.publishedAt}>{fullDate(article.publishedAt)}</time>
          <div className={styles.articleCopy}><span>{article.series}</span><h3>{article.title}</h3><p>{article.summary}</p></div>
          <div className={styles.articleCover}><Image src={article.coverImage} alt="" fill sizes="(max-width: 640px) 34vw, 200px" /></div>
          <i aria-hidden="true">↗</i>
        </Link>)}</div>
      </section>;
    })}</div>
  </>;
}
