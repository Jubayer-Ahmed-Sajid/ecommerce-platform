import { apiClient } from '@/lib/api/client';
import type { OrderDetailsDto } from '../types';

export const ordersApi = {
  trackOrder: (orderNumber: string, phoneNumber: string) =>
    apiClient.get<OrderDetailsDto>(`/orders/${encodeURIComponent(orderNumber)}/track`, {
      params: { phoneNumber },
      cache: 'no-store', // Always fetch fresh order status
    }),

  getOrderById: (orderId: string) =>
    apiClient.get<OrderDetailsDto>(`/orders/${encodeURIComponent(orderId)}`, {
      cache: 'no-store',
    }),

  cancelOrder: (orderNumber: string, phoneNumber: string, reason?: string) =>
    apiClient.post<{ success: boolean; status: string; message: string }>(
      `/orders/${encodeURIComponent(orderNumber)}/cancel`,
      { phoneNumber, reason }
    ),
};
