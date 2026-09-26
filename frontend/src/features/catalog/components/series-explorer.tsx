import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';

export function SeriesExplorer() {
  const SERIES = [
    {
      title: 'iPhone 16 Series',
      slug: 'iphone-16-series',
      subtitle: 'A18 Pro • Camera Control',
      priceFrom: 'From ৳118,000',
      badge: 'Current Flagship',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'iPhone 15 Series',
      slug: 'iphone-15-series',
      subtitle: 'Titanium • USB-C • Dynamic Island',
      priceFrom: 'From ৳72,000',
      badge: 'Popular Choice',
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'iPhone 14 Series',
      slug: 'iphone-14-series',
      subtitle: '120Hz ProMotion • 48MP Camera',
      priceFrom: 'From ৳58,000',
      badge: 'Pro Performance',
      image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'iPhone 13 Series',
      slug: 'iphone-13-series',
      subtitle: 'A15 Bionic • Cinematic Mode',
      priceFrom: 'From ৳49,500',
      badge: 'Best Value',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Under ৳45k iPhones',
      slug: 'budget-flagships',
      subtitle: 'iPhone 11 & 12 • 100% Face ID OK',
      priceFrom: 'From ৳29,500',
      badge: 'Entry Level',
      image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'MacBooks & iPads',
      slug: 'macbooks-and-ipads',
      subtitle: 'Apple Silicon • Liquid Retina',
      priceFrom: 'From ৳56,000',
      badge: 'Certified',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2 border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
            Generations
          </span>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl mt-0.5">
            Explore By iPhone Series
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors inline-flex items-center gap-1"
        >
          <span>All Models</span>
          <ArrowRightIcon size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {SERIES.map((item) => (
          <Link
            key={item.title}
            href={`/products?category=${item.slug}`}
            className="apple-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 transition-all dark:border-zinc-800 dark:bg-zinc-900/80 text-center"
          >
            {/* Tag */}
            <div className="flex justify-center">
              <span className="rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                {item.badge}
              </span>
            </div>

            {/* Thumbnail */}
            <div className="relative my-3 aspect-square w-full overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-950 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Title & Price */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                {item.subtitle}
              </p>
              <div className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {item.priceFrom}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
