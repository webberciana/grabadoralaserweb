import rss from '@astrojs/rss';
import data from '../../data';

export async function GET(context) {
  const now = new Date();
  const publishedArticles = data.articles
    .filter((article) => new Date(article.publishDate) <= now)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

  return rss({
    title: data.site.title,
    description: data.site.description,
    site: context.site,
    items: publishedArticles.map((article) => ({
      title: article.title,
      description: article.excerpt,
      link: `/blog/${article.slug}`,
      pubDate: new Date(article.publishDate),
    })),
  });
}
