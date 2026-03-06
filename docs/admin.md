# Admin Guide

This guide explains the admin features and functionality in the Remix Learning E-commerce application.

## Overview

The admin section provides administrative tools for managing products, orders, and users. Access is restricted to users with the `admin` role.

## Access Control

### Admin Role Requirement

All admin routes require the `admin` role. Access is enforced using the `requireRole` function:

**File:** `app/lib/admin.server.ts`

```typescript
export async function adminLoader(request: Request) {
  return await requireRole(request, "admin");
}
```

### Admin Routes Protection

All admin routes use the `adminLoader` function:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  await adminLoader(request);
  // Load admin data
}
```

## Admin Dashboard

**Route:** `/admin`

**File:** `app/routes/admin/admin.dashboard.tsx`

### Dashboard Statistics

The admin dashboard displays key metrics:

- **Total Revenue** - Sum of all completed orders
- **Total Orders** - Count of all orders
- **Total Products** - Count of all products
- **Pending Orders** - Count of orders awaiting processing
- **Total Users** - Count of registered users

### Recent Orders

Displays the most recent orders with:
- Order ID
- Customer email
- Order date
- Total amount
- Order status

### Quick Actions

Quick access links to:
- Add new product
- View all products
- View all orders
- View all users

## Product Management

### Products List

**Route:** `/admin/products`

**File:** `app/routes/admin/admin.products.tsx`

Features:
- List all products with pagination
- Search products by name
- Filter products by category
- View product details
- Edit product
- Delete product

### Add/Edit Product

**Route:** `/admin/addeditproduct` (add)
**Route:** `/admin/addeditproduct/:productId` (edit)

**File:** `app/routes/admin/addeditproduct.tsx`

**Product Form Fields:**
- Title
- Description
- Price
- Discount percentage
- Stock quantity
- Brand
- Category
- Thumbnail URL
- Images (multiple)

**Validation:**
- Title: Required, minimum length
- Price: Required, must be positive number
- Stock: Required, must be non-negative integer
- Category: Required, must be valid category

### Delete Product

**Route:** `/admin/deleteproduct/:productId`

**File:** `app/routes/admin/deleteproduct.$productId.tsx`

Confirms product deletion before removing from database.

## Order Management

### Orders List

**Route:** `/admin/orders`

**File:** `app/routes/admin/admin.orders.tsx`

Features:
- List all orders
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Search orders by customer email or order ID
- View order details
- Update order status

### Order Status Management

Admins can update order status:
- **Pending** → Processing
- **Processing** → Shipped
- **Shipped** → Delivered
- Any status → Cancelled

### Order Details

Each order displays:
- Order ID
- Customer information
- Order date
- Shipping address
- Payment method
- Order items with quantities
- Total amount
- Current status

## User Management

### Users List

**Route:** `/admin/users`

**File:** `app/routes/admin/admin.users.tsx`

Features:
- List all users
- Search users by email
- View user details
- Edit user information
- Delete user
- View user orders

### Add/Edit User

**Route:** `/admin/addedituser` (add)
**Route:** `/admin/addedituser/:userId` (edit)

**File:** `app/routes/admin/addedituser.$userId.tsx`

**User Form Fields:**
- Email (required, must be unique)
- Password (required for new users, optional for edits)
- Role (admin or customer)

**Validation:**
- Email: Required, valid email format, unique
- Password: Minimum 6 characters (if provided)
- Role: Must be valid role

### Delete User

**Route:** `/admin/deleteuser/:userId`

**File:** `app/routes/admin/deleteuser.$userId.tsx`

Confirms user deletion before removing from database.

**Note:** Deleting a user may affect associated orders. Consider soft deletion or archiving instead.

## Admin Layout

**File:** `app/layouts/AdminLayout.tsx`

The admin layout provides:
- Admin navigation sidebar
- Header with user info and logout
- Consistent styling across admin pages

### Admin Navigation

Navigation links include:
- Dashboard
- Products
- Orders
- Users

## Admin Utilities

**File:** `app/lib/admin.server.ts`

### Dashboard Statistics

**`getDashboardStats()`**

Retrieves aggregated statistics for the admin dashboard:

```typescript
type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  totalUsers: number;
  recentOrders: Order[];
};
```

### Admin Loader

**`adminLoader(request: Request)`**

Ensures the current user has admin role:

```typescript
export async function adminLoader(request: Request) {
  return await requireRole(request, "admin");
}
```

## Best Practices

1. **Always verify admin role:** Use `adminLoader` in all admin route loaders
2. **Validate input:** Use Zod schemas for form validation
3. **Handle errors gracefully:** Show clear error messages
4. **Confirm destructive actions:** Require confirmation for delete operations
5. **Audit trail:** Consider logging admin actions for security
6. **Pagination:** Implement pagination for large lists
7. **Search and filters:** Provide search and filter capabilities

## Example: Admin Route

```typescript
import type { Route } from "./+types/admin.products";
import { adminLoader } from "~/lib/admin.server";
import { getAllProducts } from "~/lib/products";

export async function loader({ request }: Route.LoaderArgs) {
  // Require admin role
  await adminLoader(request);
  
  // Load products
  const products = await getAllProducts();
  
  return { products };
}

export default function AdminProducts({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;
  
  return (
    <AdminLayout>
      <div>
        <h1>Product Management</h1>
        {/* Product list */}
      </div>
    </AdminLayout>
  );
}
```

## Example: Admin Action

```typescript
import { adminLoader } from "~/lib/admin.server";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock must be non-negative"),
});

export async function action({ request }: Route.ActionArgs) {
  // Require admin role
  await adminLoader(request);
  
  const formData = await request.formData();
  const result = productSchema.safeParse({
    title: formData.get("title"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
  });
  
  if (!result.success) {
    return { errors: result.error.flatten() };
  }
  
  // Create or update product
  const product = await saveProduct(result.data);
  
  return redirect(`/admin/products`);
}
```

## Security Considerations

### Role Verification

Always verify admin role on both client and server:
- Server-side: Use `adminLoader` in loaders/actions
- Client-side: Conditionally render admin UI based on user role

### Input Validation

Validate all admin inputs:
- Use Zod schemas for type-safe validation
- Sanitize user inputs
- Validate file uploads (if applicable)

### Authorization

Ensure admins can only:
- Access admin routes
- Perform admin actions
- View/modify data they're authorized for

### Audit Logging

Consider implementing:
- Log admin actions (create, update, delete)
- Track which admin performed which action
- Log access to sensitive data

## Troubleshooting

### Access Denied

- Verify user has `admin` role in database
- Check that `adminLoader` is called in route loader
- Ensure session contains correct role

### Form Validation Errors

- Check Zod schema matches form fields
- Verify all required fields are present
- Review error messages for clarity

### Data Not Loading

- Check database queries in admin utilities
- Verify admin loader is not blocking access
- Review error logs for database issues

