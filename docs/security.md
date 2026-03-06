# Security Guide

This guide documents the security measures implemented in the Remix Learning E-commerce application.

## Overview

The application implements multiple layers of security following HTTP-first security principles and Remix best practices. All security measures are designed to protect against common web vulnerabilities while maintaining a good user experience.

## Security Headers

Security headers are automatically applied to all responses via `entry.server.tsx`. These headers protect against various attacks:

### Content Security Policy (CSP)

Prevents XSS attacks by controlling which resources can be loaded:

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
img-src 'self' data: https: blob:
connect-src 'self' https://dummyjson.com
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
upgrade-insecure-requests
```

**Note:** `unsafe-inline` and `unsafe-eval` are required for Remix hydration. In production, consider using nonces for stricter CSP.

### X-Frame-Options

Prevents clickjacking attacks:

```
X-Frame-Options: DENY
```

### X-Content-Type-Options

Prevents MIME type sniffing:

```
X-Content-Type-Options: nosniff
```

### Referrer-Policy

Controls referrer information:

```
Referrer-Policy: strict-origin-when-cross-origin
```

### Permissions-Policy

Restricts browser features:

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

### Strict-Transport-Security (HSTS)

Enforces HTTPS in production:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**File:** `app/lib/security.server.ts`

## CSRF Protection

Cross-Site Request Forgery (CSRF) protection is implemented through multiple layers:

### 1. SameSite Cookies

Session cookies use `SameSite: Lax` which:
- Blocks cross-site POST requests (prevents CSRF)
- Allows GET requests from other sites (better UX)
- Works automatically with Remix forms

**File:** `app/sessions.server.ts`

```typescript
cookie: {
  sameSite: "lax", // CSRF protection
  httpOnly: true,   // XSS protection
  secure: true,     // HTTPS only in production
}
```

### 2. Origin Validation

Sensitive actions validate the `Origin` header to ensure requests come from the same domain:

**Files:**
- `app/routes/cart.actions.tsx`
- `app/routes/auth/login.tsx`
- `app/routes/auth/sign-up.tsx`
- `app/routes/checkout.address.tsx`

```typescript
const origin = request.headers.get("Origin");
const host = request.headers.get("Host");
if (origin && host) {
  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  if (originUrl.hostname !== requestUrl.hostname) {
    return errorResponse("Invalid request origin");
  }
}
```

### 3. HTTP Method Validation

State-changing operations validate HTTP methods:

```typescript
if (request.method !== "POST") {
  return errorResponse("Method not allowed");
}
```

## Secure Cookies

Session cookies are configured with security best practices:

### Configuration

```typescript
cookie: {
  name: "__session",
  httpOnly: true,        // Prevents JavaScript access (XSS protection)
  path: "/",
  sameSite: "lax",      // CSRF protection
  secrets: [env.sessionSecret],
  secure: env.nodeEnv === "production", // HTTPS only in production
  maxAge: 60 * 60 * 24 * 7, // 7 days
}
```

### Security Features

- **httpOnly:** Prevents JavaScript access, protecting against XSS attacks
- **secure:** Only sent over HTTPS in production
- **sameSite:** Prevents CSRF attacks
- **secrets:** Cookie values are encrypted using the session secret
- **maxAge:** Limits session lifetime

**File:** `app/sessions.server.ts`

## Input Sanitization

All user inputs are validated and sanitized to prevent XSS and injection attacks.

### Zod Validation

All form inputs are validated using Zod schemas before processing:

**Example:**
```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

### Sanitization Utility

A sanitization utility is available for additional XSS protection:

**File:** `app/lib/security.server.ts`

```typescript
import { sanitizeInput, sanitizeObject } from "~/lib/security.server";

// Sanitize a single string
const clean = sanitizeInput(userInput);

// Sanitize an object
const cleanData = sanitizeObject(formData);
```

### Validation in Actions

All server actions validate input before processing:

1. Extract form data
2. Validate with Zod schema
3. Sanitize if needed
4. Process only validated data

**Files:**
- `app/routes/auth/login.tsx`
- `app/routes/auth/sign-up.tsx`
- `app/routes/cart.actions.tsx`
- `app/routes/checkout.address.tsx`

