# Refactorización del Módulo Worklist

## Resumen de Cambios

Se ha refactorizado completamente el módulo Worklist para implementar un nuevo paradigma donde **Worklist es una entidad independiente** con su propia tabla en la base de datos, en lugar de ser simplemente consultas agregadas de técnicas.

## Nuevo Modelo de Datos

### Tabla `worklist`

```sql
CREATE TABLE lims_pre.worklist (
  id_worklist serial4 NOT NULL,
  nombre varchar(20) NULL,
  create_dt timestamptz NOT NULL,
  delete_dt timestamptz NULL,
  update_dt timestamptz NOT NULL,
  created_by int4 NULL,
  updated_by int4 NULL,
  CONSTRAINT worklist_pk PRIMARY KEY (id_worklist)
);
```

### Relación con Técnicas

- Una técnica puede tener un `id_worklist` (opcional)
- Un worklist puede tener múltiples técnicas
- Relación **1:N** (Worklist -> Técnicas)

## Cambios Implementados

### 1. Repository (`worklist.repository.ts`)

- **CRUD completo**: crear, obtener, actualizar, eliminar worklists
- **Operaciones específicas**:
  - `asignarTecnicas()`: Asigna técnicas a un worklist
  - `removerTecnicas()`: Remueve técnicas de un worklist
  - `obtenerEstadisticas()`: Estadísticas específicas de un worklist
  - `getTecnicasAgrupadasPorProceso()`: Técnicas agrupadas por proceso de un worklist
  - `getTecnicasSinAsignar()`: Técnicas no asignadas a ningún worklist

### 2. Service (`worklist.service.ts`)

- **Validaciones de negocio**
- **Manejo de errores** con clases específicas (BadRequestError, NotFoundError)
- **Métodos CRUD** con validaciones apropiadas
- **Operaciones de gestión** de técnicas en worklists

### 3. Controller (`worklist.controller.ts`)

- **Endpoints RESTful** estándar
- **Manejo de errores HTTP** apropiado
- **Delegación** de operaciones de técnicas para mantener separación de responsabilidades

### 4. Routes (`worklist.routes.ts`)

- **Rutas CRUD** estándar para worklists
- **Rutas específicas** para operaciones de worklist
- **Rutas de delegación** para operaciones de técnicas

## API Endpoints

### CRUD de Worklist

- `POST /api/worklist` - Crear worklist
- `GET /api/worklist` - Obtener todos los worklists
- `GET /api/worklist/tecnicas-sin-asignar` - Técnicas sin asignar (debe ir antes de /:id)
- `GET /api/worklist/:id` - Obtener worklist por ID
- `PUT /api/worklist/:id` - Actualizar worklist
- `DELETE /api/worklist/:id` - Eliminar worklist

### Operaciones Específicas de Worklist

- `POST /api/worklist/:id/asignar-tecnicas` - Asignar técnicas a worklist
- `DELETE /api/worklist/:id/remover-tecnicas` - Remover técnicas de worklist
- `GET /api/worklist/:id/estadisticas` - Estadísticas del worklist
- `GET /api/worklist/:id/tecnicas-agrupadas` - Técnicas agrupadas por proceso

### Delegación de Operaciones de Técnica

- `PATCH /api/worklist/tecnica/:idTecnica/asignar` - Asignar técnico
- `PATCH /api/worklist/tecnica/:idTecnica/iniciar` - Iniciar técnica
- `PATCH /api/worklist/tecnica/:idTecnica/completar` - Completar técnica

## Estructura de Respuesta

Todos los endpoints siguen el formato estándar:

```json
{
  "success": boolean,
  "data": any, // Datos de respuesta
  "message": string // Mensaje descriptivo
}
```

### Para errores:

```json
{
  "success": false,
  "message": string, // Descripción del error
  "error": any // Solo en modo development
}
```

## Consideraciones Técnicas

### TypeScript

- Tipado estricto en todas las capas
- Interfaces bien definidas para entrada y salida
- Uso de tipos de Sequelize apropiados

### Sequelize

- Asociaciones correctas entre Worklist y Tecnica
- Consultas optimizadas con includes apropiados
- Manejo correcto de soft deletes

### Validaciones

- Validación de IDs numéricos
- Validación de longitud de campos (nombre max 20 caracteres)
- Validación de arrays de IDs para asignación/remoción

### Manejo de Errores

- Uso de clases de error personalizadas
- Códigos HTTP apropiados (400, 404, 500)
- Logging de errores para debugging

## Migración desde el Sistema Anterior

El sistema anterior basado en consultas agregadas ha sido reemplazado por:

1. **Entidades reales** en la base de datos
2. **Gestión de relaciones** entre worklists y técnicas
3. **Operaciones CRUD** completas
4. **Estadísticas calculadas** por worklist específico

## Compatibilidad con Frontend

Las rutas de delegación (`/api/worklist/tecnica/:idTecnica/*`) mantienen la compatibilidad con el frontend existente, redirigiendo las operaciones al TecnicaService correspondiente.

## Testing Recomendado

1. **Crear worklist** y verificar respuesta
2. **Asignar técnicas** a worklist
3. **Obtener estadísticas** del worklist
4. **Remover técnicas** del worklist
5. **Eliminar worklist** y verificar soft delete
6. **Operaciones de técnicas** a través de rutas de delegación

## Próximos Pasos

1. **Actualizar documentación API** completa
2. **Implementar tests unitarios** para todas las capas
3. **Verificar integración** con frontend existente
4. **Optimizar consultas** según patrones de uso
