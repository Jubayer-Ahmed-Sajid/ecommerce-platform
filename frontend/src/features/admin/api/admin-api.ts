import { apiClient } from '@/lib/api/client';
import type { PagedResult } from '@/types/api';
import type { ProductDetail } from '@/features/catalog/types';
import type { OrderSummaryDto } from '@/features/orders/types';
import type { OrderStatus } from '@/types/commerce';
import type {
  DashboardMetrics,
  StockLevelDto,
  CreateProductInput,
  UpdateProductInput,
  StockAdjustmentInput,
  VerifyPaymentInput,
} from '../types';

export const adminApi = {
  getDashboardMetrics: () =>
    apiClient.get<DashboardMetrics>('/admin/dashboard/metrics', {
      cache: 'no-store',
    }),

  listOrders: (params?: {
    status?: OrderStatus;
    searchTerm?: string;
    page?: number;
    pageSize?: number;
  }) =>
    apiClient.get<PagedResult<OrderSummaryDto>>('/admin/orders', {
      params: {
        status: params?.status,
        searchTerm: params?.searchTerm,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
      cache: 'no-store',
    }),

  updateOrderStatus: (orderId: string, newStatus: OrderStatus, notes?: string) =>
    apiClient.patch<{ success: boolean; status: OrderStatus; message: string }>(
      `/admin/orders/${encodeURIComponent(orderId)}/status`,
      { newStatus, notes }
    ),

  verifyPayment: (paymentId: string, payload: VerifyPaymentInput) =>
    apiClient.post<{ success: boolean; message: string }>(
      `/admin/payments/${encodeURIComponent(paymentId)}/verify`,
      payload
    ),

  listInventory: () =>
    apiClient.get<StockLevelDto[]>('/admin/inventory', {
      cache: 'no-store',
    }),

  adjustStock: (payload: StockAdjustmentInput) =>
    apiClient.post<{ success: boolean }>(
      '/admin/inventory/adjust',
      payload
    ),

  createProduct: (payload: CreateProductInput) =>
    apiClient.post<{ id: string }>(
      '/admin/products',
      payload
    ),

  getProduct: (productId: string) =>
    apiClient.get<ProductDetail>(`/admin/products/${encodeURIComponent(productId)}`, {
      cache: 'no-store',
    }),

  updateProduct: (productId: string, payload: UpdateProductInput) =>
    apiClient.put<{ success: boolean }>(
      `/admin/products/${encodeURIComponent(productId)}`,
      payload
    ),

  addVariant: (productId: string, payload: { sku: string; name: string; priceAdjustment: number; initialStock: number }) =>
    apiClient.post<{ variantId: string }>(
      `/admin/products/${encodeURIComponent(productId)}/variants`,
      payload
    ),

  updateVariant: (productId: string, variantId: string, payload: { sku: string; name: string; priceAdjustment: number; isActive: boolean }) =>
    apiClient.put<{ success: boolean }>(
      `/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
      payload
    ),

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete<{ success: boolean }>(
      `/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`
    ),

  createCategory: (payload: { name: string; slug: string; description?: string; imageUrl?: string; displayOrder: number }) =>
    apiClient.post<{ id: string }>(
      '/admin/categories',
      payload
    ),

  deleteProduct: (productId: string) =>
    apiClient.delete<{ success: boolean }>(
      `/admin/products/${encodeURIComponent(productId)}`
    ),

  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>('/admin/media/upload', formData);
  },
};
