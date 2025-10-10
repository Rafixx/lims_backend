# Corrección Final: Error de Columnas en EstadoInfo

## Problema Identificado

Después de corregir el error de `Muestra.estadoInfo` que intentaba seleccionarla como columna física, apareció un nuevo error:

```
SequelizeDatabaseError: column estadoInfo.codigo does not exist
```

## Causa Raíz

El scope `withRefs` en los modelos `Muestra.ts` y `Tecnica.ts` estaba intentando seleccionar columnas que no existen en la tabla `dim_estados`:

- ❌ **Columnas incorrectas que se intentaban seleccionar**: `'codigo'`, `'nombre'`
- ✅ **Columna correcta en la tabla**: `'estado'`

## Estructura Real de la Tabla `dim_estados`

```sql
CREATE TABLE dim_estados (
  id INTEGER PRIMARY KEY,
  estado VARCHAR NOT NULL,      -- ✅ Nombre del estado
  entidad VARCHAR NOT NULL,     -- MUESTRA, TECNICA, etc.
  descripcion VARCHAR,
  orden INTEGER,
  activo BOOLEAN,
  color VARCHAR(7),             -- Para UI (#FFFFFF)
  es_inicial BOOLEAN,
  es_final BOOLEAN
);
```

## Solución Aplicada

### Archivo: `src/models/Muestra.ts` (línea ~223)

**ANTES:**

```typescript
{
  model: DimEstado,
  as: 'estadoInfo',
  attributes: ['id', 'codigo', 'nombre', 'color', 'descripcion'],  // ❌ Columnas incorrectas
  where: { entidad: 'MUESTRA' },
  required: false,
}
```

**DESPUÉS:**

```typescript
{
  model: DimEstado,
  as: 'estadoInfo',
  attributes: ['id', 'estado', 'color', 'descripcion'],  // ✅ Columnas correctas
  where: { entidad: 'MUESTRA' },
  required: false,
}
```

### Archivo: `src/models/Tecnica.ts` (línea ~157)

**ANTES:**

```typescript
{
  model: DimEstado,
  as: 'estadoInfo',
  attributes: ['id', 'codigo', 'nombre', 'color', 'descripcion'],  // ❌ Columnas incorrectas
  where: { entidad: 'TECNICA' },
  required: false,
}
```

**DESPUÉS:**

```typescript
{
  model: DimEstado,
  as: 'estadoInfo',
  attributes: ['id', 'estado', 'color', 'descripcion'],  // ✅ Columnas correctas
  where: { entidad: 'TECNICA' },
  required: false,
}
```

## Resultado

El endpoint `/api/muestras/` ahora funciona correctamente y devuelve la información de estado:

```json
{
  "id_muestra": 110,
  "codigo_epi": "",
  "codigo_externo": "EXT_01",
  "estadoInfo": {
    "id": 1,
    "estado": "REGISTRADA",
    "color": "#e3f2fd",
    "descripcion": "Muestra registrada en el sistema"
  },
  "paciente": { ... },
  "solicitud": { ... }
}
```

## Resumen de Correcciones Aplicadas

1. ✅ **Eliminación de property declaration**: `declare estadoInfo?: DimEstado` eliminado de `Muestra.ts` y `Tecnica.ts`
2. ✅ **Eliminación de attributes array**: `'estadoInfo'` eliminado del array de atributos en scope `withRefs`
3. ✅ **Corrección de nombres de columnas**: `'codigo'` y `'nombre'` reemplazados por `'estado'` en los includes

## Lección Aprendida

Cuando se trabaja con asociaciones de Sequelize:

- Las **asociaciones** (como `estadoInfo`) van en el array `include`, no en `attributes`
- Los nombres de las columnas en `attributes` deben coincidir **exactamente** con los nombres físicos de las columnas en la base de datos
- Siempre verificar el esquema de la base de datos antes de definir attributes en los scopes
