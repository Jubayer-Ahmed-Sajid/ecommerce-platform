import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ordersApi } from '@/features/orders/api/orders-api';
import { OrderActionsPanel } from '@/features/admin/components/order-actions-panel';
import { formatBdt } from '@/lib/formatting/currency';

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Order Details — Admin | BDT Shop',
  robots: { index: false },
};

const STATUS_BADGE: Record<string, string> = {
  PendingPayment: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Pending: 'text-amber-600 dark:text-amber-400',
  Paid: 'text-emerald-600 dark:text-emerald-400',
  Failed: 'text-rose-600 dark:text-rose-400',
  Refunded: 'text-slate-500 dark:text-slate-400',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CashOnDelivery: 'Cash on Delivery',
  BkashManual: 'bKash (Manual TrxID)',
  NagadManual: 'Nagad (Manual TrxID)',
  RocketManual: 'Rocket (Manual TrxID)',
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;

  let order;
  try {
    order = await ordersApi.getOrderById(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors dark:text-slate-400"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Placed{' '}
            {new Date(order.createdAtUtc).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold ${STATUS_BADGE[order.status] ?? ''}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content — 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Order Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)} units)
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      SKU: <span className="font-mono">{item.sku}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBdt(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatBdt(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-2 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatBdt(order.subTotal)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {order.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold dark:text-emerald-400">FREE</span>
                  ) : (
                    formatBdt(order.shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 pt-2 dark:border-slate-700">
                <span>Order Total</span>
                <span>{formatBdt(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Customer
              </h2>
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {order.customerFullName}
                </p>
                <p className="text-slate-600 dark:text-slate-400">{order.customerPhone}</p>
                {order.customerEmail && (
                  <p className="text-slate-600 dark:text-slate-400 text-xs">{order.customerEmail}</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Delivery Address
              </h2>
              <div className="space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
                <p>{order.shippingAddress.addressLine}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.division}
                  {order.shippingAddress.postalCode
                    ? ` — ${order.shippingAddress.postalCode}`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payment Details
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Method</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className={`font-bold ${PAYMENT_STATUS_COLORS[order.payment.status] ?? ''}`}>
                  {order.payment.status}
                </p>
              </div>
              {order.payment.transactionId && (
                <div>
                  <p className="text-xs text-slate-400">Transaction ID</p>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">
                    {order.payment.transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
              <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Customer Notes
              </h2>
              <p className="text-sm text-amber-900 dark:text-amber-200">{order.customerNotes}</p>
            </div>
          )}
        </div>

        {/* Right Sidebar — Admin Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <OrderActionsPanel
              orderId={order.id}
              currentStatus={order.status}
              paymentStatus={order.payment.status}
              paymentMethod={order.payment.method}
              transactionId={order.payment.transactionId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
