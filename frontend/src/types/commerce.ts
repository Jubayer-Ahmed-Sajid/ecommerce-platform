/**
 * Shared Commerce Invariants & Enums
 * Mirrors authoritative backend domain concepts without exposing EF entities.
 */

export type OrderStatus =
  | 'PendingPayment'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'CashOnDelivery'
  | 'BkashManual'
  | 'NagadManual'
  | 'RocketManual';

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded';

export interface Money {
  amount: number;
  currency: 'BDT';
}
