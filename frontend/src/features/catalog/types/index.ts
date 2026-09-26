export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface ProductVariantSummary {
  id: string;
  sku: string;
  name: string;
  price: number;
  priceAdjustment?: number;
  originalPrice?: number;
  inStock: boolean;
  availableQuantity?: number;
}

export interface ProductImageSummary {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSummary {
  id: string;
  name?: string;
  title: string;
  slug: string;
  basePrice: number;
  originalPrice?: number;
  primaryImageUrl?: string;
  categoryName?: string;
  inStock: boolean;
  conditionGrade?: string;
  batteryHealth?: number;
  regionVariant?: string;
  storage?: string;
  color?: string;
  warrantyText?: string;
  emiStartsAt?: number;
  boxIncluded?: boolean;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  categoryId: string;
  categoryName?: string;
  variants: ProductVariantSummary[];
  images: ProductImageSummary[];
  specifications?: Record<string, string>;
}

export interface CatalogQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  categoryId?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}
