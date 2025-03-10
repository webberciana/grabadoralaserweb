import rss from '@astrojs/rss';
import data from '../data';

export async function GET(context) {
  const now = new Date();
  
  // Get published articles
  const publishedArticles = data.articles
    .filter((article) => new Date(article.publishDate) <= now)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

  // Get published products
  const publishedProducts = data.products
    .filter((product) => new Date(product.publishDate) <= now)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

  // Combine articles and products into feed items
  const items = [
    ...publishedArticles.map((article) => ({
      title: article.title,
      description: article.excerpt,
      link: `/blog/${article.slug}/`,
      pubDate: new Date(article.publishDate),
    })),
    ...publishedProducts.map((product) => ({
      title: product.title,
      description: product.shortDescription,
      link: `/products/${product.slug}/`,
      pubDate: new Date(product.publishDate),
    })),
    ...data.brands.map((brand) => ({
      title: brand.name,
      description: brand.description,
      link: `/marcas/${brand.slug}/`,
      // Since brands don't have a publish date, use current date
      pubDate: new Date(),
    }))
  ];

  return rss({
    title: data.site.title,
    description: data.site.description,
    site: context.site,
    items: items,
  });
}