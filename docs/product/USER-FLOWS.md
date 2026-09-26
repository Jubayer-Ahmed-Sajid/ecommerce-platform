# Customer User Flows & Journey Specifications

**Document Version:** 2.0.0  
**Status:** Hardened User Journey Baseline  
**Date:** 2026-09-25  

This document details the primary customer journeys, edge cases, failure states, and UI ergonomics for the storefront.

---

## 1. Macro Customer Journey Map

```text
+-------------------+      +---------------------+      +---------------------+
| 1. Discovery      | ---> | 2. Product Detail   | ---> | 3. Cart Management  |
| - Homepage        |      | - Variant selection |      | - Slide-out drawer  |
| - Category filter |      | - Live stock badge  |      | - Quantity steppers |
| - Search keywords |      | - Price breakdown   |      | - Subtotal preview  |
+-------------------+      +---------------------+      +---------------------+
                                                                   |
                                                                   v
+-------------------+      +---------------------+      +---------------------+
| 6. Public Tracking| <--- | 5. Order Receipt    | <--- | 4. Single-Step      |
| - Dual-key lookup |      | - Reference number  |      |    Checkout         |
|   (Phone + Ord #) |      | - Courier guidance  |      | - BD phone validate |
| - Masked PII view |      | - Payment reference |      | - Shipping zone fee |
| - Live step badges|      | - Print receipt     |      | - COD or MFS select |
+-------------------+      +---------------------+      +---------------------+
```

---

## 2. Core Journey Flows (Happy Paths)

### Flow 1: Catalog Discovery, Search & Filtering
1. **Entry Points:**
   * Homepage (`/`): Features hero banner, highlighted category cards, trust policies (Cash on Delivery, Fast Shipping, 100% Authentic), and featured products grid.
   * Catalog Listing (`/products`): Full catalog with server-rendered category pills and sort controls.
2. **Interactions:**
   * **Category Filter:** Clicking a category updates the URL (`/products?categorySlug=apparel`). Streamed via React Server Components.
   * **Search Query:** Entering a term in the search input navigates to `/products?searchTerm=panjabi`.
   * **Sorting:** Dropdown options (`Newest`, `Price: Low to High`, `Price: High to Low`) update the query parameter (`?sortBy=price_asc`).
3. **Responsive Ergonomics:** On mobile, category filters scroll horizontally; sticky header provides quick access to search and cart drawer.

### Flow 2: Product Detail & Variant Selection (PDP)
1. **Navigation:** User clicks product card to view `/products/[slug]`.
2. **Presentation:**
   * High-resolution image gallery with primary image preview and thumbnail selector.
   * Product title, category badge, and base price in BDT (৳).
   * **Variant Selector:** Interactive pills for size (S, M, L, XL) and color swatches.
3. **Invariants & State:**
   * Selecting a variant updates the active SKU, price (applying `PriceAdjustment`), and stock badge.
   * **In-Stock:** Displays green badge *"In Stock"* (or amber *"Only 3 left!"* if $\le 5$). The "Add to Cart" button is active.
   * **Out-of-Stock:** Displays red badge *"Out of Stock"*. The "Add to Cart" button is disabled with text *"Sold Out"*.
4. **Action:** Clicking "Add to Cart":
   * Appends selected `{ variantId, sku, name, unitPrice, quantity }` to `localStorage` cart.
   * Automatically slides open the Cart Drawer with a smooth micro-animation.
   * The header cart icon badge increments.

### Flow 3: Shopping Cart Management
1. **Access:** Opened via header cart trigger or immediately after adding an item.
2. **Cart Drawer Components:**
   * List of cart items showing thumbnail, product title, variant name, unit price, quantity stepper (`-`, `+`), and remove button (`×`).
   * Free Delivery Progress Bar: Shows amount remaining to unlock free delivery (e.g. *"Add ৳450 more to get FREE Delivery!"*).
   * Subtotal preview (calculated as indicative preview on client).
   * Call to Action: *"Proceed to Checkout"* button.
3. **Full Cart Route (`/cart`):**
   * Accessible for desktop users preferring an itemized tabular view before checkout.

### Flow 4: High-Conversion Single-Step Checkout
1. **Navigation:** User clicks *"Proceed to Checkout"* navigating to `/checkout`.
2. **Form Layout (Single Screen):**
   * **Section 1: Contact Details:**
     * Full Name (Required).
     * Mobile Number (Required, validated against Bangladeshi pattern `01[3-9]\d{8}`).
     * Email Address (Optional, for digital invoice).
   * **Section 2: Delivery Address:**
     * Street Address / House / Road / Area (Required).
     * Delivery Zone Selection:
       * **Inside Dhaka (Metro):** Shows flat delivery fee (৳60.00).
       * **Outside Dhaka (All other districts):** Shows courier fee (৳120.00).
     * Delivery Notes (Optional, e.g. "Call before arriving").
   * **Section 3: Payment Method:**
     * **Cash on Delivery (COD):** Selected by default. Informational alert: *"Pay with cash when courier delivers parcel to your door."*
     * **bKash / Nagad / Rocket (Manual MFS):** Displays merchant account number and instructions: *"Send Money / Make Payment to 017XXXXXXXX, then enter your details below."*
     * Sub-fields appear:
       * `Sender Mobile Number` (11-digit mobile).
       * `Transaction ID (TrxID)` (alphanumeric code from MFS SMS).
   * **Section 4: Authoritative Order Summary:**
     * Displays Subtotal, Shipping Fee, and Total Amount (৳).
