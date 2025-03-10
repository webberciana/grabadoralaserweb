import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import data from './src/data/data.json';

export default defineConfig({
  site: 'https://migrabadoralaser.es',
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => {
        const now = new Date();
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

        // Check brands
        const brand = data.brands.find(
          (b) => `/brands/${b.slug}/` === urlPath
        );
        if (brand) {
          // Only include brands that have published products
          return data.products.some(
            (p) => p.brand === brand.id && new Date(p.publishDate) <= now
          );
        }

        // Check categories
        const category = data.categories.find(
          (c) => `/categories/${c.slug}/` === urlPath
        );
        if (category) {
          // Only include categories that have published products
          return data.products.some(
            (p) => p.categories.includes(category.id) && new Date(p.publishDate) <= now
          );
        }

        // Check authors
        const author = data.authors.find(
          (a) => `/authors/${a.slug}/` === urlPath
        );
        if (author) {
          // Only include authors that have published articles
          return data.articles.some(
            (a) => a.author === author.id && new Date(a.publishDate) <= now
          );
        }

        // Include other pages by default (home, about, contact, etc)
        return true;
      },
      customPages: [
        'https://migrabadoralaser.es/buscador/',
        'https://migrabadoralaser.es/sobre-nosotros/',
        'https://migrabadoralaser.es/contacto/',
        'https://migrabadoralaser.es/faqs/'
      ],
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date(),
    }),
    robotsTxt(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});