import React from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  WrenchIcon,
  CreditCardIcon,
  BoxIcon,
  PhoneIcon,
  MessageCircleIcon,
  MailIcon,
  MapPinIcon,
  CheckIcon,
} from '@/components/ui/icons';

export function StorefrontFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-[#090a0d] text-zinc-300">
      {/* Upper Trust Strip */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <ShieldCheckIcon size={18} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">7-Day Guarantee</div>
              <div className="text-[11px] text-zinc-400">Instant hardware replacement</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <WrenchIcon size={18} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">2-Year Service</div>
              <div className="text-[11px] text-zinc-400">Free diagnostic &amp; labor warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <CreditCardIcon size={18} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">0% EMI Available</div>
              <div className="text-[11px] text-zinc-400">Up to 36 months on 18+ banks</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <BoxIcon size={18} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Open-Box Inspection</div>
              <div className="text-[11px] text-zinc-400">Verify device before paying COD</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand & Contacts */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white font-semibold text-sm border border-zinc-700">
                <ShieldCheckIcon size={16} className="text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white">
                  iStore<span className="text-amber-400">BD</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium -mt-1">
                  Certified Pre-Owned Apple
                </span>
              </div>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Bangladesh’s verified marketplace for certified pre-owned iPhones, iPads, and MacBooks. Every device passes a 70-point hardware diagnostic inspection with genuine component assurance.
            </p>
            <div className="pt-2 text-xs space-y-2 text-zinc-300">
              <div className="flex items-center gap-2">
                <PhoneIcon size={13} className="text-zinc-500" />
                <span>Hotline: <a href="tel:+8801800478673" className="hover:text-white font-medium">01800-478673</a></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircleIcon size={13} className="text-emerald-500" />
                <span>WhatsApp: <a href="https://wa.me/8801976478673" className="hover:text-white font-medium">+880 1976-478673</a></span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon size={13} className="text-zinc-500" />
                <span>Email: support@istorebd.com</span>
              </div>
            </div>
          </div>

          {/* Physical Store Locations */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Store Network
            </span>
            <h4 className="mt-1 text-xs sm:text-sm font-semibold text-white">
              Experience Centers &amp; Lab
            </h4>
            <div className="mt-3 space-y-3 text-xs text-zinc-400">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="font-medium text-white flex items-center gap-1.5">
                  <MapPinIcon size={13} className="text-zinc-400" />
                  <span>Bashundhara City Center</span>
                </div>
                <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
                  Level 5, Block B, Shop #52, Panthapath, Dhaka
                  <br />
                  <span className="text-zinc-500">10:30 AM - 8:30 PM (Tuesday Closed)</span>
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="font-medium text-white flex items-center gap-1.5">
                  <MapPinIcon size={13} className="text-zinc-400" />
                  <span>Jamuna Future Park Center</span>
                </div>
                <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
                  Level 4, Zone C, Shop #4A-012, Kuril, Dhaka
                  <br />
                  <span className="text-zinc-500">11:00 AM - 9:00 PM (Wednesday Closed)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Categories Navigation */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Inventory
            </span>
            <h4 className="mt-1 text-xs sm:text-sm font-semibold text-white">
              Pre-Owned Generations
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/products?category=iphone-16-series" className="hover:text-white transition-colors">
                  iPhone 16 Series
                </Link>
              </li>
              <li>
                <Link href="/products?category=iphone-15-series" className="hover:text-white transition-colors">
                  iPhone 15 Series
                </Link>
              </li>
              <li>
                <Link href="/products?category=iphone-14-series" className="hover:text-white transition-colors">
                  iPhone 14 Series
                </Link>
              </li>
              <li>
                <Link href="/products?category=iphone-13-series" className="hover:text-white transition-colors">
                  iPhone 13 Series
                </Link>
              </li>
              <li>
                <Link href="/products?category=budget-flagships" className="hover:text-white transition-colors">
                  Budget Models Under ৳45k
                </Link>
              </li>
              <li>
                <Link href="/products?category=macbooks-and-ipads" className="hover:text-white transition-colors">
                  MacBooks &amp; iPads
                </Link>
              </li>
              <li>
                <Link href="/#trade-in" className="hover:text-white transition-colors font-medium text-zinc-300">
                  Trade-In &amp; Exchange Calculator →
                </Link>
              </li>
            </ul>
          </div>

          {/* Warranty & Payment Flexibility */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Integrity
            </span>
            <h4 className="mt-1 text-xs sm:text-sm font-semibold text-white">
              Inspection &amp; Coverage
            </h4>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed font-normal">
              Every device passes 3uTools hardware validation, iCloud clean audit, and True Tone / Face ID verification.
            </p>

            <div className="mt-3 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckIcon size={12} className="text-emerald-500" />
                <span>Open-Box Delivery Across 64 Districts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon size={12} className="text-emerald-500" />
                <span>36 Months 0% EMI with 18+ Banks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon size={12} className="text-emerald-500" />
                <span>Exchange Old Android or iPhone</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap gap-1.5 text-[10px] font-medium text-zinc-400">
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">Cash on Delivery</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">bKash</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">Nagad</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">Visa / Master</span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">Amex</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 iStoreBD Marketplace Ltd. All rights reserved. Apple, iPhone, iPad, and MacBook are trademarks of Apple Inc.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/orders/track" className="hover:text-white transition-colors">Track Order</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
