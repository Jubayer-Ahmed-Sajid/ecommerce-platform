# Module Boundaries & Contract Governance

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

This document specifies the exact business responsibilities, data ownership, invariants, public interfaces, and dependency limits for every module in the modular monolith.

---

## 1. Catalog Module (`Ecommerce.Modules.Catalog`)

### Purpose
Manages all commercial product information, categories, product variants, and associated media assets.

### Responsibilities
* Defining product titles, descriptions, slugs, base prices, and publication status.
* Managing hierarchical product categories.
* Defining product variants (e.g. Size, Color, SKU).
* Managing product image URLs, display order, and alt text.

### Data Owned
* Entities: `Product`, `Category`, `ProductVariant`, `ProductImage`.
* Tables: `cat_products`, `cat_categories`, `cat_product_variants`, `cat_product_images`.

### Business Rules Owned
* A product slug must be unique and URL-safe.
* Every product variant must have a valid SKU.
* Base prices must be non-negative `decimal(18,2)` values.
* Inactive or unpublished products must not appear in public storefront queries.

### Public Surface (`ICatalogModule`)
```csharp
public interface ICatalogModule
{
    Task<ProductDetailsDto?> GetProductByIdAsync(Guid productId, CancellationToken ct = default);
    Task<ProductDetailsDto?> GetProductBySlugAsync(string slug, CancellationToken ct = default);
    Task<VariantPricingDto?> GetVariantPriceSnapshotAsync(Guid variantId, CancellationToken ct = default);
    Task<PagedResult<ProductSummaryDto>> ListPublicProductsAsync(ProductQueryParameters query, CancellationToken ct = default);
}
```

### Dependency Rules
* **May Depend On:** `Ecommerce.Domain`.
* **Must NOT Depend On:** `Ecommerce.Modules.Orders`, `Ecommerce.Modules.Inventory`, `Ecommerce.Modules.Payments`, `Ecommerce.Modules.Customers`, `Ecommerce.Infrastructure`.
* **Interactions:** Read-only pricing inquiries from `Orders`. Does not know about checkouts or order lines.

---

## 2. Inventory Module (`Ecommerce.Modules.Inventory`)

### Purpose
Authoritatively tracks and controls physical stock availability, stock reservations, and stock deductions.

### Responsibilities
* Maintaining real-time physical stock counts per product variant.
* Deducting stock atomically upon order placement.
* Releasing stock upon order cancellation.
* Logging an immutable audit trail of every stock modification.

### Data Owned
* Entities: `StockItem`, `StockLog`.
* Tables: `inv_stock_items`, `inv_stock_logs`.

### Business Rules Owned
* Available stock count cannot drop below zero unless backorders are explicitly configured.
* Stock deductions must be logged with the associated `OrderId` and reason.
* Stock changes must be thread-safe / transactionally safe.

### Public Surface (`IInventoryModule`)
```csharp
public interface IInventoryModule
{
    Task<bool> CheckAvailabilityAsync(Guid variantId, int requestedQuantity, CancellationToken ct = default);
    Task<InventoryReservationResult> DeductStockAsync(Guid orderId, IEnumerable<StockDeductionItem> items, CancellationToken ct = default);
    Task ReleaseStockAsync(Guid orderId, IEnumerable<StockDeductionItem> items, CancellationToken ct = default);
    Task<StockLevelDto?> GetStockLevelAsync(Guid variantId, CancellationToken ct = default);
}
```

### Dependency Rules
* **May Depend On:** `Ecommerce.Domain`.
* **Must NOT Depend On:** `Ecommerce.Modules.Catalog`, `Ecommerce.Modules.Orders`, `Ecommerce.Modules.Payments`.
* **Interactions:** Receives stock deduction/release requests from `Orders`. Never queries order tables directly.

---

## 3. Customers Module (`Ecommerce.Modules.Customers`)

### Purpose
Maintains customer profiles, contact information, and shipping addresses for both guest and registered purchasers.

### Responsibilities
* Storing customer contact details (Full Name, Phone Number, Email).
* Storing shipping and billing delivery addresses.
* Associating orders with customer records without enforcing mandatory password registration.

### Data Owned
* Entities: `Customer`, `CustomerAddress`.
* Tables: `cus_customers`, `cus_customer_addresses`.

### Business Rules Owned
* A valid Bangladeshi phone number format (e.g. `01XXXXXXXXX`) is mandatory for delivery in Bangladesh.
* Guest customers can purchase without a user account.
* Customer profile information is decoupled from user authentication passwords.

### Public Surface (`ICustomersModule`)
```csharp
public interface ICustomersModule
{
    Task<CustomerDto> GetOrCreateCustomerAsync(CustomerContactInfo contact, CancellationToken ct = default);
    Task<CustomerAddressDto> SaveAddressAsync(Guid customerId, AddressDetails address, CancellationToken ct = default);
}
```

### Dependency Rules
* **May Depend On:** `Ecommerce.Domain`.
* **Must NOT Depend On:** `Ecommerce.Modules.Orders`, `Ecommerce.Modules.Catalog`, `Ecommerce.Modules.Payments`.

