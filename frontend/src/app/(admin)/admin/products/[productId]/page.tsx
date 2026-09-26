import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { adminApi } from '@/features/admin/api/admin-api';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { ProductEditForm } from '@/features/admin/components/product-edit-form';

interface AdminProductEditPageProps {
  params: Promise<{ productId: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Product — Admin | BDT Shop',
  robots: { index: false },
};

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const { productId } = await params;

  const [product, categories] = await Promise.all([
    adminApi.getProduct(productId).catch(() => null),
    catalogApi.getCategories().catch(() => []),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <Link
          href="/admin/products"
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors dark:text-slate-400"
        >
          ← Back to Products
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Edit Product
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Editing: <span className="font-semibold text-slate-700 dark:text-slate-300">{product.title || product.name}</span>
            </p>
          </div>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View on Storefront ↗
          </Link>
        </div>
      </div>

      {/* Current Images Preview (read-only — images managed separately) */}
      {product.images.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Product Images ({product.images.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {product.images
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((img) => (
                <div
                  key={img.id}
                  className={`relative h-20 w-20 rounded-xl border-2 overflow-hidden ${
                    img.isPrimary
                      ? 'border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText ?? product.title}
                    className="h-full w-full object-cover"
                  />
                  {img.isPrimary && (
                    <span className="absolute bottom-0 left-0 right-0 bg-indigo-600/90 text-center text-[9px] font-bold text-white py-0.5">
                      Primary
                    </span>
                  )}
                </div>
              ))}
          </div>
          <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">
            Image management (add/remove/reorder) via product creation flow. Use &ldquo;Add New Product&rdquo; to upload new images and then delete this entry if needed.
          </p>
        </div>
      )}

      {/* Edit Form — Client Component leaf */}
      <ProductEditForm product={product} categories={categories} />
    </div>
  );
}
