import data from '../data';

export async function GET(context) {
  const now = new Date();
  const lastmod = now.toISOString();

  // Helper function to create URL entry
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

  // Get published products
  const publishedProducts = (data.products || []).filter(
    product => new Date(product.publishDate) <= now
  );

  // Get published articles
  const publishedArticles = (data.blog.articles || []).filter(
    article => new Date(article.publishDate) <= now
  );

  // Get brands with published products
  const brandsWithProducts = (data.brands || []).filter(brand =>
    publishedProducts.some(product => product.brand === brand.id)
  );

  // Get categories with published products
  const categoriesWithProducts = (data.categories || []).filter(category =>
    publishedProducts.some(product => product.categories.includes(category.id))
  );

  // Get authors with published articles
  const authorsWithArticles = (data.blog.authors || []).filter(author =>
    publishedArticles.some(article => article.author === author.id)
  );

  // Build sitemap entries
  const urlEntries = [
    // Static pages with high priority
    createUrlEntry("/", "1.0", "daily"),
    createUrlEntry("/buscador/", "0.9", "daily"),
    createUrlEntry("/blog/", "0.8", "daily"),
    createUrlEntry("/marcas/", "0.8", "daily"),
    createUrlEntry("/categories/", "0.8", "daily"),
    
    // Other static pages
    createUrlEntry("/sobre-nosotros/", "0.6", "weekly"),
    createUrlEntry("/contacto/", "0.6", "weekly"),
    createUrlEntry("/faqs/", "0.6", "weekly"),

    // Dynamic content
    ...publishedProducts.map(product => 
      createUrlEntry(`/products/${product.slug}/`, "0.8", "daily")
    ),
    ...publishedArticles.map(article => 
      createUrlEntry(`/blog/${article.slug}/`, "0.7", "weekly")
    ),
    ...brandsWithProducts.map(brand => 
      createUrlEntry(`/marcas/${brand.slug}/`, "0.7", "weekly")
    ),
    ...categoriesWithProducts.map(category => 
      createUrlEntry(`/categories/${category.slug}/`, "0.7", "weekly")
    ),
    ...authorsWithArticles.map(author => 
      createUrlEntry(`/authors/${author.slug}/`, "0.6", "weekly")
    )
  ];

  // Build the complete sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
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