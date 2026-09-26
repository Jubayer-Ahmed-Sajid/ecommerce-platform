# Product Acceptance Criteria & Quality Specifications

**Document Version:** 2.0.0  
**Status:** Hardened Quality & Verification Baseline  
**Date:** 2026-09-25  

Every major MVP capability, business rule, and security invariant must have explicit, observable, and automated or manual testable acceptance criteria.

---

## 1. Catalog & Product Management

### AC-CAT-01: Product Creation with Mandatory Variant
* **Given** an authenticated administrator on `/admin/products/new`.
* **When** valid product details are submitted (Title, unique Slug, non-negative Base Price, Category ID, and at least one Variant with SKU and initial stock).
* **Then** the product, variant, and stock records are created atomically in `cat_products`, `cat_product_variants`, and `inv_stock_items`.
* **And** the product becomes accessible on the storefront if `IsActive` / `Status` is set to `Published`.

### AC-CAT-02: Slug Uniqueness & Collision Defense
* **Given** an existing product with slug `blue-cotton-panjabi`.
* **When** an administrator attempts to create or update another product with the slug `blue-cotton-panjabi`.
* **Then** the backend rejects the request with HTTP 400 Problem Details indicating the slug is already in use.
* **And** the frontend highlights the slug field with an actionable error message.

### AC-CAT-03: Soft Deletion & Historical Reference Integrity
* **Given** a product that has been purchased in past historical orders (`ord_order_items`).
* **When** an administrator clicks "Delete" on `/admin/products`.
* **Then** the product record undergoes soft deletion (`IsActive = false`).
* **And** the product is immediately excluded from public storefront listings and search queries.
* **And** past orders referencing the product remain intact and readable without error.

### AC-CAT-04: Media File Upload Security
* **Given** an administrator uploading product images on `/admin/products/new`.
* **When** uploading a file exceeding 5 MB, or having a non-whitelisted extension (e.g. `.exe`, `.php`, `.sh`), or disguised MIME type.
* **Then** the API rejects the upload with HTTP 400 Problem Details ("Only JPG, PNG, and WebP images up to 5MB are permitted.").
* **When** uploading a valid image (e.g. `panjabi.jpg`, 1.2 MB).
* **Then** the file is stored under `uploads/` with a non-colliding randomized GUID filename and returned URL.

---

## 2. Storefront Browsing, Search & SEO

### AC-DISC-01: Server-Rendered Catalog Filtering & Sorting
* **Given** a visitor browsing `/products`.
* **When** selecting a category (`?categorySlug=apparel`), search term (`?searchTerm=panjabi`), or sort (`?sortBy=price_asc`).
* **Then** the URL updates accordingly, and the page renders matching products via React Server Components.
* **And** the page contains proper OpenGraph metadata and a single `<h1>` matching the active query.

### AC-DISC-02: Product Detail Page & JSON-LD Structured Data
* **Given** a search engine crawler or public visitor accessing `/products/[slug]`.
* **When** the page renders.
* **Then** the HTML includes server-rendered Schema.org JSON-LD (`Product` with name, image, offers, priceCurrency: "BDT", and availability).
* **And** selecting a variant dynamically updates the displayed price, SKU, and availability indicator without full page reload.

---

## 3. Shopping Cart & Trust Model

### AC-CART-01: Ephemeral Cart State & Subtotal Indication
* **Given** a visitor on a Product Detail Page.
* **When** "Add to Cart" is clicked for an in-stock variant.
* **Then** the item is added to `localStorage` cart, the cart drawer slides out with the updated item, and the header badge increments.
* **And** the subtotal displayed in the cart drawer is treated as an indicative preview only.

### AC-CART-02: Out-of-Stock UI Prevention
* **Given** a variant with `AvailableQuantity == 0`.
* **When** the variant is selected on the PDP.
* **Then** the status displays "Out of Stock" (Sold Out).
* **And** the "Add to Cart" button is disabled preventing new additions.

---

## 4. Single-Step Checkout & Price Authority

### AC-CHK-01: Server-Authoritative Price Calculation
* **Given** a malicious user intercepting the checkout request to `/api/v1/orders/checkout` and modifying the item price from ৳1,500 to ৳10.
* **When** the request is processed by the backend.
* **Then** the client-submitted price is completely ignored.
* **And** the backend retrieves the current unit price from `ICatalogModule` (`BasePrice + PriceAdjustment`), calculates the true line totals and shipping fee, and persists the authoritative total amount.

