# Store Operations & Admin Workflows

**Document Version:** 2.0.0  
**Status:** Hardened Operational Baseline  
**Date:** 2026-09-25  

This document specifies all administrative workflows, security gates, lifecycle transitions, and audit trail rules for store merchants and fulfillment personnel.

---

## 1. Admin System Architecture & Navigation Topology

```text
                     +----------------------------+
                     |   Admin Login Screen       |
                     |   (/admin/login)           |
                     +----------------------------+
                                   | Valid Credentials & Session Cookie
                                   v
                     +----------------------------+
                     |   Admin Operational Hub    |
                     |   (/admin/dashboard)       |
                     +----------------------------+
                      /            |            \
                     /             |             \
                    v              v              v
         +-------------+    +-------------+    +-------------+
         | Products    |    | Orders      |    | Inventory   |
         | & Catalog   |    | Fulfillment |    | Adjustments |
         | Management  |    | & Payments  |    | & Audit Logs|
         +-------------+    +-------------+    +-------------+
```

---

## 2. Granular Operational Flows

### Flow 1: Secure Admin Authentication & Session Issuance
1. **Entry:** Merchant visits `/admin` or `/admin/login`.
2. **Form Credentials:**
   * Email Address.
   * Password.
3. **Execution & Defenses:**
   * Submits `POST /api/v1/admin/auth/login`.
   * Server validates hash via `IPasswordHasher` (PBKDF2 HMAC-SHA512).
   * **Brute-Force Guard:** 5 consecutive failed attempts locks account for 15 minutes.
   * **Rate Limiting:** Max 5 login requests per minute per IP.
   * **Session Issue:** Returns encrypted HttpOnly, SameSite=Lax, Secure cookie `admin_session` (8-hour lifetime).
   * **Redirect:** Merchant lands on `/admin/dashboard`.

### Flow 2: Operational Dashboard & Key Metrics
1. **Route:** `/admin/dashboard`.
2. **Metrics Displayed:**
   * **Total Revenue:** Sum of completed / active orders in BDT (৳).
   * **Total Orders:** Lifetime order count.
   * **Pending Orders:** Count of orders requiring packaging or confirmation (`PendingPayment` + `Processing`).
   * **Pending MFS Verifications:** Count of orders with unverified bKash/Nagad/Rocket TrxIDs.
   * **Low-Stock Alerts:** Variants with available stock $\le 5$ units.
3. **Recent Orders Feed:** Top 10 latest orders with status badges and quick action links.

### Flow 3: Product Creation & Variant Setup
1. **Route:** `/admin/products/new`.
2. **Workflow:**
   * **Step A: Basic Information:**
     * Title (e.g. "Premium Cotton Panjabi").
     * Slug: Auto-generated from title, editable, validated for global uniqueness.
     * Category: Select from existing categories or create new.
     * Description: Markdown/rich-text product details (sanitized server-side).
     * Publication Status: `Published` vs `Draft`.
     * `IsFeatured`: Checkbox to showcase on homepage.
   * **Step B: Pricing:**
     * Base Price: Standard retail price in BDT (`decimal(18,2)`).
     * Comparison Price: Optional strike-through MSRP for discount display.
   * **Step C: Variant & SKU Configuration (Mandatory $\ge 1$ Variant):**
     * Add variants (e.g. Size "40", Color "Navy", SKU "PAN-NVY-40").
     * Variant Price Adjustment: `+৳0` or specific surcharge (e.g. `+৳100` for XL).
     * Initial Physical Stock: Allocation for each variant.
   * **Step D: Media Management:**
     * Upload dropzone supporting JPG, PNG, WebP up to 5 MB.
     * Files validated by extension, MIME header, and stored via `IFileStorageService` under `uploads/` with randomized GUID filenames.
     * Radio button to designate the Primary Image.
   * **Step E: Save & Commit:**
     * Dispatches `POST /api/v1/admin/products`.
     * Product, variants, and initial stock items are created atomically in MySQL.

