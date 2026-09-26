import { apiClient } from '@/lib/api/client';
import type { CheckoutRequest, CheckoutResponse } from '../types';

export const checkoutApi = {
  submitOrder: (payload: CheckoutRequest) =>
    apiClient.post<CheckoutResponse>('/orders/checkout', payload),
};
