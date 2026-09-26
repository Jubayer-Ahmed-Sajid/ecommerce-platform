import React from 'react';
import Link from 'next/link';
import { CartTrigger } from './cart-trigger';
import { UserNav } from './user-nav';
import { InstantSearch } from './instant-search';
import {
  PhoneIcon,
  MapPinIcon,
  RefreshCwIcon,
  MessageCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@/components/ui/icons';

export function StorefrontHeader() {
  return (
    <>
      {/* Top Pre-Owned Trust & Branch Announcement Bar */}
      <div className="bg-zinc-950 text-zinc-300 text-[11px] font-medium tracking-normal py-2 px-4 border-b border-zinc-800/80">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          {/* Hotline & Physical Stores */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <PhoneIcon size={12} className="text-amber-400" />
              <a href="tel:+8801800478673" className="hover:text-white transition-colors">
                Hotline: <strong className="text-white font-semibold">01800-iSTORE (478673)</strong>
              </a>
            </span>
            <span className="hidden lg:inline text-zinc-700">•</span>
            <span className="hidden lg:flex items-center gap-1.5 text-zinc-400">
              <MapPinIcon size={12} className="text-zinc-500" />
              <span>
                Stores: <strong className="text-zinc-200 font-medium">Bashundhara City (L-5)</strong> &amp;{' '}
                <strong className="text-zinc-200 font-medium">Jamuna Future Park (L-4)</strong>
              </span>
            </span>
          </div>

          {/* Quick Badges & Trade-in Link */}
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheckIcon size={13} className="text-emerald-400" />
              <span>7-Day Replacement Guarantee</span>
            </span>
            <Link
              href="/#trade-in"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 px-2.5 py-0.5 text-[11px] font-medium transition-colors"
            >
              <RefreshCwIcon size={11} className="text-amber-400" />
              <span>Exchange Old Phone</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Precision Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl transition-all duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/95 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs border border-zinc-800/60 dark:border-zinc-200/60">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.77-7.94-12.24-14.59-6.3-9.35-11.22-20.15-14.75-32.39-3.53-12.24-5.3-23.77-5.3-34.58 0-14.77 3.73-26.68 11.2-35.73 7.46-9.05 16.7-13.67 27.72-13.88 4.8 0 10.15 1.25 16.05 3.75 5.9 2.5 9.77 3.86 11.61 4.08 2.29-.33 6.46-1.78 12.52-4.35 6.05-2.58 11.24-3.75 15.57-3.52 11.53.54 20.89 4.89 28.08 13.06-9.8 5.98-14.59 14.35-14.36 25.11.23 8.37 3.48 15.34 9.76 20.91 6.27 5.58 13.58 8.78 21.94 9.61-2.41 7.27-5.69 15.11-9.84 23.53zM119.22 31.84c0-7.39 2.68-14.28 8.04-20.67 5.37-6.38 11.83-10.45 19.39-12.17.65 1.52.98 3.15.98 4.89 0 7.39-2.79 14.39-8.37 20.98-5.58 6.6-12.14 10.59-19.68 11.97-.22-1.63-.36-3.3-.36-5z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
                  iStore<span className="text-amber-600 dark:text-amber-400">BD</span>
                </span>
                <span className="rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 px-1.5 py-0.2 text-[9px] font-semibold tracking-wide">
                  Certified
                </span>
              </div>
              <span className="text-[10px] font-medium text-zinc-400 -mt-0.5">
                Pre-Owned Apple Marketplace
              </span>
            </div>
          </Link>

          {/* Central Instant Search */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <InstantSearch />
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* WhatsApp Specialist Link */}
            <a
              href="https://wa.me/8801976478673"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <MessageCircleIcon size={14} className="text-emerald-500" />
              <span>WhatsApp</span>
            </a>

            <Link
              href="/orders/track"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors hidden sm:inline-flex items-center gap-1.5 dark:text-zinc-400 dark:hover:text-white px-2 py-1.5"
            >
              <TruckIcon size={14} className="text-zinc-500" />
              <span>Track Order</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <UserNav />
            <CartTrigger />
          </div>
        </div>

        {/* Categories Bar (Sub-Navigation) */}
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-2 dark:border-zinc-800/60 dark:bg-zinc-900/40 overflow-x-auto scrollbar-none">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5 sm:gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
            <Link
              href="/products"
              className="rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-3 py-1 text-xs font-medium transition-colors"
            >
              All Models
            </Link>
            <Link
              href="/products?category=iphone-16-series"
              className="rounded-lg hover:bg-zinc-200/70 hover:text-zinc-900 px-3 py-1 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              iPhone 16 Series
            </Link>
            <Link
              href="/products?category=iphone-15-series"
              className="rounded-lg hover:bg-zinc-200/70 hover:text-zinc-900 px-3 py-1 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              iPhone 15 Series
            </Link>
            <Link
              href="/products?category=iphone-14-series"
              className="rounded-lg hover:bg-zinc-200/70 hover:text-zinc-900 px-3 py-1 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              iPhone 14 Series
            </Link>
            <Link
              href="/products?category=iphone-13-series"
              className="rounded-lg hover:bg-zinc-200/70 hover:text-zinc-900 px-3 py-1 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              iPhone 13 Series
            </Link>
            <Link
              href="/products?category=budget-flagships"
              className="rounded-lg hover:bg-zinc-200/70 hover:text-zinc-900 px-3 py-1 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white text-amber-700 dark:text-amber-400"
            >
              Under ৳45,000
            </Link>
            <Link
              href="/products?category=macbooks-and-ipads"
              className="rounded-lg hover:bg-zinc-200/70 hover:text-zinc-900 px-3 py-1 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              MacBooks &amp; iPads
            </Link>
            <Link
              href="/#trade-in"
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 ml-auto transition-colors"
            >
              <RefreshCwIcon size={11} className="text-amber-600 dark:text-amber-400" />
              <span>Trade-In Valuation</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 md:hidden bg-white dark:bg-zinc-950">
          <InstantSearch />
        </div>
      </header>
    </>
  );
}