### AC-CHK-02: Bangladeshi Mobile Number Validation
* **Given** a customer submitting the checkout form.
* **When** entering an invalid phone number (e.g. `12345`, `0212345678`, or `01234567890` with invalid operator prefix).
* **Then** client validation flags the field before submission, and backend API returns HTTP 400 Problem Details if client validation is bypassed.
* **When** entering a valid number (e.g. `01712345678` or `+8801812345678`).
* **Then** the backend normalizes the phone number to standard 11-digit format `01XXXXXXXXX` and proceeds.

### AC-CHK-03: Destination-Based Shipping Evaluation
* **Given** a checkout submission with items subtotaling ৳1,200.
* **When** `DeliveryCity` contains "Dhaka".
* **Then** `ShippingFee` is calculated as ৳60.00 and `TotalAmount` is ৳1,260.00.
* **When** `DeliveryCity` is "Chattogram" (Outside Dhaka).
* **Then** `ShippingFee` is calculated as ৳120.00 and `TotalAmount` is ৳1,320.00.
* **When** the item subtotal is ৳2,200 (meeting or exceeding the ৳2,000 threshold).
* **Then** `ShippingFee` is calculated as ৳0.00 regardless of destination.

---

## 5. Inventory Concurrency & Stock Lifecycle

### AC-INV-01: Atomic Stock Deduction on Checkout
* **Given** variant $V$ with available stock $S = 5$.
* **When** customer places an order for quantity $Q = 2$.
* **Then** within a single database transaction (`BeginTransactionAsync`), the order record is created, available stock is decremented to $S' = 3$, and an audit row is written to `inv_stock_logs` referencing the order ID.

### AC-INV-02: Concurrency & Overselling Prevention
* **Given** variant $V$ with only $S = 1$ unit left in stock.
* **When** two customers simultaneously submit checkout requests for $Q = 1$ of variant $V$.
* **Then** the first transaction commits successfully, reducing stock to 0.
* **And** the second transaction fails stock validation, rolls back cleanly with zero orphaned order records, and returns HTTP 400 Problem Details ("Insufficient stock").

### AC-INV-03: Stock Release on Order Cancellation
* **Given** an order in `PendingPayment` or `Processing` status with reserved items.
* **When** an administrator or business rule transitions the order status to `Cancelled`.
* **Then** `IInventoryModule.ReleaseStockAsync` is executed atomically, returning the deducted quantities to `AvailableQuantity`.
* **And** an audit entry is created in `inv_stock_logs` documenting the order cancellation.

### AC-INV-04: Manual Stock Adjustment Audit
* **Given** an administrator on `/admin/inventory`.
* **When** performing a manual stock adjustment (+10 units for "Restock" or -2 units for "Damaged / Written Off").
* **Then** the new available quantity is updated in `inv_stock_items` and an immutable record is inserted into `inv_stock_logs` with the selected reason, timestamp, and quantity delta.
* **And** omitting the reason note fails validation with HTTP 400.

---

## 6. Order Lifecycle & State Transitions

### AC-ORD-01: Order State Machine Transitions
* **Given** an order in `PendingPayment` status.
* **When** the merchant verifies payment or confirms COD delivery details.
* **Then** the order successfully transitions to `Processing`.
* **When** packaging is complete and the courier picks up the package.
* **Then** the order successfully transitions to `Shipped`.
* **When** the courier completes delivery.
* **Then** the order transitions to `Delivered`.

### AC-ORD-02: Irreversible Terminal State (Delivered Cannot Cancel)
* **Given** an order in `Delivered` status.
* **When** an administrator attempts to update status to `Cancelled`.
* **Then** the backend rejects the request with HTTP 400 Problem Details ("Delivered orders cannot be cancelled.").
* **And** stock is NOT released.

### AC-ORD-03: Prohibition of Customer Cancellation After Dispatch
* **Given** an order in `Shipped` or `Delivered` status.
* **When** a customer attempts to cancel the order.
* **Then** the request is rejected; cancellation is permitted only while the order is in `PendingPayment` or `Processing`.

---

## 7. Payments & Manual MFS Verification

