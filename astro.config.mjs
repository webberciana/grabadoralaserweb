import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

export default defineConfig({
  site: 'https://migrabadoralaser.es',
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => {
        const now = new Date();

        // Extract date from URL if it exists in data.json
        const urlPath = new URL(page.url).pathname;

        // Check products
        const product = data.products.find(
          (p) => `/products/${p.slug}/` === urlPath
        );
        if (product) {
          return new Date(product.publishDate) <= now;
        }

        // Check articles
        const article = data.articles.find(
          (a) => `/blog/${a.slug}/` === urlPath
        );
        if (article) {
          return new Date(article.publishDate) <= now;
        }

        // Include other pages by default
        return true;
      },
    }),
    robotsTxt(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});
