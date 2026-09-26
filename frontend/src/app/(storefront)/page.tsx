import React from 'react';
import type { Metadata } from 'next';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { HeroSpotlight } from '@/features/catalog/components/hero-spotlight';
import { TrustBanner } from '@/features/catalog/components/trust-banner';
import { SeriesExplorer } from '@/features/catalog/components/series-explorer';
import { LiveDeviceInventory } from '@/features/catalog/components/live-device-inventory';
import { TradeInCalculator } from '@/features/catalog/components/trade-in-calculator';
import { DiagnosticInspectionSection } from '@/features/catalog/components/diagnostic-inspection-section';
import { ComparisonMatrix } from '@/features/catalog/components/comparison-matrix';
import { CustomerProofSection } from '@/features/catalog/components/customer-proof-section';
import { FloatingSupportWidget } from '@/features/catalog/components/floating-support-widget';

export const metadata: Metadata = {
  title: 'iStoreBD — Certified Pre-Owned iPhones & Apple Marketplace in Bangladesh',
  description:
    'Buy and exchange 70-point certified used iPhones in Bangladesh. 100% genuine battery health, 7-day replacement guarantee, 2-year service warranty, 0% EMI and open-box cash on delivery in Dhaka & all 64 districts.',
};

export default async function StorefrontHomePage() {
  const productsResponse = await catalogApi.getProducts({ pageSize: 24, sortBy: 'newest' }).catch(() => ({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 24,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  }));

  const products = productsResponse.items;

  return (
    <div className="space-y-16 sm:space-y-24 py-4 md:py-8 overflow-hidden">
      {/* 1. Hero Spotlight */}
      <HeroSpotlight />

      {/* 2. Trust Pillars Banner */}
      <TrustBanner />

      {/* 3. Series Explorer */}
      <SeriesExplorer />

      {/* 4. Live Device Inventory (Client Filter Leaf) */}
      <LiveDeviceInventory initialProducts={products} />

      {/* 5. Trade-In / Phone Exchange Calculator */}
      <TradeInCalculator />

      {/* 6. Diagnostic Inspection Transparency Section */}
      <DiagnosticInspectionSection />

      {/* 7. Comparison Matrix */}
      <ComparisonMatrix />

      {/* 8. Customer Proof & Testimonials */}
      <CustomerProofSection />

      {/* Floating Support & WhatsApp Widget */}
      <FloatingSupportWidget />
    </div>
  );
}
