# Security Architecture & Invariant Defense

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

This document specifies the security boundaries, authentication/authorization models, data protection rules, and fraud-defense mechanisms.

---

## 1. Fundamental Principle: Zero Trust of the Client

The browser is an untrusted runtime. Any data originating from the client (HTTP headers, query strings, cookies, request bodies) is treated as potentially adversarial:
* **Prices:** Ignored during checkout; recomputed from authoritative catalog records.
* **Stock:** Validated against real-time database balances before order persistence.
* **Identity:** Admin claims verified on every request via cryptographic signature.
* **UI Controls:** Hiding an admin button or link in Next.js is purely a cosmetic UX feature, never a security boundary.

---

## 2. Authentication & Credential Security

1. **Admin Authentication:**
   * Handled by `Ecommerce.Modules.Identity`.
   * Sessions use encrypted, short-lived tokens delivered via **HttpOnly, Secure, SameSite=Lax** cookies to protect against Cross-Site Scripting (XSS).
   * Storage of authentication tokens in `localStorage` or `sessionStorage` is strictly forbidden.
2. **Password Standards:**
   * Minimum 8 characters with alphanumeric and special symbol complexity.
   * Hashed using ASP.NET Core `IPasswordHasher<User>` utilizing PBKDF2 with HMAC-SHA512 and $\ge 100,000$ iterations.
   * Plaintext passwords must never appear in logs, traces, or database columns.
3. **Brute-Force Protection:**
   * Account lockout triggered after 5 consecutive failed login attempts (15-minute cooldown).

---

## 3. Server-Side Authorization Model

* **Policy-Based Enforcement:** All administrative endpoints require explicit authorization attributes:
  ```csharp
  [Authorize(Policy = "AdminOnly")]
  ```
* **IDOR (Insecure Direct Object Reference) Prevention:**
  * When tracking an order (`GET /api/v1/orders/{orderNumber}`), access is permitted only when the caller supplies both the `OrderNumber` and the matching customer `PhoneNumber` used during checkout.

---

## 4. Input Validation & Injection Defense

1. **SQL Injection Defense:**
   * All database queries execute through EF Core parameterized LINQ queries.
   * Raw SQL queries using string interpolation (`FromSqlRaw($"SELECT * FROM ... {input}")`) are strictly forbidden.
2. **Validation Framework:**
   * Incoming request DTOs are validated using **FluentValidation** before reaching domain use cases.
   * Phone numbers must strictly adhere to the Bangladeshi mobile format (`^01[3-9]\d{8}$`).
3. **Cross-Site Scripting (XSS):**
   * Next.js JSX automatically escapes rendered strings.
   * If rich-text product descriptions are supported in the admin panel, HTML must be sanitized using a strict tag allowlist before being saved or rendered.

---

## 5. File Upload Security

Product image uploads (`/api/v1/admin/uploads`) are strictly constrained:
* **Size Limit:** Maximum file size is strictly capped at 3 MB.
* **MIME & Extension Whitelist:** Only `.jpg`, `.jpeg`, `.png`, and `.webp` extensions are permitted.
* **Content Verification:** The server inspects file magic bytes (headers) to prevent disguised executable scripts (`.php`, `.exe`, `.sh`).
* **Non-Executable Storage:** Uploaded files are assigned random GUID filenames and served with `X-Content-Type-Options: nosniff`.

---

## 6. Rate Limiting & Traffic Defense

ASP.NET Core built-in rate limiting middleware is applied to high-risk routes:
* `/api/v1/admin/auth/login`: Maximum 5 requests per minute per IP.
* `/api/v1/orders/checkout`: Maximum 10 checkout attempts per minute per IP to prevent spam order placement.

---

## 7. Commercial Payment & Fraud Defense

For the BDT 40k MVP, payments utilize Cash on Delivery (COD) and manual Mobile Financial Services (bKash / Nagad / Rocket):
* **Order Status Invariant:** Orders placed via manual MFS enter `PendingPayment` status.
* **No Automatic Dispatch:** The order status machine prevents transitioning an order to `Processing` or `Shipped` until an administrator manually cross-references the submitted `SenderPhoneNumber` and `TransactionId (TrxID)` against the store's MFS statement.

---

## 8. Baseline Security vs. Future Hardening

| Feature | Baseline MVP (Current) | Future Hardening (Scale) |
|---|---|---|
| **Admin Auth** | Password + HttpOnly Cookie | Multi-Factor Authentication (MFA / TOTP) |
| **WAF / DDoS** | Nginx rate limiting & fail2ban | Cloudflare Enterprise WAF & Bot Management |
| **Audit Logs** | Database status change logs | Immutable centralized SIEM log shipping |
| **Secret Storage** | Environment variables on host | Azure Key Vault / HashiCorp Vault |
