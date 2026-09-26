'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { normalizeBdPhoneNumber, isValidBdPhoneNumber } from '@/lib/validation/phone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function OrderTrackingForm() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    if (!cleanOrderNumber) {
      setErrorMessage('Please enter your Order Number (e.g. ORD-20260925-1001).');
      return;
    }

    if (!isValidBdPhoneNumber(phone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number.');
      return;
    }

    const normalized = normalizeBdPhoneNumber(phone);
    router.push(`/orders/${encodeURIComponent(cleanOrderNumber)}?phone=${encodeURIComponent(normalized)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      <Input
        label="Order Number"
        required
        placeholder="e.g. ORD-20260925-1001"
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
      />

      <Input
        label="Recipient Mobile Phone"
        type="tel"
        required
        placeholder="017XXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
        Check Order Status
      </Button>
    </form>
  );
}
