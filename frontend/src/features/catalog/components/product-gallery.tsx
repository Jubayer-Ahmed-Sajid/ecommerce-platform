'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ProductImageSummary } from '../types';

interface ProductGalleryProps {
  images: ProductImageSummary[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const primaryIndex = sortedImages.findIndex((img) => img.isPrimary);
  const [selectedIndex, setSelectedIndex] = useState(primaryIndex > -1 ? primaryIndex : 0);

  const activeImage = sortedImages[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText || title}
            fill
            priority
            className="object-cover transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
            No Image Available
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `${title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
