import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { formatBdt } from '@/lib/formatting/currency';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Products Management | ShopBD Console',
};

export default async function AdminProductsPage() {
  const productsResponse = await catalogApi.getProducts({ pageSize: 50 }).catch(() => ({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 50,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  }));

  const products = productsResponse.items;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Product Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, and organize catalog items and variant pricing.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className={buttonVariants({ variant: 'primary', size: 'sm', className: 'font-semibold' })}
        >
          + Add New Product
        </Link>
      </div>

      {/* Products Table Card */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 p-5 dark:border-slate-800">
          <CardTitle className="text-base">Catalog Inventory ({products.length} items)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No products found in the database. Click &ldquo;Add New Product&rdquo; to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">Image</th>
                    <th className="p-4 font-semibold">Product Name</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Base Price</th>
                    <th className="p-4 font-semibold">Stock Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="relative h-12 w-12 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden dark:border-slate-800">
                          {product.primaryImageUrl ? (
                            <Image
                              src={product.primaryImageUrl}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400 font-medium">
                              None
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {product.title}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                          /products/{product.slug}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {product.categoryName || 'Unassigned'}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {formatBdt(product.basePrice)}
                      </td>
                      <td className="p-4">
                        {product.inStock ? (
                          <Badge variant="success">In Stock</Badge>
                        ) : (
                          <Badge variant="danger">Out of Stock</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className={buttonVariants({ variant: 'primary', size: 'sm' })}
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                          >
                            View ↗
                          </Link>
                        </div>
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
