import data from '../data';

export async function GET(context) {
  const now = new Date();
  const lastmod = now.toISOString();

  // URL base del sitio
  const siteUrl = String(context.site).endsWith("/")
    ? String(context.site).slice(0, -1)
    : String(context.site);

  // Helper: crea cada entrada <url> del sitemap
  const createUrlEntry = (loc, priority = "0.7", changefreq = "daily") => `
    <url>
      <loc>${siteUrl}${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;

  // Contenido publicado
  const publishedProducts = (data.products || []).filter(
    (product) => new Date(product.publishDate) <= now
  );

  const publishedArticles = (data.blog?.articles || []).filter(
    (article) => new Date(article.publishDate) <= now
  );

  const brandsWithProducts = (data.brands || []).filter((brand) =>
    publishedProducts.some((product) => product.brand === brand.id)
  );

  // Compatibilidad: productos con `categories: string[]` o `category: string`
  const hasCategory = (p, id) =>
    Array.isArray(p.categories) ? p.categories.includes(id) : p.category === id;

  const categoriesWithProducts = (data.categories || []).filter((category) =>
    publishedProducts.some((product) => hasCategory(product, category.id))
  );

  const authorsWithArticles = (data.blog?.authors || []).filter((author) =>
    publishedArticles.some((article) => article.author === author.id)
  );

  // Entradas del sitemap
  const urlEntries = [
    // Páginas estáticas (prioridad alta)
    createUrlEntry("/", "1.0", "daily"),
    createUrlEntry("/buscador/", "0.9", "daily"),
    createUrlEntry("/blog/", "0.8", "daily"),
    createUrlEntry("/marcas/", "0.8", "daily"),
    createUrlEntry("/categories/", "0.8", "daily"),

    // Otras estáticas
    createUrlEntry("/sobre-nosotros/", "0.6", "weekly"),
    createUrlEntry("/contacto/", "0.6", "weekly"),
    createUrlEntry("/faqs/", "0.6", "weekly"),

    // Dinámicas
    ...publishedProducts.map((product) =>
      createUrlEntry(`/products/${product.slug}/`, "0.8", "daily")
    ),
    ...publishedArticles.map((article) =>
      createUrlEntry(`/blog/${article.slug}/`, "0.7", "weekly")
    ),
    ...brandsWithProducts.map((brand) =>
      createUrlEntry(`/marcas/${brand.slug}/`, "0.7", "weekly")
    ),
    ...categoriesWithProducts.map((category) =>
      createUrlEntry(`/categories/${category.slug}/`, "0.7", "weekly")
    ),
    ...authorsWithArticles.map((author) =>
      createUrlEntry(`/authors/${author.slug}/`, "0.6", "weekly")
    ),
  ];

  // XSL embebido (data URI) para vista humana en navegador
  const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>
  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>Mapa del sitio</title>
        <style>
          :root { --bg:#0b1220; --card:#0f172a; --text:#e5e7eb; --muted:#94a3b8; --acc:#22c55e; }
          *{box-sizing:border-box}
          body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 system-ui,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial}
          .wrap{max-width:1100px;margin:40px auto;padding:0 16px}
          h1{font-size:28px;margin:0 0 12px}
          .muted{color:var(--muted)}
          .card{background:var(--card);border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
          table{width:100%;border-collapse:separate;border-spacing:0}
          thead th{font-weight:600;text-align:left;color:var(--muted);padding:12px 12px 10px;border-bottom:1px solid rgba(148,163,184,.2)}
          tbody td{padding:12px;border-bottom:1px solid rgba(148,163,184,.08)}
          tbody tr:hover{background:rgba(255,255,255,.03)}
          a{color:#a5b4fc;text-decoration:none}
          .pill{display:inline-block;padding:.2rem .55rem;border-radius:999px;background:rgba(34,197,94,.15);color:var(--acc);font-weight:600}
          .right{text-align:right}
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>Mapa del sitio</h1>
          <div class="muted">Total de URLs: <xsl:value-of select="count(s:urlset/s:url)"/></div>
          <div class="card" style="margin-top:12px">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th class="right">Prioridad</th>
                  <th class="right">Frecuencia</th>
                  <th class="right">Última modificación</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <xsl:sort select="number(s:priority)" data-type="number" order="descending"/>
                  <xsl:sort select="s:lastmod" order="descending"/>
                  <tr>
                    <td><a href="{s:loc}" target="_blank" rel="noopener"><xsl:value-of select="s:loc"/></a></td>
                    <td class="right"><span class="pill"><xsl:value-of select="format-number(number(s:priority),'0.0')"/></span></td>
                    <td class="right muted"><xsl:value-of select="s:changefreq"/></td>
                    <td class="right muted"><xsl:value-of select="s:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
            <div class="muted" style="margin-top:8px">La hoja de estilo se ignora por los buscadores; es solo para visualización.</div>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

  const stylesheetPI =
    `<?xml-stylesheet type="text/xsl" href="data:text/xsl;charset=UTF-8,${encodeURIComponent(xsl)}"?>`;

  // Sitemap final con XSL embebido
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
${stylesheetPI}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
