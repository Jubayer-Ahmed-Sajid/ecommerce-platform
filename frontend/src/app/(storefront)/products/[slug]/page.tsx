import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { catalogApi } from '@/features/catalog/api/catalog-api';
import { ProductGallery } from '@/features/catalog/components/product-gallery';
import { VariantSelector } from '@/features/catalog/components/variant-selector';
import { formatBdt } from '@/lib/formatting/currency';
import {
  MicroscopeIcon,
  BatteryChargingIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  MessageCircleIcon,
  WrenchIcon,
  BoxIcon,
} from '@/components/ui/icons';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await catalogApi.getProductBySlug(slug);
    return {
      title: `${product.title} — Certified Pre-Owned | iStoreBD`,
      description:
        product.description?.slice(0, 160) ??
        `Buy authentic pre-owned ${product.title} with 7-day replacement guarantee, 2-year service warranty, and open-box cash on delivery in Bangladesh.`,
      openGraph: {
        title: `${product.title} | iStoreBD`,
        description: product.description?.slice(0, 160),
        images: product.primaryImageUrl ? [{ url: product.primaryImageUrl, alt: product.title }] : [],
      },
    };
  } catch {
    return { title: 'Product Not Found | iStoreBD' };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await catalogApi.getProductBySlug(slug);
  } catch {
    notFound();
  }

  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const highestPrice = Math.max(...product.variants.map((v) => v.price));
  const highestOriginalPrice = product.variants
    .map((v) => v.originalPrice)
    .filter((p): p is number => p !== undefined)
    .reduce((max, p) => Math.max(max, p), 0);

  const emiPerMonth = product.emiStartsAt || Math.round(lowestPrice / 36);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.map((img) => img.url) ?? [],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BDT',
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Link href="/" className="hover:text-amber-500 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-amber-500 transition-colors">
          Certified iPhones
        </Link>
        {product.categoryName && (
          <>
            <span>/</span>
            <span className="text-slate-500 dark:text-slate-400">{product.categoryName}</span>
          </>
        )}
        <span>/</span>
        <span className="truncate max-w-[200px] text-slate-900 font-semibold dark:text-white">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: Product Gallery (Client Component leaf) */}
        <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
          <ProductGallery images={product.images} title={product.title} />

          {/* Diagnostic Inspection Badge Strip under image */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
              <MicroscopeIcon size={16} className="text-zinc-600 dark:text-zinc-400" />
              <span>70-Point Hardware Lab Passed</span>
            </div>
            <span className="rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono px-2 py-0.5 text-[10px] font-semibold">
              3uTools: 98-100%
            </span>
          </div>
        </div>

        {/* Right: Product Info + Variant/Cart Controls */}
        <div className="flex flex-col gap-6">
          {/* Header & Pre-Owned Trust Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.categoryName && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {product.categoryName}
                </span>
              )}

              {product.conditionGrade && (
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {product.conditionGrade}
                </span>
              )}

              {product.batteryHealth && (
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <BatteryChargingIcon size={12} />
                  <span>{product.batteryHealth}% Battery Health</span>
                </span>
              )}

              {product.regionVariant && (
                <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                  {product.regionVariant}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              {product.title}
            </h1>

            {/* Price summary for SSR / SEO */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                {formatBdt(lowestPrice)}
              </span>
              {highestOriginalPrice > lowestPrice && (
                <span className="text-base text-zinc-400 line-through dark:text-zinc-500 font-normal">
                  {formatBdt(highestOriginalPrice)}
                </span>
              )}
              {highestOriginalPrice > lowestPrice && (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-0.5 text-xs">
                  Save {formatBdt(highestOriginalPrice - lowestPrice)}
                </span>
              )}
            </div>

            {/* EMI & Replacement Kicker */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CreditCardIcon size={14} className="text-zinc-400" />
                <span>0% EMI from <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{formatBdt(emiPerMonth)}/month</strong> (Up to 36 Mo)</span>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheckIcon size={14} />
                <span>7-Day Instant Replacement Guarantee</span>
              </span>
            </div>
          </div>

          {/* Variant Selector + Add to Cart — Client Component leaf */}
          <VariantSelector product={product} />

          {/* WhatsApp Specialist Link */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <MessageCircleIcon size={15} className="text-emerald-500" />
                <span>Need live video inspection or exact 3uTools report?</span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Our technicians can stream or send high-resolution video of this unit via WhatsApp before dispatch.
              </div>
            </div>
            <a
              href={`https://wa.me/8801976478673?text=${encodeURIComponent(
                `Hello iStoreBD! I want live video proof & 3uTools report for: ${product.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 text-xs transition-colors shrink-0 shadow-xs"
            >
              Ask on WhatsApp
            </a>
          </div>

          {/* Pre-Owned Detailed Description */}
          {product.description && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Diagnostic &amp; Condition Details
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Detailed Hardware Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Hardware &amp; Verification Specs
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex flex-col py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{key}</dt>
                    <dd className="font-semibold text-zinc-900 dark:text-white mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* 4 Guarantees Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ShieldCheckIcon, label: '7-Day Replacement', sub: 'Instant physical hardware replacement' },
              { icon: WrenchIcon, label: '2-Year Free Service', sub: 'Dedicated store lab care & testing' },
              { icon: BoxIcon, label: 'Open-Box Inspection', sub: 'Check True Tone & IMEI before COD' },
              { icon: CreditCardIcon, label: '36 Months 0% EMI', sub: 'City Bank, BRAC, SCB, EBL & 18+ banks' },
            ].map(({ icon: IconComponent, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <IconComponent size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">{label}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Store Experience Pickup Notice */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
            <strong>Prefer physical store pickup?</strong> Visit our diagnostic centers at <strong>Bashundhara City (Level 5, Block B, Shop #52)</strong> or <strong>Jamuna Future Park (Level 4, Shop #4A-012)</strong> for hands-on inspection.
          </div>
        </div>
      </div>
    </div>
  );
}
