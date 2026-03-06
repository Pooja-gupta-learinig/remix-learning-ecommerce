# Authentication Guide

This guide explains the authentication system used in the Remix Learning E-commerce application.

## Overview

The application uses cookie-based session authentication with role-based access control (RBAC). Sessions are managed server-side using Remix's session storage.

## User Roles

The application supports two user roles:

- **`admin`** - Administrative users with full access to admin features
- **`customer`** - Regular customers with access to shopping features

Roles are defined in `app/sessions.server.ts`:

```typescript
export const roles = ["admin", "customer"] as const;
export type Role = (typeof roles)[number];
```

## Session Management

### Session Storage

Sessions are stored using Remix's cookie session storage:

**File:** `app/sessions.server.ts`

```typescript
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [env.sessionSecret],
    secure: env.nodeEnv === "production",
  },
});
```

### User Session Type

```typescript
type UserSession = {
  id: string;
  email: string;
  role: Role;
};
```

## Authentication Functions

### Getting User Session

**`getUserSession(request: Request)`**

Retrieves the current user session if it exists:

```typescript
const user = await getUserSession(request);
if (user) {
  // User is authenticated
}
```

### Requiring Authentication

**`requireUserSession(request: Request, redirectTo?: string)`**

Ensures a user is authenticated. Redirects to login if not:

```typescript
const user = await requireUserSession(request);
// User is guaranteed to be authenticated here
```

### Requiring Specific Role

**`requireRole(request: Request, role: Role)`**

Ensures user has a specific role:

```typescript
const admin = await requireRole(request, "admin");
// User is guaranteed to be admin here
```

### Creating User Session

**`createUserSession(params)`**

Creates a new user session after successful login:

```typescript
await createUserSession({
  request,
  user: { id: user.id, email: user.email, role: user.role },
  redirectTo: "/dashboard",
});
```

### Logging Out

**`logout(request: Request)`**

Destroys the user session and redirects to login:

```typescript
await logout(request);
```

**Note:** Cart data is preserved during logout to maintain shopping cart state.

## Authentication Routes

### Login

**Route:** `/auth/login`

**File:** `app/routes/auth/login.tsx`

Features:
- Email and password authentication
- Form validation using Conform and Zod
- Role-based redirect after login
- Support for `redirectTo` query parameter

**Login Schema:**
```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

### Sign Up

**Route:** `/auth/sign-up`

**File:** `app/routes/auth/sign-up.tsx`

Allows new users to create accounts.

### Logout

**Route:** `/auth/logout`

**File:** `app/routes/auth/logout.tsx`

Handles user logout and session destruction.

## User Authentication Logic

**File:** `app/auth/users.server.ts`

### Verifying Login

**`verifyLogin({ email, password })`**

Validates user credentials:

```typescript
const user = await verifyLogin({ email, password });
if (!user) {
  // Invalid credentials
}
```

### Default Admin User

**`ensureDefaultAdminUser()`**

Creates a default admin user for development/demo purposes:

- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

**Note:** This should be disabled or removed in production.

## Route Protection

### Public Routes

Routes in `(public)/` directory are accessible without authentication:
- `/home`
- `/products`
- `/categories`
- `/about`
- `/contact`

### Protected Routes

Routes in `(private)/` directory require authentication:
- `/dashboard` - User dashboard
- `/settings` - User settings
- `/orders` - Order history

**Example:**
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUserSession(request);
  // Load protected data
  return { user };
}
```

### Admin Routes

Routes in `admin/` directory require admin role:
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management

**Example:**
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const admin = await requireRole(request, "admin");
  // Load admin data
  return { admin };
}
```

## Role-Based Redirects

After login, users are redirected based on their role:

**Function:** `getDefaultRedirectForRole(role: Role)`

- **Admin:** `/admin` (admin dashboard)
- **Customer:** `/dashboard` (user dashboard)

## Redirect After Login

The login page supports a `redirectTo` query parameter:

```
/auth/login?redirectTo=/checkout
```

After successful login, users are redirected to the specified path.

## Security Considerations

### Session Secret

The `SESSION_SECRET` environment variable must be set to a secure random string in production:

```env
SESSION_SECRET="your-secure-random-string-here"
```

### Cookie Security

- **httpOnly:** Prevents JavaScript access to cookies (XSS protection)
- **secure:** Only sent over HTTPS in production
- **sameSite:** Prevents CSRF attacks

### Password Storage

Passwords should be hashed using a secure hashing algorithm (e.g., bcrypt) before storage. The current implementation may need enhancement for production use.

## Cross-Tab Logout

The application includes cross-tab logout functionality:

**File:** `app/lib/cross-tab-logout.ts`

When a user logs out in one tab, all other tabs are notified and logged out automatically.

## Best Practices

1. **Always validate on server:** Never trust client-side authentication checks
2. **Use role-based access control:** Check roles in loaders/actions, not just in components
3. **Protect sensitive routes:** Use `requireUserSession` or `requireRole` in loaders
4. **Handle redirects properly:** Use `redirectTo` parameter for better UX
5. **Secure session storage:** Use strong secrets and secure cookies in production

## Example: Protected Route

```typescript
import type { Route } from "./+types/dashboard";
import { requireUserSession } from "~/sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  // Require authentication
  const user = await requireUserSession(request);
  
  // Load user-specific data
  const orders = await getUserOrders(user.id);
  
  return { user, orders };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, orders } = loaderData;
  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

## Example: Admin Route

```typescript
import type { Route } from "./+types/admin.products";
import { requireRole } from "~/sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  // Require admin role
  const admin = await requireRole(request, "admin");
  
  // Load admin data
  const products = await getAllProducts();
  
  return { products };
}
```

## Troubleshooting

### Session Not Persisting

- Check that `SESSION_SECRET` is set in environment variables
- Verify cookie settings (httpOnly, secure, sameSite)
- Check browser console for cookie-related errors

### Redirect Loops

- Ensure login route doesn't require authentication
- Check that `redirectTo` parameter is valid
- Verify role-based redirects are working correctly

### Role Access Issues

- Verify user role is set correctly in database
- Check that `requireRole` is used in admin routes
- Ensure role enum matches database values

