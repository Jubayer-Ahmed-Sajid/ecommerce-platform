import React from 'react';
import { StorefrontHeader } from '@/components/layout/storefront-header';
import { StorefrontFooter } from '@/components/layout/storefront-footer';
import { CartProvider } from '@/features/cart/context/cart-context';
import { CartDrawer } from '@/features/cart/components/cart-drawer';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
        <StorefrontHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <StorefrontFooter />
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
