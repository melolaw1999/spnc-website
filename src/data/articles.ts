import generatedArticles from "./articles.generated.json";

export type ArticleContentMode = "html" | "image";

export interface Article {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  series: string;
  author: string;
  originalUrl: string;
  coverImage: string;
  contentMode: ArticleContentMode;
  contentHtml: string;
  contentImage?: string;
  contentImages?: Array<{
    src: string;
    width: number;
    height: number;
  }>;
  sourceStatus: string;
}

export const articles = generatedArticles as Article[];

export const getArticle = (slug: string) => articles.find((article) => article.slug === slug);

export const formatArticleDate = (value: string, compact = false) => {
  const [date] = value.split(" ");
  const [year, month, day] = date.split("-");
  return compact ? `${year}.${month}.${day}` : `${year}年${Number(month)}月${Number(day)}日`;
};

export const formatArticleDateTime = (value: string) => `${formatArticleDate(value)} ${value.split(" ")[1]}`;

export const articleYears = Array.from(new Set(articles.map((article) => article.publishedAt.slice(0, 4))));
export const articleSeries = ["理想营养答网友问", "运动营养科普", "饮食与健康", "行业与消费"].filter((series) =>
  articles.some((article) => article.series === series),
);
