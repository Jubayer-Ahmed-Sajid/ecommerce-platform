# System Evolution & Scalability Guide

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

This guide provides concrete, step-by-step instructions for evolving the platform from the initial BDT 40,000 MVP deployment into a BDT 600,000+ commercial commerce platform without architectural degradation or rewrites.

---

## 1. Architectural Scaling Philosophy

* **Localized Evolution:** Scaling is achieved by optimizing specific module implementations, not by rewriting the entire system.
* **Metric-Driven Triggers:** New infrastructure (caches, search engines, queues) is introduced only when concrete operational telemetry demonstrates necessity.
* **Preserve Abstraction Boundaries:** The interface contracts established in the MVP must remain stable as implementations evolve.

---

## 2. Evolution Milestones & Triggers

```text
[Phase 1: BDT 40,000 MVP]
  - Single Linux VPS, In-Process Modules, Single MySQL 8.0, Local Image Storage, Manual MFS/COD.
  │
  ▼ (Trigger: Merchant Account Acquired & Order Volume Exceeds 20 orders/day)
[Phase 2: Commercial Automation]
  - Automated Payment Gateways (SSLCommerz, bKash Checkout API) behind IPaymentsModule.
  - Media storage migrated to Cloudflare R2 behind IFileStorageService.
  - Coupon & Discount Engine added as Ecommerce.Modules.Discounts.
  │
  ▼ (Trigger: Multi-Instance Deployment or Database CPU > 70% under catalog read load)
[Phase 3: High-Scale Monolith]
  - Distributed Redis cache behind ICatalogModule read operations.
  - Hangfire / Background workers for SMS delivery notifications.
  - Meilisearch introduced if catalog exceeds 10,000 SKUs with faceted search.
  │
  ▼ (Trigger: Independent Business Units / Separate Storefronts)
[Phase 4: Multi-Storefront & Targeted Extraction (BDT 600,000+)]
  - Shared backend powering multiple discrete Next.js storefronts via ChannelId.
  - Extraction of high-volume modules (e.g. Payments) into standalone services via gRPC.
```

---

## 3. How to Add a New Business Module

To introduce a new module (e.g. `Ecommerce.Modules.Discounts`):

1. **Create the Project:**
   ```bash
   dotnet new classlib -o backend/src/Ecommerce.Modules.Discounts
   dotnet sln backend/EcommercePlatform.sln add backend/src/Ecommerce.Modules.Discounts/Ecommerce.Modules.Discounts.csproj
   ```
2. **Reference the Shared Kernel:**
   * Reference `Ecommerce.Domain`. Do not reference other module implementation assemblies.
3. **Define Public Surface:**
   * Create `IDiscountsModule` and expose high-level operations (e.g. `ValidateCouponAsync`, `CalculateDiscountAsync`).
4. **Define Entities & EF Configurations:**
   * Place entities in `Domain/` and EF configurations in `Infrastructure/`.
   * Apply table prefix: `disc_*` (e.g. `disc_coupons`, `disc_coupon_usages`).
5. **Register in Infrastructure & API:**
   * Register entity configurations in `EcommerceDbContext`.
   * Add service registration extension `services.AddDiscountsModule()`.
   * Generate an EF Core migration: `dotnet ef migrations add AddDiscountsModule`.
6. **Update Architecture Documentation:**
   * Add the module to `MODULE-BOUNDARIES.md` and `SYSTEM-MAP.md`.

---

## 4. How to Add an Automated Payment Gateway

When integrating an automated gateway such as **SSLCommerz** or **bKash Checkout API**:

1. **Do NOT modify `Ecommerce.Modules.Orders`:** Orders only interacts with `IPaymentsModule`.
2. **Implement Gateway Driver:**
   * In `Ecommerce.Modules.Payments`, create `SslCommerzPaymentGateway` implementing `IPaymentGateway`.
3. **Register Webhook / Callback Endpoint:**
   * Add `/api/v1/payments/sslcommerz/ipn` to receive asynchronous Instant Payment Notifications (IPN).
4. **Verify Gateway Callback Signature:**
   * Authenticate the payload using SSLCommerz store password/hash before marking payment as `Paid`.
5. **Notify Orders Module:**
   * `IPaymentsModule` triggers order status transition to `Processing`.

---

## 5. How to Transition File Storage to Cloudflare R2 / S3

When local disk storage capacity reaches 20 GB or multi-instance load balancing is deployed:

1. Create `R2FileStorageService` in `Ecommerce.Infrastructure` implementing `IFileStorageService`.
2. Configure AWS S3 SDK with Cloudflare R2 endpoint and credentials.
3. In `Program.cs`, swap the dependency injection registration:
   ```csharp
   // From:
   // builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
   // To:
   builder.Services.AddScoped<IFileStorageService, R2FileStorageService>();
   ```
4. **Zero changes** are required in `Ecommerce.Modules.Catalog` or the controllers.

---

## 6. How to Introduce Redis Caching

**Gatekeeper Trigger:** Read traffic on catalog endpoints causes database CPU to exceed 70%, or multiple API server instances require distributed cache invalidation.

1. Create `CachedCatalogModule` implementing `ICatalogModule` using the **Decorator Pattern**.
2. Wrap the primary `CatalogModule`:
   ```csharp
   public class CachedCatalogModule(ICatalogModule inner, IDistributedCache cache) : ICatalogModule
   {
       public async Task<ProductDetailsDto?> GetProductBySlugAsync(string slug, CancellationToken ct)
       {
           // Check Redis cache -> On miss, call inner.GetProductBySlugAsync and set cache
       }
   }
   ```
3. Register the decorator in `Program.cs`. Calling modules (`Orders`, `Api`) remain 100% unaware of the cache layer.

---

## 7. How to Support Multiple Storefronts

When a second storefront (e.g. Wholesale, Mobile App, or Brand B) requires the commerce engine:

1. Introduce a `ChannelId` or `StoreId` GUID header into incoming API requests.
2. Resolve `StoreId` in API middleware and pass it to use case queries.
3. Add `StoreId` index to `cat_products` and `ord_orders`.
4. **No architecture rewrite:** The backend remains a modular monolith serving multiple client frontends.
