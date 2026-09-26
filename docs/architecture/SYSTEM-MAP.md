# System Map & Repository Structure

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

This document provides a comprehensive textual and visual map of the repository structure, code locations, and subsystem relationships.

---

## 1. High-Level Subsystem Topology

```text
E-commerce Platform Repository
│
├── frontend/                     # Next.js 16 (React 19) App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (storefront)/     # Public Customer Storefront (page, layout)
│   │   │   ├── (admin)/          # Protected Admin Control Panel (login, dashboard, layout)
│   │   │   ├── error.tsx         # Global Error Boundary (RFC 7807 problem details)
│   │   │   ├── loading.tsx       # Global Skeleton Loading Shell
│   │   │   ├── not-found.tsx     # Global 404 Route
│   │   │   ├── layout.tsx        # Root HTML Shell & Font Configuration
│   │   │   └── globals.css       # Core Design System Variables & Utilities
│   │   ├── features/             # Business Capability Modules
│   │   │   ├── catalog/          # Catalog types & API integration
│   │   │   ├── cart/             # Cart types & CartProvider context
│   │   │   ├── checkout/         # Checkout types & API integration
│   │   │   ├── orders/           # Orders types & tracking API
│   │   │   ├── auth/             # Admin session & login API
│   │   │   └── customer/         # Customer profile & address types
│   │   ├── components/
│   │   │   ├── ui/               # Reusable Atomic UI Primitives (Button, Input, Badge, Card, Skeleton)
│   │   │   ├── layout/           # Structural Shells (StorefrontHeader, StorefrontFooter, AdminSidebar, AdminHeader)
│   │   │   └── shared/           # Cross-feature Display Components (StatusBadge, EmptyState)
│   │   ├── lib/
│   │   │   ├── api/              # Centralized API Client (client.ts, errors.ts)
│   │   │   ├── auth/             # Session helpers (session.ts)
│   │   │   ├── formatting/       # BDT Currency (৳) & Date Formatting
│   │   │   ├── validation/       # Bangladeshi Phone Validator
│   │   │   └── utils/            # Tailwind merge utility (cn.ts)
│   │   └── types/                # Shared TypeScript API Contracts & DTOs
│   │
│   └── package.json
│
├── backend/                      # ASP.NET Core (.NET 10) Modular Monolith
│   ├── EcommercePlatform.sln
│   ├── src/
│   │   ├── Ecommerce.Domain/             # Shared Kernel: Money Value Object, Result, Base Entity
│   │   ├── Ecommerce.Modules.Catalog/    # Product, Category, Variant, Media Domain & Use Cases
│   │   ├── Ecommerce.Modules.Inventory/  # Stock Items, Adjustments, Availability Checks
│   │   ├── Ecommerce.Modules.Customers/  # Customer Profiles, Delivery Addresses
│   │   ├── Ecommerce.Modules.Orders/     # Order Aggregate, Line Snapshots, Status Machine
│   │   ├── Ecommerce.Modules.Payments/   # Payment Intent, COD & Manual MFS Handlers
│   │   ├── Ecommerce.Modules.Identity/   # Admin Authentication, Password Hashing, JWT/Session
│   │   ├── Ecommerce.Infrastructure/     # Unified EF Core DbContext, MySQL Mappings, File Storage
│   │   └── Ecommerce.Api/                # Web API Host, Middleware, Endpoints, DI Composition
│   │
│   └── tests/
│       └── Ecommerce.UnitTests/          # Unit Tests for Invariants, Pricing & Calculations
│
├── docs/                         # Engineering Constitution & Documentation
│   ├── architecture/             # Architectural Specifications
│   └── decisions/                # Architecture Decision Records (ADRs)
│
└── AGENTS.md                     # Permanent Engineering Constitution
```

---

## 2. Backend Assembly Dependency Map

The following map defines the strictly allowed compile-time project dependencies:

```text
                  +-----------------------+
                  |    Ecommerce.Api      |
                  +-----------------------+
                    /     |     |     \
                   /      |     |      \
                  v       v     v       v
+-----------------------+    +-----------------------+
|  Ecommerce.Modules.*  |    |Ecommerce.Infrastructure|
+-----------------------+    +-----------------------+
           |                             |
           \                            /
            \                          /
             v                        v
        +----------------------------------+
        |        Ecommerce.Domain          |
        |  (Zero Project Dependencies)     |
        +----------------------------------+
```

### Module Cross-Communication Flow
```text
[Ecommerce.Modules.Orders]
   ├── ICatalogModule   ──> Implemented by [Ecommerce.Modules.Catalog]
   ├── IInventoryModule ──> Implemented by [Ecommerce.Modules.Inventory]
   ├── ICustomersModule ──> Implemented by [Ecommerce.Modules.Customers]
   └── IPaymentsModule  ──> Implemented by [Ecommerce.Modules.Payments]
```

*Note: Modules depend strictly on the interface abstractions of other modules, never on internal implementations or concrete DbContext classes.*

---

## 3. Database Schema Map (MySQL 8.0)

All tables reside within a single relational MySQL database, cleanly partitioned using module prefixes:

```text
ecommerce_db (MySQL 8.0 / InnoDB / utf8mb4)
│
├── cat_categories               # Product Categories & Hierarchy
├── cat_products                 # Product Definitions & Slugs
├── cat_product_variants         # SKU, Size, Color, Price Override
├── cat_product_images           # Image URLs & Display Order
│
├── inv_stock_items              # Variant Stock Quantity & Reserved Count
├── inv_stock_logs               # Audit Trail of Deductions / Restocks
│
├── cus_customers                # Customer Profiles (Name, Email, Phone)
├── cus_customer_addresses       # Shipping & Billing Addresses
│
├── ord_orders                   # Order Header (Total, Status, Reference IDs)
├── ord_order_items              # Immutable Snapshot of Purchased Products & Prices
├── ord_status_history           # Order Lifecycle Audit Log
│
├── pay_payments                 # Payment Intents & Recorded Method
├── pay_transactions             # MFS TrxIDs, Gateway References, Audit Logs
│
└── usr_users                    # Admin User Accounts, Passwords, Role Claims
```

---

## 4. Frontend Route & Component Map

```text
frontend/src/app/
│
├── (storefront)/
│   ├── page.tsx                 # [RSC] Storefront Homepage & Featured Products
│   ├── products/
│   │   ├── page.tsx             # [RSC] Catalog Listing & Category Filter
│   │   └── [slug]/page.tsx      # [RSC] Product Detail Page with Structured Data
│   ├── cart/page.tsx            # [RSC Shell] Full Cart View
│   ├── checkout/page.tsx        # [Client Form] Interactive Checkout & Payment Selector
│   └── orders/[orderNumber]/
│       └── page.tsx             # [RSC] Order Confirmation & Tracking
│
└── (admin)/
    ├── admin/login/page.tsx     # [Client Form] Admin Authentication Form
    └── admin/
        ├── layout.tsx           # [RSC Shell] Admin Navigation Sidebar & Header
        ├── dashboard/page.tsx   # [RSC] Store Overview & Order Metrics
        ├── products/page.tsx    # [Client/RSC] Product Catalog Management
        ├── orders/page.tsx      # [Client/RSC] Order Fulfillment & Status Processing
        └── inventory/page.tsx   # [Client] Quick Stock Adjustment Table
```
