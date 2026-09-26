'use client';

import React, { useSyncExternalStore } from 'react';
import { useCart } from '@/features/cart/context/cart-context';

const noopSubscribe = () => () => {};

export function CartTrigger() {
  const { totalItemCount, setIsCartOpen } = useCart();
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const count = isMounted ? totalItemCount : 0;

  return (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      aria-label={`Shopping Cart with ${count} items`}
      className="relative p-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm animate-scaleIn">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
