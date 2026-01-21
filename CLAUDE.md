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

## Generación de CRUD backend a partir de DDL (Sequelize + TS + Express)

### Contexto y objetivo

Cuando te proporcione un **DDL SQL (CREATE TABLE ...)** de una nueva tabla, debes **generar los archivos necesarios** para integrarla en el backend con la **misma estructura y estilo** que el código existente (models / repositories / services / controllers / routes) y con las **mismas convenciones** vistas en `Muestra`, `Tecnica`, `Worklist`.

El resultado debe ser un CRUD funcional (mínimo: list, getById, create, update, delete) y, si aplica, endpoints adicionales coherentes con el dominio.

---

## Estructura esperada de archivos

Para cada tabla nueva (entidad), genera:

1. `src/models/<Entidad>.ts`
2. `src/repositories/<entidad>.repository.ts`
3. `src/services/<entidad>.service.ts`
4. `src/controllers/<entidad>.controller.ts`
5. `src/routes/<entidad>.routes.ts`

Además, si hacen falta asociaciones con modelos existentes, actualiza:

- `static associate()` del modelo nuevo y/o modelos relacionados.
- Cualquier `index`/registro de rutas donde se monten los routers (si existe en el proyecto).

---

## Reglas de implementación (obligatorias)

### 1) Model (Sequelize Model + initModel + associate + scopes)

- Usar patrón:
  - `export class <Entidad> extends Model<InferAttributes<...>, InferCreationAttributes<...>> { ... }`
  - `static initModel(sequelize: Sequelize) { this.init({ ... }, { ... }) ; this.addScope('withRefs', { ... }); }`
  - `static associate(models: Record<string, ModelStatic<Model>>) { ... }`
- Tipado:
  - Campos `PK` autoincrement: `CreationOptional<number>`
  - Campos opcionales en DDL: `?` y `allowNull: true`
  - Defaults del DDL deben reflejarse en `defaultValue` si tiene sentido.
- Timestamps / soft delete:
  - Si la tabla tiene `update_dt`, `delete_dt` (o equivalente), usar:
    - `timestamps: true`
    - `createdAt: false` si no existe `create_dt`
    - `updatedAt: 'update_dt'`
    - `paranoid: true`
    - `deletedAt: 'delete_dt'`
  - Si tiene `create_dt`, mapear `createdAt: 'create_dt'`.
- Schema:
  - `schema: process.env.DB_SCHEMA`
- Validaciones:
  - Para `NOT NULL` usar `allowNull: false` + `validate.notNull`
  - Para ints: `validate.isInt` cuando proceda
  - Longitudes: `DataTypes.STRING(n)` según DDL
- FK:
  - En el atributo usar `references: { model: '<tabla_ref>', key: '<pk_ref>' }` si es claro por DDL.
- Scope `withRefs`:
  - Debe incluir `attributes` explícitos (evitar `*`)
  - Debe incluir `include` con los `belongsTo/hasMany` relevantes, con:
    - `as` consistente con asociaciones
    - `attributes` limitados
    - `required: false` por defecto, salvo que el DDL/negocio indique lo contrario
- Hooks:
  - Solo si el patrón del proyecto lo pide (p.ej. estado inicial). Si el DDL incluye `id_estado` o estados, proponer `beforeCreate` similar a `Muestra/Tecnica` y justificarlo.

### 2) Repository

- El repository debe contener métodos mínimos:
  - `findById(id: number)`
  - `findAll()`
  - `create(data)`
  - `update(entityInstance, data)`
  - `delete(entityInstance)` (soft delete vía `destroy()` con paranoid)
- Por defecto, usar `Model.scope('withRefs')` en `findById` y `findAll`.
- Si hay relaciones 1:N con includes grandes, prevenir cartesian explosion:
  - Preferir `include` con `separate: true` cuando corresponda (como en `findTecnicasById`).
- Si la creación implica varias tablas (transacción):
  - Usar `const transaction = await sequelize.transaction()` y `commit/rollback`.
  - No mezclar lógica de negocio compleja: el repo gestiona persistencia, el service orquesta reglas.
