import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { ProductCreateForm } from '@/features/admin/components/product-create-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Add New Product | ShopBD Console',
  description: 'Create and publish a new catalog item with variant pricing and initial inventory.',
};

export default async function AdminNewProductPage() {
  const categories = await catalogApi.getCategories().catch(() => []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <Link href="/admin/products" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create New Product
        </h1>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 p-6 dark:border-slate-800">
          <CardTitle className="text-lg">Product Information & Specifications</CardTitle>
          <CardDescription>
            Specify core details, assign category, and define base pricing for the storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ProductCreateForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
