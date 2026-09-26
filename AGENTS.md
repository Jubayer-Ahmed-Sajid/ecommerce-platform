# AGENTS.md — The Engineering Constitution & Architectural Invariants

> **Core Philosophy:** *"Build today's simplest correct system while preserving clear boundaries for tomorrow's requirements."*  
> **Target Scope:** Production-grade BDT ~40,000 MVP deployment engineered to evolve into a BDT 600,000+ platform without structural rewrites.

This document is the authoritative engineering constitution for this repository. Every developer and AI coding agent working in this codebase **MUST** verify all changes against these explicit, actionable rules before writing or committing code.

---

## 1. System Architecture & Topology

1. **Modular Monolith Mandate:** The backend is a single ASP.NET Core process containing strictly isolated business modules.
2. **No Microservices:** Microservices, distributed services, and separate network deployments are strictly prohibited unless an approved Architecture Decision Record (ADR) establishes a non-negotiable operational necessity.
3. **Module Ownership:** Every business entity, database table, and operation belongs to exactly one business module.
4. **Boundary Integrity:** Modules communicate strictly through public interface contracts (`ICatalogModule`, `IInventoryModule`, etc.). Modules **MUST NOT** directly access another module's internal classes, DbContext, or database tables.
5. **No Speculative Tenancy:** Multi-store tenancy or multi-tenancy abstractions must not be implemented until a concrete business requirement arrives.

---

## 2. Backend Engineering Rules (ASP.NET Core / C#)

1. **Thin Endpoints:** Controllers and Minimal API endpoints must contain zero domain business rules. They only:
   * Bind and validate incoming HTTP requests.
   * Resolve authentication context (`ClaimsPrincipal`).
   * Invoke an application use case / handler.
   * Return standard HTTP responses (or RFC 7807 Problem Details on failure).
2. **Zero HTTP Leakage:** Application use cases and domain models **MUST NOT** reference `HttpContext`, `HttpRequest`, `HttpResponse`, `IHeaderDictionary`, or ASP.NET Core MVC/Http namespaces.
3. **Entity Encapsulation:** EF Core entities **MUST NEVER** be returned as public API contracts or accepted as request parameters. All endpoints must use explicit Request/Response Data Transfer Objects (DTOs).
4. **No Cross-Module Database Foreign Keys:** In MySQL, tables must not define foreign keys pointing to tables owned by other modules. Relationships across boundaries are stored as primitive IDs (e.g. `Guid ProductId`, `Guid CustomerId`).
5. **Server Authority:** All business calculations (pricing, discounts, taxes, shipping, stock validation, order status transitions) occur authoritatively on the backend. Client-provided prices or calculations must be discarded.
6. **Result & Exception Semantics:** Business validation failures must use explicit Result models or known domain exceptions that map cleanly to standard HTTP Problem Details. Do not swallow exceptions.

---

## 3. Database Rules (MySQL 8.0 & EF Core)

1. **MySQL Exclusivity:** MySQL 8.0 with InnoDB and `utf8mb4` collation is the authoritative database. Do not propose switching to PostgreSQL or NoSQL databases.
2. **Module Table Prefixes:** Tables in MySQL must be prefixed by their owning module:
   * Catalog: `cat_*` (e.g. `cat_products`, `cat_categories`)
   * Inventory: `inv_*` (e.g. `inv_stock_items`, `inv_stock_logs`)
   * Orders: `ord_*` (e.g. `ord_orders`, `ord_order_items`)
   * Customers: `cus_*` (e.g. `cus_customers`, `cus_addresses`)
   * Payments: `pay_*` (e.g. `pay_payments`, `pay_transactions`)
   * Identity: `usr_*` (e.g. `usr_users`, `usr_roles`)
3. **Financial Precision:** All monetary amounts (`UnitPrice`, `SubTotal`, `ShippingFee`, `DiscountAmount`, `TotalAmount`) must be mapped to `decimal(18,2)`. Floating point (`float` / `double`) is strictly forbidden for currency.
4. **Atomic Transactions:** Order placement, stock deduction, and payment intent generation must execute within an explicit database transaction (`BeginTransactionAsync`) to guarantee ACID guarantees across module boundaries.
5. **Read Optimization:** All read-only queries must use `.AsNoTracking()` and explicit projections (`.Select()`) to prevent change-tracker overhead.
6. **Migration Discipline:** Migrations are code-first, versioned, and managed centrally in `Ecommerce.Infrastructure`. Never manually edit production schema outside EF Core migrations.

