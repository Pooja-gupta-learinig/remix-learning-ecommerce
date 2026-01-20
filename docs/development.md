# Development Guide

This guide covers development practices, tools, and workflows for the project.

## Development Workflow

### Starting Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:5173`

3. **Make changes:**
   - Edit files in `/app`
   - Changes automatically reload (HMR)

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

This command:
- Generates React Router types
- Checks for TypeScript errors

**Tip:** Run this before committing code to catch type errors early.

## Code Style

### TypeScript

- Use TypeScript for all code
- Enable strict mode in `tsconfig.json`
- Define explicit types for function parameters and returns
- Use type inference where appropriate

### Component Patterns

**Function Components:**
```typescript
type Props = {
  product: Product;
};

export default function ProductItem({ product }: Props) {
  return <div>{product.title}</div>;
}
```

**Route Components:**
```typescript
export default function Products({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;
  return <div>{/* Render products */}</div>;
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use consistent spacing and colors
- Keep components focused and reusable

### File Naming

- **Components**: PascalCase (e.g., `ProductDetails.tsx`)
- **Utilities**: lowercase-with-dashes (e.g., `product-detail.ts`)
- **Routes**: lowercase-with-dashes (e.g., `products.$productId.tsx`)
- **Types**: lowercase-with-dashes (e.g., `product.types.ts`)

## Project Structure

### Adding New Routes

1. Create a new file in `/app/routes`
2. Export a default component
3. Optionally add a `loader` for data fetching
4. Optionally add a `meta` function for SEO

**Example:**
```typescript
// app/routes/new-page.tsx
import type { Route } from "./+types/new-page";

export function meta({}: Route.MetaArgs) {
  return [{ title: "New Page" }];
}

export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### Adding New Components

1. Create component file in appropriate directory
2. Define TypeScript props type
3. Export the component

**Example:**
```typescript
// app/components/common/NewComponent.tsx
type Props = {
  title: string;
};

export default function NewComponent({ title }: Props) {
  return <h1>{title}</h1>;
}
```

### Adding Data Fetching

1. Create utility function in `/app/lib`
2. Add error handling
3. Define return types
4. Use in route loaders

**Example:**
```typescript
// app/lib/new-data.ts
export async function fetchNewData(): Promise<NewData> {
  const response = await fetch("https://api.example.com/data");
  if (!response.ok) {
    throw new Response(null, { status: 500 });
  }
  return response.json();
}
```

## Database Development

### Prisma Workflow

1. **Modify Schema:**
   Edit `prisma/schema.prisma`

2. **Create Migration:**
   ```bash
   npx prisma migrate dev --name migration_name
   ```

3. **Generate Client:**
   ```bash
   npx prisma generate
   ```

4. **View Database:**
   ```bash
   npx prisma studio
   ```

### Database Schema Changes

When modifying the Prisma schema:

1. Update `schema.prisma`
2. Create a migration
3. Generate Prisma client
4. Update TypeScript types if needed

## Testing

### Manual Testing

1. Test all routes and navigation
2. Verify data loading and error states
3. Test responsive design on different screen sizes
4. Check browser console for errors

### Type Checking

Always run type checking before committing:

```bash
npm run typecheck
```

## Debugging

### Browser DevTools

- Use React DevTools for component inspection
- Use Network tab to monitor API calls
- Check Console for errors and warnings

### Server-Side Debugging

- Add `console.log` statements in loaders
- Check terminal output for server logs
- Use Node.js debugger if needed

## Performance Optimization

### Code Splitting

React Router automatically code-splits routes. No manual configuration needed.

### Image Optimization

- Use appropriate image formats (WebP, AVIF)
- Optimize image sizes
- Use lazy loading for images below the fold

### Bundle Size

- Monitor bundle size with build output
- Use dynamic imports for large dependencies
- Remove unused dependencies

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
DATABASE_URL="file:./prisma/dev.db"
```

**Note:** Never commit `.env` files to version control.

## Git Workflow

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add product search functionality
fix: Resolve image loading issue
docs: Update API documentation
refactor: Simplify product component
```

### Branching

- `main` - Production-ready code
- `develop` - Development branch (if used)
- Feature branches for new features

## Common Tasks

### Adding a New Product Feature

1. Create component in `/app/components/products`
2. Add route if needed in `/app/routes`
3. Add data fetching in `/app/lib` if needed
4. Update types in `/app/types`
5. Test the feature

### Modifying Existing Features

1. Locate the relevant files
2. Make changes incrementally
3. Test after each change
4. Run type checking
5. Verify in browser

## Troubleshooting

### Build Errors

- Check TypeScript errors: `npm run typecheck`
- Verify all imports are correct
- Check for missing dependencies

### Runtime Errors

- Check browser console
- Verify API endpoints are accessible
- Check data types match expectations

### Database Issues

- Verify Prisma client is generated
- Check database file exists
- Run migrations if schema changed

## Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

