# Product Implementation Roadmap & Evolution Blueprint

**Document Version:** 2.0.0  
**Status:** Hardened Roadmap Baseline  
**Date:** 2026-09-25  

This document defines the architectural implementation phases, dependency graph, and strict release milestones, cleanly separating MVP deliverables from post-MVP expansions.

---

## 1. Scope Partitioning & Horizon Overview

```text
========================================================================
HORIZON 1: PRODUCTION MVP (Current Target — Budget ~BDT 40k)
========================================================================
- Foundation & Architecture Verification (Completed)
- Persistence Core & Database Models (cat_*, inv_*, cus_*, ord_*, pay_*, usr_*)
- Catalog Module & Public Product Discovery (Homepage, /products, PDP)
- Inventory Module & Physical Stock Tracking (Deduction, Restock, Logs)
- Cart Experience & Slide-Out Drawer (localStorage, Subtotal preview)
- Customers & Single-Step Authoritative Checkout (BD Phone, Zones, Server Calc)
- Order Lifecycle & Public Tracking (Dual-Key Phone + Order # Anti-IDOR)
- Payments Module (COD & Manual MFS with TrxID Verification)
- Identity & Admin Authentication (PBKDF2, Lockout, Secure Cookies)
- Admin Management Suite (Dashboard, Catalog CRUD, Order Fulfillment, Stock Adjust)
- Production Hardening & Automated Quality Gates (L1–L10)

========================================================================
HORIZON 2: POST-MVP COMMERCIAL EXPANSION (Phase 2)
========================================================================
- Optional Customer Account Claiming (Password creation post-checkout)
- Authenticated Customer Order History Portal
- Automated Payment Gateway Integration (SSLCommerz / bKash Direct API)
- Automated SMS Transaction Notifications (Greenweb / BulkSMSBD)
- Promotional Coupons & Discount Engine (Ecommerce.Modules.Discounts)
- Cloudflare R2 / AWS S3 File Storage Integration (IFileStorageService)
- Customer Product Reviews & Star Ratings

========================================================================
HORIZON 3: SCALE & ENTERPRISE EXPANSION (BDT 600k+ Platform Scope)
========================================================================
- Redis Distributed Cache for Catalog Queries (Trigger: DB CPU > 70%)
- Meilisearch / Elasticsearch Faceted Search (Trigger: Catalog > 5,000 SKUs)
- Multi-Warehouse Inventory Routing & Split Shipments
- Multi-Vendor Marketplace & Seller Onboarding Portal
- Granular Role-Based Access Control (SuperAdmin, Support, Fulfillment Agent)
- Event-Driven Asynchronous Message Queue (RabbitMQ / Kafka)
```

---

## 2. Granular Implementation Phases for MVP

```text
Phase 1: Persistence Core & Database Models
   │   - Entities & Mappings for all 6 modules
   │   - EF Core DbContext with prefixed tables (cat_*, inv_*, etc.)
   │   - Zero cross-module physical foreign keys in MySQL
   │   - Migration pipeline & seed data
   │
   ▼
Phase 2: Catalog Module & Public Discovery
   │   - CatalogModule implementation & ICatalogModule contract
   │   - Public endpoints: /api/v1/products, /api/v1/categories
   │   - Storefront UI: Homepage, Products listing, Category filters, PDP, SEO JSON-LD
   │
   ▼
Phase 3: Inventory Module & Physical Stock Tracking
   │   - InventoryModule implementation & IInventoryModule contract
   │   - Stock reservation, atomic deduction, restock methods
   │   - Storefront stock badges & out-of-stock guards
   │
   ▼
Phase 4: Cart Experience & Drawer UI
   │   - Cart drawer component, persistent local state, item controls
   │   - Free shipping progress indicator
   │   - Dedicated /cart overview route
   │
   ▼
Phase 5: Customers & Single-Step Authoritative Checkout
   │   - CustomersModule & ICustomersModule
   │   - Checkout command in OrdersModule with atomic stock reservation
   │   - Single-step checkout frontend with BD phone validation & shipping zone selector
   │   - Server price authority enforcement
   │
   ▼
Phase 6: Order Lifecycle & Public Tracking
   │   - OrdersModule implementation & status state machine
   │   - Public order confirmation & dual-key tracking (/orders/track)
   │   - Anti-IDOR security & rate limiting
   │
   ▼
Phase 7: Payments Module (COD & Manual MFS)
   │   - PaymentsModule implementation & IPaymentsModule contract
   │   - Cash on Delivery handling & bKash/Nagad TrxID recording
   │   - Admin payment verification workflow
   │
   ▼
Phase 8: Identity & Admin Authentication
   │   - IdentityModule implementation & PBKDF2 password hasher
   │   - Token/Cookie generation & AdminOnly authorization policies
   │   - Frontend /admin/login form, 5-attempt lockout, session security
   │
   ▼
Phase 9: Admin Operations Suite
   │   - Admin Dashboard metrics overview
   │   - Product & Variant management with image uploads (IFileStorageService)
   │   - Order fulfillment & status updates
   │   - Inventory stock adjustments with audit logging
   │
   ▼
Phase 10: Production Hardening, Quality Gates & Automated Verification
       - Unit, architecture, and integration test coverage
       - Zero-warning builds (dotnet build -c Release, npm run build)
       - Security & performance audit
```

---

## 3. Detailed Specifications per MVP Phase

