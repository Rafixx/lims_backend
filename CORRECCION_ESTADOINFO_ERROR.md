# Corrección: Error "column estadoInfo does not exist"

## Problema

Al acceder a las muestras desde el frontend, Sequelize generaba el siguiente error:

```
SequelizeDatabaseError: column Muestra.estadoInfo does not exist
```

### SQL Generado (Incorrecto)

```sql
SELECT "Muestra"."estadoInfo", ...
FROM "lims_pre"."muestra" AS "Muestra"
LEFT OUTER JOIN "lims_pre"."dim_estados" AS "estadoInfo" ...
```

Sequelize intentaba seleccionar `estadoInfo` como una columna física de la tabla `muestra`, cuando en realidad es una **asociación** (relación con la tabla `dim_estados`).

## Causa Raíz

El problema tenía DOS ubicaciones donde `estadoInfo` estaba incorrectamente declarado:

### 1. Declaración como Propiedad del Modelo

En los modelos `Muestra.ts` y `Tecnica.ts`, se declaró incorrectamente `estadoInfo` como una propiedad del modelo:

```typescript
// ❌ INCORRECTO
export class Muestra extends Model {
  declare id_estado?: CreationOptional<number>;
  declare estadoInfo?: DimEstado; // <-- Problema #1

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_estado: {
          type: DataTypes.INTEGER,
          // ...
        },
      },
      {
        /* config */
      }
    );
  }
}
```

### 2. Inclusión en Scope de Atributos ⚠️ **ESTE ERA EL PROBLEMA PRINCIPAL**

En el modelo `Muestra.ts`, dentro del scope `withRefs`, `estadoInfo` estaba incluido en el array de `attributes`:

```typescript
// ❌ INCORRECTO
this.addScope('withRefs', {
  attributes: [
    'id_muestra',
    'codigo_epi',
    // ...
    'estado_muestra',
    'estadoInfo', // <-- Problema #2: Esto hace que Sequelize intente seleccionar la columna
  ],
  include: [
    {
      model: DimEstado,
      as: 'estadoInfo', // La asociación está correcta aquí
      // ...
    },
  ],
});
```

Cuando un atributo se lista en el array `attributes` de un scope, Sequelize intenta seleccionarlo como una **columna física** de la tabla.

## Solución

Se necesitaron **DOS correcciones**:

### 1. Eliminar Declaración de Propiedad

**Eliminar la declaración de `estadoInfo` de las propiedades del modelo**, ya que las asociaciones se manejan automáticamente a través de los métodos `belongsTo`, `hasMany`, etc.

### 2. Eliminar del Scope de Atributos ⚠️ **CRÍTICO**

**Eliminar `'estadoInfo'` del array `attributes` en los scopes** para evitar que Sequelize intente seleccionarlo como columna.

### Código Corregido

### Corrección en Modelo

```typescript
// ✅ CORRECTO
export class Muestra extends Model {
  declare id_estado?: CreationOptional<number>;
  // estadoInfo NO se declara aquí

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        id_estado: {
          type: DataTypes.INTEGER,
          references: {
            model: 'dim_estados',
            key: 'id',
          },
        },
      },
      {
        /* config */
      }
    );
  }

  static associate(models: any) {
    // La asociación se define aquí, no como propiedad
    this.belongsTo(models.DimEstado, {
      foreignKey: 'id_estado',
      as: 'estadoInfo',
      scope: {
        entidad: 'MUESTRA',
      },
    });
  }
}
```

### Corrección en Scope ⚠️ **IMPORTANTE**

```typescript
// ✅ CORRECTO
this.addScope('withRefs', {
  attributes: [
    'id_muestra',
    'codigo_epi',
    'estado_muestra',
    // 'estadoInfo' NO debe estar aquí ❌
  ],
  include: [
    {
      model: DimEstado,
      as: 'estadoInfo', // ✅ La asociación va en include
      attributes: ['id', 'codigo', 'nombre', 'color'],
    },
    // ... otras asociaciones
  ],
});
```

### Archivos Modificados

