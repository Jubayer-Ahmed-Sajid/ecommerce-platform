# Feature Scope & Traceability Matrix

**Document Version:** 2.0.0  
**Status:** Hardened Architectural & Scope Baseline  
**Date:** 2026-09-25  

This matrix details the full capability inventory, module ownership, visibility, dependencies, acceptance criteria references, and scope boundaries.

---

## 1. Comprehensive Feature Matrix

| Feature / Capability | Scope | Owning Module | Dependencies | Visibility | Acceptance Criteria Ref | Implementation Status |
|---|:---:|---|---|:---:|:---:|:---:|
| **Category Hierarchy & Browsing** | **MVP** | `Ecommerce.Modules.Catalog` | Domain | Storefront & Admin | `AC-CAT-01`, `AC-DISC-01` | Implemented |
| **Product Definitions & Slugs** | **MVP** | `Ecommerce.Modules.Catalog` | Domain | Storefront & Admin | `AC-CAT-01`, `AC-CAT-02` | Implemented |
| **Multi-Variant Support (SKU, Size, Color)** | **MVP** | `Ecommerce.Modules.Catalog` | Domain | Storefront & Admin | `AC-CAT-01`, `AC-DISC-02` | Implemented |
| **Product Image Gallery & Uploads** | **MVP** | `Ecommerce.Modules.Catalog` | `IFileStorageService` | Storefront & Admin | `AC-CAT-04` | Implemented |
| **Base Pricing & Variant Adjustments** | **MVP** | `Ecommerce.Modules.Catalog` | Domain | Storefront & Admin | `AC-CAT-01`, `AC-CHK-01` | Implemented |
| **Soft Product Deletion** | **MVP** | `Ecommerce.Modules.Catalog` | Domain | Admin Only | `AC-CAT-03` | Implemented |
| **Public Catalog Search (Prefix/Like)** | **MVP** | `Ecommerce.Modules.Catalog` | MySQL `FULLTEXT` | Storefront | `AC-DISC-01` | Implemented |
| **Category & Price Sorting** | **MVP** | `Ecommerce.Modules.Catalog` | URL State | Storefront | `AC-DISC-01` | Implemented |
| **PDP Structured Data (Schema.org JSON-LD)**| **MVP** | `Ecommerce.Modules.Catalog` | RSC | Storefront | `AC-DISC-02` | Implemented |
| **Ephemeral Local Cart (`localStorage`)** | **MVP** | `frontend/src/features/cart`| Local Storage | Storefront | `AC-CART-01` | Implemented |
| **Cart Slide-Out Drawer & Full /cart** | **MVP** | `frontend/src/features/cart`| CartProvider | Storefront | `AC-CART-01` | Implemented |
| **Out-of-Stock Cart UI Prevention** | **MVP** | `frontend/src/features/cart`| `IInventoryModule` | Storefront | `AC-CART-02` | Implemented |
| **Free Delivery Progress Bar** | **MVP** | `frontend/src/features/cart`| Cart State | Storefront | `AC-CHK-03` | Implemented |
| **Guest Single-Step Checkout** | **MVP** | `Ecommerce.Modules.Orders` | Catalog, Inventory, Customers | Storefront | `AC-CHK-01`, `AC-CHK-02` | Implemented |
| **Bangladeshi Phone Validation (`01[3-9]\d{8}`)** | **MVP** | `Ecommerce.Modules.Customers`| Regex | Storefront & Admin | `AC-CHK-02` | Implemented |
| **Destination Shipping Fee Evaluation** | **MVP** | `Ecommerce.Modules.Orders` | Config | Storefront & Admin | `AC-CHK-03` | Implemented |
| **Server-Authoritative Price Calculation** | **MVP** | `Ecommerce.Modules.Orders` | `ICatalogModule` | Backend Internal | `AC-CHK-01` | Implemented |
| **Immutable Order Line Snapshots** | **MVP** | `Ecommerce.Modules.Orders` | Domain | Backend Internal | `AC-CHK-01`, `AC-CAT-03` | Implemented |
| **Atomic Stock Deduction on Checkout** | **MVP** | `Ecommerce.Modules.Inventory`| `BeginTransactionAsync` | Backend Internal | `AC-INV-01`, `AC-INV-02` | Implemented |
| **Stock Movement Audit Log (`inv_stock_logs`)**| **MVP** | `Ecommerce.Modules.Inventory`| MySQL | Admin Only | `AC-INV-01`, `AC-INV-04` | Implemented |
| **Order Cancellation Stock Release** | **MVP** | `Ecommerce.Modules.Inventory`| `IOrdersModule` | Backend Internal | `AC-INV-03` | Implemented |
| **Order Status State Machine** | **MVP** | `Ecommerce.Modules.Orders` | Domain | Admin & Storefront | `AC-ORD-01`, `AC-ORD-02` | Implemented |
| **Cash on Delivery (COD) Workflow** | **MVP** | `Ecommerce.Modules.Payments` | `IOrdersModule` | Storefront & Admin | `AC-PAY-01` | Implemented |
| **Manual MFS (bKash/Nagad) TrxID Capture** | **MVP** | `Ecommerce.Modules.Payments` | Storefront Form | Storefront & Admin | `AC-PAY-02` | Implemented |
| **Admin MFS Verification Screen** | **MVP** | `Ecommerce.Modules.Payments` | Admin Auth | Admin Only | `AC-PAY-02`, `AC-PAY-04` | Implemented |
| **MFS Duplicate TrxID Replay Prevention** | **MVP** | `Ecommerce.Modules.Payments` | MySQL Index | Backend Internal | `AC-PAY-03` | Implemented |
| **Dual-Key Public Order Tracking** | **MVP** | `Ecommerce.Modules.Orders` | Phone + Order # | Storefront | `AC-TRK-01`, `AC-TRK-02` | Implemented |
| **Anti-IDOR & Tracking Rate Limiting** | **MVP** | `Ecommerce.Api` | ASP.NET RateLimiter | Public API | `AC-TRK-03` | Implemented |
| **Secure Admin Login (PBKDF2)** | **MVP** | `Ecommerce.Modules.Identity` | Crypto | Admin Only | `AC-SEC-01`, `AC-SEC-03` | Implemented |
| **Admin Brute-Force Lockout Defense** | **MVP** | `Ecommerce.Modules.Identity` | In-Memory / Db | Admin API | `AC-SEC-02` | Implemented |
| **Admin Dashboard Overview Metrics** | **MVP** | `Ecommerce.Api` | EF Core | Admin Only | `AC-SEC-01` | Implemented |
| **Admin Inventory Adjustment with Reason** | **MVP** | `Ecommerce.Modules.Inventory`| Admin Auth | Admin Only | `AC-INV-04` | Implemented |
| **Customer Account Claiming Post-Order** | **Later** | `Ecommerce.Modules.Customers`| `Identity` | Storefront | *Phase 2 Spec* | Planned (Phase 2) |
| **Customer Order History Portal** | **Later** | `Ecommerce.Modules.Customers`| Customer Auth | Storefront | *Phase 2 Spec* | Planned (Phase 2) |
| **Automated Payment Gateway (SSLCommerz)** | **Later** | `Ecommerce.Modules.Payments` | External Gateway | Storefront & Admin | *Phase 2 Spec* | Deferred (Phase 2) |
| **Automated SMS Notification Gateway** | **Later** | `Ecommerce.Infrastructure` | Third-party SMS API | Storefront & Admin | *Phase 2 Spec* | Deferred (Phase 2) |
| **Promotional Coupon & Discount Engine** | **Later** | `Ecommerce.Modules.Discounts`| `IOrdersModule` | Storefront & Admin | *Phase 2 Spec* | Deferred (Phase 2) |
| **Cloudflare R2 / S3 Storage Gateway** | **Later** | `Ecommerce.Infrastructure` | S3 SDK | Infrastructure | *Phase 2 Spec* | Deferred (Phase 2) |
| **Customer Product Reviews & Ratings** | **Later** | `Ecommerce.Modules.Catalog` | Customer Auth | Storefront | *Phase 2 Spec* | Deferred (Phase 2) |
| **Faceted Dynamic Search (Meilisearch)** | **Scale** | `Ecommerce.Infrastructure` | Meilisearch Engine | Storefront | *Platform Spec* | Scale Triggered |
| **Redis Distributed Caching** | **Scale** | `Ecommerce.Infrastructure` | Redis Server | Infrastructure | *Platform Spec* | Scale Triggered |
| **Multi-Warehouse Logistics & Routing** | **Out** | N/A | N/A | N/A | N/A | Non-Goal |
| **Multi-Vendor Marketplace** | **Out** | N/A | N/A | N/A | N/A | Non-Goal |
| **Microservices / Service Mesh** | **Out** | N/A | N/A | N/A | N/A | Strictly Forbidden |
