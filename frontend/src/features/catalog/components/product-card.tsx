import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProductSummary } from '../types';
import { formatBdt } from '@/lib/formatting/currency';
import {
  BatteryChargingIcon,
  BoxIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
} from '@/components/ui/icons';

interface ProductCardProps {
  product: ProductSummary;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.basePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.basePrice) / product.originalPrice!) * 100)
    : 0;

  // Monthly 36-month EMI approximation if not explicitly provided
  const emiPerMonth = product.emiStartsAt || Math.round(product.basePrice / 36);

  return (
    <div className="apple-card group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* Product Image & Badges */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 block"
      >
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.title}
            fill
            priority={priority}
            className="object-cover p-3 transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
            No Image Available
          </div>
        )}

        {/* Ambient Overlay on Hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none gap-1.5">
          {product.conditionGrade ? (
            <span className="rounded-md bg-zinc-950/80 text-zinc-200 border border-zinc-700/80 px-2 py-0.5 text-[10px] font-medium tracking-wide backdrop-blur-md">
              {product.conditionGrade}
            </span>
          ) : hasDiscount ? (
            <span className="rounded-md bg-rose-600 text-white px-2 py-0.5 text-[10px] font-medium tracking-wide">
              Save {discountPercentage}%
            </span>
          ) : <span />}

          {/* Battery Health or In-Stock Status */}
          {product.batteryHealth ? (
            <span className="rounded-md bg-zinc-950/80 text-emerald-400 border border-zinc-700/80 px-2 py-0.5 text-[10px] font-medium backdrop-blur-md flex items-center gap-1">
              <BatteryChargingIcon size={11} className="text-emerald-400" />
              <span>{product.batteryHealth}%</span>
            </span>
          ) : (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide ${
                product.inStock
                  ? 'bg-zinc-900/80 text-emerald-400 border border-zinc-700'
                  : 'bg-zinc-900/80 text-rose-400 border border-zinc-700'
              }`}
            >
              {product.inStock ? 'Available' : 'Sold Out'}
            </span>
          )}
        </div>

        {/* Region & Diagnostic Badge Strip */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-medium">
          {product.regionVariant ? (
            <span className="rounded bg-white/90 text-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 px-2 py-0.5 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs">
              {product.regionVariant}
            </span>
          ) : <span />}

          <span className="rounded bg-zinc-900/90 text-emerald-400 border border-zinc-700/80 px-1.5 py-0.5 text-[9px] font-medium flex items-center gap-1 backdrop-blur-md">
            <CheckIcon size={10} className="text-emerald-400" />
            <span>70-Pt Tested</span>
          </span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Box memo info */}
        <div className="flex items-center justify-between mb-1 text-[11px]">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            {product.categoryName || 'Pre-Owned iPhone'}
          </span>
          {product.boxIncluded && (
            <span className="text-zinc-600 dark:text-zinc-300 font-medium inline-flex items-center gap-1">
              <BoxIcon size={11} className="text-zinc-400" />
              <span>With Box</span>
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-1 transition-colors group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400">
          <Link href={`/products/${product.slug}`}>
            {product.title}
          </Link>
        </h3>

        {/* Warranty Tag */}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <ShieldCheckIcon size={12} className="text-emerald-500 shrink-0" />
          <span className="truncate">{product.warrantyText || '7D Replace + 2Y Free Service'}</span>
        </div>

        {/* Pricing & EMI Section */}
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tabular-nums">
                {formatBdt(product.basePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-400 line-through dark:text-zinc-500 font-normal tabular-nums">
                  {formatBdt(product.originalPrice!)}
                </span>
              )}
            </div>

            {hasDiscount && (
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                Save {formatBdt(product.originalPrice! - product.basePrice)}
              </span>
            )}
          </div>

          {/* EMI Indicator */}
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400">
              EMI from <strong className="text-zinc-800 dark:text-zinc-200 font-medium tabular-nums">{formatBdt(emiPerMonth)}/mo</strong>
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="font-medium text-zinc-700 group-hover:text-zinc-950 dark:text-zinc-300 dark:group-hover:text-white transition-colors inline-flex items-center gap-0.5"
            >
              <span>View</span>
              <ArrowRightIcon size={10} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
