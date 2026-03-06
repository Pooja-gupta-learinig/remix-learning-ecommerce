# Deployment Guide

This guide explains how to deploy the Remix Learning E-commerce application to production.

## Prerequisites

Before deploying, ensure you have:

- Production-ready database (PostgreSQL recommended for production)
- Environment variables configured
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Build Process

### Production Build

Create an optimized production build:

```bash
npm run build
```

This command:
- Compiles TypeScript
- Bundles and minifies code
- Optimizes assets
- Generates server and client builds

### Build Output

The build process creates:

```
build/
├── client/          # Static assets for client
│   ├── assets/     # JavaScript, CSS, images
│   └── ...         # Other static files
└── server/         # Server-side code
    └── index.js    # Server entry point
```

## Environment Variables

### Required Variables

Create a `.env` file or set environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Session
SESSION_SECRET="your-secure-random-string-here"

# Environment
NODE_ENV="production"
```

### Generating Session Secret

Generate a secure random string for `SESSION_SECRET`:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Database Setup

### Production Database

For production, use PostgreSQL instead of SQLite:

1. **Update Prisma Schema:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Run Migrations:**

```bash
npx prisma migrate deploy
```

3. **Generate Prisma Client:**

```bash
npx prisma generate
```

### Database Migrations

Before deploying:

```bash
# Review pending migrations
npx prisma migrate status

# Apply migrations
npx prisma migrate deploy
```

## Docker Deployment

### Dockerfile

The project includes a `Dockerfile` for containerized deployment:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Building Docker Image

```bash
docker build -t remix-ecommerce .
```

### Running Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e SESSION_SECRET="..." \
  -e NODE_ENV="production" \
  remix-ecommerce
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/dbname
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

## Platform-Specific Deployment

### Vercel

1. **Install Vercel CLI:**

```bash
npm i -g vercel
```

2. **Deploy:**

```bash
vercel
```

3. **Set Environment Variables:**

In Vercel dashboard:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`

### Railway

1. **Connect Repository:**

Link your GitHub repository to Railway.

2. **Set Environment Variables:**

In Railway dashboard:
- `DATABASE_URL` (Railway can provision PostgreSQL)
- `SESSION_SECRET`
- `NODE_ENV`

3. **Deploy:**

Railway automatically deploys on push to main branch.

### Fly.io

1. **Install Fly CLI:**

```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login:**

```bash
fly auth login
```

3. **Create App:**

```bash
fly launch
```

4. **Set Secrets:**

```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set SESSION_SECRET="..."
```

### AWS (EC2/ECS)

1. **Build Docker Image:**

```bash
docker build -t remix-ecommerce .
```

2. **Push to ECR:**

```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker tag remix-ecommerce:latest <account-id>.dkr.ecr.<region>.amazonaws.com/remix-ecommerce:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/remix-ecommerce:latest
```

3. **Deploy to ECS:**

Create ECS task definition and service using the pushed image.

### DigitalOcean App Platform

1. **Connect Repository:**

Link your GitHub repository.

2. **Configure Build:**

- Build command: `npm run build`
- Run command: `npm start`

3. **Set Environment Variables:**

In App Platform dashboard:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`

4. **Provision Database:**

Use DigitalOcean's managed PostgreSQL database.

## Production Checklist

Before going live:

- [ ] Set `NODE_ENV=production`
- [ ] Use production database (PostgreSQL)
- [ ] Set secure `SESSION_SECRET`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS if needed
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure logging
- [ ] Set up backups for database
- [ ] Test all critical flows (login, checkout, etc.)
- [ ] Remove default admin user creation
- [ ] Review security settings
- [ ] Set up CDN for static assets (optional)
- [ ] Configure rate limiting (optional)

## Performance Optimization

### Caching

Consider implementing:
- Static asset caching
- API response caching
- Database query caching

### CDN

Use a CDN for static assets:
- CloudFront (AWS)
- Cloudflare
- Fastly

### Database Optimization

- Add indexes for frequently queried fields
- Use connection pooling
- Monitor query performance

## Monitoring

### Error Tracking

Set up error monitoring:
- **Sentry:** Error tracking and performance monitoring
- **LogRocket:** Session replay and error tracking
- **Rollbar:** Error tracking

### Logging

Configure logging:
- Application logs
- Error logs
- Access logs

### Health Checks

Implement health check endpoint:

```typescript
// app/routes/health.tsx
export async function loader() {
  return json({ status: "ok" });
}
```

## Security

### HTTPS

Always use HTTPS in production:
- SSL/TLS certificate
- Redirect HTTP to HTTPS
- Secure cookies

### Headers

Set security headers:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### Rate Limiting

Implement rate limiting:
- API endpoints
- Authentication routes
- Form submissions

## Troubleshooting

### Build Failures

- Check Node.js version (>= 20.0.0)
- Verify all dependencies are installed
- Review build logs for errors

### Runtime Errors

- Check environment variables are set
- Verify database connection
- Review application logs

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible
- Review firewall/security group settings

## Rollback Strategy

### Version Control

Tag releases:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Database Migrations

Test migrations in staging before production:

```bash
# Staging
npx prisma migrate deploy

# Production (after verification)
npx prisma migrate deploy
```

### Quick Rollback

Keep previous build artifacts for quick rollback if needed.

## Post-Deployment

After deployment:

1. **Verify Application:**
   - Test critical user flows
   - Check admin functionality
   - Verify API endpoints

2. **Monitor:**
   - Watch error logs
   - Monitor performance
   - Check database connections

3. **Update Documentation:**
   - Document deployment process
   - Update environment variables
   - Note any platform-specific configurations

