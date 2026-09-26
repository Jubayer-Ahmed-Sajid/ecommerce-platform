'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SearchIcon, ShieldCheckIcon, SpinnerIcon, CloseIcon, ArrowRightIcon } from '@/components/ui/icons';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import type { ProductSummary } from '@/features/catalog/types';
import { formatBdt } from '@/lib/formatting/currency';

const QUICK_TRENDS = [
  'iPhone 16 Pro Max',
  'iPhone 15 Pro',
  'MacBook Pro',
  'Sony Alpha',
  'Keychron Q1',
  'iPad Pro M4',
  'PlayStation 5',
];

export function InstantSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keystroke-based debounced live search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await catalogApi.getProducts({
          searchTerm: trimmed,
          pageSize: 5,
        });
        setResults(response.items || []);
        setTotalMatches(response.totalCount || 0);
      } catch {
        setResults([]);
        setTotalMatches(0);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  }, [router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      setIsOpen(false);
      router.push(`/products/${results[selectedIndex].slug}`);
    } else {
      handleSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalMatches(0);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={onSubmit} className="relative flex items-center w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(true);
            setSelectedIndex(-1);
            if (val.trim().length < 2) {
              setResults([]);
              setTotalMatches(0);
              setIsLoading(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search 10,000+ devices, laptops, cameras (live keystroke)..."
          className="w-full bg-zinc-100/90 border border-zinc-200/90 rounded-xl px-3.5 py-2 pl-9 pr-20 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-100"
        />

        <div className="absolute left-3 text-zinc-400 pointer-events-none">
          {isLoading ? (
            <div className="animate-spin text-amber-500">
              <SpinnerIcon size={14} />
            </div>
          ) : (
            <SearchIcon size={14} />
          )}
        </div>

        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
              aria-label="Clear search input"
            >
              <CloseIcon size={12} />
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-medium px-2.5 py-1 text-xs transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Instant Dropdown Suggestions & Live Keystroke Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-xl backdrop-blur-xl z-50 dark:border-zinc-800 dark:bg-zinc-900/95 animate-fadeIn max-h-[460px] overflow-y-auto">
          {/* Live Product Matches on Keystroke */}
          {query.trim().length >= 2 ? (
            <div>
              <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-zinc-400 uppercase mb-2 px-1">
                <span>Matching Devices ({totalMatches})</span>
                {isLoading && <span className="text-amber-500 normal-case">Searching live...</span>}
              </div>

              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((product, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <Link
                        key={product.id || product.slug}
                        href={`/products/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          {product.primaryImageUrl ? (
                            <Image
                              src={product.primaryImageUrl}
                              alt={product.title}
                              fill
                              className="object-cover p-1"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[8px] text-zinc-400">
                              N/A
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span>{product.categoryName || 'Certified Device'}</span>
                            {product.conditionGrade && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  {product.conditionGrade}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold tabular-nums text-zinc-950 dark:text-white">
                            {formatBdt(product.basePrice)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}

                  {/* View All Matches Footer */}
                  <button
                    type="button"
                    onClick={() => handleSearch(query)}
                    className="w-full mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-500 py-1.5 px-1 transition-colors"
                  >
                    <span>View all {totalMatches} results for &ldquo;{query}&rdquo;</span>
                    <ArrowRightIcon size={12} />
                  </button>
                </div>
              ) : !isLoading ? (
                <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  <p>No products found matching &ldquo;{query}&rdquo;.</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Try searching for &ldquo;iPhone&rdquo;, &ldquo;MacBook&rdquo;, or &ldquo;Sony&rdquo;.</p>
                </div>
              ) : null}
            </div>
          ) : (
            /* Quick Trends when input is empty or 1 character */
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase mb-2 px-1">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TRENDS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      handleSearch(tag);
                    }}
                    className="rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 text-xs font-medium transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon size={12} className="text-emerald-500" />
              <span>Certified 70-Point Hardware Lab Audit</span>
            </span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">10,000+ Units</span>
          </div>
        </div>
      )}
    </div>
  );
}