3. **Submission:**
   * Customer clicks *"Confirm Order (৳Total)"*.
   * Button enters loading state with spinner; form inputs are disabled to prevent double-clicks.
   * Request posted to `/api/v1/orders/checkout`.
   * **Success:** Client cart is cleared from `localStorage`. User is immediately redirected to `/orders/[orderNumber]`.

### Flow 5: Order Confirmation & Receipt Screen
1. **View (`/orders/[orderNumber]`):**
   * Success banner: *"Thank you! Your order has been placed successfully."*
   * Highlighted Order Reference Number (e.g. `ORD-20260925-8491`).
   * Fulfillment Status Stepper: `Order Placed` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`.
   * Complete item breakdown, delivery destination, and payment method details.
   * Action button: *"Track This Order"* and *"Continue Shopping"*.

### Flow 6: Public Order Tracking (Dual-Key Lookup)
1. **Access:** Buyer visits `/orders/track`.
2. **Lookup Form:**
   * Field 1: Order Reference Number (`orderNumber`).
   * Field 2: Delivery Phone Number (`phoneNumber`).
3. **Execution:**
   * Submits query to `/api/v1/orders/{orderNumber}/track?phoneNumber={phoneNumber}`.
   * Both fields must match the database record exactly.
4. **Display:**
   * Live status indicator (`PendingPayment`, `Processing`, `Shipped`, `Delivered`).
   * Courier tracking consignment notes (if shipped).
   * Sanitized summary (customer phone masked as `017*****678`, recipient name, delivery city).

---

## 3. Failure States & Edge Case Flows

```text
[Checkout Submission]
        │
        ├───> Case 1: Concurrent Stock Exhaustion (HTTP 400 Problem Details)
        │     - Error Alert: "Item '[Product Name]' is no longer available in the requested quantity."
        │     - Offending item is highlighted; user prompted to adjust cart quantity.
        │     - Zero orphaned orders created.
        │
        ├───> Case 2: Validation Failure (HTTP 400 / 422 Problem Details)
        │     - Invalid Phone: "Please provide a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX)."
        │     - Missing Address: "Street address is required for delivery."
        │     - Focus automatically jumps to first invalid field.
        │
        ├───> Case 3: Network Timeout / Server Disconnect
        │     - Error toast appears: "Unable to connect to server. Your information has been preserved. Please retry."
        │     - Form remains populated; user does not retype address or phone.
        │
        └───> Case 4: Duplicate Submission Defense
              - Submit button disabled immediately on click (`isSubmitting = true`).
              - Prevents duplicate order creation or multiple inventory deductions.
```

### Flow 7: Empty States
1. **Empty Cart:**
   * If cart drawer or `/cart` is accessed with 0 items:
   * Displays friendly illustration: *"Your cart is empty."*
   * Action button: *"Start Shopping"* routing to `/products`.
2. **Empty Catalog / Search Results:**
   * If search or filter returns 0 products:
   * Displays: *"No products found matching your selection."*
   * Action button: *"Clear Filters"* resetting category, query, and price filters.

### Flow 8: Failed Payment Verification (Customer Impact)
1. **Context:** Customer submitted an invalid or unverified bKash/Nagad TrxID.
2. **System Behavior:**
   * Admin audits and rejects payment in admin panel (`PaymentStatus` $\rightarrow$ `Failed`).
   * Order remains in `PendingPayment` status.
   * Merchant calls the customer using the registered phone number to verify or request a valid TrxID or switch order to Cash on Delivery.
   * If the customer is unreachable within the merchant expiration window (e.g. 24 hours), admin cancels the order, immediately releasing stock back to available inventory.

### Flow 9: Delivery Failure & COD Rejection Flow
1. **Context:** Parcel shipped via courier; customer refuses delivery or is unreachable at delivery address.
2. **System Behavior:**
   * Courier returns parcel to merchant warehouse.
   * Admin opens `/admin/orders/[id]` and changes status to `Cancelled` with mandatory note: *"Delivery Failed: Customer refused COD delivery"*.
   * `IInventoryModule.ReleaseStockAsync` executes automatically, restoring physical stock counts.

### Flow 10: Unauthorized Tracking Attempt
1. **Context:** A user attempts to inspect an order by guessing `orderNumber` without knowing the exact customer phone number.
2. **System Behavior:**
   * Request returns HTTP 404 Problem Details: *"Order not found or phone number does not match."*
   * Zero order data or customer details are returned.
   * If $>5$ attempts occur within 1 minute, IP is rate-limited with HTTP 429.