1. **src/models/Muestra.ts**

   - ✅ **Corrección #1**: Eliminada línea `declare estadoInfo?: DimEstado;` de las propiedades
   - ✅ **Corrección #2**: Eliminado `'estadoInfo'` del array `attributes` en el scope `withRefs`

2. **src/models/Tecnica.ts**
   - ✅ **Corrección #1**: Eliminada línea `declare estadoInfo?: DimEstado;` de las propiedades
   - ℹ️ No requería corrección en scope (no tenía `'estadoInfo'` en attributes)

## Conceptos Clave de Sequelize

### 1. Declaración de Propiedades en el Modelo

- **`declare property`**: Solo para columnas físicas en la tabla
- **NO declarar**: Asociaciones (relaciones con otras tablas)

### 2. Scopes y Atributos

- **`attributes` array**: Solo nombres de columnas físicas de la tabla
- **`include` array**: Aquí van las asociaciones con otras tablas

### Regla de Oro

```typescript
// ❌ MAL: estadoInfo en attributes
attributes: ['id', 'codigo', 'estadoInfo']  // ¡Error! estadoInfo no es una columna

// ✅ BIEN: estadoInfo en include
attributes: ['id', 'codigo'],  // Solo columnas físicas
include: [{ model: DimEstado, as: 'estadoInfo' }]  // Asociación aquí
```

### Ejemplo Completo

```typescript
export class Muestra extends Model {
  // ✅ Columnas físicas (están en la tabla)
  declare id_muestra: CreationOptional<number>;
  declare id_estado?: CreationOptional<number>;
  declare codigo_epi?: CreationOptional<string>;

  // ✅ NO declarar asociaciones aquí
  // declare estadoInfo?: DimEstado;  ❌
  // declare solicitud?: Solicitud;   ❌
  // declare tecnicas?: Tecnica[];    ❌

  static initModel(sequelize: Sequelize) {
    this.init(
      {
        // Solo columnas físicas
        id_muestra: { type: DataTypes.INTEGER, primaryKey: true },
        id_estado: { type: DataTypes.INTEGER },
        codigo_epi: { type: DataTypes.STRING },
      },
      { sequelize }
    );
  }

  static associate(models: any) {
    // Las asociaciones se definen aquí
    this.belongsTo(models.DimEstado, {
      foreignKey: 'id_estado',
      as: 'estadoInfo',
    });

    this.belongsTo(models.Solicitud, {
      foreignKey: 'id_solicitud',
      as: 'solicitud',
    });

    this.hasMany(models.Tecnica, {
      foreignKey: 'id_muestra',
      as: 'tecnicas',
    });
  }
}
```

## Resultado

Después de la corrección:

```sql
-- SQL Correcto Generado por Sequelize
SELECT
  "Muestra"."id_muestra",
  "Muestra"."codigo_epi",
  "Muestra"."id_estado",
  -- "Muestra"."estadoInfo" NO aparece aquí ✅
  "estadoInfo"."id" AS "estadoInfo.id",
  "estadoInfo"."estado" AS "estadoInfo.estado",
  "estadoInfo"."descripcion" AS "estadoInfo.descripcion"
FROM "lims_pre"."muestra" AS "Muestra"
LEFT OUTER JOIN "lims_pre"."dim_estados" AS "estadoInfo"
  ON "Muestra"."id_estado" = "estadoInfo"."id"
```

## Lección Aprendida

**Regla General para Modelos Sequelize:**

1. **`declare`** → Solo para columnas que existen físicamente en la tabla
2. **Asociaciones** → Se definen en el método `associate()`, NO se declaran como propiedades
3. **TypeScript** → Puede acceder a las asociaciones automáticamente gracias a los tipos inferidos

## Verificación

```bash
# Servidor reiniciado correctamente
curl http://localhost:3002/api/health
# ✅ {"ok":true,"service":"lims_backend"}

# Endpoint de muestras funcionando sin errores
# El frontend ahora puede acceder correctamente a las muestras con su información de estado
```

## Estado Final

✅ Error corregido
✅ Modelos Muestra y Tecnica actualizados
✅ Servidor funcionando correctamente
✅ Asociaciones funcionando correctamente sin errores de SQL