---

## 4. Frontend Engineering Rules (Next.js App Router)

1. **Server Components by Default:** All pages, layouts, and data-fetching views in `app/(storefront)` and `app/(admin)` must be React Server Components (RSC) to maximize SEO, speed First Contentful Paint (FCP), and maintain zero client JavaScript footprint.
2. **Strict Client Component Justification:** A component is marked with `'use client'` **ONLY** when it strictly requires:
   * Interactive browser events (`onClick`, `onChange`, `onSubmit`).
   * React hooks (`useState`, `useEffect`, `useReducer`, `useRef`).
   * Browser APIs (`window`, `localStorage`, `IntersectionObserver`).
   * Client-side UI animations (e.g. modal dialogs, drawer sliders).
3. **Interactive Leaves Only:** Place `'use client'` directives as deep in the component tree as possible (at the leaves). Do not turn entire pages or parent layouts into Client Components.
4. **Centralized API Communication:** All API calls must route through the centralized API client wrapper (`src/lib/api-client.ts`). Components must not make ad-hoc `fetch()` calls with inline URLs or custom headers.
5. **No Global State Bloat:** Avoid large Redux/MobX/Zustand state trees. Storefront state belongs in:
   * URL Search Parameters (`?category=...&page=...`) for filterable/paginated views.
   * Server-rendered page props for catalog data.
   * Lightweight local/cookie storage for the active cart.
6. **No Client-Side Domain Logic:** The frontend must not compute checkout prices, apply discounts, or determine whether stock is available. It renders what the backend returns.

---

## 5. Security & Invariant Protection

1. **Never Trust the Client:**
   * Treat all incoming request bodies, query strings, headers, and form inputs as untrusted.
   * Frontend route guards or hidden buttons are UI conveniences, never security boundaries.
2. **Server-Side Authorization:** Every admin API endpoint must be protected by ASP.NET Core authorization policies (`[Authorize(Policy = "AdminOnly")]`).
3. **Secure Admin Authentication:** Admin sessions use encrypted HttpOnly, SameSite, Secure cookies (or short-lived Bearer tokens). Tokens must never be stored in browser `localStorage`.
4. **Password Security:** Passwords must be hashed using ASP.NET Core `IPasswordHasher` (PBKDF2 with HMAC-SHA512) or Argon2. Plaintext or MD5/SHA1 hashing is forbidden.
5. **Zero Secrets in Source Control:** Database credentials, JWT signing keys, and third-party API keys must be loaded from environment variables (`appsettings.json` must contain only placeholders).
6. **Input Sanitization & Injection Defense:**
   * Raw string concatenation in SQL queries is strictly prohibited (use EF Core parameterized queries).
   * User-submitted HTML in product descriptions must be sanitized before rendering.
7. **Rate Limiting:** Authentication endpoints (`/api/v1/admin/auth/login`) and checkout endpoints (`/api/v1/orders/checkout`) must have rate limiting enabled to prevent brute-force attacks and spam.

---

## 6. Abstraction & Simplicity Rules

1. **Abstractions Must Earn Their Place:** Do not introduce an interface, factory, or wrapper class unless it:
   * Provides an actual boundary between business modules.
   * Wraps an external I/O system (file storage, payment provider, email sender).
   * Enables critical unit testing of non-trivial business logic.
2. **No Generic Repositories:** Do not create a generic `IRepository<T>` or `BaseService<T>`. EF Core's `DbSet<T>` already implements the repository pattern. Use focused query methods and command handlers.
3. **No Design Pattern Checklist:** Do not add Mediator (MediatR), CQRS pipelines, Event Sourcing, or Specification patterns simply because they exist in textbooks. Introduce a pattern only when direct use-case classes become insufficient.
4. **No Giant Utility/Helper Classes:** Never create a `Utils`, `Helpers`, or `CommonManager` dumping ground. Place domain logic in the appropriate module entity, value object, or domain service.

---

## 7. Infrastructure Gateways & Triggers

The initial MVP must run cost-effectively on a single low-cost host. Future infrastructure components are **FORBIDDEN** until their documented triggers are met:

