import React from 'react';
import { ScaleIcon, CheckIcon, XIcon, ShieldCheckIcon } from '@/components/ui/icons';

export function ComparisonMatrix() {
  const ROWS = [
    {
      feature: 'Hardware Diagnostic Check',
      istore: '70+ Point Certified Lab Test',
      informal: 'None / Word of mouth',
      grey: 'Basic power-on check only',
    },
    {
      feature: 'True Tone & Original Screen',
      istore: '100% Guaranteed Original OLED',
      informal: 'High risk of fake TFT replacements',
      grey: 'Often unverified third-party',
    },
    {
      feature: 'Replacement Guarantee',
      istore: '7 Days Hassle-Free Instant Swap',
      informal: '0 Days (No return once sold)',
      grey: 'Usually no replacement',
    },
    {
      feature: 'Free Service Warranty',
      istore: '2 Years Dedicated Store Lab',
      informal: 'None',
      grey: '30 days limited or none',
    },
    {
      feature: 'iCloud & IMEI BTRC Status',
      istore: 'Clean & Verified Factory Unlocked',
      informal: 'Risk of bypass / blacklist lock',
      grey: 'Unchecked grey imports',
    },
    {
      feature: '0% Interest EMI',
      istore: 'Available up to 36 Months',
      informal: 'Cash only',
      grey: 'Rarely available',
    },
    {
      feature: 'Physical Store Experience',
      istore: 'Bashundhara City & Jamuna Future Park',
      informal: 'Random street/tea stall meetup',
      grey: 'Small non-specialized counter',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80 space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-0.5 text-xs font-medium">
            <ScaleIcon size={13} className="text-zinc-500" />
            <span>Market Transparency</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
            Why Buy Certified Pre-Owned vs Informal Sellers?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Buying a used iPhone is a substantial investment. Here is how iStoreBD protects your purchase versus buying from unverified social media sellers.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/80">
                <th className="p-3.5 font-semibold text-zinc-900 dark:text-white">Feature / Safety Standard</th>
                <th className="p-3.5 font-semibold text-zinc-900 dark:text-white bg-zinc-100/70 dark:bg-zinc-800/40 border-x border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheckIcon size={14} className="text-emerald-500" />
                    <span>iStoreBD Certified</span>
                  </div>
                </th>
                <th className="p-3.5 font-medium text-zinc-500 dark:text-zinc-400">Social Media / Classifieds</th>
                <th className="p-3.5 font-medium text-zinc-500 dark:text-zinc-400">Grey Market Shops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {ROWS.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={idx % 2 === 0 ? 'bg-white dark:bg-zinc-900/30' : 'bg-zinc-50/40 dark:bg-zinc-950/30'}
                >
                  <td className="p-3.5 font-medium text-zinc-800 dark:text-zinc-200">{row.feature}</td>
                  <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400 bg-zinc-100/40 dark:bg-zinc-800/20 border-x border-zinc-200/80 dark:border-zinc-800">
                    <span className="flex items-center gap-1.5">
                      <CheckIcon size={13} className="text-emerald-500 shrink-0" />
                      <span>{row.istore}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <XIcon size={12} className="text-zinc-400 shrink-0" />
                      <span>{row.informal}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-zinc-500 dark:text-zinc-400">{row.grey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
