# Quality Gates & Automated Architecture Enforcement

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

---

## 1. The 10-Level Quality Model

To prevent architectural degradation without adding bureaucratic overhead, quality verification is structured across 10 progressive validation levels:

| Level | Validation Stage | Scope & Tools | Failure Action | Execution Point |
|---|---|---|---|---|
| **L1** | **Formatting** | `.editorconfig`, `dotnet format --verify-no-changes`, Prettier/ESLint | Non-blocking warning / Auto-fix | Local / IDE |
| **L2** | **Static Analysis** | Roslyn Analyzers (`AnalysisLevel=latest-recommended`), ESLint 9 | **Build Break** | Compile time / CI |
| **L3** | **Type Checking** | C# (`<Nullable>enable</Nullable>`), TypeScript Strict (`noEmit: true`) | **Build Break** | Compile time / CI |
| **L4** | **Unit Tests** | Domain rules, Money arithmetic, Result pattern, formatters (`xUnit`, Node test runner) | **Test Failure** | Fast PR Gate (<1s) |
| **L5** | **Architecture Tests** | Assembly reference invariants, module boundary isolation, zero HTTP leakage | **Test Failure** | Fast PR Gate (<500ms) |
| **L6** | **Integration / API Tests** | EF Core MySQL persistence, transactions, Problem Details status codes | **Test Failure** | Pre-merge / CI |
| **L7** | **Production Build** | `dotnet build -c Release (0 warnings)`, `next build (Turbopack)` | **Build Break** | Pre-merge / CI |
| **L8** | **End-to-End Tests** | Playwright critical shopping & admin management journeys | **Deployment Block** | Nightly / Pre-release |
| **L9** | **Security Checks** | Secret scan, vulnerable dependency scan (NuGet Audit, npm audit) | **Deployment Block** | CI Pipeline |
| **L10**| **Production Validation**| `/health` endpoint, error-rate telemetry, structured logging | **Alert / Rollback** | Post-deploy monitoring |

---

## 2. Backend Automated Gates

### 2.1 Compiler & Roslyn Analyzers (`Directory.Build.props`)
* `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`: The solution enforces a strict zero-warning policy. Any compiler warning fails the build.
* `<Nullable>enable</Nullable>`: Non-nullable reference types are enforced globally.
* `<AnalysisLevel>latest-recommended</AnalysisLevel>`: Active enforcement of modern C# performance, security, and design guidelines (e.g. CA1000, CA1852, CA1050).

### 2.2 Assembly Reference Invariants (`DomainIsolationArchitectureTests`)
* `Ecommerce.Domain` has zero references to `Microsoft.AspNetCore.*`, `Microsoft.EntityFrameworkCore.*`, or any business module.
* `Ecommerce.Domain` does not reference `Ecommerce.Infrastructure` or `Ecommerce.Api`.

### 2.3 Module Boundary Isolation (`ModuleBoundaryArchitectureTests`)
* No business module (`Ecommerce.Modules.*`) references `Ecommerce.Infrastructure` or `Ecommerce.Api`.
* Peer modules (`Catalog`, `Inventory`, `Customers`, `Payments`, `Identity`) never reference `Ecommerce.Modules.Orders`.
* Zero HTTP leakage: No module assembly references `Microsoft.AspNetCore.Http` or `Microsoft.AspNetCore.Mvc`.
* Public module interfaces follow the naming convention `I{ModuleName}Module`.

---

## 3. Frontend Automated Gates

### 3.1 ESLint Architectural Boundary Rules (`eslint.config.mjs`)
* UI primitives (`components/ui/**`) cannot import from `features/**`, `app/**`, or `components/layout/**`.
* Layout components (`components/layout/**`) cannot import from route pages (`app/**`).
* Feature internal implementations (`features/*/internal/*`) cannot be imported across module boundaries.
* Filesystem and Node-only operations (`node:fs`) are forbidden in frontend components.

### 3.2 Frontend Architecture Invariants (`architecture.test.ts`)
* Every business feature must export an explicit `types/index.ts` contract.
* UI primitives (`badge.tsx`, `card.tsx`, `skeleton.tsx`) must remain Server Components and not declare `'use client'`.
* Client code must not reference server-only environment variables (e.g. `JWT_SECRET`, `DB_PASSWORD`).

---

## 4. CI/CD Quality Pipeline (`.github/workflows/ci.yml`)

Every pull request and push to `main` must pass the automated CI pipeline:
1. **Backend Validation:** Restore $\rightarrow$ Build (0 warnings) $\rightarrow$ Run unit & architecture tests.
2. **Frontend Validation:** Install $\rightarrow$ Lint & boundary checks $\rightarrow$ Run unit & architecture tests $\rightarrow$ Next.js production build.
3. **Security Audit:** Scan for accidentally committed private keys or cloud credentials.
