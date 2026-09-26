'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/features/admin/api/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProductDetail, CategorySummary, ProductVariantSummary } from '@/features/catalog/types';
import type { UpdateProductInput } from '@/features/admin/types';

interface ProductEditFormProps {
  product: ProductDetail;
  categories: CategorySummary[];
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<UpdateProductInput>({
    name: product.title || product.name || '',
    slug: product.slug,
    basePrice: product.basePrice,
    originalPrice: product.originalPrice,
    description: product.description ?? '',
    categoryId: product.categoryId ?? '',
    isActive: true,
    isFeatured: false,
  });

  // Variant Management State
  const [variants, setVariants] = useState<ProductVariantSummary[]>(product.variants || []);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [variantForm, setVariantForm] = useState({
    sku: '',
    name: '',
    priceAdjustment: 0,
    initialStock: 0,
  });
  const [variantError, setVariantError] = useState<string | null>(null);
  const [isVariantSubmitting, setIsVariantSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'basePrice' || name === 'originalPrice'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const payload: UpdateProductInput = {
        ...formData,
        originalPrice: formData.originalPrice || undefined,
        categoryId: formData.categoryId || undefined,
        description: formData.description || undefined,
      };

      await adminApi.updateProduct(product.id, payload);
      setMessage({ text: 'Product updated successfully.', type: 'success' });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update product.';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.sku.trim() || !variantForm.name.trim()) {
      setVariantError('SKU and Variant Name are required.');
      return;
    }

    setIsVariantSubmitting(true);
    setVariantError(null);

    try {
      const res = await adminApi.addVariant(product.id, {
        sku: variantForm.sku.trim(),
        name: variantForm.name.trim(),
        priceAdjustment: Number(variantForm.priceAdjustment) || 0,
        initialStock: Math.max(0, parseInt(String(variantForm.initialStock), 10) || 0),
      });

      const newVariant: ProductVariantSummary = {
        id: res.variantId,
        sku: variantForm.sku.trim(),
        name: variantForm.name.trim(),
        priceAdjustment: Number(variantForm.priceAdjustment) || 0,
        price: formData.basePrice + (Number(variantForm.priceAdjustment) || 0),
        inStock: variantForm.initialStock > 0,
        availableQuantity: variantForm.initialStock,
      };

      setVariants((prev) => [...prev, newVariant]);
      setVariantForm({ sku: '', name: '', priceAdjustment: 0, initialStock: 0 });
      setIsAddingVariant(false);
      setMessage({ text: 'New variant added successfully.', type: 'success' });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add variant.';
      setVariantError(msg);
    } finally {
      setIsVariantSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (variants.length <= 1) {
      setMessage({ text: 'Cannot delete the only remaining variant. Every product must have at least one variant.', type: 'error' });
      return;
    }

    if (!confirm('Are you sure you want to deactivate this variant?')) {
      return;
    }

    try {
      await adminApi.deleteVariant(product.id, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      setMessage({ text: 'Variant deactivated successfully.', type: 'success' });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate variant.';
      setMessage({ text: msg, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Information */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Product Information</CardTitle>
            <Badge variant={formData.isActive ? 'success' : 'neutral'}>
              {formData.isActive ? 'Published' : 'Draft / Inactive'}
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used in URL: /products/{formData.slug || '...'}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description ?? ''}
                onChange={handleChange}
                placeholder="Detailed product description visible to customers..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Category */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="text-sm">Pricing & Classification</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Base Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Price (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="basePrice"
                  required
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Original Price (৳) <span className="text-slate-400 font-normal">(optional — for discount display)</span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId ?? ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="">— No Category —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility & Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Active (visible on storefront)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Featured (shown on homepage)
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Product Details Button */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => router.push('/admin/products')}
          >
            Back to Products
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="font-bold shadow-md shadow-indigo-500/20"
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Variants Management Card */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Product Variants ({variants.length})</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every product must have at least one active variant with its SKU and pricing adjustment.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAddingVariant(!isAddingVariant);
              setVariantError(null);
            }}
          >
            {isAddingVariant ? 'Cancel' : '+ Add Variant'}
          </Button>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {variantError && (
            <div className="rounded-xl p-3 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300">
              {variantError}
            </div>
          )}

          {/* Add Variant Inline Form */}
          {isAddingVariant && (
            <form onSubmit={handleAddVariant} className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                New Variant Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POLO-BLK-XL"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Variant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Extra Large - Black"
                    value={variantForm.name}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Price Adjustment (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variantForm.priceAdjustment}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, priceAdjustment: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={variantForm.initialStock}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, initialStock: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingVariant(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isVariantSubmitting}
                >
                  Save Variant
                </Button>
              </div>
            </form>
          )}

          {/* Existing Variants Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5">Variant Name</th>
                  <th className="px-4 py-2.5">Price Adjustment</th>
                  <th className="px-4 py-2.5">Final Price</th>
                  <th className="px-4 py-2.5">Stock</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {variants.map((v) => {
                  const adjustment = v.priceAdjustment ?? 0;
                  const finalPrice = formData.basePrice + adjustment;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-white">
                        {v.sku}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {v.name}
                      </td>
                      <td className="px-4 py-3">
                        {adjustment === 0 ? (
                          <span className="text-slate-400">৳0.00</span>
                        ) : adjustment > 0 ? (
                          <span className="text-emerald-600 font-semibold">+৳{adjustment.toFixed(2)}</span>
                        ) : (
                          <span className="text-rose-600 font-semibold">-৳{Math.abs(adjustment).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        ৳{finalPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {v.inStock ? (
                          <Badge variant="success">
                            {v.availableQuantity !== undefined ? `In Stock (${v.availableQuantity})` : 'In Stock'}
                          </Badge>
                        ) : (
                          <Badge variant="danger">Out of Stock</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={variants.length <= 1}
                          onClick={() => handleDeleteVariant(v.id)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                          title={variants.length <= 1 ? "Product must have at least one variant" : "Deactivate variant"}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
