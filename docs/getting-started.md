# Getting Started

This guide will help you set up and run the Remix Learning E-commerce project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** or **pnpm** (package manager)
- **Git** (for version control)

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd remix-learning-ecommerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations (if any)
   npx prisma migrate dev
   ```

4. **Set up environment variables** (if needed):
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

## Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

The development server supports:
- ⚡️ Hot Module Replacement (HMR)
- 🔄 Automatic reloading on file changes
- 📦 Fast builds with Vite

## Building for Production

Create a production build:

```bash
npm run build
```

This will create optimized production files in the `build/` directory:
- `build/client/` - Static assets for the client
- `build/server/` - Server-side code

## Running Production Build

After building, start the production server:

```bash
npm start
```

## Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

This will:
- Generate React Router types
- Check for TypeScript errors

## Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |

## Next Steps

- Read the [Project Structure](./project-structure.md) guide to understand the codebase
- Check out the [Routing Guide](./routing.md) to learn about route organization
- Explore [Components](./components.md) to understand the UI structure
- Review [API & Data Fetching](./api-data-fetching.md) for data management

