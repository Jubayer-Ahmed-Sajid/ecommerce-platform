# Architecture Debt Register

**Document Version:** 1.0.0  
**Status:** Active Register  

The architecture debt register records conscious technical trade-offs, known limitations, and deferred capabilities. Each item specifies its impact, current workaround, preferred solution, priority, and the trigger condition that mandates resolution.

---

| ID | Title | Problem Description | Impact | Current Workaround | Preferred Solution | Priority | Revisit Trigger |
|---|---|---|---|---|---|---|---|
| **DEBT-001** | **Shared EF Core Migration Assembly** | All module migrations currently reside in `Ecommerce.Infrastructure`. | Multiple developers adding migrations simultaneously to different modules could cause sequential migration conflicts. | Single unified DbContext with strict module table prefixes (`cat_*`, `ord_*`, etc.). | Implement separate modular migrations or isolated module schema contexts if team expands. | **Low** | When $>3$ backend engineers develop migrations concurrently. |
| **DEBT-002** | **In-Memory Cart State** | Cart items are stored in browser `localStorage` without server synchronization. | Guest carts are lost if the user changes devices or clears local storage. | Local client context (`cart-context.tsx`) with lazy local storage hydration. | Implement backend-synced cart session in `Ecommerce.Modules.Customers` for registered users. | **Medium** | When registered customer authentication & account profile features are introduced. |
| **DEBT-003** | **Local Disk Media Storage** | Product images are stored on the host filesystem under `uploads/`. | Horizontal scaling to multiple backend application instances requires shared NFS or object storage. | `LocalFileStorageService` implementing `IFileStorageService`. | Swap implementation to `R2FileStorageService` (Cloudflare R2 / AWS S3) behind the existing interface. | **Medium** | When media storage exceeds 20 GB or multi-instance host deployment begins. |
| **DEBT-004** | **Manual Payment Reconciliation** | bKash/Nagad payments require manual admin verification of SMS TrxIDs. | Operations team must manually verify payments in merchant portal before dispatching orders. | Admin status verification endpoint via `IPaymentsModule.VerifyManualPaymentAsync`. | Integrate automated payment aggregator (SSLCommerz / bKash merchant API) behind `IPaymentsModule`. | **Medium** | When store daily order volume exceeds 50 orders/day. |
| **DEBT-005** | **Absence of E2E Browser Automation** | Playwright test suite is not yet configured for full browser checkout emulation. | Regressions in checkout form flow require manual browser verification. | Fast Node.js native unit tests and Next.js static build pre-rendering validation. | Implement Playwright test suite for critical paths (Browse $\rightarrow$ Cart $\rightarrow$ Checkout $\rightarrow$ Order). | **Medium** | Prior to public production launch of checkout feature. |
