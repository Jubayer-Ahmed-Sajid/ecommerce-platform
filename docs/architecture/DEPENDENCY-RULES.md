# Dependency Governance & Layering Rules

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

This document defines the strict, machine-auditable dependency rules governing the entire codebase. A dependency is not permitted merely because C# or TypeScript compiles; it must comply with this standard.

---

## 1. Project Reference Matrix (Backend)

The table below indicates which projects are allowed to reference each other:

| Consumer Project | `Domain` | `Catalog` | `Inventory` | `Customers` | `Orders` | `Payments` | `Identity` | `Infrastructure` | `Api` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `Ecommerce.Domain` | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `Ecommerce.Modules.Catalog` | ✅ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `Ecommerce.Modules.Inventory`| ✅ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `Ecommerce.Modules.Customers`| ✅ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ |
| `Ecommerce.Modules.Payments` | ✅ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| `Ecommerce.Modules.Identity` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| `Ecommerce.Modules.Orders`   | ✅ | ✅* | ✅* | ✅* | — | ✅* | ❌ | ❌ | ❌ |
| `Ecommerce.Infrastructure`   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ❌ |
| `Ecommerce.Api` (Host)      | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `Ecommerce.UnitTests`        | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

*\*Note: `Ecommerce.Modules.Orders` references only public interface abstractions and DTOs of peer modules, never internal classes.*

---

## 2. Layering Invariants

### Rule 1: The Domain Layer is Pure
`Ecommerce.Domain` represents the shared kernel of enterprise concepts (`Money`, `Entity<T>`, `Result<T>`).
* **FORBIDDEN:** Referencing `Microsoft.AspNetCore.*`, `Microsoft.EntityFrameworkCore.*`, or any external database driver.
* **FORBIDDEN:** Accessing the system clock directly via `DateTime.Now` (use `DateTimeOffset.UtcNow` or a time provider).

### Rule 2: Application Use Cases Do Not Know HTTP
Classes in `Ecommerce.Modules.*` that implement business use cases (e.g. `CheckoutCommandHandler`, `UpdateProductHandler`):
* **FORBIDDEN:** Referencing `Microsoft.AspNetCore.Http` (`HttpContext`, `HttpRequest`, `IHeaderDictionary`).
* **FORBIDDEN:** Accessing cookies, session state, or HTTP query strings directly.
* **MANDATE:** Receive typed parameters and return typed results.

### Rule 3: API Host Contains Zero Business Calculations
Controllers and Minimal API endpoints in `Ecommerce.Api`:
* **FORBIDDEN:** Calculating prices, applying taxes, or evaluating stock rules.
* **FORBIDDEN:** Calling `DbContext.SaveChanges()` directly in endpoint delegates.
* **MANDATE:** Act purely as an HTTP protocol gateway: validate model, call use case, map response.

### Rule 4: EF Entities Are Not Public API Contracts
* **FORBIDDEN:** Returning an EF Core entity (e.g. `Product`, `Order`, `StockItem`) directly from a Web API endpoint.
* **MANDATE:** Map domain entities to explicit Data Transfer Objects (`ProductDto`, `OrderSummaryDto`) before returning to callers.

---

## 3. Database Dependency & Foreign Key Rules

1. **Intra-Module Relationships:** Entities within the same module (e.g. `Order` and `OrderItem`, or `Product` and `ProductVariant`) may define EF Core navigation properties and database foreign keys with cascade delete where appropriate.
2. **Cross-Module Relationships:** Entities across different modules (e.g. `OrderItem` referencing `Product`) **MUST NOT** define EF Core navigation properties or database foreign key constraints. They store the target identifier as a scalar primitive (e.g. `public Guid ProductId { get; set; }`).
3. **Rationale:** This prevents database schema locking, prevents unintended cascade deletions across boundaries, and allows independent module evolution without migration conflicts.

---

## 4. Frontend Dependency & Boundary Rules

1. **No Ad-Hoc Fetching:** UI components must not execute raw `fetch('http://localhost:5000/api/...')`. All network requests route through `src/lib/api-client.ts`.
2. **Component Import Boundaries:**
   * `components/ui`: Must not import from `components/storefront` or `components/admin`.
   * `components/storefront`: Must not import from `components/admin`.
   * `components/admin`: Must not import from `components/storefront`.
3. **Client Component Confinement:** A file with `'use client'` must never be imported by another Server Component if doing so forces the parent to become a Client Component unnecessarily.
