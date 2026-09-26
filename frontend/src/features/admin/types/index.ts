export interface UpdateProductInput {
  name: string;
  slug: string;
  basePrice: number;
  originalPrice?: number;
  description?: string;
  categoryId?: string;
  isActive: boolean;
  isFeatured: boolean;
}

export interface AddVariantInput {
  sku: string;
  name: string;
  priceAdjustment: number;
  initialStock: number;
}

export interface UpdateVariantInput {
  sku: string;
  name: string;
  priceAdjustment: number;
  isActive: boolean;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  pendingPayments: number;
  lowStockCount: number;
}

export interface AdminProductVariantInput {
  sku: string;
  name: string;
  priceDelta: number;
  initialStock: number;
}

export interface AdminProductImageInput {
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  basePrice: number;
  originalPrice?: number;
  description?: string;
  categoryId?: string;
  isFeatured: boolean;
  variants: AdminProductVariantInput[];
  images: AdminProductImageInput[];
}

export interface StockLevelDto {
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
}

export interface StockAdjustmentInput {
  variantId: string;
  type: 'InwardRestock' | 'OutwardSale' | 'InventoryCorrection' | 'DamagedOrLost';
  quantityDelta: number;
  reason: string;
  referenceNotes?: string;
}

export interface VerifyPaymentInput {
  isVerified: boolean;
  adminNotes?: string;
}
