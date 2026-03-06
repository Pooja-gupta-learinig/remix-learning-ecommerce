# Project Structure

This document outlines the organization and structure of the Remix Learning E-commerce project.

## Directory Overview

```
remix-learning-ecommerce/
├── app/                          # Main application code
│   ├── auth/                    # Authentication utilities
│   │   ├── roles.ts            # Role definitions
│   │   └── users.server.ts     # User authentication logic
│   ├── components/              # React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── common/             # Shared/common components
│   │   ├── posts/              # Blog post components
│   │   ├── products/           # Product-related components
│   │   └── wizard/             # Multi-step wizard components
│   ├── layouts/                 # Layout components
│   │   ├── AdminLayout.tsx     # Admin layout wrapper
│   │   └── AppLayouts.tsx      # Main application layout
│   ├── lib/                     # Utility functions and data fetching
│   │   ├── admin.server.ts     # Admin server utilities
│   │   ├── cart-session.server.ts # Cart session management
│   │   ├── categories.ts       # Category data fetching
│   │   ├── orders.server.ts    # Order management
│   │   ├── products.ts         # Product data fetching
│   │   └── ...                  # Other utility functions
│   ├── routes/                  # Route handlers (file-based routing)
│   │   ├── (public)/           # Public routes group
│   │   ├── (private)/          # Protected routes group
│   │   ├── (componentRouteExample)/ # Example route group
│   │   ├── admin/              # Admin routes
│   │   ├── auth/               # Authentication routes
│   │   ├── blog/               # Blog routes
│   │   ├── cart.tsx            # Shopping cart
│   │   ├── checkout.*.tsx      # Checkout flow routes
│   │   └── ...                 # Other routes
│   ├── services/               # Service layer (if used)
│   ├── types/                  # TypeScript type definitions
│   ├── root.tsx                # Root component
│   ├── routes.ts               # Route configuration
│   ├── sessions.server.ts      # Session management
│   ├── config.server.ts        # Server configuration
│   └── tailwind.css            # Tailwind CSS styles
├── data/                        # Static data files (JSON)
├── docs/                        # Project documentation
├── generated/                   # Generated files (Prisma client)
├── prisma/                      # Database schema and migrations
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── react-router.config.ts       # React Router configuration
└── Dockerfile                   # Docker configuration
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

- **Product-related:**
  - `products.ts` - Product data fetching from API
  - `product-detail.ts` - Single product fetching
  - `product-search.ts` - Product search functionality
  - `product.schema.ts` - Product validation schemas
  - `categories.ts` - Category data fetching
  - `category-products.ts` - Products by category fetching

- **Cart & Orders:**
  - `cart-session.server.ts` - Cart session management
  - `orders.server.ts` - Order management (server-side)
  - `orders.ts` - Order utilities

- **User & Auth:**
  - `users.ts` - User utilities
  - `user.schema.ts` - User validation schemas
  - `client-info.ts` - Client information utilities
  - `cross-tab-logout.ts` - Cross-tab logout functionality

- **Admin:**
  - `admin.server.ts` - Admin server utilities

- **Other:**
  - `posts.ts` - Blog post utilities

#### `/app/routes`

File-based routing using React Router conventions:

- **`(public)/`** - Public routes (grouped):
  - `home.tsx` - Home page
  - `products.tsx` - Products listing
  - `categories.tsx` - Categories page
  - `about.tsx` - About page
  - `contact.tsx` - Contact page
  - `examples.tsx` - Example pages
  - `await-defer-examples.tsx` - Data loading examples

- **`(private)/`** - Protected routes (grouped):
  - `dashboard.tsx` - User dashboard
  - `settings.tsx` - User settings
  - `orders/` - Order management
    - `route.tsx` - Orders listing
    - `$orderId/route.tsx` - Order details

- **`admin/`** - Admin routes (require admin role):
  - `admin.dashboard.tsx` - Admin dashboard
  - `admin.products.tsx` - Product management
  - `admin.orders.tsx` - Order management
  - `admin.users.tsx` - User management
  - `addeditproduct.tsx` - Add/edit product
  - `addedituser.$userId.tsx` - Add/edit user
  - `deleteproduct.$productId.tsx` - Delete product
  - `deleteuser.$userId.tsx` - Delete user

- **`auth/`** - Authentication routes:
  - `login.tsx` - Login page
  - `sign-up.tsx` - Sign up page
  - `logout.tsx` - Logout handler
  - `AuthLayout.tsx` - Auth layout wrapper
  - `catchall.tsx` - Auth catchall route

- **`blog/`** - Blog routes:
  - `route.tsx` - Blog listing
  - `$slug/route.tsx` - Individual blog post
  - `new/route.tsx` - Create new post

- **Cart & Checkout:**
  - `cart.tsx` - Shopping cart page
  - `cart.actions.tsx` - Cart action handlers
  - `checkout.tsx` - Checkout layout
  - `checkout.address.tsx` - Address step
  - `checkout.payment.tsx` - Payment step
  - `checkout.review.tsx` - Review & place order

- **Dynamic product routes:**
  - `products.$productSlug.$productId.category.$categorySlug.tsx` - Product with category
  - `products.category.$categorySlug.tsx` - Category products page
  - `product.search.tsx` - Product search

- **Other routes:**
  - `privacy-policy.tsx` - Privacy policy
  - `terms.tsx` - Terms of service
  - `concerts.*.tsx` - Concert examples
  - `posts.($lang).tsx` - Internationalized posts

#### `/app/types`

TypeScript type definitions:

- `product.types.ts` - Product and review types
- `product-detail.types.ts` - Product detail page types
- `product-component-props.types.ts` - Product component prop types
- `category.types.ts` - Category types
- `post.types.ts` - Blog post types

### `/prisma`

Database schema and migrations:

- `schema.prisma` - Prisma schema definition
- `migrations/` - Database migration files
- `dev.db` - SQLite database file (development)

### `/data`

Static data files:

- `orders.json` - Sample order data
- `users.json` - Sample user data

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

