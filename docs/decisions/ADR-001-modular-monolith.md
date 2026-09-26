# ADR-001: Modular Monolith Architecture

## Status
**Accepted** (2026-09-25)

## Context
We are engineering an e-commerce platform for a real business client. The initial deployment operates under a budget-constrained client budget of approximately BDT 40,000. However, the architectural foundation must be robust and maintainable enough to evolve into a commercial-grade commerce platform valued at BDT 600,000+ without requiring costly structural rewrites.

We evaluated three potential architectural models:
1. **Microservices Architecture:** Independent services deployed across separate network containers.
2. **Traditional Monolith ("Big Ball of Mud"):** A single application with global folders (Controllers, Services, Repositories) and shared database tables.
3. **Modular Monolith:** A single deployable application with strictly isolated business modules and enforced dependency boundaries.

## Decision
We decided to adopt a **Modular Monolith** architecture:
* A single ASP.NET Core process host (`Ecommerce.Api`).
* Autonomous, cohesive business modules implemented as distinct C# projects (`Ecommerce.Modules.Catalog`, `Ecommerce.Modules.Inventory`, `Ecommerce.Modules.Customers`, `Ecommerce.Modules.Orders`, `Ecommerce.Modules.Payments`, `Ecommerce.Modules.Identity`).
* Modules communicate strictly through public interface contracts. Direct access to peer internal entities or DbContext is prohibited.
* Persistence is a single MySQL 8.0 database with module-prefixed tables and no physical cross-module foreign key constraints.

## Consequences

### Positive (What this makes easier)
* **Single Deployment Pipeline:** Low hosting costs (~$5–$10/month Linux VPS or standard app service), matching the BDT 40k MVP budget.
* **Transactional Integrity:** Complex operations such as checkout (stock deduction, order line snapshot, payment intent) execute within a single ACID transaction without distributed sagas.
* **Low Latency:** Zero inter-service network latency or serialization overhead.
* **High Maintainability:** Modules have clear ownership, making codebase evolution straightforward.
* **Extraction Pathway:** If a specific module (e.g. Payments) ever requires independent scaling, its isolated assembly and lack of cross-module database foreign keys make service extraction straightforward.

### Negative (What this makes harder)
* **Discipline Required:** Developers must actively adhere to dependency boundaries. C# allows referencing other projects if not guarded by architectural rules.
* **Shared Database Resources:** A poorly optimized query in one module could impact database resources for other modules until indexed.

## Alternatives Considered

### Alternative 1: Microservices Architecture
* **Rejected:** Requires container orchestration (Kubernetes), distributed logging, service discovery, API gateways, and distributed event buses. This would cause massive cost overruns, exceed the client budget immediately, and introduce unnecessary failure modes.

### Alternative 2: Traditional Monolith ("Big Ball of Mud")
* **Rejected:** Organizes code purely by technical concerns (`Controllers/`, `Services/`, `Repositories/`). As features grow, entities become tangled in complex object graphs, cross-domain database queries proliferate, and scaling the system beyond the MVP would require a complete rewrite.

## Reason for Selection
The Modular Monolith adheres directly to our guiding philosophy:
> *"Build today's simplest correct system while preserving clear boundaries for tomorrow's requirements."*
It delivers the lowest total cost of ownership today while preserving total architectural freedom for tomorrow.
