'use client';

import React, { useState } from 'react';
import { formatBdt } from '@/lib/formatting/currency';
import {
  RefreshCwIcon,
  CheckIcon,
  BoxIcon,
  MessageCircleIcon,
} from '@/components/ui/icons';

interface PhoneModelOption {
  model: string;
  baseValuation: number;
}

const BRAND_MODELS: Record<string, PhoneModelOption[]> = {
  Apple: [
    { model: 'iPhone 14 Pro Max 128GB', baseValuation: 85000 },
    { model: 'iPhone 14 Pro 128GB', baseValuation: 74000 },
    { model: 'iPhone 14 128GB', baseValuation: 55000 },
    { model: 'iPhone 13 Pro Max 128GB', baseValuation: 68000 },
    { model: 'iPhone 13 Pro 128GB', baseValuation: 62000 },
    { model: 'iPhone 13 128GB', baseValuation: 48000 },
    { model: 'iPhone 12 Pro Max 128GB', baseValuation: 49000 },
    { model: 'iPhone 12 128GB', baseValuation: 35000 },
    { model: 'iPhone 11 128GB', baseValuation: 28000 },
  ],
  Samsung: [
    { model: 'Galaxy S24 Ultra 256GB', baseValuation: 92000 },
    { model: 'Galaxy S23 Ultra 256GB', baseValuation: 68000 },
    { model: 'Galaxy S22 Ultra 128GB', baseValuation: 46000 },
    { model: 'Galaxy S21 Ultra', baseValuation: 32000 },
    { model: 'Galaxy Z Fold 5', baseValuation: 88000 },
  ],
  'Google Pixel': [
    { model: 'Pixel 8 Pro 128GB', baseValuation: 56000 },
    { model: 'Pixel 7 Pro 128GB', baseValuation: 40000 },
    { model: 'Pixel 7 128GB', baseValuation: 32000 },
    { model: 'Pixel 6 Pro 128GB', baseValuation: 26000 },
  ],
  OnePlus: [
    { model: 'OnePlus 12 256GB', baseValuation: 58000 },
    { model: 'OnePlus 11 128GB', baseValuation: 38000 },
    { model: 'OnePlus 10 Pro', baseValuation: 28000 },
  ],
};