| Infrastructure | Current Status | Concrete Justification Trigger |
|---|---|---|
| **Redis** | **FORBIDDEN** | Introduced only when database CPU exceeds 70% under sustained catalog read load, or multi-server scaling requires distributed session invalidation. |
| **Search Engine (Elasticsearch / Meilisearch)** | **FORBIDDEN** | Introduced only when typo-tolerance, faceted catalog filtering, or search latency exceeds MySQL `FULLTEXT` index capabilities. |
| **Message Broker (RabbitMQ / Kafka)** | **FORBIDDEN** | Introduced only when asynchronous cross-system messaging requires durable pub/sub delivery guarantees beyond in-process background queues. |
| **Kubernetes / Clustered Containers** | **FORBIDDEN** | Introduced only when multiple engineering teams or independent high-availability auto-scaling requires container orchestration. |
| **Cloud Object Storage (S3 / R2)** | **DEFERRED** | Local disk storage behind `IFileStorageService` is used for MVP. Transition to Cloudflare R2 when local storage exceeds 20GB or multi-instance hosting begins. |

---

## 8. AI Coding Agent Workflow & Discipline

Before implementing any feature, bug fix, or refactoring, every AI agent **MUST** complete this 10-point checklist:

1. **Owning Module:** Which business module owns this feature? (If ambiguous, review [MODULE-BOUNDARIES.md](file:///c:/Projects/E-commerce%20platform/docs/architecture/MODULE-BOUNDARIES.md)).
2. **Boundary Impact:** Does this change affect any other module's public contract?
3. **Dependency Check:** Does this change introduce any forbidden project reference or namespace import? (Review [DEPENDENCY-RULES.md](file:///c:/Projects/E-commerce%20platform/docs/architecture/DEPENDENCY-RULES.md)).
4. **Database Impact:** Does this require a database schema change? If so, is it confined to the owning module's table prefix?
5. **API Contract:** Does this modify the public REST API? Are request/response DTOs updated and RFC 7807 error formats preserved?
6. **Component Placement:** If adding a Next.js component, can it remain a Server Component? (Default to RSC).
7. **Security Implications:** Are inputs validated server-side? Are admin endpoints authorized? Are prices recalculated?
8. **Justified Abstractions:** Did I introduce any unnecessary interfaces, wrappers, or design patterns?
9. **Build Verification:** Run `dotnet build` and `npm run build` to verify zero errors and zero warnings.
10. **Architecture Documentation:** If a major architectural decision was made, was an ADR created in `docs/decisions/`?

---

## 9. Architectural Change Protocol

Significant architectural changes (e.g., adding a new module, introducing an external service, altering database access patterns) **MUST NOT** be performed silently. Follow this procedure:

1. Identify the concrete business or performance problem.
2. Explain why the current architecture cannot solve it cleanly.
3. Evaluate the simplest alternative before proposing new infrastructure.
4. Create an Architecture Decision Record (`docs/decisions/ADR-xxx-<name>.md`).
5. Obtain explicit human approval before modifying project structures or adding dependencies.
6. Implement the change and update the corresponding architecture documentation.

---

## 10. Feature Implementation Lifecycle

Future feature implementation must strictly follow this sequential engineering workflow:

```text
Requirement
    ↓
1. Identify owning business module (Catalog, Inventory, Orders, Customers, Payments, Identity)
    ↓
2. Identify application use case / handler
    ↓
3. Identify required domain rules & invariants
    ↓
4. Identify database schema changes (prefixed tables, decimal(18,2), no cross-module FKs)
    ↓
5. Identify API contract changes (request/response DTOs, RFC 7807 problem details)
    ↓
6. Identify frontend changes (Server Components default, Client leaves only)
    ↓
7. Identify security implications (server-side authorization, input sanitization, rate limits)
    ↓
8. Implement backend & frontend logic
    ↓
9. Execute automated tests (Unit tests, build verification with zero errors)
    ↓
10. Architecture review against AGENTS.md rules
```

Features must never grow organically into random cross-module dependencies or ad-hoc API calls.

---

## 11. Automated Architecture Fitness & Enforcement

Where practical, architecture rules are machine-enforceable rather than relying on human memory:

1. **Architecture Unit Tests (`Ecommerce.UnitTests`):**
   * **Domain Isolation:** Enforce that `Ecommerce.Domain` has zero references to `Microsoft.AspNetCore`, `Microsoft.EntityFrameworkCore`, or any business module.
   * **Module Isolation:** Enforce that business modules only reference public interfaces of peer modules and never reference `Ecommerce.Infrastructure` or `Ecommerce.Api`.
   * **Zero HTTP Leakage:** Enforce that business modules have zero references to `Microsoft.AspNetCore.Http` or `Microsoft.AspNetCore.Mvc`.
   * **Interface Naming:** Enforce that all module public entry points implement `I{ModuleName}Module`.
2. **Roslyn Code Analyzers & Compiler Discipline (`Directory.Build.props`):**
   * `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`: Zero compiler warnings permitted across the entire backend.
   * `<Nullable>enable</Nullable>`: Mandatory non-nullable reference type safety.
   * `<AnalysisLevel>latest-recommended</AnalysisLevel>`: Active enforcement of modern C# reliability rules.
3. **Frontend ESLint & Boundary Rules (`frontend/eslint.config.mjs`):**
   * UI primitives (`components/ui/**`) cannot import from features, layouts, or route pages.
   * Layout components cannot import from route pages (`app/**`).
   * Feature private internal files (`features/*/internal/*`) cannot be imported across feature boundaries.
   * Filesystem operations (`node:fs`) are forbidden in frontend components.
4. **Automated CI Quality Pipeline (`.github/workflows/ci.yml`):**
   * Every PR and push to `main` must pass:
     * Backend: `dotnet restore` $\rightarrow$ `dotnet build -c Release` $\rightarrow$ `dotnet test` (27 unit & architecture tests).
     * Frontend: `npm ci` $\rightarrow$ `npm run lint` $\rightarrow$ `npm test` (14 unit & architecture tests) $\rightarrow$ `npm run build`.
     * Security: Automated secret scanning for committed private keys and API credentials.

---

## 12. The "No Bypass" Architectural Rule

Do not solve a technical problem by bypassing the architecture:

* **Bad:** "Need inventory availability" $\rightarrow$ Directly access `inv_stock_items` table or Inventory internal classes from Orders.  
  **Mandate:** Use `IInventoryModule.CheckAvailabilityAsync` via the public contract.
* **Bad:** "Need fast state access in frontend" $\rightarrow$ Dump server data into a global Zustand/Redux store.  
  **Mandate:** Determine whether state is server state (RSC), URL search params, or local UI state before introducing global client state.
* **Bad:** "Need payment processing" $\rightarrow$ Hardcode gateway-specific logic across `Orders` module.  
  **Mandate:** Encapsulate gateway interaction behind `IPaymentsModule` abstractions.
* **Bad:** "Build failed on warning" $\rightarrow$ Disable `<TreatWarningsAsErrors>` or add `#pragma warning disable` without formal exception registration.  
  **Mandate:** Fix the root cause or register an exception in [ARCHITECTURE-EXCEPTIONS.md](file:///c:/Projects/E-commerce%20platform/docs/architecture/ARCHITECTURE-EXCEPTIONS.md).

---

## 13. AI Agent Safety & Operational Invariants

Future AI coding agents working in this repository are strictly bound by the following prohibitions:

1. **DO NOT** introduce microservices, distributed actors, or Docker container meshes.
2. **DO NOT** introduce external infrastructure (Redis, Kafka, RabbitMQ, Elasticsearch, Meilisearch) until documented triggers in Section 7 are met.
3. **DO NOT** create generic repositories (`IRepository<T>`) or generic service layers (`BaseService<T>`).
4. **DO NOT** bypass module boundaries or reference concrete internal classes of peer modules.
5. **DO NOT** expose EF Core entities directly through API endpoints or accept them in requests.
6. **DO NOT** create global state stores when URL parameters or React Server Components suffice.
7. **DO NOT** mark parent layouts or full pages with `'use client'`; keep Client Components confined strictly to interactive leaves.
8. **DO NOT** commit secrets, private tokens, or hardcoded passwords to source files.
9. **DO NOT** suppress compiler warnings or disable architecture tests to make code compile.
10. **ALWAYS** run `dotnet test` and `npm test && npm run lint && npm run build` before declaring a task complete.


