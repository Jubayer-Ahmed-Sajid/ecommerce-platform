'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../api/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, XIcon } from '@/components/ui/icons';
import type { OrderStatus, PaymentStatus } from '@/types/commerce';

interface OrderActionsPanelProps {
  orderId: string;
  currentStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
}

export function OrderActionsPanel({
  orderId,
  currentStatus,
  paymentStatus,
  paymentMethod,
  transactionId,
}: OrderActionsPanelProps) {
  const router = useRouter();

  const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setMessage(null);

    try {
      const res = await adminApi.updateOrderStatus(orderId, newStatus, notes || undefined);
      if (res.success) {
        setMessage({ text: 'Order status updated successfully.', type: 'success' });
        router.refresh();
      } else {
        setMessage({ text: res.message || 'Failed to update order status.', type: 'error' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status.';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleVerifyPayment = async (verified: boolean) => {
    setIsVerifyingPayment(true);
    setMessage(null);

    try {
      // In our design, orderId maps to payment record for this order
      const res = await adminApi.verifyPayment(orderId, {
        isVerified: verified,
        adminNotes: verified ? 'Verified in bKash/Nagad Merchant Portal' : 'Invalid Transaction ID',
      });

      if (res.success) {
        setMessage({
          text: verified ? 'Payment verified & recorded as Paid.' : 'Payment marked as Failed.',
          type: 'success',
        });
        router.refresh();
      } else {
        setMessage({ text: res.message || 'Failed to verify payment.', type: 'error' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error verifying payment.';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const isDelivered = currentStatus === 'Delivered';

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-xl p-3.5 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Status Transition Control */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm">Update Order Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <form onSubmit={handleStatusUpdate} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                disabled={isDelivered}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="PendingPayment">PendingPayment</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Internal Operational Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Dispatched via Steadfast Courier #9812..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isDelivered}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full font-bold"
              disabled={isDelivered || isUpdatingStatus}
              isLoading={isUpdatingStatus}
            >
              Update Order Status
            </Button>
            {isDelivered && (
              <p className="text-[11px] text-slate-400 italic">
                Delivered orders cannot be modified or cancelled.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Manual Payment Verification (for bKash / Nagad) */}
      {paymentMethod !== 'CashOnDelivery' && (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm">Manual Payment Verification</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 dark:bg-slate-800/50">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TrxID:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {transactionId || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-900 dark:text-white">{paymentStatus}</span>
              </div>
            </div>

            {paymentStatus === 'Pending' && (
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center justify-center gap-1.5"
                  disabled={isVerifyingPayment}
                  onClick={() => handleVerifyPayment(true)}
                >
                  <CheckIcon size={14} />
                  <span>Approve Payment</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50 border-rose-200 font-semibold flex items-center justify-center gap-1.5"
                  disabled={isVerifyingPayment}
                  onClick={() => handleVerifyPayment(false)}
                >
                  <XIcon size={14} />
                  <span>Reject</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
