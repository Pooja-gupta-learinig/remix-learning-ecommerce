# Routing Guide

This guide explains how routing works in this React Router application.

## File-Based Routing

React Router uses file-based routing, where the file structure in `/app/routes` determines the URL structure.

## Route Organization

### Route Groups

Parentheses `()` create route groups that organize routes without affecting URLs:

```
app/routes/
├── (public)/
│   ├── home.tsx          → /home
│   ├── products.tsx      → /products
│   └── about.tsx         → /about
├── (private)/
│   ├── dashboard.tsx     → /dashboard
│   └── settings.tsx      → /settings
└── auth/
    ├── login.tsx         → /auth/login
    └── sign-up.tsx       → /auth/sign-up
```

### Dynamic Routes

Use `$` prefix for dynamic route segments:

- `products.$productId.tsx` → `/products/:productId`
- `products.category.$categorySlug.tsx` → `/products/category/:categorySlug`

### Example Route File

```typescript
import type { Route } from "./+types/products.$productId";

// Meta tags for SEO
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Product Page" },
    { name: "description", content: "Product details" },
  ];
}

// Data loader (runs on server)
export async function loader({
  params,
}: Route.LoaderArgs): Promise<ProductDetailLoaderData> {
  const { productId } = params;
  const product = await fetchProductById(productId);
  return { product };
}

// Page component
export default function Product({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  return <ProductDetails product={product} />;
}
```

## Route Types

### Public Routes

Located in `(public)/` directory:

- `/home` - Home page
- `/products` - Products listing
- `/categories` - Categories page
- `/about` - About page
- `/contact` - Contact page

### Private Routes

Located in `(private)/` directory (require authentication):

- `/dashboard` - User dashboard
- `/settings` - User settings

### Authentication Routes

Located in `auth/` directory:

- `/auth/login` - Login page
- `/auth/sign-up` - Sign up page

### Dynamic Product Routes

- `/products/:productId` - Individual product page
- `/products/category/:categorySlug` - Products by category

### Other Routes

- `/privacy-policy` - Privacy policy page
- `/terms` - Terms of service page

## Route Functions

### `loader`

Server-side data fetching function that runs before the component renders:

```typescript
export async function loader({ params, request }: Route.LoaderArgs) {
  const productId = params.productId;
  const product = await fetchProductById(productId);
  return { product };
}
```

**Access loader data in component:**
```typescript
export default function Product({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  // Use product data
}
```

### `meta`

Function to set page meta tags for SEO:

```typescript
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Page Title" },
    { name: "description", content: "Page description" },
  ];
}
```

### `default export`

The page component that renders the route:

```typescript
export default function Products({ loaderData }: Route.ComponentProps) {
  return <div>Products Page</div>;
}
```

## Route Parameters

Access dynamic route parameters via `params`:

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  const { productId } = params; // From products.$productId.tsx
  // Use productId
}
```

## Query Parameters

Access query parameters via `request`:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  // Use search query
}
```

## Navigation

### Using Links

```typescript
import { Link } from "react-router";

<Link to="/products/123">View Product</Link>
```

### Programmatic Navigation

```typescript
import { useNavigate } from "react-router";

const navigate = useNavigate();
navigate("/products/123");
```

## Layout Routes

Use layout components to wrap multiple routes:

```typescript
import { AppLayout } from "../layouts/AppLayouts";

export default function Products({ loaderData }: Route.ComponentProps) {
  return (
    <AppLayout>
      {/* Page content */}
    </AppLayout>
  );
}
```

## Error Handling

React Router automatically handles errors. You can create error boundaries:

```typescript
export function ErrorBoundary() {
  return <div>Something went wrong</div>;
}
```

## Route Protection

For protected routes, add authentication checks in the loader:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Response(null, { status: 401 });
  }
  return { user };
}
```

