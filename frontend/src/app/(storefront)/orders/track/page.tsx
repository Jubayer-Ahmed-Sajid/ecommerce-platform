import React from 'react';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OrderTrackingForm } from '@/features/orders/components/order-tracking-form';

export const metadata: Metadata = {
  title: 'Track Your Order | ShopBD Authentic E-commerce',
  description: 'Enter your order number and mobile phone number to view real-time delivery status and courier updates.',
};

export default function OrderTrackingPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:py-20">
      <Card className="shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Track Your Order</CardTitle>
          <CardDescription>
            Enter your order reference and registered phone number to view live delivery status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTrackingForm />
        </CardContent>
      </Card>
    </div>
  );
}
