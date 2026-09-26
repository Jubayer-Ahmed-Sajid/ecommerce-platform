# Frontend Architecture & Next.js Implementation Standards

**Document Version:** 1.1.0  
**Status:** Approved Architectural Standard  

This document specifies the technical design, directory organization, state management, API boundary, and component governance for the Next.js 16 (React 19) frontend application.

---

## 1. Core Architectural Invariants

1. **Server Components by Default:** All pages, product grids, category lists, and layout shells are React Server Components (RSC). They stream pre-rendered HTML to the browser with zero client JavaScript payload.
2. **Interactive Leaves Only:** The `'use client'` directive is confined strictly to interactive leaf components (e.g. `AddToCartButton`, `CartTrigger`, `CartDrawer`, `CheckoutForm`).
3. **Decoupled Business Authority:** The frontend never determines prices, discounts, stock availability, or authorization. The ASP.NET Core backend is authoritative.
4. **Feature-Oriented Boundaries:** Code is organized by business domain (`features/catalog`, `features/cart`, `features/checkout`, etc.), preventing scattered global folders.
5. **Centralized API Communication:** No component executes unconfigured `fetch()`. All requests route through `src/lib/api/client.ts`.

---

## 2. Comprehensive Directory Structure

```text
frontend/src/
├── app/
│   ├── (storefront)/              # Route Group: Public Storefront
│   │   ├── layout.tsx             # [RSC] Storefront Header, Navigation, Footer, CartProvider
│   │   ├── page.tsx               # [RSC] Homepage (Hero, Trust Badges, Categories)
│   │   ├── products/
│   │   │   ├── page.tsx           # [RSC] Product Listing & Search Results
│   │   │   └── [slug]/page.tsx    # [RSC] Product Details & Server-rendered Structured Data
│   │   ├── cart/page.tsx          # [RSC Shell] Full Cart Overview
│   │   ├── checkout/page.tsx      # [Client Page] Multi-Step Checkout Form
│   │   └── orders/[orderNumber]/
│   │       └── page.tsx           # [RSC] Order Confirmation & Status Tracker
│   │
│   ├── (admin)/                   # Route Group: Store Administration
│   │   ├── admin/login/page.tsx   # [Client Form] Admin Authentication Form
│   │   └── admin/
│   │       ├── layout.tsx         # [RSC Shell] Admin Dashboard Navigation Sidebar & Header
│   │       ├── dashboard/page.tsx # [RSC] Store Metrics & Overview
│   │       ├── products/page.tsx  # [Client/RSC] Product Catalog Management
│   │       ├── orders/page.tsx    # [Client/RSC] Order Fulfillment & Status Processing
│   │       └── inventory/page.tsx # [Client] Stock Adjustments
│   │
│   ├── error.tsx                  # Global client error boundary (RFC 7807 support)
│   ├── loading.tsx                # Global skeleton loading state
│   ├── not-found.tsx              # Global 404 page
│   ├── layout.tsx                 # Root HTML shell, fonts, accessibility skip link
│   └── globals.css                # Design tokens, color palette, animations
│
├── features/                      # Business Capability Modules
│   ├── catalog/                   # Types, API client calls, catalog presentation
│   ├── cart/                      # Types, CartProvider Context, cart state
│   ├── checkout/                  # Types, API client calls, checkout validation
│   ├── orders/                    # Types, API client calls, order tracking
│   ├── auth/                      # Types, API client calls, admin session
│   └── customer/                  # Types, address models, guest profile
│
├── components/
│   ├── ui/                        # Reusable Atomic UI Primitives (Button, Input, Badge, Card, Skeleton)
│   ├── layout/                    # Shell Elements (StorefrontHeader, StorefrontFooter, AdminSidebar, AdminHeader)
│   └── shared/                    # Cross-feature Display Components (StatusBadge, EmptyState)
│
├── lib/
│   ├── api/                       # API Client (client.ts, errors.ts)
│   ├── auth/                      # Session helpers (session.ts)
│   ├── formatting/                # Currency (currency.ts) & Date formatting (date.ts)
│   ├── validation/                # Bangladeshi Phone Validator (phone.ts)
│   └── utils/                     # Tailwind merge helper (cn.ts)
│
└── types/                         # Shared Global Contracts (api.ts, commerce.ts)
```

---

## 3. Feature Module Boundaries

| Feature Module | Responsibilities & Data Owned | Non-Responsibilities (Delegated to Backend) |
|---|---|---|
| **`catalog`** | Product display, category navigation, filtering, slug queries | Price authority, inventory deductions |
| **`cart`** | Ephemeral item list in `localStorage`, quantity toggling, drawer state | Discount calculations, stock reservation |
| **`checkout`** | Customer contact collection, shipping address input, payment method selection | Final total calculation, tax evaluation, stock verification |
| **`orders`** | Order status display, order history presentation, tracking lookup | State transition authority, fulfillment updates |
| **`auth`** | Admin credentials collection, session presentation, logout trigger | Password validation, role permission evaluation |
| **`customer`** | Address form fields, delivery preferences, guest contact | Identity credentials, password management |

---

## 4. State Management Standards

1. **Server State:**
   * Products, categories, orders, and stock levels are fetched server-side via Server Components.
   * Cached using Next.js tag-based revalidation (`revalidateTag`).
2. **URL State (`useSearchParams`):**
   * Filter parameters (`?category=...`), sort order (`?sortBy=...`), and pagination (`?pageNumber=...`).
   * Guarantees that catalog listings are bookmarkable, shareable, and crawlable by search engine bots.
3. **Local UI State (`useState`):**
   * Modal dialogs, dropdown menus, form field interaction, and tab selections.
4. **Global Client State:**
   * Confined strictly to `CartProvider` (`features/cart/context/cart-context.tsx`).
   * Uses lazy state initialization to prevent cascading renders or hydration flicker.

---

## 5. API Boundary Architecture (`src/lib/api/`)

All requests route through `apiClient` (`src/lib/api/client.ts`):
* **Base URL:** Resolved from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api/v1`).
* **Credentials:** Configured with `credentials: 'include'` to automatically transmit HttpOnly session cookies.
* **Error Translation:** HTTP errors are converted into typed `ApiError` instances capturing RFC 7807 Problem Details.
* **Caching Integration:** Supports Next.js `revalidate` and `tags` natively.

---

## 6. Security & Invariant Defenses

1. **Zero Client Trust:**
   * Checkout submissions send only `{ variantId, quantity }`. The server authoritatively calculates the price.
   * Product prices displayed in the client cart are indicative only.
2. **Secret Isolation:**
   * No backend credentials, database strings, or signing keys are prefixed with `NEXT_PUBLIC_`.
   * Only `NEXT_PUBLIC_API_URL` is exposed to the browser.
3. **Security Headers in `next.config.ts`:**
   * `X-Content-Type-Options: nosniff`
   * `X-Frame-Options: DENY`
   * `Referrer-Policy: strict-origin-when-cross-origin`
   * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 7. Testing Foundation

* **Test Framework:** Node.js 24 native test runner (`node --experimental-strip-types --test`).
* **Zero Dependencies:** Eliminates version conflicts with `@types/node` and adds zero bytes to the client bundle.
* **Execution Command:** `npm test` runs all unit tests (`*.test.ts`) across formatting, validation, and error parsing.
