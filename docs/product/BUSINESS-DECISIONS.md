# Business & Operational Decisions Register

**Document Version:** 1.0.0  
**Status:** Baseline Document for Merchant Alignment  
**Date:** 2026-09-25  

This document captures all commercial, operational, and business-policy decisions required for the e-commerce platform. It cleanly isolates merchant-owned business decisions from technical implementation choices and established architectural invariants.

---

## 1. Decisions Requiring Merchant Confirmation Before Implementation

These decisions directly affect commercial operations, courier contracts, and merchant cash flow. Engineering cannot safely guess them.

| ID | Decision Area | Operational Context | Available Options | Recommended Default | Merchant Decision Required |
|---|---|---|---|---|---|
| **BD-001** | **Standard Delivery Rates** | Flat shipping fees charged to customer during checkout based on delivery zone. | **A:** ৳60 Inside Dhaka / ৳120 Outside Dhaka<br>**B:** ৳70 Inside Dhaka / ৳130 Outside Dhaka<br>**C:** ৳80 Inside Dhaka / ৳150 Outside Dhaka | **Option A** (৳60 / ৳120) | Confirm exact delivery charge per delivery zone based on merchant courier agreement (Steadfast, Pathao, RedX). |
| **BD-002** | **Free Shipping Threshold** | Subtotal threshold at which shipping fee is automatically waived (৳0). | **A:** ৳2,000 threshold<br>**B:** ৳2,500 threshold<br>**C:** No free shipping (flat rate on all orders) | **Option A** (৳2,000 threshold) | Confirm whether free shipping is offered, and if so, the minimum qualifying subtotal. |
| **BD-003** | **Merchant MFS Account Numbers & Type** | Mobile Financial Services (bKash, Nagad, Rocket) details displayed to customers at checkout for manual money transfer. | **A:** Merchant Account ("Make Payment" via bKash Merchant QR / Counter)<br>**B:** Personal Account ("Send Money" with cash-out fee consideration) | **Option B** for initial small MVP; **Option A** if commercial trade license exists | Provide merchant account number, account type (Personal vs Merchant), and transfer instructions for bKash, Nagad, and Rocket. |
| **BD-004** | **Unverified MFS Order Expiration Window** | How long stock is held for an order placed via manual MFS before merchant cancels due to missing/invalid TrxID. | **A:** 12 Hours<br>**B:** 24 Hours<br>**C:** 48 Hours | **Option B** (24 Hours) | Confirm maximum time allowed for customer to complete payment before merchant cancels the order and releases reserved stock. |
| **BD-005** | **Customer Order Cancellation Policy** | Whether customer can cancel an order directly from the tracking page without calling the merchant. | **A:** Customer self-cancellation allowed only while in `PendingPayment` state (before merchant confirmation)<br>**B:** No self-cancellation; customer must call merchant phone support | **Option A** (Self-cancellation while `PendingPayment` only) | Confirm if customers may cancel directly online before merchant begins fulfillment. |
| **BD-006** | **COD Refusal & Delivery Failure Policy** | Operational protocol when a customer rejects a Cash on Delivery package at their doorstep. | **A:** Courier returns package; admin marks order `Cancelled` with note "Delivery Failed / Refused"; stock returned to inventory upon receipt.<br>**B:** Courier re-attempts delivery once before marking failed. | **Option A** | Confirm operational handling and inventory return timeline for failed deliveries. |

---

## 2. Decisions Engineering Can Safely Decide

These decisions involve technical invariants, data integrity, and system safety. Engineering has made authoritative choices that satisfy production safety and architectural boundaries without requiring merchant consultation.

| ID | Decision Area | Engineering Decision | Technical & Architectural Rationale |
|---|---|---|---|
| **ED-001** | **Inventory Deduction Model** | **Option A: Immediate Atomic Deduction** on checkout inside `BeginTransactionAsync`. | Prevents overselling and phantom inventory in high-demand moments. Stock is released immediately if an order is cancelled. Eliminates background reservation timeout daemon complexity in MVP. |
| **ED-002** | **Guest Order Tracking Authentication** | **Order Reference Number + Exact Customer Mobile Number** with strict IP rate limiting (5 req/min) and PII masking. | Eliminates SMS OTP provider dependency and SMS costs for MVP while defeating IDOR attacks and brute-force order scanning. |
| **ED-003** | **Product & Variant Data Model** | Every product has $\ge 1$ variant. Single-item products use a "Default" variant. Inventory and SKU belong strictly to variants. | Guarantees consistent relational integrity across catalog, inventory, and order items without conditional schema branching. |
| **ED-004** | **Order Line Item Immutability** | Order items snapshot `ProductName`, `VariantName`, `SKU`, and `UnitPrice` as frozen values at order placement. | Ensures historical order auditability and financial accounting integrity even if product titles or prices are modified or archived later. |
| **ED-005** | **Duplicate Payment TrxID Handling** | Approved Transaction IDs (`TrxID`) must be unique across all non-failed MFS payments. Submitting an already-approved TrxID is rejected. | Defeats payment replay attacks where a customer attempts to reuse one valid payment across multiple purchases. |
| **ED-006** | **Product Deletion Policy** | Soft deletion (`IsActive = false`) / Archival only. Hard deletion is prevented if historical orders or stock logs exist. | Preserves foreign scalar references in historical orders and maintains relational audit consistency in MySQL. |
| **ED-007** | **Admin Authentication & Session Security** | Single `Admin` role using PBKDF2 password hashing (HMAC-SHA512, $\ge 100,000$ iterations) and HttpOnly, SameSite=Lax, Secure session cookies with 5-attempt lockout (15-min cooldown). | Meets OWASP standards, eliminates complex RBAC overhead for single-store retail MVP, and prevents credential stuffing and token theft. |
| **ED-008** | **Media Storage Implementation** | Local disk storage behind `IFileStorageService` (`uploads/`) with GUID renaming, 5MB file cap, and MIME/extension allowlists (`.jpg`, `.jpeg`, `.png`, `.webp`). | Minimizes initial hosting cost within BDT 40k budget while preserving a drop-in transition to Cloudflare R2 / AWS S3 when scale triggers are met. |

---

## 3. Decisions Already Established (Authoritative Baseline)

These decisions are locked and verified by the architectural constitution (`AGENTS.md`) and must not be reopened:

1. **System Architecture:** Modular Monolith in a single ASP.NET Core process host. No microservices or container meshes.
2. **Database Engine:** MySQL 8.0 with InnoDB and `utf8mb4` collation. Module-prefixed tables (`cat_*`, `inv_*`, `cus_*`, `ord_*`, `pay_*`, `usr_*`) and zero cross-module database foreign keys.
3. **Monetary Precision:** All monetary amounts mapped strictly to `decimal(18,2)` in BDT (Bangladeshi Taka / ৳).
4. **Checkout Paradigm:** Guest checkout by default. Customer phone number is an 11-digit Bangladeshi mobile number (`01[3-9]\d{8}`).
5. **Server Authority:** The backend server authoritatively calculates all prices, subtotals, shipping fees, and taxes. Client-submitted prices are discarded.
6. **Payment Scope:** Cash on Delivery (COD) and manual Mobile Financial Services (bKash, Nagad, Rocket). Direct automated payment gateway integration (SSLCommerz/bKash Direct) is deferred post-MVP.
7. **Frontend Architecture:** Next.js 16 App Router using React Server Components (RSC) by default, with client components confined strictly to interactive leaves (`'use client'`).
8. **Infrastructure Gateways:** Redis, RabbitMQ, Kafka, Elasticsearch, and Kubernetes are strictly forbidden until documented scale triggers are met.