export function TradeInCalculator() {
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [condition, setCondition] = useState<'flawless' | 'good' | 'fair'>('flawless');
  const [batteryRange, setBatteryRange] = useState<'90+' | '80-89' | 'below-80'>('90+');
  const [hasBox, setHasBox] = useState(true);

  const currentModels = BRAND_MODELS[selectedBrand] || [];
  const selectedModel = currentModels[selectedModelIndex] || currentModels[0];

  // Valuation algorithm
  let multiplier = 1.0;
  if (condition === 'good') multiplier *= 0.90;
  if (condition === 'fair') multiplier *= 0.78;

  if (batteryRange === '80-89') multiplier *= 0.94;
  if (batteryRange === 'below-80') multiplier *= 0.88;

  if (!hasBox) multiplier *= 0.96;

  const estimatedValue = Math.round((selectedModel?.baseValuation || 45000) * multiplier);

  // Upgrade comparison target: iPhone 15 Pro (approx ৳94,500)
  const upgradeTargetPrice = 94500;
  const upgradePayDifference = Math.max(0, upgradeTargetPrice - estimatedValue);

  return (
    <section id="trade-in" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-3 py-0.5 text-xs font-medium">
              <RefreshCwIcon size={12} className="text-amber-500" />
              <span>Exchange &amp; Trade-In</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl mt-2">
              Upgrade Your Current Phone
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Calculate an authoritative estimate for your existing Android or iPhone to offset against a certified pre-owned unit.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs">
              <CheckIcon size={12} className="text-emerald-500" />
              <span>Instant Store Payout</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs">
              <CheckIcon size={12} className="text-emerald-500" />
              <span>Doorstep Pickup</span>
            </span>
          </div>
        </div>

        {/* Interactive Calculator Body */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Brand Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                1. Select Brand
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(BRAND_MODELS).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => {
                      setSelectedBrand(brand);
                      setSelectedModelIndex(0);
                    }}
                    className={`rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                      selectedBrand === brand
                        ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Model Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                2. Select Your Current Model
              </label>
              <select
                value={selectedModelIndex}
                onChange={(e) => setSelectedModelIndex(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              >
                {currentModels.map((item, idx) => (
                  <option key={item.model} value={idx}>
                    {item.model}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Physical Condition */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                3. Physical Condition
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('flawless')}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    condition === 'flawless'
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-semibold">Flawless (10/10)</div>
                  <div className={`text-[10px] ${condition === 'flawless' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>Zero scratches or dents</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition('good')}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    condition === 'good'
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 dark:border-slate-800 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-semibold">Good (8-9/10)</div>
                  <div className={`text-[10px] ${condition === 'good' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>Light hairline marks</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition('fair')}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    condition === 'fair'
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-semibold">Fair (6-7/10)</div>
                  <div className={`text-[10px] ${condition === 'fair' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>Visible marks or wear</div>
                </button>
              </div>
            </div>

            {/* 4. Battery Health */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                4. Battery Health
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBatteryRange('90+')}
                  className={`rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                    batteryRange === '90+'
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  90% or Higher
                </button>
                <button
                  type="button"
                  onClick={() => setBatteryRange('80-89')}
                  className={`rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                    batteryRange === '80-89'
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  80% – 89%
                </button>
                <button
                  type="button"
                  onClick={() => setBatteryRange('below-80')}
                  className={`rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                    batteryRange === 'below-80'
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  Below 80%
                </button>
              </div>
            </div>

            {/* 5. Original Accessories */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                5. Packaging &amp; Accessories
              </label>
              <button
                type="button"
                onClick={() => setHasBox(!hasBox)}
                className={`w-full rounded-xl border py-2.5 px-3 text-xs font-medium flex items-center justify-between transition-all ${
                  hasBox
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BoxIcon size={14} />
                  <span>{hasBox ? 'Original Box & Matching IMEI Memo Available' : 'Device Only (No Packaging)'}</span>
                </span>
                {hasBox && <CheckIcon size={14} />}
              </button>
            </div>
          </div>

          {/* Valuation Result Column */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-zinc-800 bg-[#0d0e12] p-6 text-white shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Authoritative Estimate
                </span>
                <span className="rounded bg-zinc-800 text-zinc-300 px-2 py-0.5 text-[10px] font-medium">
                  Guaranteed
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                  {formatBdt(estimatedValue)}
                </div>
                <div className="text-xs text-zinc-400">
                  Estimated valuation for <strong className="text-zinc-200 font-medium">{selectedModel?.model}</strong>
                </div>
              </div>

              {/* Upgrade Difference calculation */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 text-xs">
                <div className="font-medium text-white flex items-center justify-between">
                  <span>Upgrade Target: iPhone 15 Pro (128GB)</span>
                  <span className="text-zinc-300 tabular-nums">{formatBdt(upgradeTargetPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Trade-In Value:</span>
                  <span className="text-emerald-400 font-medium tabular-nums">- {formatBdt(estimatedValue)}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between font-semibold text-sm text-white">
                  <span>Difference Payable:</span>
                  <span className="text-base font-bold tabular-nums text-white">{formatBdt(upgradePayDifference)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={`https://wa.me/8801976478673?text=${encodeURIComponent(
                    `Hello iStoreBD! I want to trade in my ${selectedModel?.model} (${condition}, battery: ${batteryRange}). Estimated value: ${formatBdt(
                      estimatedValue
                    )}. Please confirm exchange availability.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold py-2.5 px-4 text-xs sm:text-sm text-center transition-colors shadow-sm"
                >
                  <MessageCircleIcon size={14} className="text-emerald-600" />
                  <span>Lock In Valuation on WhatsApp</span>
                </a>

                <div className="text-center text-[11px] text-zinc-400 leading-relaxed">
                  Visit our diagnostic centers at Bashundhara City or Jamuna Future Park for hands-on physical verification &amp; instant payout.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
