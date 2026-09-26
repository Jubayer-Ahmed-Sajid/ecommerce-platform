'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../api/admin-api';
import type { StockLevelDto } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon } from '@/components/ui/icons';

interface StockAdjustModalProps {
  stockItems: StockLevelDto[];
}

export function StockAdjustModal({ stockItems }: StockAdjustModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(stockItems[0]?.variantId || '');
  const [type, setType] = useState<'InwardRestock' | 'OutwardSale' | 'InventoryCorrection' | 'DamagedOrLost'>('InwardRestock');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (stockItems.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const delta = parseInt(quantity, 10);
    if (isNaN(delta) || delta <= 0) {
      setErrorMessage('Quantity delta must be a positive integer.');
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Reason is mandatory for auditability.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Inward is positive, Outward/Damaged is negative
      const adjustedDelta = type === 'InwardRestock' ? delta : -delta;

      await adminApi.adjustStock({
        variantId: selectedVariantId,
        type,
        quantityDelta: adjustedDelta,
        reason: reason.trim(),
      });

      setIsOpen(false);
      setReason('');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stock adjustment failed.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="font-semibold"
      >
        + Adjust Stock Level
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inventory Stock Adjustment
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close"
              >
                <XIcon size={16} />
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Product / SKU
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {stockItems.map((item) => (
                    <option key={item.variantId} value={item.variantId}>
                      {item.sku} — {item.productName} ({item.variantName}) [Avail: {item.availableQuantity}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Adjustment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="InwardRestock">Inward Restock (+)</option>
                  <option value="DamagedOrLost">Damaged / Defective (-)</option>
                  <option value="InventoryCorrection">Manual Stock Correction (-)</option>
                </select>
              </div>

              <Input
                label="Units Count"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <Input
                label="Audit Reason"
                required
                placeholder="e.g. Received shipment PO-401 or Warehouse count audit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold"
                  isLoading={isSubmitting}
                >
                  Submit Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
