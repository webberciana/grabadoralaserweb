import type { Product } from '../types/product';

export function getProductsByCategory(products: Product[], category: string): Product[] {
  return products.filter(product => product.categories.includes(category));
}

export function getAllProductCategories(products: Product[]): string[] {
  const categories = new Set<string>();
  products.forEach(product => {
    product.categories.forEach(category => categories.add(category));
  });
  return Array.from(categories);
}

export function isProductPublished(product: Product): boolean {
  return new Date(product.publishDate) <= new Date();
}