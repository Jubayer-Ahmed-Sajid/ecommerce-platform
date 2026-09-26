import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { ProductCard } from '@/features/catalog/components/product-card';
import { CatalogSearchInput } from '@/features/catalog/components/catalog-search-input';
import { buttonVariants } from '@/components/ui/button';
import { CheckIcon, SmartphoneIcon } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Certified Pre-Owned iPhones & Apple Devices | iStoreBD',
  description:
    'Browse our verified inventory of used iPhones in Bangladesh. 100% genuine battery health, 7-day replacement guarantee, 2-year service warranty, 0% EMI and open-box cash on delivery.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest';
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const pageNumber = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const searchTerm = resolvedParams.search;
  const sort = resolvedParams.sort;
  const categoryParam = resolvedParams.category;
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;

  // Fetch categories for filter tabs
  const categories = await catalogApi.getCategories().catch(() => []);

  // Match category by slug or id
  const activeCategory = categories.find(
    (c) => c.slug === categoryParam || c.id === categoryParam
  );

  // Fetch products
  const productsResponse = await catalogApi.getProducts({
    pageNumber,
    pageSize: 16,
    categoryId: activeCategory?.id || (categoryParam ? categoryParam : undefined),
    searchTerm,
    minPrice,
    maxPrice,
    sortBy: sort,
  }).catch(() => ({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 16,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  }));

  const { items: products, totalCount, totalPages, hasPreviousPage, hasNextPage } = productsResponse;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {activeCategory ? activeCategory.name : 'Certified Pre-Owned Inventory'}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl mt-1">
            {searchTerm ? `Search Results for "${searchTerm}"` : activeCategory ? activeCategory.name : 'All Certified Pre-Owned iPhones'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span>Showing {products.length} of {totalCount} lab-tested units</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckIcon size={14} />
              <span>70-Point Tested &amp; 7-Day Replacement Included</span>
            </span>
          </p>
        </div>

        {/* Keystroke Live Search Input */}
        <CatalogSearchInput initialValue={searchTerm || ''} categoryParam={categoryParam} />
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/products"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              !categoryParam
                ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All Inventory
          </Link>
          {categories.map((category) => {
            const isSelected = categoryParam === category.slug || categoryParam === category.id;
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Sort:</span>
          <Link
            href={`/products?${new URLSearchParams({
              ...(categoryParam ? { category: categoryParam } : {}),
              ...(searchTerm ? { search: searchTerm } : {}),
              sort: 'newest',
            }).toString()}`}
            className={`px-2 py-1 rounded ${sort === 'newest' || !sort ? 'font-bold text-amber-600 dark:text-amber-400' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            Newest
          </Link>
          <span>•</span>
          <Link
            href={`/products?${new URLSearchParams({
              ...(categoryParam ? { category: categoryParam } : {}),
              ...(searchTerm ? { search: searchTerm } : {}),
              sort: 'price_asc',
            }).toString()}`}
            className={`px-2 py-1 rounded ${sort === 'price_asc' ? 'font-bold text-amber-600 dark:text-amber-400' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            Price: Low to High
          </Link>
          <span>•</span>
          <Link
            href={`/products?${new URLSearchParams({
              ...(categoryParam ? { category: categoryParam } : {}),
              ...(searchTerm ? { search: searchTerm } : {}),
              sort: 'price_desc',
            }).toString()}`}
            className={`px-2 py-1 rounded ${sort === 'price_desc' ? 'font-bold text-amber-600 dark:text-amber-400' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            Price: High to Low
          </Link>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {products.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            <SmartphoneIcon size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
            No devices found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            We couldn&apos;t find any pre-owned units matching your selected criteria. Try resetting the filters or speak to our hotline specialist.
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Reset All Filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id || product.slug} product={product} priority={index < 4} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          {hasPreviousPage && (
            <Link
              href={`/products?${new URLSearchParams({
                ...(categoryParam ? { category: categoryParam } : {}),
                ...(searchTerm ? { search: searchTerm } : {}),
                ...(minPrice !== undefined ? { minPrice: minPrice.toString() } : {}),
                ...(maxPrice !== undefined ? { maxPrice: maxPrice.toString() } : {}),
                ...(sort ? { sort } : {}),
                page: (pageNumber - 1).toString(),
              }).toString()}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              ← Previous
            </Link>
          )}

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Page {pageNumber} of {totalPages}
          </span>

          {hasNextPage && (
            <Link
              href={`/products?${new URLSearchParams({
                ...(categoryParam ? { category: categoryParam } : {}),
                ...(searchTerm ? { search: searchTerm } : {}),
                ...(minPrice !== undefined ? { minPrice: minPrice.toString() } : {}),
                ...(maxPrice !== undefined ? { maxPrice: maxPrice.toString() } : {}),
                ...(sort ? { sort } : {}),
                page: (pageNumber + 1).toString(),
              }).toString()}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
