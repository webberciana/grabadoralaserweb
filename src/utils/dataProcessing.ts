import type { Product } from '../types/product';
import data from '../data';

export function getPublishedProducts(): Product[] {
  return (data.products || []).filter(
    product => new Date(product.publishDate) <= new Date()
  );
}

export function getPublishedArticles(limit?: number) {
  const articles = (data.blog.articles || [])
    .filter(article => new Date(article.publishDate) <= new Date())
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  
  return limit ? articles.slice(0, limit) : articles;
}

export function getBrandsWithProductCount(limit?: number) {
  const brands = (data.brands || []).map(brand => ({
    ...brand,
    productCount: (data.products || []).filter(
      product => 
        product.brand === brand.id &&
        new Date(product.publishDate) <= new Date()
    ).length
  }));
  
  return limit ? brands.slice(0, limit) : brands;
}

export function getAuthorById(authorId: string) {
  return (data.blog.authors || []).find(author => author.id === authorId);
}