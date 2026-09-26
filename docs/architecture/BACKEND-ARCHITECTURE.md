# Backend Architecture & Implementation Standards

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

This document specifies the technical design, patterns, and conventions governing the ASP.NET Core (.NET 10) backend.

---

## 1. Architectural Layering within Modules

Each business module adheres to clean internal separation:

```text
Ecommerce.Modules.[ModuleName]
├── Domain/                 # Entities, Value Objects, Domain Exceptions, Invariants
├── Application/            # Use Cases, Commands, Queries, DTOs, Public Interfaces
└── Infrastructure/         # EF Core Entity Configurations (IEntityTypeConfiguration<T>)
```

### Layer Responsibilities

| Layer | Responsibility | Allowed Dependencies |
|---|---|---|
| **Domain** | Entity state, invariants, core business calculations | `Ecommerce.Domain` |
| **Application** | Use case orchestration, input validation, DTO mapping | `Ecommerce.Domain`, Peer Module Interfaces |
| **Infrastructure** | EF Core mappings, database configurations | `Ecommerce.Domain`, Module Application & Domain |
| **API Host** | HTTP endpoints, authentication middleware, Swagger, DI | All Modules & Infrastructure |

---

## 2. Request Processing Pipeline

Every incoming HTTP request flows through a standard pipeline:

```text
HTTP Request
    ↓
ASP.NET Core Middleware Pipeline (CORS, Rate Limiting, Exception Handling, Auth)
    ↓
API Endpoint / Controller (Model Binding & Parameter Validation)
    ↓
Application Use Case (Input Validation via FluentValidation)
    ↓
Domain Execution & Inter-Module Coordination
    ↓
Unit of Work / Transaction Commit (MySQL SaveChanges)
    ↓
Typed Result / DTO Mapping
    ↓
HTTP Response (or Problem Details RFC 7807)
```

---

## 3. Error Handling & RFC 7807 Problem Details

* The API utilizes a centralized **Global Exception Handling Middleware**.
* Unhandled exceptions return HTTP 500 with a sanitized error trace (detailed traces logged internally, never exposed to clients).
* Domain validation and business rule violations return standard **RFC 7807 Problem Details**:

```json
{
  "type": "https://api.ecommerce.local/errors/insufficient-stock",
  "title": "Insufficient Stock",
  "status": 400,
  "detail": "Requested quantity (5) exceeds available stock (2) for SKU 'TSHIRT-BLK-L'.",
  "instance": "/api/v1/orders/checkout"
}
```

---

## 4. DTO & Mapping Discipline

1. **Explicit Mapping Preferred:** Avoid complex, reflection-heavy auto-mappers that hide runtime mapping failures. Use explicit extension methods (`ToDto()`, `ToEntity()`) or simple static mapper classes.
2. **Immutability:** Request and Response DTOs should be immutable C# `record` types or classes with `init`-only properties.
3. **Strict Separation:** Never reuse an entity class as an API response contract.

---

## 5. Transaction & Consistency Strategy

* For single-entity modifications (e.g. updating product details), standard EF Core `SaveChangesAsync` provides atomic persistence.
* For multi-step business transactions (e.g. **Checkout**: Deduct Stock $\rightarrow$ Create Order Lines $\rightarrow$ Record Payment Intent), execution must be wrapped in an explicit `IDbContextTransaction`:

```csharp
await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);
try
{
    await inventoryModule.DeductStockAsync(orderId, items, ct);
    await ordersModule.PersistOrderAsync(order, ct);
    await paymentsModule.CreatePaymentIntentAsync(orderId, amount, method, ct);
    
    await dbContext.SaveChangesAsync(ct);
    await transaction.CommitAsync(ct);
}
catch
{
    await transaction.RollbackAsync(ct);
    throw;
}
```

---

## 6. Dependency Injection & Composition Root

* All services and module implementations are registered in `Ecommerce.Api/Program.cs` (or module extension methods `AddCatalogModule()`, `AddOrdersModule()`).
* **Service Lifetimes:**
  * Application Handlers & Repositories: `Scoped`
  * EF Core DbContext: `Scoped`
  * Stateless utilities / Passwords / Time providers: `Singleton`
