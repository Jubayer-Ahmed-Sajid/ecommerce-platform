export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartState {
  items: CartItem[];
  totalItemCount: number;
  subtotal: number;
}
