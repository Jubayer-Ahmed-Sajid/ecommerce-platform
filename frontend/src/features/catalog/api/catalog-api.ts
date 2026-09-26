import { apiClient } from '@/lib/api/client';
import type { PagedResult } from '@/types/api';
import type {
  ProductSummary,
  ProductDetail,
  CategorySummary,
  CatalogQueryParameters,
} from '../types';
import { USED_IPHONES, IPHONE_CATEGORIES, getUsedIphoneDetail } from '../data/used-iphones';

export const catalogApi = {
  getProducts: async (params?: CatalogQueryParameters): Promise<PagedResult<ProductSummary>> => {
    try {
      const res = await apiClient.get<PagedResult<ProductSummary>>('/products', {
        params: {
          page: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 20,
          categoryId: params?.categoryId,
          searchTerm: params?.searchTerm,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          sortBy: params?.sortBy,
        },
        next: { revalidate: 60, tags: ['products'] },
      });

      if (res && res.items && res.items.length > 0) {
        return {
          ...res,
          items: res.items.map((item) => ({
            ...item,
            title: item.title || item.name || '',
          })),
        };
      }
    } catch {
      // Graceful fallback to pre-owned inventory
    }

    // Filter used iPhones fallback
    let items = [...USED_IPHONES];

    if (params?.searchTerm) {
      const term = params.searchTerm.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.categoryName?.toLowerCase().includes(term) ||
          p.color?.toLowerCase().includes(term) ||
          p.storage?.toLowerCase().includes(term)
      );
    }

    if (params?.categoryId) {
      const cat = IPHONE_CATEGORIES.find(
        (c) => c.id === params.categoryId || c.slug === params.categoryId
      );
      if (cat) {
        items = items.filter((p) => p.categoryName === cat.name);
      }
    }

    if (params?.minPrice !== undefined) {
      items = items.filter((p) => p.basePrice >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined) {
      items = items.filter((p) => p.basePrice <= params.maxPrice!);
    }

    if (params?.sortBy === 'price_asc') {
      items.sort((a, b) => a.basePrice - b.basePrice);
    } else if (params?.sortBy === 'price_desc') {
      items.sort((a, b) => b.basePrice - a.basePrice);
    }

    const page = params?.pageNumber ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginatedItems,
      totalCount,
      pageNumber: page,
      pageSize,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  },

  getProductBySlug: async (slug: string): Promise<ProductDetail> => {
    try {
      const raw = await apiClient.get<ProductDetail>(`/products/${encodeURIComponent(slug)}`, {
        next: { revalidate: 60, tags: [`product-${slug}`] },
      });
      const title = raw.title || raw.name || '';
      const variants = (raw.variants || []).map((v) => ({
        ...v,
        price: v.price ?? (raw.basePrice + (v.priceAdjustment ?? 0)),
      }));
      return {
        ...raw,
        title,
        variants,
      };
    } catch {
      const localDetail = getUsedIphoneDetail(slug);
      if (localDetail) {
        return localDetail;
      }
      throw new Error(`Product ${slug} not found`);
    }
  },

  getCategories: async (): Promise<CategorySummary[]> => {
    try {
      const res = await apiClient.get<CategorySummary[]>('/categories', {
        next: { revalidate: 300, tags: ['categories'] },
      });
      if (res && res.length > 0) return res;
    } catch {
      // Fallback to pre-owned categories
    }
    return IPHONE_CATEGORIES;
  },
};
