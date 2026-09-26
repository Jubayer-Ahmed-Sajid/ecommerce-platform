import type { MetadataRoute } from 'next';
import { catalogApi } from '@/features/catalog/api/catalog-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopbd.local';

  const [productsResponse, categories] = await Promise.all([
    catalogApi.getProducts({ pageSize: 100 }).catch(() => ({ items: [] })),
    catalogApi.getCategories().catch(() => []),
  ]);

  const productEntries: MetadataRoute.Sitemap = productsResponse.items.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/orders/track`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...categoryEntries,
    ...productEntries,
  ];
}
