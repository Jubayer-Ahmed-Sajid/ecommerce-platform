# Product & Technical Assumptions

**Document Version:** 2.0.0  
**Status:** Hardened Operational Baseline  
**Date:** 2026-09-25  

---

## 1. Commercial & Market Assumptions (Bangladesh D2C)

1. **Currency & Precision:**
   * All monetary figures are in Bangladeshi Taka (BDT / ৳).
   * Monetary precision is strictly 2 decimal places (`decimal(18,2)`), formatted as `৳1,250.00` or `৳1,250`.
2. **Customer Phone Numbers:**
   * Primary customer identifier and delivery contact is an 11-digit Bangladeshi mobile number starting with `01` (e.g. `01712345678`).
   * Valid telecom operator prefixes: `013`, `014`, `015`, `016`, `017`, `018`, `019`.
   * Country code `+88` or `88` is automatically normalized to the local 11-digit format upon entry.
3. **Delivery & Shipping Rates (Configurable Baseline):**
   * Configurable flat-rate delivery defaults (subject to merchant confirmation in `BUSINESS-DECISIONS.md` [BD-001]):
     * **Inside Dhaka Metro:** Default ৳60.00 (Standard 24–48 hours).
     * **Outside Dhaka (All other divisions):** Default ৳120.00 (Standard 48–72 hours).
   * Free shipping automatically applied when order subtotal $\ge ৳2,000.00$ (subject to [BD-002]).
4. **Payment Ergonomics:**
   * **Cash on Delivery (COD):** The standard default payment method for ~85% of retail e-commerce in Bangladesh. Order is confirmed immediately with payment status `Pending`.
   * **Mobile Financial Services (MFS):** Manual bKash, Nagad, and Rocket support where merchant provides a designated personal or merchant number, and customer enters their sender number and 8–10 character alphanumeric Transaction ID (TrxID).
   * Automated gateway redirects (e.g. SSLCommerz, bKash Direct API) are intentionally deferred to Phase 2 to keep initial MVP costs within BDT 40k.
5. **Guest Purchasing:**
   * Mandatory password creation creates significant checkout abandonment in Bangladesh. Therefore, guest checkout is enabled by default. Orders are linked by phone number and customer ID.

---

## 2. Technical & Architectural Assumptions

1. **Single-Process Deployment:**
   * The backend runs as a single ASP.NET Core process with MySQL 8.0 on a Linux VPS or cloud app container.
   * File uploads are stored on local persistent disk behind `IFileStorageService` during MVP, with zero code changes required when transitioning to Cloudflare R2 or AWS S3 later.
2. **Database Concurrency & Transactions:**
   * EF Core with Pomelo MySQL provider handles atomic checkout using explicit database transactions (`BeginTransactionAsync`).
   * Read operations use `.AsNoTracking()` and explicit projections (`.Select()`).
3. **Frontend Rendering:**
   * Storefront public routes use Next.js React Server Components (RSC) to maximize SEO and page speed on 4G cellular connections.
   * Interactive components (`AddToCart`, `CartDrawer`, `CheckoutForm`) are client components placed at the leaf level.
