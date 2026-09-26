import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { CreateCategoryModal } from '@/features/admin/components/create-category-modal';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Categories Management | ShopBD Console',
};

export default async function AdminCategoriesPage() {
  const categories = await catalogApi.getCategories().catch(() => []);

  return (
    <div className="space-y-6">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Category Taxonomy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize catalog navigation, storefront filtering, and category rankings.
          </p>
        </div>

        <div>
          <CreateCategoryModal />
        </div>
      </div>

      {/* Categories Table */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 p-5 dark:border-slate-800">
          <CardTitle className="text-base">Configured Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No categories found. Click &ldquo;Add Category&rdquo; to create your first category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">Category Name</th>
                    <th className="p-4 font-semibold">URL Slug</th>
                    <th className="p-4 font-semibold">Description</th>
                    <th className="p-4 font-semibold text-center">Display Order</th>
                    <th className="p-4 font-semibold text-right">Storefront Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {category.name}
                      </td>
                      <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400">
                        {category.slug}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {category.description || '—'}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {category.displayOrder}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/products?category=${category.slug}`}
                          target="_blank"
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          View on Storefront ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
