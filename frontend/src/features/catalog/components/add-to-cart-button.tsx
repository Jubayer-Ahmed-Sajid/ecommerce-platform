'use client';

import React, { useState } from 'react';
import { useCart } from '@/features/cart/context/cart-context';
import { Button } from '@/components/ui/button';
import type { CartItem } from '@/features/cart/types';

interface AddToCartButtonProps {
  item: Omit<CartItem, 'quantity'>;
  quantity?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function AddToCartButton({
  item,
  quantity = 1,
  className,
  size = 'md',
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    addItem(item, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  return (
    <Button
      type="button"
      variant={justAdded ? 'secondary' : 'primary'}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      aria-label={`Add ${item.title} to shopping cart`}
    >
      {disabled ? (
        'Out of Stock'
      ) : justAdded ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Added!</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add to Cart</span>
        </span>
      )}
    </Button>
  );
}