---

## 4. Orders Module (`Ecommerce.Modules.Orders`)

### Purpose
Orchestrates the order checkout process, calculates authoritative order prices, enforces order lifecycle state transitions, and preserves immutable purchase history.

### Responsibilities
* Accepting checkout requests containing requested variants and quantities.
* Calling `ICatalogModule` to obtain current authoritative prices.
* Calculating line items, shipping fees, discounts, and total order sum.
* Calling `IInventoryModule` to verify and deduct stock.
* Calling `IPaymentsModule` to initiate payment records.
* Managing order lifecycle states (`PendingPayment`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).

### Data Owned
* Entities: `Order`, `OrderItem`, `OrderStatusHistory`.
* Tables: `ord_orders`, `ord_order_items`, `ord_status_history`.

### Business Rules Owned
* **The Server is Authoritative:** Any price sent by the client browser during checkout is discarded.
* **Immutable Snapshot:** Once an order is created, `OrderItem` stores the product title, SKU, and unit price as an immutable snapshot. Future catalog price changes do not alter past orders.
* **State Machine Invariants:** An order cannot transition to `Shipped` if payment has failed. An order cannot transition from `Delivered` to `Cancelled`.
* **Cancellation Invariant:** Cancelling an order triggers a call to `IInventoryModule.ReleaseStockAsync`.

### Public Surface (`IOrdersModule`)
```csharp
public interface IOrdersModule
{
    Task<OrderResultDto> CheckoutAsync(CreateOrderCommand command, CancellationToken ct = default);
    Task<OrderDetailsDto?> GetOrderByIdAsync(Guid orderId, CancellationToken ct = default);
    Task<OrderDetailsDto?> GetOrderByOrderNumberAsync(string orderNumber, string phoneNumber, CancellationToken ct = default);
    Task<OrderStatusResult> UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus, string? notes, CancellationToken ct = default);
}
```

### Dependency Rules
* **May Depend On:** `Ecommerce.Domain`, `ICatalogModule`, `IInventoryModule`, `ICustomersModule`, `IPaymentsModule`.
* **Must NOT Depend On:** Concrete implementations or internal database models of other modules.

---

## 5. Payments Module (`Ecommerce.Modules.Payments`)

### Purpose
Authoritatively registers, tracks, and verifies payment intents, methods, and transaction records.

### Responsibilities
* Recording payment method: Cash on Delivery (COD) or manual Mobile Financial Services (MFS: bKash / Nagad / Rocket).
* Storing customer payment claims (Sender Phone Number, Transaction ID / TrxID).
* Auditing payment status transitions (`Pending`, `Paid`, `Failed`, `Refunded`).

### Data Owned
* Entities: `Payment`, `PaymentTransaction`.
* Tables: `pay_payments`, `pay_transactions`.

### Business Rules Owned
* Cash on Delivery orders initialize in `Pending` payment status until marked `Paid` upon delivery.
* Manual bKash/Nagad transactions initialize in `Pending` until verified by an administrator against the merchant statement.
* Financial transaction amounts must match the authoritative order total exactly.

### Public Surface (`IPaymentsModule`)
```csharp
public interface IPaymentsModule
{
    Task<PaymentRecordDto> CreatePaymentIntentAsync(Guid orderId, decimal amount, PaymentMethod method, PaymentDetails details, CancellationToken ct = default);
    Task<PaymentVerificationResult> VerifyManualPaymentAsync(Guid paymentId, bool isVerified, string? adminNotes, CancellationToken ct = default);
}
```

### Dependency Rules
* **May Depend On:** `Ecommerce.Domain`.
* **Must NOT Depend On:** `Ecommerce.Modules.Catalog`, `Ecommerce.Modules.Orders` (internal models).

---

## 6. Identity & Access Module (`Ecommerce.Modules.Identity`)

### Purpose
Manages administrator authentication, credentials, password security, and role claims.

### Responsibilities
* Authenticating store administrators via secure credentials.
* Generating secure, short-lived session tokens / HttpOnly cookies.
* Providing password hashing (PBKDF2 with HMAC-SHA512).

### Data Owned
* Entities: `User`, `Role`, `UserRole`.
* Tables: `usr_users`, `usr_roles`.

### Business Rules Owned
* Plaintext passwords must never be persisted or logged.
* Accounts lock out temporarily after 5 consecutive failed login attempts.
* Sensitive user tokens must be transmitted strictly over HTTPS with HttpOnly cookies.

### Public Surface (`IIdentityModule`)
```csharp
public interface IIdentityModule
{
    Task<AuthResultDto> AuthenticateAdminAsync(string email, string password, CancellationToken ct = default);
    Task<UserClaimsDto?> ValidateTokenAsync(string token, CancellationToken ct = default);
}
```

### Dependency Rules
* **May Depend On:** `Ecommerce.Domain`.
* **Must NOT Depend On:** Commerce modules (`Catalog`, `Inventory`, `Orders`, etc.).
