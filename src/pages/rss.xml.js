import rss from '@astrojs/rss';
import data from '../data/blog.json';

export async function GET(context) {
  const now = new Date();
  const publishedArticles = (data.articles || [])
    .filter((article) => new Date(article.publishDate) <= now)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

  return rss({
    title: "Mi Grabadora Láser",
    description: "Expert reviews and guides for laser engravers and cutters",
    site: context.site,
    items: publishedArticles.map((article) => ({
      title: article.title,
      description: article.excerpt,
      link: `/blog/${article.slug}`,
      pubDate: new Date(article.publishDate),
    })),
  });
}