'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/features/admin/api/admin-api';
import type { CategorySummary } from '@/features/catalog/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductCreateFormProps {
  categories: CategorySummary[];
}

export function ProductCreateForm({ categories }: ProductCreateFormProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [basePrice, setBasePrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variantName, setVariantName] = useState('Standard');
  const [variantSku, setVariantSku] = useState('');
  const [initialStock, setInitialStock] = useState('10');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);

    // Auto-suggest SKU if empty
    if (!variantSku && val.trim().length > 2) {
      const initials = val.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
      setVariantSku(`${initials}-001`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      setErrorMessage('Please enter a valid base price.');
      return;
    }

    const stock = parseInt(initialStock, 10);
    if (isNaN(stock) || stock < 0) {
      setErrorMessage('Please enter a valid stock quantity.');
      return;
    }

    if (!variantSku.trim()) {
      setErrorMessage('Variant SKU is mandatory.');
      return;
    }

    setIsSubmitting(true);

    try {
      await adminApi.createProduct({
        name: name.trim(),
        slug: slug.trim(),
        basePrice: price,
        originalPrice: originalPrice.trim() ? parseFloat(originalPrice) : undefined,
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        isFeatured: false,
        variants: [
          {
            name: variantName.trim() || 'Standard',
            sku: variantSku.trim().toUpperCase(),
            priceDelta: 0,
            initialStock: stock,
          },
        ],
        images: imageUrl.trim()
          ? [
              {
                url: imageUrl.trim(),
                isPrimary: true,
                displayOrder: 0,
              },
            ]
          : [],
      });

      router.push('/admin/products');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create product.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Basic Product Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Title"
            required
            placeholder="e.g. Ergonomic Wireless Mouse"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <Input
            label="URL Slug (Auto-generated)"
            required
            placeholder="e.g. ergonomic-wireless-mouse"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Base Selling Price (৳ BDT)"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="e.g. 1450.00"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />

          <Input
            label="Comparison Price (৳ Strike-through, Optional)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 1850.00"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Detailed description of features, materials, and warranty..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Initial Variant & Stock */}
      <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Initial Variant & Inventory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every product requires at least one variant. Initial stock is tracked authoritatively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Variant Name"
            required
            placeholder="e.g. Standard, Size M, or Blue"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
          />

          <Input
            label="Unique SKU"
            required
            placeholder="e.g. MOUSE-001"
            value={variantSku}
            onChange={(e) => setVariantSku(e.target.value)}
          />

          <Input
            label="Initial Stock Quantity"
            type="number"
            min="0"
            required
            placeholder="10"
            value={initialStock}
            onChange={(e) => setInitialStock(e.target.value)}
          />
        </div>
      </div>

      {/* Product Image */}
      <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Primary Image
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Provide a direct image URL (or uploaded media URL) for the primary storefront display.
          </p>
        </div>

        <Input
          label="Image URL"
          placeholder="https://images.unsplash.com/... or /uploads/..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="font-bold"
          isLoading={isSubmitting}
        >
          Publish Product
        </Button>
      </div>
    </form>
  );
}
