# Security Policy & Architecture — SmartStock

This document outlines the security architecture, safeguards, and defensive measures implemented in SmartStock (a software-simulated IoT inventory monitoring web application).

---

## 1. Authentication Security
- **Token Mechanism:** Stateless JSON Web Tokens (JWT) signed using HMAC SHA-256 (`HS256`).
- **Secret Isolation:** The JWT secret is strictly loaded from the backend environment variable `JWT_SECRET` and is never committed to source control or exposed to the client.
- **Expiration:** Tokens are issued with a 24-hour expiration window (`JWT_EXPIRES_IN=24h`). Expired or altered tokens are rejected with HTTP 401.
- **Minimal Payload:** Payloads contain only necessary identification claims (`userId`, `email`, `role`). No credentials, hashes, or internal database metadata are ever embedded in tokens.

## 2. Authorization & Role-Based Access Control (RBAC)
- **Authoritative Backend:** The backend is the single source of truth for authorization. Frontend route protection (`ProtectedRoute`) enhances user experience, while Express middleware (`authorizeRoles`) strictly enforces permissions.
- **Role Hierarchy:**
  - `MANAGER`: Full administrative privileges (manage products, create/edit suppliers, approve/receive purchase orders, perform manual stock count adjustments).
  - `STAFF`: Operational privileges (view catalog and inventory, record stock-in / stock-out transactions, acknowledge alerts, view notifications and analytics).
  - Staff attempts to access restricted manager endpoints receive HTTP 403 Forbidden.

## 3. Password Security
- **One-Way Hashing:** Passwords are never stored in plaintext. They are hashed using `bcrypt` with 10 salt rounds.
- **Zero Leakage:** Password hashes are excluded from all API responses, profile queries, and server logs.
- **Password Updates:** Changing passwords requires re-verifying the caller's current password, enforcing minimum length rules (>= 8 characters), and re-hashing with fresh salts.

## 4. Insecure Direct Object Reference (IDOR) & User Isolation
- **Scoped User Resources:** Operations modifying user profiles, notification read statuses, or notification preferences strictly resolve identity from the authenticated JWT token (`req.user.userId`), completely ignoring any arbitrary `userId` parameters passed in client request bodies.
- **Privacy Preservation:** Attempts to access or modify notifications belonging to another user return HTTP 404 (Not Found) rather than exposing resource existence.

## 5. API Input Validation & Mass Assignment Defense
- **Quantity Validation:** Inventory and restock quantities must be strictly positive whole integers (`quantity > 0`). Fractional values, `NaN`, `Infinity`, negative numbers, and oversized inputs (> 1,000,000) are rejected with HTTP 400.
- **Price Validation:** Unit prices must be non-negative finite numbers (`price >= 0`). Negative values, `NaN`, or strings are rejected with HTTP 400.
- **IoT Telemetry Validation:** Sensor telemetry requires authenticated access. Readings must have `calculated_quantity >= 0`, `raw_value >= 0`, and battery levels bounded between `0` and `100`.
- **Date Range Verification:** All historical audit and restock date filters require valid date formatting where `startDate <= endDate`.
- **Mass Assignment Protection:** Entity updates (products, suppliers, restock orders, preferences) use strict field allowlists, preventing injection of internal metadata such as `id`, `created_at`, or `role`.

## 6. Pagination & Sort Safety
- **Pagination Guard:** Pagination limits are capped at `100` (`limit <= 100`, `page >= 1`). Oversized requests such as `limit=999999999` are automatically bounded to prevent denial of service and memory exhaustion.
- **Sort Allowlisting:** Database queries and in-memory sorters only accept allowlisted sort keys (`name`, `created_at`, `current_stock`, etc.). Arbitrary SQL injection strings in sort queries are ignored or rejected.

## 7. CORS Configuration
- **Restricted Origins:** Access-Control-Allow-Origin is configured via environment variables (`CLIENT_URL`). Unrestricted wildcard (`*`) access with credentials is disallowed in production.

## 8. HTTP Security Headers
The API includes comprehensive HTTP response headers providing Helmet-equivalent defense:
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `X-Frame-Options: DENY`: Prevents clickjacking in iframes.
- `X-XSS-Protection: 0`: Disables legacy flawed browser filters in favor of modern escaping.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Mandates HTTPS.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer data leakage.
- `X-Powered-By`: Explicitly removed to avoid framework fingerprinting.

## 9. Rate Limiting & Denial of Service Protection
- **Payload Size Limits:** Express request body parser limits JSON and URL-encoded bodies to `1MB` to prevent memory flooding.
- **Auth Endpoint Throttling:** Strict rate limiting protects `/api/auth/login`, `/api/auth/register`, and `/api/auth/change-password` from brute-force attempts.
- **General API Throttling:** Protects routes against automated scraping and runaway loops. Exceeded thresholds return HTTP 429 Too Many Requests with standard `Retry-After` headers.

## 10. Database Security & Secret Management
- **Service-Role Key Protection:** The Supabase service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is backend-only and never exposed to the client or bundled into Vite (`VITE_*`) frontend variables.
- **Environment Isolation:** Secrets are kept in ignored `.env` files and tracked via sanitized `.env.example` templates.
- **Safe Error Responses:** Production error handlers suppress technical database error messages, stack traces, and internal file paths, returning clean JSON error responses: `{ success: false, message: "..." }`.

## 11. Reporting Security Issues
For issues or vulnerabilities discovered within this academic project:
1. Contact the maintainers via repository issue tracker.
2. Please do not commit real API keys, secrets, or production database connection strings to git history.
