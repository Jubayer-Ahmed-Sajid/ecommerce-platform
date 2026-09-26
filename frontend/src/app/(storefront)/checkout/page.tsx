import React from 'react';
import type { Metadata } from 'next';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';

export const metadata: Metadata = {
  title: 'Secure Checkout | ShopBD Authentic E-commerce',
  description: 'Complete your purchase with Cash on Delivery or bKash mobile banking. Fast island-wide delivery across Bangladesh.',
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Complete Your Order
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enter your delivery details and choose your preferred payment method.
        </p>
      </div>

      <CheckoutForm />
    </div>
  );
}
