'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/context/cart-context';
import { checkoutApi } from '../api/checkout-api';
import { authApi } from '@/features/auth/api/auth-api';
import { formatBdt } from '@/lib/formatting/currency';
import { isValidBdPhoneNumber, normalizeBdPhoneNumber } from '@/lib/validation/phone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BanknoteIcon, SmartphoneIcon, LockIcon } from '@/components/ui/icons';
import type { PaymentMethod } from '@/types/commerce';

const FREE_SHIPPING_THRESHOLD = 2000;

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // Form State
  const [customerFullName, setCustomerFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');
  const [deliveryCity, setDeliveryCity] = useState('Dhaka');
  const [deliveryDivision, setDeliveryDivision] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CashOnDelivery');
  const [senderPhoneNumber, setSenderPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // UI State
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-populate contact info for logged-in customer asynchronously
  useEffect(() => {
    authApi
      .getCurrentUser()
      .then((user) => {
        if (user.fullName) setCustomerFullName((prev) => prev ? prev : user.fullName);
        if (user.phoneNumber) setCustomerPhone((prev) => prev ? prev : (user.phoneNumber || ''));
        if (user.email) setCustomerEmail((prev) => prev ? prev : user.email);
      })
      .catch(() => {
        // Unauthenticated customer
      });
  }, []);

  // Delivery Calculations
  const isFreeDelivery = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeDelivery ? 0 : deliveryZone === 'inside' ? 60 : 120;
  const estimatedTotal = subtotal + shippingFee;

  const isPhoneValid = isValidBdPhoneNumber(customerPhone);
  const showPhoneError = phoneTouched && !isPhoneValid && customerPhone.length > 0;

  const handleZoneChange = (zone: 'inside' | 'outside') => {
    setDeliveryZone(zone);
    if (zone === 'inside') {
      setDeliveryCity('Dhaka');
      setDeliveryDivision('Dhaka');
    } else {
      setDeliveryCity('');
      setDeliveryDivision('Outside Dhaka');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerFullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }

    if (!isValidBdPhoneNumber(customerPhone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    if (!deliveryCity.trim()) {
      setErrorMessage('Please specify your delivery city/district.');
      return;
    }

    if (paymentMethod === 'BkashManual') {
      if (!senderPhoneNumber.trim() || !isValidBdPhoneNumber(senderPhoneNumber)) {
        setErrorMessage('Please provide the bKash number used to send the payment.');
        return;
      }
      if (!transactionId.trim() || transactionId.trim().length < 6) {
        setErrorMessage('Please provide a valid bKash Transaction ID (TrxID).');
        return;
      }
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const response = await checkoutApi.submitOrder({
        customerFullName: customerFullName.trim(),
        customerPhone: normalizeBdPhoneNumber(customerPhone),
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        deliveryCity: deliveryCity.trim(),
        deliveryDivision: deliveryDivision.trim(),
        postalCode: postalCode.trim() || undefined,
        paymentMethod,
        senderPhoneNumber: senderPhoneNumber.trim() ? normalizeBdPhoneNumber(senderPhoneNumber) : undefined,
        transactionId: transactionId.trim() || undefined,
        items: orderItems,
        customerNotes: customerNotes.trim() || undefined,
      });

      if (response && response.orderNumber) {
        clearCart();
        const normalized = normalizeBdPhoneNumber(customerPhone);
        try {
          localStorage.setItem('shopbd_last_phone', normalized);
        } catch {
          // ignore
        }
        router.push(`/orders/${encodeURIComponent(response.orderNumber)}?phone=${encodeURIComponent(normalized)}`);
      } else {
        setErrorMessage('Order placement failed. Please verify details and try again.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to process checkout. Please check stock or connection and try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          You don&apos;t have any items in your cart to checkout.
        </p>
        <div className="mt-6">
          <Link href="/products">
            <Button variant="primary" size="md">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Checkout Details Form (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">{errorMessage}</div>
            </div>
            {errorMessage.toLowerCase().includes('catalog') && (
              <div className="pt-2 pl-8 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearCart();
                    router.push('/products');
                  }}
                >
                  Clear Cart &amp; Browse Catalog
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 1. Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </span>
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Tanvir Ahmed"
              value={customerFullName}
              onChange={(e) => setCustomerFullName(e.target.value)}
            />

            <div>
              <Input
                label="Mobile Phone Number (Bangladeshi)"
                type="tel"
                required
                placeholder="01712345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onBlur={() => setPhoneTouched(true)}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                11-digit mobile number for order delivery confirmation and courier SMS.
              </p>
              {showPhoneError && (
                <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Please enter a valid BD phone number starting with 013-019.
                </p>
              )}
            </div>

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="tanvir@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* 2. Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </span>
              <span>Delivery Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Zone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Delivery Location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleZoneChange('inside')}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                    deliveryZone === 'inside'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40 dark:border-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Inside Dhaka
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isFreeDelivery ? 'Free Delivery (Promo)' : '৳60 delivery • 24-48h'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleZoneChange('outside')}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                    deliveryZone === 'outside'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40 dark:border-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Outside Dhaka
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isFreeDelivery ? 'Free Delivery (Promo)' : '৳120 delivery • 48-72h'}
                  </span>
                </button>
              </div>
            </div>

            <Input
              label="Delivery Street Address"
              required
              placeholder="House/Apartment, Road, Area (e.g. Flat 4B, House 12, Road 5, Dhanmondi)"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / District"
                required
                placeholder="e.g. Dhaka or Chattogram"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
              />
              <Input
                label="Postal Code (Optional)"
                placeholder="e.g. 1205"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Special Delivery Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Call before arriving, leave with security..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                3
              </span>
              <span>Payment Method</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Option A: Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'CashOnDelivery'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40 dark:border-indigo-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CashOnDelivery"
                  checked={paymentMethod === 'CashOnDelivery'}
                  onChange={() => setPaymentMethod('CashOnDelivery')}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BanknoteIcon size={18} className="text-zinc-600 dark:text-zinc-400" />
                    <span>Cash on Delivery (COD)</span>
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pay in cash directly to courier representative upon doorstep delivery.
                  </p>
                </div>
              </label>

              {/* Option B: bKash Manual */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'BkashManual'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40 dark:border-indigo-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BkashManual"
                  checked={paymentMethod === 'BkashManual'}
                  onChange={() => setPaymentMethod('BkashManual')}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SmartphoneIcon size={18} className="text-zinc-600 dark:text-zinc-400" />
                    <span>bKash / Nagad Mobile Banking</span>
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Send Money / Cash Out to merchant wallet & enter your Transaction ID.
                  </p>
                </div>
              </label>
            </div>

            {/* bKash Instructions Panel */}
            {paymentMethod === 'BkashManual' && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3 dark:border-indigo-900 dark:bg-indigo-950/40">
                <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <SmartphoneIcon size={14} />
                  <span>Mobile Banking Instructions:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  1. Send exact amount <strong className="text-indigo-700 dark:text-indigo-300">{formatBdt(estimatedTotal)}</strong> to Merchant Number: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 dark:bg-slate-800 dark:border-indigo-800">01812-345678</strong> (bKash / Nagad).
                  <br />
                  2. Enter your sender phone number and the Transaction ID (TrxID) below:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Input
                    label="Sender Mobile Number"
                    required
                    placeholder="017XXXXXXXX"
                    value={senderPhoneNumber}
                    onChange={(e) => setSenderPhoneNumber(e.target.value)}
                  />
                  <Input
                    label="Transaction ID (TrxID)"
                    required
                    placeholder="e.g. 9J3X8M20K"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Order Summary (5 cols) */}
      <div className="lg:col-span-5">
        <div className="sticky top-24 space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base">Order Summary ({items.length} items)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Items List Preview */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          Item
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-slate-900 truncate dark:text-white">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.variantName} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatBdt(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm dark:border-slate-800">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatBdt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 items-center">
                  <span>Delivery Fee</span>
                  {shippingFee === 0 ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-900 dark:text-white">{formatBdt(shippingFee)}</span>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold text-slate-900 dark:text-white dark:border-slate-700">
                  <span>Total Payable</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-lg">
                    {formatBdt(estimatedTotal)}
                  </span>
                </div>
              </div>

              {/* Order Placement CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md shadow-indigo-600/20"
                isLoading={isSubmitting}
              >
                Confirm Order ({formatBdt(estimatedTotal)})
              </Button>

              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <LockIcon size={13} className="text-zinc-400" />
                <span>All orders authoritatively calculated &amp; verified by our server.</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
