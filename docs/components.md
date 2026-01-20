# Components Guide

This guide documents the React components used in the application.

## Component Organization

Components are organized by feature in `/app/components`:

- `common/` - Shared components
- `products/` - Product-related components
- `wizard/` - Multi-step wizard components

## Common Components

### Header

**Location:** `app/components/common/Header.tsx`

Site header with navigation.

### Footer

**Location:** `app/components/common/Footer.tsx`

Site footer component.

### Sidebar

**Location:** `app/components/common/Sidebar.tsx`

Sidebar navigation component.

## Product Components

### ProductDetails

**Location:** `app/components/products/ProductDetails.tsx`

Main component for displaying product details page.

**Props:**
```typescript
type Props = {
  product: Product;
};
```

**Features:**
- Image gallery with thumbnail navigation
- Main product image display
- Discount badge display
- Integrates ProductInfo, ProductMeta, and ProductReviews

**Usage:**
```typescript
<ProductDetails product={product} />
```

### ProductInfo

**Location:** `app/components/products/ProductInfo.tsx`

Displays product information including title, price, description, and purchase options.

**Props:**
```typescript
type Props = {
  product: Product;
};
```

**Features:**
- Product title and brand
- Price with discount calculation
- Rating display
- Stock availability
- Add to cart functionality
- Product description

### ProductItem

**Location:** `app/components/products/ProductItem.tsx`

Product card component for product listings.

**Props:**
```typescript
type Props = {
  product: Product;
};
```

**Features:**
- Product thumbnail image
- Product title
- Price display
- Rating display
- Link to product detail page

**Usage:**
```typescript
<ProductItem product={product} />
```

### ProductMeta

**Location:** `app/components/products/ProductMeta.tsx`

Displays product metadata such as brand, category, stock, and warranty information.

**Props:**
```typescript
type Props = {
  product: Product;
};
```

**Features:**
- Brand and category
- Stock information
- Warranty information
- Return policy

### ProductReviews

**Location:** `app/components/products/ProductReviews.tsx`

Displays product reviews and ratings.

**Props:**
```typescript
type Props = {
  reviews?: Review[];
};
```

**Features:**
- Review list display
- Rating stars
- Reviewer name and date
- Review comments

**Usage:**
```typescript
<ProductReviews reviews={product.reviews} />
```

### ProductsGridWrapper

**Location:** `app/components/products/products-grid-wrapper.tsx`

Wrapper component for product grid layouts.

**Props:**
```typescript
type Props = {
  title: string;
  children: React.ReactNode;
};
```

**Features:**
- Grid layout for products
- Section title
- Responsive design

**Usage:**
```typescript
<ProductsGridWrapper title="All Products">
  {products.map(product => (
    <ProductItem key={product.id} product={product} />
  ))}
</ProductsGridWrapper>
```

## Wizard Components

Multi-step wizard components for guided processes:

- `StepOne.tsx` - First step of wizard
- `StepTwo.tsx` - Second step of wizard
- `StepThree.tsx` - Third step of wizard

## Layout Components

### AppLayout

**Location:** `app/layouts/AppLayouts.tsx`

Main application layout that wraps pages with header and footer.

**Usage:**
```typescript
<AppLayout>
  <PageContent />
</AppLayout>
```

## Component Patterns

### Type Safety

All components use TypeScript with explicit prop types:

```typescript
type Props = {
  product: Product;
};

export default function ProductItem({ product }: Props) {
  // Component implementation
}
```

### Styling

Components use Tailwind CSS for styling:

```typescript
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Content */}
</div>
```

### State Management

Components use React hooks for local state:

```typescript
const [selectedImage, setSelectedImage] = useState(product.thumbnail);
```

## Best Practices

1. **Component Composition**: Break down complex components into smaller, reusable pieces
2. **Props Typing**: Always define explicit TypeScript types for props
3. **Responsive Design**: Use Tailwind responsive classes for mobile-first design
4. **Accessibility**: Include proper ARIA labels and semantic HTML
5. **Performance**: Use React.memo for expensive components if needed

## Component Index

All components in `common/` are exported via an index file:

```typescript
// app/components/common/index.ts
export { Header } from "./Header";
export { Footer } from "./Footer";
export { Sidebar } from "./Sidebar";
```

This allows clean imports:

```typescript
import { Header, Footer } from "~/components/common";
```

