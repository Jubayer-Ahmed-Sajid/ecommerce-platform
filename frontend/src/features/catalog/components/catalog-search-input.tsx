'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon, CloseIcon, SpinnerIcon } from '@/components/ui/icons';

interface CatalogSearchInputProps {
  initialValue?: string;
  categoryParam?: string;
}

export function CatalogSearchInput({ initialValue = '', categoryParam }: CatalogSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  // Adjust state during render if prop changes externally
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setSearchTerm(initialValue);
  }

  const updateSearchUrl = useCallback(
    (query: string) => {
      startTransition(() => {
        const currentParams = new URLSearchParams(searchParams.toString());
        
        // Reset page back to 1 on new search
        currentParams.delete('page');

        if (query.trim()) {
          currentParams.set('search', query.trim());
        } else {
          currentParams.delete('search');
        }

        if (categoryParam) {
          currentParams.set('category', categoryParam);
        }

        const queryString = currentParams.toString();
        const targetUrl = queryString ? `/products?${queryString}` : '/products';
        router.replace(targetUrl, { scroll: false });
      });
    },
    [router, searchParams, categoryParam]
  );

  // Debounce keystrokes by 300ms
  useEffect(() => {
    // If the searchTerm matches the current URL parameter, don't trigger unnecessary push
    const currentUrlSearch = searchParams.get('search') || '';
    if (searchTerm === currentUrlSearch) {
      return;
    }

    const timer = setTimeout(() => {
      updateSearchUrl(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, updateSearchUrl]);

  const handleClear = () => {
    setSearchTerm('');
    updateSearchUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateSearchUrl(searchTerm);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="relative flex items-center gap-2 max-w-md w-full">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by model, storage, specs (live keystroke)..."
          className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
          aria-label="Search catalog products"
        />

        {/* Search Icon */}
        <div className="absolute left-3.5 top-3 text-zinc-400 pointer-events-none">
          <SearchIcon size={14} />
        </div>

        {/* Loading Spinner or Clear Button */}
        <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
          {isPending && (
            <div className="animate-spin text-amber-500">
              <SpinnerIcon size={14} />
            </div>
          )}
          {searchTerm && !isPending && (
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded-full transition-colors"
              aria-label="Clear search input"
            >
              <CloseIcon size={12} />
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => updateSearchUrl(searchTerm)}
        className="rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 text-xs transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
      >
        <span>Search</span>
      </button>
    </div>
  );
}
