# iStoreBD — Certified Pre-Owned iPhone Marketplace: Product Requirements Document (PRD)

> **Core Concept:** Bangladesh's premier certified pre-owned iPhone and Apple ecosystem marketplace engineered with 70-point hardware diagnostic verification, authentic battery health disclosure, 7-day replacement guarantee, 2-year service warranty, 0% EMI up to 36 months, and open-box cash on delivery across all 64 districts.
> **Design References & Invariants:** Inspired by the trust, clarity, and speed of [Goriber Gadget](https://goribergadget.com/), [Recell BD](https://www.recell.com.bd/), and [Gadget N Gadget BD](https://www.gadgetngadgetbd.com/).

---

## 1. Executive Summary & Market Positioning

### 1.1 The Market Problem in Bangladesh
Buying a used iPhone through informal channels (Facebook groups, Bikroy, unverified grey-market street shops) carries severe consumer risks:
* **Hidden Component Swapping:** Original OLED Super Retina displays swapped with cheap aftermarket TFT/LCD screens, causing yellow tint and lost True Tone.
* **Biometric & Sensor Failure:** Bypassed or broken Face ID sensors, non-functional LiDAR depth scanners.
* **Battery Health Manipulation:** Boosted or low-grade third-party batteries with thermal throttling.
* **iCloud / BTRC Blacklisting:** Locked iCloud accounts or blacklisted IMEI numbers.
* **Zero After-Sales Recourse:** "Sold as-is" with 0-day warranties.

### 1.2 The iStoreBD Solution & Invariant Guarantees
1. **70-Point Hardware Lab Audit:** 3uTools score of 95–100%, original display match, functional True Tone, and functional Face ID guaranteed.
2. **Transparent Battery Disclosure:** Exact battery health percentage displayed upfront (85%–100% original Apple batteries).
3. **Condition Grading:** Explicit physical grading (Grade A+ Pristine, Grade A Excellent, Grade B+ Value).
4. **7-Day Instant Replacement Guarantee:** If any hardware defect arises within 7 days, immediate replacement with equal or higher-tier unit.
5. **2-Year Free Service Warranty:** In-house repair and diagnostics lab care at Bashundhara City and Jamuna Future Park stores.
6. **36 Months 0% EMI:** Supported through 22 Bangladeshi commercial banks.
7. **Instant Phone Exchange / Trade-In:** Online valuation calculator allowing trade-in of older iPhones or Android flagships.
8. **Nationwide Open-Box Cash on Delivery:** Customers can inspect the phone, verify True Tone, camera lenses, and IMEI before disbursing cash.

---

## 2. Core Functional Requirements

### 2.1 Storefront & Catalog Experience
* **Series Navigation:** Quick access to iPhone 16 Series, iPhone 15 Series, iPhone 14 Series, iPhone 13 Series, Budget Flagships (< ৳45k), and Certified MacBooks & iPads.
* **Live Attribute Filtering:** Instant client-side and server-side filtering by:
  * Condition Grade (`Grade A+`, `Grade A`, `Grade B`)
  * Battery Health (`90%+`, `85–89%`)
  * SIM Configuration (`ZA/A Dual Physical SIM`, `LL/A eSIM + Nano-SIM`)
  * Storage Capacity (`128GB`, `256GB`, `512GB`, `1TB`)
  * Price Bands (`< ৳45k`, `৳45k–৳80k`, `৳80k+`)
* **Live Instant Search:** Typeahead search with trending pre-owned model suggestions.

### 2.2 Product Detail Page (PDP)
* **Pre-Owned Trust Badges:** Prominent battery health pill, condition grade pill, region code, and 70-point test checkmark.
* **Monthly EMI Indicator:** Calculated installment pricing per month for 36-month tenures.
* **WhatsApp Live Proof Request:** One-click WhatsApp link to request video proof and 3uTools inspection sheet before shipment.
* **Hardware Specification Audit Table:** Detailed breakdown of True Tone, Face ID, camera OIS, LCI moisture indicator, and package contents (box, memo, charger).

### 2.3 Interactive Phone Exchange & Trade-In Calculator
* Brand selector (Apple, Samsung, Google Pixel, OnePlus).
* Model selector with base trade-in valuations.
* Condition adjustments (Flawless 10/10, Good 8–9/10, Fair 7/10).
* Battery health & box availability multipliers.
* Real-time calculation of trade-in value and upgrade difference towards a target iPhone.
* One-click direct trade-in reservation via WhatsApp or store drop-off.

### 2.4 Physical Retail & Lab Locations
* **Bashundhara City Experience Center:** Level 5, Block B, Shop #52, Panthapath, Dhaka.
* **Jamuna Future Park Experience Center:** Level 4, Zone C, Shop #4A-012, Kuril, Dhaka.

---

## 3. Architecture & Technical Invariants

* **Framework:** Next.js App Router (React 19).
* **Rendering Strategy:** React Server Components (RSC) by default for SEO, FCP, and zero unnecessary client JavaScript.
* **Interactive Leaves:** Strictly isolate `'use client'` to interactive leaves (`InstantSearch`, `LiveDeviceInventory`, `TradeInCalculator`, `FloatingSupportWidget`).
* **Financial Integrity:** All pricing in Bangladeshi Taka (`৳ BDT`), server-authoritative calculations, decimal(18,2) precision.
* **API Integration:** Centralized API client wrapper with graceful fallback to curated pre-owned inventory.
