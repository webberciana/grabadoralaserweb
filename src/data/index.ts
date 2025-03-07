import type { Product } from '../types/product';

// Import JSON data
const site = await import('./site.json');
const categories = await import('./categories.json');
const brands = await import('./brands.json');
const blog = await import('./blog.json');
const products = await import('./products.json');

// Create the data object with proper typing
const data = {
  site: site.default,
  categories: categories.categories || [],
  brands: brands.brands || [],
  products: products.products || [],
  blog: {
    authors: blog.authors || [],
    articles: blog.articles || [],
    categories: blog.categories || [],
    tags: blog.tags || []
  }
};

export default data;