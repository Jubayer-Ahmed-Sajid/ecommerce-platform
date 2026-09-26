import React from 'react';
import {
  ShieldCheckIcon,
  WrenchIcon,
  CpuIcon,
  CreditCardIcon,
  RefreshCwIcon,
  TruckIcon,
} from '@/components/ui/icons';

export function TrustBanner() {
  const PILLARS = [
    {
      icon: ShieldCheckIcon,
      title: '7-Day Replacement',
      desc: 'Immediate hardware replacement if any defect is detected.',
      badge: 'Guaranteed',
    },
    {
      icon: WrenchIcon,
      title: '2-Year Free Service',
      desc: 'Free labor, testing, and dedicated diagnostic care at our labs.',
      badge: 'Certified Lab',
    },
    {
      icon: CpuIcon,
      title: '70+ Hardware Checks',
      desc: 'True Tone, Face ID, OIS, and 3uTools score certified original.',
      badge: 'Verified',
    },
    {
      icon: CreditCardIcon,
      title: 'Up to 36M 0% EMI',
      desc: 'Flexible monthly installments with 18+ leading partner banks.',
      badge: '0% Interest',
    },
    {
      icon: RefreshCwIcon,
      title: 'Instant Phone Exchange',
      desc: 'Trade in older iPhone or Android models towards upgrades.',
      badge: 'Top Valuation',
    },
    {
      icon: TruckIcon,
      title: 'Open-Box Delivery',
      desc: 'Inspect device, verify IMEI and True Tone before paying COD.',
      badge: '64 Districts',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    <Icon size={16} />
                  </div>
                  <span className="rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                    {pillar.badge}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white leading-snug">
                  {pillar.title}
                </h4>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
