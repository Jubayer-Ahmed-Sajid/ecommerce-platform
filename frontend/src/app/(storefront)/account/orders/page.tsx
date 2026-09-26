import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentCustomerUser } from '@/lib/auth/session';
import { apiClient } from '@/lib/api/client';
import type { PagedResult } from '@/types/api';
import type { OrderSummaryDto } from '@/features/orders/types';
import { CustomerOrdersList } from '@/features/customer/components/customer-orders-list';

export const metadata: Metadata = {
  title: 'My Orders | ShopBD',
  description: 'View your order history, delivery progress, and tracking details.',
  robots: { index: false },
};

export default async function CustomerOrdersPage() {
  const user = await getCurrentCustomerUser();

  if (!user) {
    redirect('/login?redirect=/account/orders');
  }

  let initialOrders: OrderSummaryDto[] = [];

  try {
    const searchFilter = user.phoneNumber || user.email || user.fullName;
    const result = await apiClient<PagedResult<OrderSummaryDto>>('/admin/orders', {
      params: {
        searchTerm: searchFilter,
        pageSize: 50,
      },
      cache: 'no-store',
    });

    initialOrders = (result.items || []).filter((order) => {
      const matchesPhone = user.phoneNumber && order.customerPhone.includes(user.phoneNumber);
      const matchesName = user.fullName && order.customerFullName.toLowerCase() === user.fullName.toLowerCase();
      return matchesPhone || matchesName || !searchFilter;
    });
  } catch {
    initialOrders = [];
  }

  const initial = user.fullName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Account Profile Header */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white shadow-lg shadow-indigo-600/30">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {user.fullName}
                </h1>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user.email}
              </p>
              {user.phoneNumber && (
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                  📞 {user.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/orders/track"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-slate-400">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              <span>Track Single Order</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex border-b border-slate-100 dark:border-slate-800">
          <Link
            href="/account/orders"
            className="border-b-2 border-indigo-600 pb-3 text-xs font-bold text-indigo-600 dark:text-indigo-400"
          >
            Order History ({initialOrders.length})
          </Link>
        </div>
      </div>

      {/* Orders List Component */}
      <CustomerOrdersList initialOrders={initialOrders} user={user} />
    </div>
  );
}
