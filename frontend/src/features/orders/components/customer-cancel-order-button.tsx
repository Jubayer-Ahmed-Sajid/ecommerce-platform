'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '../api/orders-api';
import { Button } from '@/components/ui/button';

interface CustomerCancelOrderButtonProps {
  orderNumber: string;
  phoneNumber: string;
}

export function CustomerCancelOrderButton({
  orderNumber,
  phoneNumber,
}: CustomerCancelOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await ordersApi.cancelOrder(orderNumber, phoneNumber, reason.trim() || undefined);
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/50"
      >
        Cancel Order
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cancel Order #{orderNumber}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to cancel this order? Reserved items will be released back to the store.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Changed my mind, ordered by mistake..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Keep Order
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleCancel}
                isLoading={isLoading}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