### AC-PAY-01: Cash on Delivery Lifecycle
* **Given** an order placed with Payment Method `CashOnDelivery`.
* **Then** the payment record initializes with status `Pending`.
* **When** the order status transitions to `Delivered`.
* **Then** the payment status transitions to `Paid`.
* **When** the order is cancelled due to delivery refusal.
* **Then** the payment status transitions to `Failed`.

### AC-PAY-02: Manual bKash / Nagad TrxID Verification
* **Given** an order placed with Payment Method `bKash` and customer-submitted TrxID `9J2K4L1M` and sender phone `01712345678`.
* **When** an administrator audits the transaction and clicks "Mark as Paid".
* **Then** the payment record updates to `Paid`, recording the approving admin timestamp.
* **And** the order status automatically transitions from `PendingPayment` to `Processing`.

### AC-PAY-03: Duplicate TrxID Replay Prevention
* **Given** an order where TrxID `9J2K4L1M` has already been verified and marked `Paid`.
* **When** another customer submits an order using the identical TrxID `9J2K4L1M`.
* **Then** the system flags or rejects the payment submission, preventing double-spending of the same MFS transaction.

### AC-PAY-04: Manual MFS Payment Rejection
* **Given** an order with an invalid or unverifiable TrxID.
* **When** an administrator clicks "Mark as Failed" with note "TrxID not found on merchant statement".
* **Then** the payment status updates to `Failed`.
* **And** the order remains in `PendingPayment` with an action banner alerting the merchant to contact the customer.

---

## 8. Public Order Tracking & Anti-IDOR Security

### AC-TRK-01: Dual-Key Order Tracking Authentication
* **Given** a customer accessing `/orders/track`.
* **When** entering valid `OrderNumber` (`ORD-20260925-8491`) AND the matching `PhoneNumber` (`01712345678`).
* **Then** the system returns order status, fulfillment steps, masked customer phone, and line items.

### AC-TRK-02: IDOR Prevention on Guessing / Enumeration
* **Given** an attacker who knows an `OrderNumber` (`ORD-20260925-8491`) but enters an incorrect or arbitrary phone number.
* **When** submitting the tracking lookup.
* **Then** the backend returns HTTP 404 Problem Details ("Order not found or phone number does not match.").
* **And** zero order details, names, addresses, or items are exposed.

### AC-TRK-03: Tracking Rate Limiting
* **Given** an automated bot attempting to brute-force order numbers against `/api/v1/orders/{orderNumber}/track`.
* **When** more than 5 requests are sent within 1 minute from the same IP.
* **Then** the API returns HTTP 429 Too Many Requests.

---

## 9. Admin Authentication & Security Gates

### AC-SEC-01: Admin Route & API Authorization
* **Given** an unauthenticated visitor or non-admin user.
* **When** attempting to access `/admin/dashboard`, `/admin/products`, `/admin/orders`, or `/api/v1/admin/*`.
* **Then** the API returns HTTP 401 Unauthorized / 403 Forbidden.
* **And** the frontend redirects the user to `/admin/login`.

### AC-SEC-02: Brute-Force Password Lockout
* **Given** the admin login endpoint `/api/v1/admin/auth/login`.
* **When** 5 consecutive failed login attempts occur for an email within a 5-minute window.
* **Then** the account is locked for 15 minutes, rejecting further attempts even with correct credentials until the lockout duration expires.

### AC-SEC-03: Secure Session Cookie Issuance
* **Given** a successful admin authentication.
* **Then** the session token is set via an `HttpOnly`, `SameSite=Lax`, `Secure` cookie named `admin_session`.
* **And** client JavaScript cannot access the session token via `document.cookie`.

---

## 10. Performance, SEO & Accessibility Thresholds

### AC-PERF-01: Core Web Vitals (4G Mobile)
* **Given** storefront pages (`/`, `/products`, `/products/[slug]`).
* **When** audited on simulated 4G mobile network:
  * LCP is $\le 2.5$ seconds.
  * INP is $\le 200$ milliseconds.
  * CLS is $\le 0.1$.
  * First-load client JavaScript bundle is $\le 100$ KB gzipped.

### AC-A11Y-01: Accessible Forms & Navigation
* **Given** any interactive form (Checkout, Tracking, Admin Login).
* **Then** all inputs have associated `<label>` elements.
* **And** all interactive controls exhibit visible focus rings (`focus-visible:ring-2`) and touch targets $\ge 44 \times 44$ pixels.
* **And** text meets minimum contrast ratio $\ge 4.5:1$ against background.
