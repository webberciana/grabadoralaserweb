export interface Product {
  id: string;
  title: string;
  slug: string;
  categories: string[];  // Changed from category to categories
  brand: string;
  publishDate: string;
  price: number;
  discount?: {
    percentage: number;
  };
  rating: number;
  shortDescription: string;
  priceQuote?: string;
  mainImage: string;
  images: string[];
  information: string;
  expertOpinion: {
    content: string;
    rating: number;
    pros: string[];
    cons: string[];
  };
  videoReview?: {
    title: string;
    youtubeId: string;
    description?: string;
  };
  reviewsAnalysis?: string;
  reviews: Array<{
    name: string;
    rating: number;
    content: string;
  }>;
  additionalInfo: string;
  specifications: Record<string, string | string[]>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  affiliateUrl: string;
  lastUpdated: string;
  stock: string;
}