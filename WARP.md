# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an Express.js REST API for an acquisitions management system using:

- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Validation**: Zod schemas
- **Logging**: Winston (file-based logging with console output in development)

## Common Commands

### Development

```bash
npm run dev              # Start dev server with --watch flag
```

### Code Quality

```bash
npm run lint             # Check code with ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes
```

### Database (Drizzle)

```bash
npm run db:generate      # Generate migration files from schema
npm run db:migrate       # Apply migrations to database
npm run db:studio        # Open Drizzle Studio UI
```

## Architecture

### Import Path Aliases

The project uses Node.js subpath imports (defined in package.json):

- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#models/*` → `./src/models/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`
- `#services/*` → `./src/services/*`
- `#routes/*` → `./src/routes/*`
- `#middleware/*` → `./src/middleware/*`

Always use these aliases when importing across directories.

### Request Flow

1. **Routes** (`src/routes/`) - Define endpoints and attach controllers
2. **Controllers** (`src/controllers/`) - Handle HTTP requests, validate input with Zod schemas, call services, format responses
3. **Services** (`src/services/`) - Business logic, database operations via Drizzle ORM
4. **Models** (`src/models/`) - Drizzle schema definitions (using pg-core)
5. **Validations** (`src/validations/`) - Zod schemas for request validation
6. **Utils** (`src/utils/`) - Reusable utilities (JWT, cookies, formatters)

### Database Schema Management

- Models are defined using Drizzle's `pgTable` in `src/models/*.js`
- The drizzle.config.js points to `./src/models/*.js` as the schema source
- After modifying models, run `npm run db:generate` to create migrations
- Apply migrations with `npm run db:migrate`

### Authentication Pattern

The auth flow uses:

1. JWT tokens signed with payload `{id, email, role}`
2. Tokens stored in HTTP-only cookies via `cookies.set(res, 'token', token)`
3. Cookie settings: httpOnly, secure in production, sameSite strict, 15min maxAge
4. JWT utilities in `src/utils/jwt.js` (sign/verify methods)

### Validation Pattern

All request validation uses Zod schemas from `src/validations/`:

```javascript
const validationResult = schema.safeParse(req.body);
if (!validationResult.success) {
  return res.status(400).json({
    error: 'Validation failed',
    details: formatValidationError(validationResult.error),
  });
}
```

### Logging

- Winston logger configured in `src/config/logger.js`
- Logs to `logs/error.log` (errors only) and `logs/combined.log` (all levels)
- Console output in non-production environments
- Log level controlled by `LOG_LEVEL` env var (default: 'info')
- HTTP requests logged via Morgan middleware

## Environment Variables

Required variables (see .env.example):

```bash
PORT=3000                    # Server port
NODE_ENV=development         # Environment (affects logging, cookie security)
LOG_LEVEL=info              # Winston log level
DATABASE_URL=               # Neon PostgreSQL connection string
JWT=                        # JWT signing secret (defaults to 'secret-key' if not set)
```

## Code Style

### ESLint Rules

- 2-space indentation
- Single quotes
- Semicolons required
- No var (use const/let)
- Prefer arrow functions
- Object shorthand required
- Unused vars allowed if prefixed with `_`

### Prettier Config

- Semi: true
- Single quotes: true
- Print width: 80
- Tab width: 2
- Arrow parens: avoid
- Line ending: LF
