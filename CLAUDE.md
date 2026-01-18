# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Backend API for a Laboratory Information Management System (LIMS) built with Express.js, TypeScript, and Sequelize ORM. Uses PostgreSQL in production and SQLite in-memory for tests.

## Common Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload (nodemon + ts-node)

# Build
npm run build                  # Compile TypeScript to dist/
npm start                      # Run compiled production build

# Linting & Formatting
npm run lint                   # Run ESLint
npm run lint:fix               # Auto-fix ESLint issues
npm run format                 # Format with Prettier

# Testing
npm test                       # Run all tests (uses SQLite in-memory)

# Production (PM2)
npm run pm2:start              # Start with PM2 cluster mode
npm run pm2:restart            # Restart PM2 process
npm run pm2:logs               # View PM2 logs
```

## Architecture

### Layered Architecture Pattern

The codebase follows a layered architecture with clear separation of concerns:

```
Routes → Controllers → Services → Repositories → Models
```

- **Routes** (`src/routes/*.routes.ts`): Define API endpoints, map HTTP methods to controller functions
- **Controllers** (`src/controllers/*.controller.ts`): Handle HTTP request/response, delegate to services
- **Services** (`src/services/*.service.ts`): Business logic, transactions, orchestration
- **Repositories** (`src/repositories/*.repository.ts`): Data access layer with Sequelize queries
- **Models** (`src/models/*.ts`): Sequelize model definitions with `initModel()` and `associate()` static methods

### Model Pattern

Models use a static initialization pattern:
```typescript
export class MyModel extends Model<...> {
  static initModel(sequelize: Sequelize) { /* define schema */ }
  static associate(models: Record<string, ModelStatic<Model>>) { /* define relations */ }
}
```

All models are initialized in `src/models/index.ts` via `initModels(sequelize)`.

### Key Files

- `src/server.ts` - Application entry point, initializes models and starts server
- `src/app.ts` - Express app configuration, middleware, route registration
- `src/config/db.config.ts` - Database connection (PostgreSQL prod, SQLite test)
- `src/models/index.ts` - Model initialization and associations

### Error Handling

Custom error classes in `src/errors/`:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `NotFoundError` (404)

Global error middleware in `src/middlewares/error.middleware.ts` handles all errors uniformly.

### Authentication

JWT-based authentication via `src/middlewares/auth.middleware.ts`. Token expected in `Authorization: Bearer <token>` header.

## Environment Variables

Required for PostgreSQL (not needed for tests):
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_SCHEMA`, `DB_USER`, `DB_PASS`
- `JWT_SECRET`
- `NODE_ENV` (development/production/test)

## Naming Conventions

- Models: PascalCase (e.g., `Solicitud`, `DimCliente`)
- "Dim" prefix for dimension/lookup tables (e.g., `DimTipoMuestra`, `DimPrueba`)
- Routes: kebab-case plurals in URLs (e.g., `/api/solicitudes`, `/api/clientes`)
- Files: camelCase with type suffix (e.g., `solicitud.service.ts`, `solicitud.repository.ts`)
