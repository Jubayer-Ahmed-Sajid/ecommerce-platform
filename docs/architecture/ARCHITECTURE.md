# High-Level Architecture & System Philosophy

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

---

## 1. System Overview & Macro Flow

The system is constructed as a decoupled **Next.js Storefront & Admin** application interacting with an **ASP.NET Core Modular Monolith API** backed by a **MySQL 8.0** relational database.

```text
                  +-----------------------------------+
                  |        Next.js Storefront         |
                  |        & Admin Dashboard          |
                  |  (Server Components + Client Leaves) |
                  +-----------------------------------+
                                    |
                                    | HTTPS / JSON REST API
                                    v
                  +-----------------------------------+
                  |     ASP.NET Core Web API Host     |
                  | (Routing, Auth, Validation, CORS) |
                  +-----------------------------------+
                                    |
                                    v
     +-------------------------------------------------------------+
     |                 BUSINESS MODULE LAYER                       |
     |                                                             |
     |   +-----------+  +-----------+  +-----------+  +--------+   |
     |   |  Catalog  |  | Inventory |  | Customers |  | Identity|  |
     |   +-----------+  +-----------+  +-----------+  +--------+   |
     |         ^              ^              ^                     |
     |         |              |              |                     |
     |   +-----------------------------------------------------+   |
     |   |                   Orders Module                     |   |
     |   +-----------------------------------------------------+   |
     |                            |                                |
     |                            v                                |
     |                     +-------------+                         |
     |                     |  Payments   |                         |
     |                     +-------------+                         |
     +-------------------------------------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |    Infrastructure & Persistence   |
                  |     (EF Core / MySQL 8.0 / Pomelo)|
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |             MySQL 8.0             |
                  |  (InnoDB, utf8mb4, Strict Keys)   |
                  +-----------------------------------+
```

---

## 2. Why a Modular Monolith?

### The Context
The first client deployment is a focused e-commerce MVP with an approximate client budget of **BDT 40,000**. However, the platform must serve as the technical foundation for a commercial platform capable of justifying a project value of **BDT 600,000 or more**.

### The Solution: Modular Monolith
A Modular Monolith combines the simplicity, operational ease, and transactional safety of a monolith with the strict domain encapsulation, clear ownership, and maintainability of distributed systems.

* **Single Process Deployment:** One Web API application running on affordable hardware ($5–$10/month Linux VPS or standard app service).
* **Zero Distributed Latency:** Modules communicate via direct, strongly-typed in-memory method invocations (`ICatalogModule`, `IInventoryModule`), avoiding HTTP/network overhead.
* **ACID Transactions:** Checkout orchestration (stock deduction, order line creation, payment registration) can execute within a single database transaction without requiring complex distributed sagas or two-phase commits.
* **Enforced Boundaries:** Business modules are separated into distinct assemblies in C#. Code in `Orders` cannot accidentally read or update `Catalog` internal state without going through explicit contracts.

---

## 3. Why Microservices Are Forbidden

Microservices are strictly prohibited for this project because:
1. **Disproportionate Operational Overhead:** Microservices require container registries, Kubernetes or service meshes, distributed tracing, API gateways, independent CI/CD pipelines, and multi-database management. This would instantly exhaust the BDT 40k budget and render maintenance impossible.
2. **Distributed Data Complexity:** In an e-commerce checkout flow, distributed services require eventual consistency, compensating transactions, and distributed locks. In our modular monolith, MySQL transactions guarantee consistency out-of-the-box.
3. **Premature Optimization:** "Microservices are more scalable" is not engineering justification. Our modular monolith on a standard 4GB VPS can comfortably handle hundreds of requests per second for standard e-commerce traffic.
4. **Extraction Readiness:** Because modules are separated into isolated assemblies with strict public contracts and no cross-module database foreign keys, any module can be extracted into an independent service in the future if a legitimate business requirement arises (e.g. independent scaling or third-party compliance).

---

## 4. Frontend vs. Backend Separation of Concerns

The system enforces an authoritative division of responsibilities:

| Responsibility | Owning Tier | Guiding Principle |
|---|---|---|
| **Presentation & UI Layout** | Next.js Frontend | Fast SSR, mobile-responsive, modern design system. |
| **SEO & OpenGraph Metadata** | Next.js Frontend | Pre-rendered HTML via Server Components. |
| **User Interaction State** | Next.js Frontend | Cart drawer, interactive filters, form inputs. |
| **Price Authority** | ASP.NET Core Backend | The backend calculates and validates all totals. The client price is ignored. |
| **Stock Validation & Deduction**| ASP.NET Core Backend | The backend verifies stock availability and deducts atomically. |
| **Order State Machine** | ASP.NET Core Backend | State transitions (`Pending` $\rightarrow$ `Processing` $\rightarrow$ `Shipped`) enforced server-side. |
| **Authentication & Permissions**| ASP.NET Core Backend | Security policies enforced via claims on every request. |
| **Payment Status Verification** | ASP.NET Core Backend | Verified against trusted payment intent or admin confirmation. |

---

## 5. Organization of Business Modules

The backend business domain is divided into focused modules:
1. **`Catalog`**: Product definitions, categories, variants (sizes, colors), media images, base pricing.
2. **`Inventory`**: Stock tracking, stock adjustments, deduction upon purchase.
3. **`Customers`**: Customer profiles, delivery addresses, guest identity.
4. **`Orders`**: Checkout orchestration, authoritative order lines, price snapshots, status workflow.
5. **`Payments`**: Payment intent tracking, Cash on Delivery (COD) handling, manual bKash/Nagad verification.
6. **`Identity`**: Admin credentials, password hashing, role claims, session tokens.

---

## 6. Infrastructure Isolation

The core domain and application use cases have **zero knowledge** of infrastructure implementation details:
* The database engine (MySQL 8.0 via Pomelo EF Core) is wired inside `Ecommerce.Infrastructure`.
* File storage is accessed via `IFileStorageService`. The application does not care whether bytes are written to the local filesystem (`LocalFileStorageService`) or Cloudflare R2 (`R2FileStorageService`).
* Authentication mechanisms (cookies vs Bearer tokens) are handled by ASP.NET Core middleware and handlers, not domain aggregates.

---

## 7. Evolution Pathway (BDT 40k to BDT 600k+)

The architecture scales through **controlled evolution**, not rewrites:
1. **MVP Phase (BDT 40k):** Single MySQL instance, in-process modular contracts, local image storage, Cash on Delivery + manual bKash/Nagad.
2. **Commercial Expansion:** Introduce automated payment gateways (SSLCommerz) behind `IPaymentsModule`, swap image storage to Cloudflare R2 behind `IFileStorageService`, add a `Discounts` module.
3. **Enterprise Platform (BDT 600k+):** Add Redis caching behind existing read interfaces without modifying business logic, add multi-store channel IDs to query contracts, and extract high-volume modules if independent scaling is demanded.
