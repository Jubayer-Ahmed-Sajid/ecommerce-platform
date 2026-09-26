import type { PaymentMethod } from '@/types/commerce';

export interface CheckoutOrderItem {
  variantId: string;
  quantity: number;
}

export interface CheckoutRequest {
  customerFullName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryDivision: string;
  postalCode?: string;
  paymentMethod: PaymentMethod;
  senderPhoneNumber?: string;
  transactionId?: string;
  items: CheckoutOrderItem[];
  customerNotes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderNumber: string;
  orderId: string;
  totalAmount: number;
  errorMessage?: string;
}
