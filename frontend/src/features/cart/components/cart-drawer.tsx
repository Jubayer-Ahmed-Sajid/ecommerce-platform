'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/cart-context';
import { formatBdt } from '@/lib/formatting/currency';
import { buttonVariants } from '@/components/ui/button';
import {
  ShoppingBagIcon,
  CheckIcon,
  ShieldCheckIcon,
  LockIcon,
  ArrowRightIcon,
} from '@/components/ui/icons';

const FREE_SHIPPING_THRESHOLD = 2000;

export function CartDrawer() {
  const {
    items,
    totalItemCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
  } = useCart();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col dark:bg-[#0c0e14]/95 border-l border-slate-200/80 dark:border-slate-800/80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 dark:border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Your Selection
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Shopping Cart</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {totalItemCount}
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Liquid Free Shipping Progress Indicator */}
          <div className="border-b border-slate-100 bg-amber-50/40 px-6 py-3.5 dark:border-slate-800/60 dark:bg-amber-950/20">
            {remainingForFreeShipping > 0 ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Add <strong className="text-amber-700 dark:text-amber-400 font-bold">{formatBdt(remainingForFreeShipping)}</strong> for Free Delivery
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {progressPercent}%
                </span>
              </div>
            ) : (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckIcon size={14} className="text-emerald-500" />
                <span>Complimentary Delivery Unlocked!</span>
              </p>
            )}
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-zinc-200/80 overflow-hidden dark:bg-zinc-800">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  progressPercent >= 100
                    ? 'bg-emerald-500'
                    : 'bg-zinc-900 dark:bg-zinc-100'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List or Empty State */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
                  <ShoppingBagIcon size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Your cart is empty</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                    Explore our certified pre-owned iPhones and genuine accessories.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setIsCartOpen(false)}
                  className={buttonVariants({ variant: 'primary', className: 'rounded-full px-6 font-semibold flex items-center gap-1.5' })}
                >
                  <span>Explore Catalog</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 py-4 group">
                    {/* Item Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 font-medium">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 dark:text-white leading-snug">
                            {item.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            aria-label={`Remove ${item.title}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.variantName}
                        </p>
                        <p className="text-xs font-extrabold text-slate-900 mt-1.5 dark:text-slate-100">
                          {formatBdt(item.unitPrice)}
                        </p>
                      </div>

                      {/* Tactile Quantity Selector */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/60 dark:border-slate-800/40">
                        <div className="flex items-center rounded-lg border border-slate-200/80 bg-slate-50/50 p-0.5 dark:border-slate-700/80 dark:bg-slate-800/50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-slate-600 hover:bg-white hover:shadow-xs active:scale-90 transition-all dark:text-slate-300 dark:hover:bg-slate-700"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-slate-600 hover:bg-white hover:shadow-xs active:scale-90 transition-all dark:text-slate-300 dark:hover:bg-slate-700"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {formatBdt(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="border-t border-zinc-200/80 p-6 space-y-4 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-base font-bold text-zinc-900 dark:text-white">
                  <span>Subtotal</span>
                  <span className="text-lg font-bold tracking-tight">{formatBdt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span>{remainingForFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className={buttonVariants({
                    variant: 'primary',
                    size: 'lg',
                    className:
                      'w-full h-12 rounded-full font-semibold transition-all duration-200 hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2',
                  })}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRightIcon size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center text-xs font-medium text-zinc-500 hover:text-zinc-800 py-1 transition-colors dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon size={14} className="text-zinc-400 dark:text-zinc-500" />
                  <span>Cash on Delivery</span>
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="flex items-center gap-1.5">
                  <LockIcon size={14} className="text-zinc-400 dark:text-zinc-500" />
                  <span>Server-Verified</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
