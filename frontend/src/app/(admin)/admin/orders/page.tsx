import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/api/errors';
import { adminApi } from '@/features/admin/api/admin-api';
import { formatBdt } from '@/lib/formatting/currency';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderStatus } from '@/types/commerce';

export const metadata: Metadata = {
  title: 'Orders Management | ShopBD Console',
};

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: OrderStatus;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const resolved = await searchParams;
  const page = resolved.page ? parseInt(resolved.page, 10) : 1;
  const status = resolved.status;
  const search = resolved.search;

  let ordersResult;
  try {
    ordersResult = await adminApi.listOrders({
      status,
      searchTerm: search,
      page,
      pageSize: 20,
    });
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect('/admin/login');
    }
    ordersResult = {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const getStatusBadge = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case 'Delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'Shipped':
        return <Badge variant="brand">Shipped</Badge>;
      case 'Processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'PendingPayment':
        return <Badge variant="neutral">Pending</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{orderStatus}</Badge>;
    }
  };

  const statusFilters: { label: string; value?: OrderStatus }[] = [
    { label: 'All Orders' },
    { label: 'Pending', value: 'PendingPayment' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Order Lifecycle Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Process incoming orders, track shipments, and verify customer payments.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((tab) => {
            const isSelected = (!status && !tab.value) || status === tab.value;
            return (
              <Link
                key={tab.label}
                href={`/admin/orders${tab.value ? `?status=${tab.value}` : ''}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/orders" className="flex items-center gap-2 max-w-sm w-full">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by order# or phone..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Orders Table */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 p-5 dark:border-slate-800">
          <CardTitle className="text-base">
            Orders ({ordersResult.totalCount} total)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordersResult.items.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No orders found matching the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">Order Reference</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Phone</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold text-center">Items</th>
                    <th className="p-4 font-semibold">Total Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ordersResult.items.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {order.customerFullName}
                      </td>
                      <td className="p-4 font-mono text-slate-500 dark:text-slate-400">
                        {order.customerPhone}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAtUtc).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {order.totalItemCount}
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
