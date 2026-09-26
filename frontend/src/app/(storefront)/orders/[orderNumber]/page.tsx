import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ordersApi } from '@/features/orders/api/orders-api';
import { CustomerCancelOrderButton } from '@/features/orders/components/customer-cancel-order-button';
import { formatBdt } from '@/lib/formatting/currency';
import { CheckIcon } from '@/components/ui/icons';

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ phone?: string }>;
}

export const metadata: Metadata = {
  title: 'Order Details | iStoreBD',
  description: 'View the verified hardware status and shipment progress of your certified order.',
  robots: { index: false },
};

const ORDER_STATUS_STEPS = [
  'PendingPayment',
  'Processing',
  'Shipped',
  'Delivered',
] as const;

const STATUS_LABELS: Record<string, string> = {
  PendingPayment: 'Payment Pending',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  PendingPayment: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800',
  Processing: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800',
  Shipped: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950 dark:border-indigo-800',
  Delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800',
  Cancelled: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950 dark:border-rose-800',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Pending: 'text-amber-700 dark:text-amber-300',
  Paid: 'text-emerald-700 dark:text-emerald-300',
  Failed: 'text-rose-700 dark:text-rose-300',
  Refunded: 'text-slate-500 dark:text-slate-400',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CashOnDelivery: 'Cash on Delivery',
  BkashManual: 'bKash (Manual)',
  NagadManual: 'Nagad (Manual)',
  RocketManual: 'Rocket (Manual)',
};

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const { orderNumber } = await params;
  const { phone } = await searchParams;

  if (!phone) {
    notFound();
  }

  let order;
  try {
    order = await ordersApi.trackOrder(orderNumber, phone);
  } catch {
    notFound();
  }

  const isCancelled = order.status === 'Cancelled';
  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(
    order.status as (typeof ORDER_STATUS_STEPS)[number]
  );
  const canCancel = order.status === 'PendingPayment';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back navigation */}
      <Link
        href="/orders/track"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        ← Back to Order Tracking
      </Link>

      {/* Order header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Placed on{' '}
            {new Date(order.createdAtUtc).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLORS[order.status] ?? ''}`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {canCancel && (
            <CustomerCancelOrderButton
              orderNumber={order.orderNumber}
              phoneNumber={order.customerPhone}
            />
          )}
        </div>
      </div>

      {/* Order progress tracker (hidden for cancelled) */}
      {!isCancelled && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative flex items-center justify-between">
            {/* Progress line background */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-100 dark:bg-slate-800" />
            {/* Progress line filled */}
            <div
              className="absolute left-0 top-4 h-0.5 bg-indigo-600 transition-all duration-500"
              style={{
                width:
                  currentStepIndex === -1
                    ? '0%'
                    : `${(currentStepIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />
            {ORDER_STATUS_STEPS.map((step, index) => {
              const isCompleted = currentStepIndex >= index;
              const isActive = currentStepIndex === index;
              return (
                <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                      isCompleted
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                        : 'border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900'
                    } ${isActive ? 'ring-4 ring-zinc-500/20' : ''}`}
                  >
                    {isCompleted ? <CheckIcon size={14} className="stroke-[2.5]" /> : index + 1}
                  </div>
                  <span
                    className={`text-center text-[10px] font-semibold max-w-[60px] ${
                      isCompleted ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-400'
                    }`}
                  >
                    {STATUS_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Items */}
        <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Order Items
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    SKU: {item.sku} · Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatBdt(item.lineTotal)}
                  </p>
                  <p className="text-xs text-slate-500">@ {formatBdt(item.unitPrice)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
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
              <span>Total</span>
              <span>{formatBdt(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Delivery Address
          </h2>
          <div className="text-sm text-slate-700 dark:text-slate-300 space-y-0.5">
            <p className="font-semibold text-slate-900 dark:text-white">{order.customerFullName}</p>
            <p>{order.shippingAddress.addressLine}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.division}
              {order.shippingAddress.postalCode ? ` - ${order.shippingAddress.postalCode}` : ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{order.customerEmail}</p>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Payment
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Method</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <span className={`font-bold ${PAYMENT_STATUS_COLORS[order.payment.status] ?? ''}`}>
                {order.payment.status}
              </span>
            </div>
            {order.payment.transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">TrxID</span>
                <span className="font-mono text-xs text-indigo-600 font-bold dark:text-indigo-400">
                  {order.payment.transactionId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Notes */}
        {order.customerNotes && (
          <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-amber-50 p-5 dark:border-slate-800 dark:bg-amber-950/20">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Your Notes to Merchant
            </h2>
            <p className="text-sm text-amber-900 dark:text-amber-200">{order.customerNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
