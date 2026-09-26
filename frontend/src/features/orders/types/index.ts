import type { OrderStatus, PaymentStatus, PaymentMethod } from '@/types/commerce';

export interface OrderItemDto {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderShippingAddressDto {
  addressLine: string;
  city: string;
  division: string;
  postalCode?: string;
}

export interface PaymentSummaryDto {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
}

export interface OrderDetailsDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subTotal: number;
  shippingFee: number;
  totalAmount: number;
  createdAtUtc: string;
  items: OrderItemDto[];
  shippingAddress: OrderShippingAddressDto;
  payment: PaymentSummaryDto;
  customerFullName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNotes?: string;
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAtUtc: string;
  customerFullName: string;
  customerPhone: string;
  totalItemCount: number;
}
