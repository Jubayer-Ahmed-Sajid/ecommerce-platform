'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductDetail, ProductVariantSummary } from '../types';
import { useCart } from '@/features/cart/context/cart-context';
import { formatBdt } from '@/lib/formatting/currency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VariantSelectorProps {
  product: ProductDetail;
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Default to first variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantSummary>(
    product.variants[0] || {
      id: product.id,
      sku: 'DEFAULT',
      name: 'Standard',
      price: product.basePrice,
      originalPrice: product.originalPrice,
      inStock: product.inStock,
    }
  );

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const isSoldOut = !selectedVariant.inStock;
  const hasDiscount = selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(((selectedVariant.originalPrice! - selectedVariant.price) / selectedVariant.originalPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    setIsAdding(true);

    const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.primaryImageUrl;

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        title: product.title,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        unitPrice: selectedVariant.price,
        imageUrl: primaryImg,
      },
      quantity
    );

    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;

    const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.primaryImageUrl;

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        title: product.title,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        unitPrice: selectedVariant.price,
        imageUrl: primaryImg,
      },
      quantity
    );

    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* Price & Stock Display */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatBdt(selectedVariant.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-slate-400 line-through dark:text-slate-500">
                {formatBdt(selectedVariant.originalPrice!)}
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                Save {discountPercent}%
              </span>
            </>
          )}
        </div>

        <div>
          {isSoldOut ? (
            <Badge variant="danger">
              Sold Out
            </Badge>
          ) : (
            <Badge variant="success">
              In Stock & Ready to Ship
            </Badge>
          )}
        </div>
      </div>

      {/* Variant Selection (if multiple variants exist) */}
      {product.variants.length > 1 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            Option: <span className="font-normal text-slate-600 dark:text-slate-300">{selectedVariant.name}</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => {
              const isSelected = v.id === selectedVariant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  disabled={!v.inStock}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-600/30 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : v.inStock
                      ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      : 'border-slate-200 bg-slate-50 text-slate-400 line-through cursor-not-allowed opacity-60 dark:border-slate-800 dark:bg-slate-800/50'
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector & Action Buttons */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            Quantity:
          </label>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              disabled={quantity <= 1 || isSoldOut}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              disabled={isSoldOut}
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSoldOut}
            onClick={handleAddToCart}
            className="w-full font-semibold border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
          >
            {isAdding ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Added to Cart!</span>
              </span>
            ) : (
              'Add to Cart'
            )}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={isSoldOut}
            onClick={handleBuyNow}
            className="w-full font-bold shadow-md shadow-indigo-500/20"
          >
            Buy Now (Cash on Delivery)
          </Button>
        </div>
      </div>
    </div>
  );
}
