# Database Architecture & Persistence Governance

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

This document specifies the database design principles, storage standards, schema management, and relational patterns governing persistence in MySQL 8.0.

---

## 1. Core Persistence Standards

* **Engine:** MySQL 8.0 with InnoDB storage engine for ACID compliance, row-level locking, and foreign key enforcement.
* **Character Set & Collation:** `utf8mb4` with `utf8mb4_0900_ai_ci` to guarantee native support for Bengali (বাংলা) text and emojis.
* **ORM:** Entity Framework Core with `Pomelo.EntityFrameworkCore.MySql`.

---

## 2. Table Ownership & Prefix Partitioning

To avoid schema confusion, every table is strictly prefixed by its owning business module:

| Module | Table Prefix | Table Purpose |
|---|---|---|
| **Catalog** | `cat_*` | `cat_categories`, `cat_products`, `cat_product_variants`, `cat_product_images` |
| **Inventory** | `inv_*` | `inv_stock_items`, `inv_stock_logs` |
| **Customers** | `cus_*` | `cus_customers`, `cus_customer_addresses` |
| **Orders** | `ord_*` | `ord_orders`, `ord_order_items`, `ord_status_history` |
| **Payments** | `pay_*` | `pay_payments`, `pay_transactions` |
| **Identity** | `usr_*` | `usr_users`, `usr_roles`, `usr_user_roles` |

---

## 3. Relationship & Constraint Standards

### Intra-Module Relationships
Within a single module boundary, standard relational foreign keys and cascade rules are permitted:
* `cat_product_variants` $\rightarrow$ `cat_products` (`ON DELETE CASCADE`)
* `ord_order_items` $\rightarrow$ `ord_orders` (`ON DELETE CASCADE`)
* `cat_product_images` $\rightarrow$ `cat_products` (`ON DELETE CASCADE`)

### Cross-Module Boundaries (Strict Rule)
Relationships that cross module boundaries **MUST NOT** define physical foreign key constraints in MySQL:
* `ord_order_items` stores `product_id` and `variant_id` as scalar GUIDs.
* `ord_orders` stores `customer_id` as a scalar GUID.
* `pay_payments` stores `order_id` as a scalar GUID.

**Why?** This prevents relational locking across module boundaries, eliminates circular migration dependencies, and ensures that if a module is ever scaled or extracted, no schema rewrite is required.

---

## 4. Financial Precision Standard

Floating-point numbers (`float` or `double`) are **strictly prohibited** in any pricing, tax, discount, or financial column. All monetary values are defined as:
```csharp
builder.Property(o => o.TotalAmount)
       .HasPrecision(18, 2)
       .HasColumnType("decimal(18,2)")
       .IsRequired();
```

---

## 5. Indexing Principles

1. **Unique Constraints:**
   * `cat_products.slug` (Unique B-Tree index)
   * `cat_product_variants.sku` (Unique B-Tree index)
   * `usr_users.email` (Unique B-Tree index)
2. **Lookup & Foreign Key Indexes:**
   * Every scalar ID used in joins or lookups must be indexed (e.g. `cat_products.category_id`, `ord_orders.customer_id`).
3. **Temporal & Status Filtering:**
   * Composite indexes on `(status, created_at DESC)` for high-frequency admin dashboards and storefront order listings.

---

## 6. Migration Governance

* Migrations are code-first, version-controlled, and managed in `Ecommerce.Infrastructure`.
* Migration files must never be manually altered after being applied to any environment.
* Breaking schema changes (e.g. column renames) must be performed in two backward-compatible phases (Add new column $\rightarrow$ Backfill $\rightarrow$ Drop old column).
