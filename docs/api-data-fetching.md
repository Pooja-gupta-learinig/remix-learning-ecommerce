# API & Data Fetching Guide

This guide explains how data fetching works in the application.

## Data Fetching Overview

The application fetches product data from the [DummyJSON API](https://dummyjson.com/), a free REST API for testing and prototyping.

## Data Fetching Functions

All data fetching functions are located in `/app/lib/`:

### Products

**File:** `app/lib/products.ts`

Fetches all products from the API.

```typescript
export async function fetchProducts(): Promise<ProductsResponse>
```

**Returns:**
```typescript
{
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
```

**Usage in Route:**
```typescript
export async function loader() {
  const productsData = await fetchProducts();
  return { productsData };
}
```

### Product Detail

**File:** `app/lib/product-detail.ts`

Fetches a single product by ID.

```typescript
export async function fetchProductById(productId: string): Promise<Product>
```

**Parameters:**
- `productId` - The product ID to fetch

**Usage in Route:**
```typescript
export async function loader({ params }: Route.LoaderArgs) {
  const { productId } = params;
  const product = await fetchProductById(productId);
  return { product };
}
```

### Categories

**File:** `app/lib/categories.ts`

Fetches all product categories.

```typescript
export async function fetchCategories(): Promise<CategoriesResponse>
```

**Returns:** Array of category strings

**Usage in Route:**
```typescript
export async function loader() {
  const categories = await fetchCategories();
  return { categories };
}
```

### Category Products

**File:** `app/lib/category-products.ts`

Fetches products by category.

```typescript
export async function fetchProductsByCategory(
  category: string
): Promise<ProductsResponse>
```

**Parameters:**
- `category` - The category slug/name

## API Endpoints

The application uses the following DummyJSON endpoints:

| Endpoint | Description |
|----------|-------------|
| `https://dummyjson.com/products` | Get all products |
| `https://dummyjson.com/products/:id` | Get product by ID |
| `https://dummyjson.com/products/categories` | Get all categories |
| `https://dummyjson.com/products/category/:category` | Get products by category |

## Error Handling

All data fetching functions include error handling:

```typescript
if (!response.ok) {
  throw new Response(null, {
    status: 500,
    statusText: "Products not found",
  });
}
```

React Router will automatically catch these errors and display error boundaries.

## Data Types

### Product

```typescript
type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  availabilityStatus: string;
  reviews?: Review[];
  warrantyInformation?: string;
  returnPolicy?: string;
};
```

### Review

```typescript
type Review = {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
};
```

### ProductsResponse

```typescript
type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};
```

## Server-Side Data Fetching

Data is fetched on the server using React Router's `loader` functions:

1. **Route loader runs on server** before component renders
2. **Data is passed to component** via `loaderData` prop
3. **Component renders** with the fetched data

**Example:**
```typescript
// Server-side loader
export async function loader() {
  const products = await fetchProducts();
  return { products };
}

// Component receives data
export default function Products({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;
  return <div>{/* Render products */}</div>;
}
```

## Benefits of Server-Side Fetching

1. **SEO**: Search engines can index the content
2. **Performance**: Data loads before page renders
3. **Security**: API keys stay on server
4. **Caching**: Can cache responses on server
5. **No Loading States**: Data is available immediately

## Database (Prisma)

The application also uses Prisma for local database operations.

### Schema

**File:** `prisma/schema.prisma`

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}
```

### Database Setup

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Run Migrations:**
   ```bash
   npx prisma migrate dev
   ```

3. **Use Prisma Client:**
   ```typescript
   import { PrismaClient } from "~/generated/prisma";
   
   const prisma = new PrismaClient();
   const users = await prisma.user.findMany();
   ```

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Type Safety**: Use TypeScript types for all API responses
3. **Validation**: Validate API responses with Zod if needed
4. **Caching**: Consider caching frequently accessed data
5. **Loading States**: Handle loading and error states in UI

## Future Enhancements

Consider implementing:

- Client-side data fetching with React Query for real-time updates
- API response caching
- Request deduplication
- Optimistic updates
- Pagination for large datasets
- Search and filtering functionality