- Evitar `raw: true` salvo para stats/aggregations.
- Si hay “stats” o agregaciones, implementarlas en repo como métodos específicos (p.ej. `get<Entidad>Stats()`).

### 3) Service

- El service debe:
  - Validar entradas mínimas (ids, campos obligatorios)
  - Delegar persistencia al repository
  - Mapear respuestas si hace falta (mensajes, contadores)
- Métodos mínimos:
  - `getAll<EntidadPlural>()`
  - `get<Entidad>ById(id)`
  - `create<Entidad>(dto)`
  - `update<Entidad>(id, dto)`
  - `delete<Entidad>(id)`
- Errores:
  - Lanzar `Error('...')` con mensajes claros (el middleware de errores ya traducirá a HTTP).
- Mantener coherencia con el estilo existente: no inventar frameworks nuevos.

### 4) Controller (Express)

- Controladores asíncronos con `try/catch` y `next(error)`.
- Validación básica:
  - Verificar `req.body` cuando procede
  - Parsear `req.params.id` con `Number()`
  - Responder `400` si id inválido
- Respuestas:
  - `200` para GET/PUT/DELETE, `201` para POST
  - JSON directo de Sequelize o del service.
- Mantener nombres de handlers consistentes: `getX`, `getXById`, `createX`, `updateX`, `deleteX`.

### 5) Routes

- `Router()` y montar endpoints REST:
  - `GET /` → list
  - `GET /:id` → getById
  - `POST /` → create
  - `PUT /:id` → update
  - `DELETE /:id` → delete
- Orden de rutas:
  - **IMPORTANTE**: las rutas específicas (ej. `/estadisticas`, `/con-muestra`, `/codigo-epi`, etc.) deben ir **ANTES** de `/:id` para evitar colisiones.
- Si se necesita una ruta alternativa tipo `POST /deleteX` por compatibilidad con frontend:
  - Implementarla pero **sin mutar `req.params`** de forma “hacky” si se puede evitar.
  - Preferir un controller específico `deleteXPost` que lea `req.body.id`.
  - Si se mantiene el patrón existente, al menos documentarlo.

---

## Convenciones de nombres

- Tabla SQL: `snake_case`
- Modelo TS: `PascalCase` (singular)
- Archivo modelo: `PascalCase.ts`
- Resto de capas: `<entidad>.repository.ts`, `<entidad>.service.ts`, `<entidad>.controller.ts`, `<entidad>.routes.ts`
- PK: respetar el nombre real del DDL (`id_xxx`) en el modelo.
- Alias de asociaciones:
  - `belongsTo`: singular (`as: 'cliente'`, `as: 'muestra'`)
  - `hasMany`: plural (`as: 'tecnicas'`, `as: 'resultados'`)

---

## Input esperado (lo que yo te daré)

Te proporcionaré:

1. El DDL completo de la nueva tabla (y si hay FK, idealmente también DDL de tablas referenciadas o al menos sus nombres/PK).
2. (Opcional) Reglas de negocio específicas (estados iniciales, validaciones, relaciones).

Si falta info crítica (p.ej. PK, FK ambiguas), asume la opción más conservadora y deja un comentario `// TODO` señalando la decisión.

---

## Output esperado (lo que debes devolver)

Debes devolver:

1. El contenido completo de cada archivo nuevo (en bloques separados).
2. Los cambios necesarios en modelos existentes (si hay nuevas asociaciones).
3. Una checklist final de verificación:
   - Compila TS
   - Rutas no colisionan (rutas específicas antes de `/:id`)
   - `withRefs` funciona
   - `paranoid`/timestamps coherentes con columnas
   - Relaciones y `as` alineados entre `initModel` scope e `associate`

---

## Criterios de calidad (no negociables)

- Mantener el mismo estilo del proyecto: Sequelize clásico, capas repository/service/controller/routes.
- Tipado TS correcto (sin `any` salvo caso justificado).
- Includes acotados (no traer columnas de más).
- Evitar colisiones de rutas.
- No inventar endpoints ni capas extra si no lo pide el DDL o el dominio.
