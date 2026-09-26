'use client';

import React, { useState, useMemo } from 'react';
import type { ProductSummary } from '../types';
import { ProductCard } from './product-card';
import Link from 'next/link';
import {
  FlameIcon,
  BatteryChargingIcon,
  SmartphoneIcon,
  SparklesIcon,
  BoxIcon,
  ArrowRightIcon,
  SearchIcon,
} from '@/components/ui/icons';

interface LiveDeviceInventoryProps {
  initialProducts: ProductSummary[];
}

type FilterTab = 'all' | 'hot-deals' | 'battery-90' | 'dual-sim' | 'pro-models' | 'with-box';

export function LiveDeviceInventory({ initialProducts }: LiveDeviceInventoryProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by active tab
    if (activeTab === 'hot-deals') {
      result = result.filter((p) => p.basePrice <= 60000);
    } else if (activeTab === 'battery-90') {
      result = result.filter((p) => p.batteryHealth && p.batteryHealth >= 90);
    } else if (activeTab === 'dual-sim') {
      result = result.filter((p) => p.regionVariant?.includes('Dual') || p.regionVariant?.includes('ZA/A'));
    } else if (activeTab === 'pro-models') {
      result = result.filter((p) => p.title.toLowerCase().includes('pro'));
    } else if (activeTab === 'with-box') {
      result = result.filter((p) => p.boxIncluded);
    }

    // Filter by quick text search
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.storage?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialProducts, activeTab, searchFilter]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
            Available Devices
          </span>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl mt-0.5">
            Verified Pre-Owned Inventory
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Showing {filteredProducts.length} certified units available for same-day dispatch in Dhaka &amp; nationwide courier.
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter models (e.g. 256GB)..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 pl-9 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-100"
          />
          <div className="absolute left-3 top-2.5 text-zinc-400 pointer-events-none">
            <SearchIcon size={13} />
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          All Certified ({initialProducts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hot-deals')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'hot-deals'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          <FlameIcon size={12} className={activeTab === 'hot-deals' ? 'text-amber-400' : 'text-zinc-500'} />
          <span>Under ৳60,000</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('battery-90')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'battery-90'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          <BatteryChargingIcon size={12} className={activeTab === 'battery-90' ? 'text-emerald-400' : 'text-zinc-500'} />
          <span>90%+ Battery Health</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dual-sim')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'dual-sim'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          <SmartphoneIcon size={12} />
          <span>Dual Physical SIM (ZA/A)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pro-models')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'pro-models'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          <SparklesIcon size={12} />
          <span>Pro &amp; Pro Max</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('with-box')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'with-box'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          <BoxIcon size={12} />
          <span>With Original Box</span>
        </button>
      </div>

      {/* Grid of Product Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <div className="flex justify-center mb-3 text-zinc-400">
            <SearchIcon size={28} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            No devices matched your active filter
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Try adjusting your search terms or view our full pre-owned inventory.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchFilter('');
            }}
            className="mt-4 rounded-lg bg-zinc-900 text-white px-4 py-2 text-xs font-medium dark:bg-zinc-100 dark:text-zinc-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Bottom Inventory CTA */}
      <div className="pt-2 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 px-6 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 shadow-xs transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          <span>View Full Pre-Owned Catalog ({initialProducts.length}+ Models)</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
  );
}
