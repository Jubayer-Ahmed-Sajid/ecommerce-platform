import React from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  RefreshCwIcon,
  PhoneIcon,
  BatteryChargingIcon,
  CheckIcon,
  ArrowRightIcon,
  SmartphoneIcon,
} from '@/components/ui/icons';

export function HeroSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#0d0e12] px-6 py-12 text-white shadow-lg sm:px-12 md:py-16 lg:px-16">
        {/* Apple-grade subtle lighting */}
        <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-zinc-700/10 blur-[90px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Trust Kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3.5 py-1 text-xs text-zinc-300 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold text-zinc-200">
                Certified Pre-Owned Apple
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 font-normal">
                70-Point Hardware Lab Audit
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-[1.15] text-white">
              Verified Pre-Owned iPhones.{' '}
              <span className="text-zinc-400 font-normal">
                Certified hardware integrity, transparent testing.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Every device is lab-certified with authentic battery health, original Super Retina display, clean BTRC IMEI, and zero iCloud locks. Backed by our <strong className="text-zinc-200 font-medium">7-Day Replacement Guarantee</strong> and <strong className="text-zinc-200 font-medium">2-Year Free Service Warranty</strong> with open-box Cash on Delivery nationwide.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold px-5 py-2.5 text-xs sm:text-sm transition-all shadow-sm"
              >
                <span>Browse Inventory</span>
                <ArrowRightIcon size={14} />
              </Link>

              <a
                href="#trade-in"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium px-4 py-2.5 text-xs sm:text-sm transition-all"
              >
                <RefreshCwIcon size={13} className="text-amber-400" />
                <span>Exchange Old Phone</span>
              </a>

              <a
                href="tel:+8801800478673"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-2 py-2"
              >
                <PhoneIcon size={12} className="text-zinc-400" />
                <span>01800-478673</span>
              </a>
            </div>

            {/* Fast Trust Metric Badges */}
            <div className="pt-5 border-t border-zinc-800/80 grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-white font-semibold text-base sm:text-lg">70+ Checkpoints</div>
                <div className="text-zinc-400 text-[11px]">Hardware Diagnostic</div>
              </div>
              <div>
                <div className="text-white font-semibold text-base sm:text-lg">85% – 100%</div>
                <div className="text-zinc-400 text-[11px]">Battery Health Standard</div>
              </div>
              <div>
                <div className="text-white font-semibold text-base sm:text-lg">0% EMI</div>
                <div className="text-zinc-400 text-[11px]">Up to 36 Months</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Certified Device Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl backdrop-blur-xl">
              {/* Top Card Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                  <ShieldCheckIcon size={14} className="text-emerald-400" />
                  Live Verified Unit
                </span>
                <span className="rounded bg-zinc-800 text-zinc-300 border border-zinc-700/80 px-2 py-0.5 text-[10px] font-medium">
                  Grade A+ (Pristine 10/10)
                </span>
              </div>

              {/* Showcase Image */}
              <div className="relative my-4 aspect-square w-full overflow-hidden rounded-xl bg-zinc-950 p-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80"
                  alt="iPhone 16 Pro Max Natural Titanium"
                  className="h-full w-auto object-contain transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] text-zinc-300 font-mono border border-zinc-800">
                  IMEI: 359124******** (Clean)
                </div>
              </div>

              {/* Live Spec & Diagnostic Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">
                    iPhone 16 Pro Max 256GB
                  </h3>
                  <span className="font-medium text-zinc-400">Desert Titanium</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Battery Health</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <BatteryChargingIcon size={12} />
                      <span>100% Genuine</span>
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">SIM Variant</span>
                    <span className="font-semibold text-zinc-200 flex items-center gap-1 mt-0.5">
                      <SmartphoneIcon size={12} />
                      <span>ZA/A Dual SIM</span>
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">True Tone &amp; Face ID</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckIcon size={12} />
                      <span>Verified Active</span>
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">3uTools Score</span>
                    <span className="font-semibold text-blue-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheckIcon size={12} />
                      <span>100 / 100 (Pass)</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
                  <div>
                    <div className="text-[11px] text-zinc-500 line-through">৳165,000</div>
                    <div className="text-lg font-bold text-white">৳148,000</div>
                  </div>
                  <Link
                    href="/products/iphone-16-pro-max-256gb-desert-titanium"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-semibold px-3 py-1.5 text-xs transition-colors"
                  >
                    <span>Inspect Unit</span>
                    <ArrowRightIcon size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
