'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { OrderSummaryDto } from '@/features/orders/types';
import type { CustomerUser } from '@/lib/auth/session';
import { formatBdt } from '@/lib/formatting/currency';

interface CustomerOrdersListProps {
  initialOrders: OrderSummaryDto[];
  user: CustomerUser;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  PendingPayment: {
    label: 'Payment Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  Processing: {
    label: 'Processing',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  Shipped: {
    label: 'Shipped',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  },
  Delivered: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
};

export function CustomerOrdersList({ initialOrders, user }: CustomerOrdersListProps) {
  const [orders, setOrders] = useState<OrderSummaryDto[]>(initialOrders);
  const [phoneFilter, setPhoneFilter] = useState(user.phoneNumber || '');
  const [isSearching, setIsSearching] = useState(false);

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneFilter.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/orders/my-orders?phone=${encodeURIComponent(phoneFilter.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.items || []);
      }
    } catch {
      // Keep existing orders on error
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phone sync / Filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handlePhoneSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label htmlFor="phoneFilter" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Find Orders by Contact Number
            </label>
            <input
              id="phoneFilter"
              type="tel"
              placeholder="e.g. 017XXXXXXXX"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto mt-auto rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Sync Orders'}
          </button>
        </form>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Orders Placed Yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You haven&apos;t placed any orders yet under this account or phone number.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700"
            >
              Browse Catalog
            </Link>
            <Link
              href="/orders/track"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              Track by Order ID
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_BADGES[order.status] || {
              label: order.status,
              className: 'bg-slate-100 text-slate-700 border-slate-200',
            };
            const trackingUrl = `/orders/${encodeURIComponent(order.orderNumber)}?phone=${encodeURIComponent(order.customerPhone)}`;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(order.createdAtUtc).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Items</span>
                    <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                      {order.totalItemCount} {order.totalItemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Amount</span>
                    <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                      {formatBdt(order.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recipient Phone</span>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300 font-mono">
                      {order.customerPhone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Customer</span>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300 truncate">
                      {order.customerFullName}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={trackingUrl}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-600 dark:bg-white dark:text-slate-900 dark:hover:bg-indigo-400 dark:hover:text-white"
                  >
                    <span>View Tracking &amp; Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
