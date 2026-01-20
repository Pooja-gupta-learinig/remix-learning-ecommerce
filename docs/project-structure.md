# Project Structure

This document outlines the organization and structure of the Remix Learning E-commerce project.

## Directory Overview

```
remix-learning-ecommerce/
├── app/                          # Main application code
│   ├── components/              # React components
│   │   ├── common/             # Shared/common components
│   │   ├── products/           # Product-related components
│   │   └── wizard/             # Multi-step wizard components
│   ├── layouts/                # Layout components
│   ├── lib/                    # Utility functions and data fetching
│   ├── routes/                 # Route handlers (file-based routing)
│   ├── types/                  # TypeScript type definitions
│   ├── root.tsx                # Root component
│   ├── routes.ts               # Route configuration
│   └── tailwind.css            # Tailwind CSS styles
├── docs/                       # Project documentation
├── generated/                  # Generated files (Prisma client)
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
└── react-router.config.ts     # React Router configuration
```

## Key Directories

### `/app`

The main application directory containing all source code.

#### `/app/components`

React components organized by feature:

- **`common/`** - Reusable components used across the app:
  - `Header.tsx` - Site header/navigation
  - `Footer.tsx` - Site footer
  - `Sidebar.tsx` - Sidebar navigation

- **`products/`** - Product-related components:
  - `ProductDetails.tsx` - Main product detail page component
  - `ProductInfo.tsx` - Product information display
  - `ProductItem.tsx` - Product card/item component
  - `ProductMeta.tsx` - Product metadata display
  - `ProductReviews.tsx` - Product reviews section
  - `products-grid-wrapper.tsx` - Grid layout wrapper

- **`wizard/`** - Multi-step wizard components:
  - `StepOne.tsx`, `StepTwo.tsx`, `StepThree.tsx`

#### `/app/layouts`

Layout components that wrap pages:

- `AppLayouts.tsx` - Main application layout with header and footer

#### `/app/lib`

Utility functions and data fetching logic:

- `products.ts` - Product data fetching from API
- `product-detail.ts` - Single product fetching
- `categories.ts` - Category data fetching
- `category-products.ts` - Products by category fetching

#### `/app/routes`

File-based routing using React Router conventions:

- **`(public)/`** - Public routes (grouped):
  - `home.tsx` - Home page
  - `products.tsx` - Products listing
  - `categories.tsx` - Categories page
  - `about.tsx` - About page
  - `contact.tsx` - Contact page

- **`(private)/`** - Protected routes (grouped):
  - `dashboard.tsx` - User dashboard
  - `settings.tsx` - User settings

- **`auth/`** - Authentication routes:
  - `login.tsx` - Login page
  - `sign-up.tsx` - Sign up page
  - `AuthLayout.tsx` - Auth layout wrapper

- **Dynamic routes:**
  - `products.$productId.tsx` - Individual product page
  - `products.category.$categorySlug.tsx` - Category products page

- **Other routes:**
  - `privacy-policy.tsx` - Privacy policy
  - `terms.tsx` - Terms of service

#### `/app/types`

TypeScript type definitions:

- `product.types.ts` - Product and review types
- `product-detail.types.ts` - Product detail page types
- `category.types.ts` - Category types

### `/prisma`

Database schema and migrations:

- `schema.prisma` - Prisma schema definition
- `migrations/` - Database migration files
- `dev.db` - SQLite database file (development)

### `/generated`

Auto-generated files:

- `prisma/` - Generated Prisma client code

### `/public`

Static assets served directly:

- `favicon.ico` - Site favicon

## File Naming Conventions

- **Components**: PascalCase (e.g., `ProductDetails.tsx`)
- **Utilities**: lowercase-with-dashes (e.g., `product-detail.ts`)
- **Routes**: lowercase-with-dashes (e.g., `products.$productId.tsx`)
- **Types**: lowercase-with-dashes (e.g., `product.types.ts`)

## Route Groups

React Router uses parentheses `()` to create route groups that don't affect the URL:

- `(public)/` - Groups public routes together
- `(private)/` - Groups protected routes together
- `(componentRouteExample)/` - Example route group

## Dynamic Routes

Routes with dynamic segments use `$` prefix:

- `products.$productId.tsx` - `/products/:productId`
- `products.category.$categorySlug.tsx` - `/products/category/:categorySlug`

## Configuration Files

- **`package.json`** - Dependencies and npm scripts
- **`tsconfig.json`** - TypeScript compiler options
- **`vite.config.ts`** - Vite build tool configuration
- **`react-router.config.ts`** - React Router configuration
- **`prisma/schema.prisma`** - Database schema definition

