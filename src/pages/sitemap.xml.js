import data from '../data';

export async function GET(context) {
  const now = new Date();
  const lastmod = now.toISOString();

  const createUrlEntry = (loc, priority = "0.7", changefreq = "daily") => {
    const siteUrl = String(context.site).endsWith("/") 
      ? String(context.site).slice(0, -1) 
      : String(context.site);
    return `
      <url>
        <loc>${siteUrl}${loc}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
      </url>`;
  };

  const publishedProducts = (data.products || []).filter(
    p => new Date(p.publishDate) <= now
  );

  const publishedArticles = (data.blog?.articles || []).filter(
    a => new Date(a.publishDate) <= now
  );

  const brandsWithProducts = (data.brands || []).filter(b =>
    publishedProducts.some(p => p.brand === b.id)
  );

  // más robusto por si algún producto aún usa `category` string
  const hasCategory = (p, id) =>
    Array.isArray(p.categories) ? p.categories.includes(id) : p.category === id;

  const categoriesWithProducts = (data.categories || []).filter(cat =>
    publishedProducts.some(p => hasCategory(p, cat.id))
  );

  const authorsWithArticles = (data.blog?.authors || []).filter(au =>
    publishedArticles.some(a => a.author === au.id)
  );

  const urlEntries = [
    createUrlEntry("/", "1.0", "daily"),
    createUrlEntry("/buscador/", "0.9", "daily"),
    createUrlEntry("/blog/", "0.8", "daily"),
    createUrlEntry("/marcas/", "0.8", "daily"),
    createUrlEntry("/categories/", "0.8", "daily"),
    createUrlEntry("/sobre-nosotros/", "0.6", "weekly"),
    createUrlEntry("/contacto/", "0.6", "weekly"),
    createUrlEntry("/faqs/", "0.6", "weekly"),
    ...publishedProducts.map(p => createUrlEntry(`/products/${p.slug}/`, "0.8", "daily")),
    ...publishedArticles.map(a => createUrlEntry(`/blog/${a.slug}/`, "0.7", "weekly")),
    ...brandsWithProducts.map(b => createUrlEntry(`/marcas/${b.slug}/`, "0.7", "weekly")),
    ...categoriesWithProducts.map(c => createUrlEntry(`/categories/${c.slug}/`, "0.7", "weekly")),
    ...authorsWithArticles.map(au => createUrlEntry(`/authors/${au.slug}/`, "0.6", "weekly")),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
