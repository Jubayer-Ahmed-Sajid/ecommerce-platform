import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/api/errors';
import { adminApi } from '@/features/admin/api/admin-api';
import { formatBdt } from '@/lib/formatting/currency';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSignIcon,
  BoxIcon,
  ClockIcon,
  AlertTriangleIcon,
} from '@/components/ui/icons';
import type { OrderStatus } from '@/types/commerce';

export const metadata: Metadata = {
  title: 'Admin Dashboard | iStoreBD Console',
};

export default async function AdminDashboardPage() {
  let metrics;
  let recentOrdersResult;

  try {
    [metrics, recentOrdersResult] = await Promise.all([
      adminApi.getDashboardMetrics(),
      adminApi.listOrders({ page: 1, pageSize: 5 }),
    ]);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect('/admin/login');
    }
    metrics = {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      pendingPayments: 0,
      lowStockCount: 0,
    };
    recentOrdersResult = {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 5,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'Shipped':
        return <Badge variant="brand">Shipped</Badge>;
      case 'Processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'PendingPayment':
        return <Badge variant="neutral">Pending Confirmation</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Overview Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time business performance, order pipelines, and stock status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            + New Product
          </Link>
          <Link
            href="/admin/orders"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                Total Revenue
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <DollarSignIcon size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
              {formatBdt(metrics.totalRevenue)}
            </div>
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Authoritatively calculated
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                Total Orders
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <BoxIcon size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
              {metrics.totalOrders}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Lifetime customer purchases
            </p>
          </CardContent>
        </Card>

        {/* Pending Processing */}
        <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                Pending Orders
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <ClockIcon size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {metrics.pendingOrders}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Require packaging or dispatch
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                Low Stock Alerts
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertTriangleIcon size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {metrics.lowStockCount}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Items at or below 5 units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 p-5 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest incoming customer transactions
            </p>
          </div>
          <Link
            href="/admin/orders"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            View All Orders →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrdersResult.items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No orders registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">Order Number</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Phone</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentOrdersResult.items.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                        {order.customerFullName}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {order.customerPhone}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAtUtc).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {formatBdt(order.totalAmount)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