### Phase 1: Persistence Core & Database Models
* **Prerequisites:** Clean domain kernel (`Money`, `Result`, `Entity`).
* **Affected Modules:** `Ecommerce.Infrastructure`, `Ecommerce.Domain`.
* **Database Tables:**
  * `cat_categories`, `cat_products`, `cat_product_variants`, `cat_product_images`
  * `inv_stock_items`, `inv_stock_logs`
  * `cus_customers`, `cus_customer_addresses`
  * `ord_orders`, `ord_order_items`, `ord_status_history`
  * `pay_payments`, `pay_transactions`
  * `usr_users`, `usr_roles`, `usr_user_roles`
* **Invariants Enforced:**
  * Financial columns mapped to `decimal(18,2)`.
  * Module prefixes enforced on every table.
  * No cross-module physical foreign keys in MySQL.
  * Internal module cascades enabled (`cat_product_variants` $\rightarrow$ `cat_products`).

### Phase 2: Catalog Module & Public Discovery
* **Prerequisites:** Phase 1.
* **Affected Modules:** `Ecommerce.Modules.Catalog`, `Ecommerce.Api`, `frontend/src/features/catalog`.
* **Endpoints:**
  * `GET /api/v1/products` (Paged, filtered by category/search/sort)
  * `GET /api/v1/products/{slug}`
  * `GET /api/v1/categories`
* **Storefront UI:** Server Components with JSON-LD `Product` structured data, responsive image gallery, variant selector, breadcrumbs.

### Phase 3: Inventory Module & Physical Stock Tracking
* **Prerequisites:** Phase 1, Phase 2.
* **Affected Modules:** `Ecommerce.Modules.Inventory`, `Ecommerce.Api`.
* **Public Surface:** `IInventoryModule.CheckAvailabilityAsync`, `DeductStockAsync`, `ReleaseStockAsync`, `GetStockLevelAsync`.
* **Invariants:** Available quantity cannot drop below zero; stock logs record all changes with reason.

### Phase 4: Cart Experience & Drawer UI
* **Prerequisites:** Phase 2, Phase 3.
* **Frontend Components:**
  * `features/cart/context/cart-context.tsx`
  * `components/cart/cart-drawer.tsx`
  * `app/(storefront)/cart/page.tsx`
* **Ergonomics:** Slide-out drawer with backdrop blur, item removal confirmation, quantity stepper, free shipping threshold indicator.

### Phase 5: Customers & Single-Step Authoritative Checkout
* **Prerequisites:** Phase 1 through 4.
* **Affected Modules:** `Ecommerce.Modules.Customers`, `Ecommerce.Modules.Orders`, `Ecommerce.Api`.
* **Endpoints:** `POST /api/v1/orders/checkout`.
* **Frontend Route:** `app/(storefront)/checkout/page.tsx`.
* **Invariants:** Server calculates prices authoritatively; atomic stock reservation via `BeginTransactionAsync`; Bangladeshi phone regex validation.

### Phase 6: Order Lifecycle & Public Tracking
* **Prerequisites:** Phase 5.
* **Affected Modules:** `Ecommerce.Modules.Orders`, `Ecommerce.Api`.
* **Endpoints:**
  * `GET /api/v1/orders/{orderNumber}/track?phoneNumber={phone}`
  * `GET /api/v1/orders/{orderId}`
* **Invariants:** Order status transitions guarded by state machine; dual-key phone authentication for guest tracking; rate limiting.

### Phase 7: Payments Module (COD & Manual MFS)
* **Prerequisites:** Phase 5, Phase 6.
* **Affected Modules:** `Ecommerce.Modules.Payments`, `Ecommerce.Api`.
* **Endpoints:** `POST /api/v1/admin/payments/{paymentId}/verify`.
* **Invariants:** Payment record tracks TrxID and sender mobile; admin approval required for MFS to mark `Paid` and advance order to `Processing`.

### Phase 8: Identity & Admin Authentication
* **Prerequisites:** Phase 1.
* **Affected Modules:** `Ecommerce.Modules.Identity`, `Ecommerce.Api`, `frontend/src/features/auth`.
* **Endpoints:** `POST /api/v1/admin/auth/login`, `POST /api/v1/admin/auth/logout`, `GET /api/v1/admin/auth/me`.
* **Security:** PBKDF2 password hashing, 5-attempt lockout, secure HttpOnly session cookies.

### Phase 9: Admin Management Suite
* **Prerequisites:** Phase 1 through 8.
* **Affected Modules:** All modules + `Ecommerce.Api`.
* **Frontend Routes:** `/admin/dashboard`, `/admin/products`, `/admin/products/new`, `/admin/orders`, `/admin/orders/[id]`, `/admin/inventory`.
* **Features:** Media uploads via `IFileStorageService`, product/variant CRUD, order fulfillment, stock adjustment with reason logging.

### Phase 10: Production Hardening, Quality Gates & Automated Verification
* **Automated Tests:**
  * Backend unit and architecture tests (`dotnet test`).
  * Frontend unit and boundary tests (`npm test`).
  * Linter and type check passes (`npm run lint`, `npm run build`, `dotnet build -c Release`).
* **Security & Performance Audit:**
  * Verify HTTP security headers, rate limits, SQL injection protection, XSS defenses.
  * Validate Core Web Vitals (LCP $\le 2.5$s, INP $\le 200$ms, CLS $\le 0.1$).