## Rate Limiting

Rate limiting prevents abuse and brute-force attacks. Different limits apply to different endpoints:

### Login Endpoint

- **Limit:** 5 attempts per 15 minutes per IP
- **Purpose:** Prevent brute-force attacks

**File:** `app/routes/auth/login.tsx`

### Sign-Up Endpoint

- **Limit:** 3 attempts per hour per IP
- **Purpose:** Prevent account creation abuse

**File:** `app/routes/auth/sign-up.tsx`

### Cart Actions

- **Limit:** 30 requests per minute per IP
- **Purpose:** Prevent cart manipulation abuse

**File:** `app/routes/cart.actions.tsx`

### Checkout

- **Limit:** 10 requests per minute per IP
- **Purpose:** Prevent checkout abuse

**File:** `app/routes/checkout.address.tsx`

### Implementation

Rate limiting uses an in-memory store. For production, consider using Redis:

**File:** `app/lib/security.server.ts`

```typescript
const rateLimit = checkRateLimit(identifier, maxRequests, windowMs);
if (!rateLimit.allowed) {
  return errorResponse("Too many requests");
}
```

## API Server Boundaries

Remix follows HTTP-first principles where server actions are the primary API boundaries.

### Server-Side Validation

All validation happens on the server. Client-side validation is for UX only:

```typescript
export async function action({ request }: Route.ActionArgs) {
  // Server-side validation (required)
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  
  // Process validated data
  // ...
}
```

### No Trust in Client

- Never trust client-side validation
- Always validate on the server
- Never expose sensitive logic to the client
- Use server-only modules (`.server.ts`) for sensitive operations

### Module Boundaries

Remix automatically removes server-only code from browser bundles:

- Files ending in `.server.ts` are never sent to the client
- Server-only imports are automatically excluded
- Sensitive operations stay on the server

## Authentication & Authorization

### Session Management

- Sessions are stored in encrypted cookies
- Session data is validated on every request
- Sessions expire after 7 days

**File:** `app/sessions.server.ts`

### Role-Based Access Control

Access control is enforced at the route level:

```typescript
// Require authentication
const user = await requireUserSession(request);

// Require specific role
const admin = await requireRole(request, "admin");
```

**File:** `app/sessions.server.ts`

## Environment Variables

Sensitive configuration is stored in environment variables:

### Required Variables

```env
SESSION_SECRET="your-secure-random-string-here"  # At least 16 characters
NODE_ENV="production"                             # or "development"
```

### Generating Session Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

**File:** `app/config.server.ts`

## Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good: Validate with Zod
const submission = parseWithZod(formData, { schema });

// ❌ Bad: Trust client input
const email = formData.get("email");
```

### 2. Use Server-Only Modules

```typescript
// ✅ Good: Server-only file
// app/lib/users.server.ts
export async function createUser() { /* ... */ }

// ❌ Bad: Shared module with sensitive code
// app/lib/users.ts
export async function createUser() { /* ... */ }
```

### 3. Sanitize User-Generated Content

```typescript
// ✅ Good: Sanitize before display
const clean = sanitizeInput(userInput);

// ❌ Bad: Display raw user input
<div>{userInput}</div>
```

### 4. Rate Limit Sensitive Operations

```typescript
// ✅ Good: Rate limit login attempts
const rateLimit = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);

// ❌ Bad: No rate limiting
export async function action({ request }) {
  // Process without limits
}
```

### 5. Use HTTPS in Production

```typescript
// ✅ Good: Secure cookies in production
secure: env.nodeEnv === "production"

// ❌ Bad: Always allow HTTP
secure: false
```

## Security Checklist

- [x] Security headers configured
- [x] CSRF protection via SameSite cookies
- [x] Origin validation for sensitive actions
- [x] Secure cookie configuration
- [x] Input validation with Zod
- [x] Input sanitization utilities
- [x] Rate limiting on sensitive endpoints
- [x] HTTP method validation
- [x] Server-side validation only
- [x] Environment variable validation
- [x] Session encryption
- [x] Role-based access control

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Remix Security Best Practices](https://remix.run/docs/en/main/guides/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly. Do not create public issues for security vulnerabilities.