### Flow 4: Product Editing & Soft Deletion
1. **Route:** `/admin/products` and `/admin/products/[id]`.
2. **Editing:** Update title, description, category, base price, and active status.
3. **Soft Deletion Protocol:**
   * Clicking "Delete Product" displays confirmation dialog: *"Are you sure? This will archive the product and remove it from the storefront."*
   * Backend sets `IsActive = false`.
   * **Historical Invariant:** Product records referenced by historical orders are NEVER purged from MySQL, preserving database integrity.

### Flow 5: Order Review, Fulfillment & Status Stepper
1. **Route:** `/admin/orders`.
2. **Search & Filter:**
   * Filter by status (`All`, `PendingPayment`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
   * Search by Order Number (e.g. `ORD-20260925-8491`) or Customer Phone (`017XXXXXXXX`).
3. **Order Detail Screen (`/admin/orders/[id]`):**
   * **Customer Dossier:** Full Name, Phone (click-to-call link for quick mobile confirmation), Delivery Address, Delivery Zone (Inside/Outside Dhaka).
   * **Order Items Snapshot:** Product title, variant name, SKU, frozen unit price, quantity, and line total.
   * **Financial Summary:** Subtotal, shipping fee, total amount, payment method.
   * **Fulfillment Action Panel:**
     * Status transition dropdown enforcing state machine rules:
       * `PendingPayment` $\rightarrow$ `Processing` (Order confirmed with customer or MFS verified).
       * `Processing` $\rightarrow$ `Shipped` (Courier tracking number and courier name entered).
       * `Shipped` $\rightarrow$ `Delivered` (Confirmed cash collected or delivery completed).
       * Any unfulfilled $\rightarrow$ `Cancelled` (Triggers automatic stock release).
     * **Prohibited Transition:** If order is in `Delivered`, the system prevents changing status to `Cancelled`.

### Flow 6: Manual MFS Payment Verification Workflow
1. **Context:** Customer placed order choosing bKash / Nagad / Rocket and supplied:
   * Customer Sender Phone Number (`01XXXXXXXXX`).
   * Transaction ID (`TrxID`).
2. **Verification Review (`/admin/orders/[id]`):**
   * Admin inspects submitted TrxID, Sender Phone, and order total amount.
   * Admin checks merchant bKash/Nagad app or SMS statement for matching incoming transfer.
3. **Action Pathways:**
   * **Path A: Approve / Mark as Paid:**
     * Admin clicks "Mark as Paid".
     * Payment record updates to `Paid`, recording admin ID and timestamp.
     * Order status automatically transitions from `PendingPayment` to `Processing`.
   * **Path B: Reject / Mark as Failed:**
     * Admin clicks "Mark as Failed" and enters mandatory note (e.g. "TrxID not found or amount incorrect").
     * Payment status updates to `Failed`.
     * Order remains in `PendingPayment`. Merchant calls customer to request correct TrxID or switch to Cash on Delivery.

### Flow 7: Inventory Level Monitoring & Stock Adjustments
1. **Route:** `/admin/inventory`.
2. **Stock Audit Table:**
   * Shows Variant SKU, Product Title, Variant Name, Available Units, and In-Stock Status.
3. **Stock Adjustment Modal:**
   * Admin clicks "Adjust Stock" on any variant.
   * Inputs quantity delta (e.g. `+20` for new shipment, `-3` for damaged goods).
   * Selects mandatory reason:
     * `Restock`
     * `Inventory Count Correction`
     * `Damaged / Written Off`
   * Backend updates `inv_stock_items` and appends an immutable audit entry in `inv_stock_logs`.
   * Omitting the reason note is rejected by validation.

### Flow 8: Order Cancellation & Stock Release
1. **Context:** Customer requests cancellation before dispatch, or customer is unreachable during confirmation, or customer rejects COD delivery.
2. **Execution:**
   * Admin navigates to `/admin/orders/[id]` and selects status `Cancelled`.
   * Admin enters mandatory reason in Notes (e.g. "Customer requested cancellation before shipment").
   * **Automated Action:**
     * `IInventoryModule.ReleaseStockAsync` is executed atomically.
     * Each line item quantity is added back to `AvailableQuantity` in `inv_stock_items`.
     * A cancellation log entry is written to `inv_stock_logs` referencing the order ID.
     * `ord_status_history` records the cancellation event.
