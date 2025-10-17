# Corrección: Asociación id_array en Técnicas

## 🐛 Problema Identificado

Cuando se creaba una muestra con `array_config`, las técnicas asociadas a cada posición del array se creaban pero el campo `id_array` quedaba en `NULL`.

## ✅ Soluciones Aplicadas

### 1. **Agregado campo `id_array` al modelo Tecnica**

**Archivo:** `src/models/Tecnica.ts`

**Cambios:**

- ✅ Agregada declaración de tipo: `declare id_array?: number;`
- ✅ Agregada definición en schema con referencia a `muestra_array`:
  ```typescript
  id_array: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'muestra_array',
      key: 'id_array',
    },
  }
  ```
- ✅ Agregada asociación `belongsTo` con MuestraArray:
  ```typescript
  this.belongsTo(models.MuestraArray, {
    foreignKey: 'id_array',
    as: 'muestraArray',
  });
  ```

### 2. **Agregada relación inversa en MuestraArray**

**Archivo:** `src/models/MuestraArray.ts`

**Cambios:**

- ✅ Agregada relación `hasMany` con Tecnica:
  ```typescript
  this.hasMany(models.Tecnica, {
    foreignKey: 'id_array',
    as: 'tecnicas',
  });
  ```

### 3. **Mejorado logging y validación en repositorio**

**Archivo:** `src/repositories/muestra.repository.ts`

**Cambios:**

- ✅ Agregados console.log para debugging de IDs generados
- ✅ Agregada validación de que los IDs se generen correctamente
- ✅ Agregado error descriptivo si falta algún ID
- ✅ Confirmado que `id_estado: 8` se usa en lugar de `estado: 'PENDIENTE_TECNICA'`

## 🔗 Relaciones Establecidas

```
MuestraArray (id_array=1, posicion=1A)
  ↓ belongsTo
  ├─► Muestra (id_muestra)
  │
  └─► hasMany
      └─► Tecnica (id_array=1, id_muestra, id_tecnica_proc)
```

## 📊 Flujo de Creación

1. **Se crea la Muestra** con `tipo_array=true`
2. **Se crean N registros de MuestraArray** con `bulkCreate` + `returning: true`
3. **Se obtienen los IDs generados** de cada registro de array
4. **Se crean N Técnicas** cada una asociada a su `id_array` correspondiente
5. **Se establecen automáticamente:**
   - `id_muestra`: ID de la muestra creada
   - `id_array`: ID del registro de muestra_array
   - `id_tecnica_proc`: De la primera técnica especificada
   - `id_estado`: 8 (estado inicial)
   - `fecha_estado`: Fecha actual
   - `comentarios`: De la técnica original

## 🧪 Verificación

### Logs Agregados:

```typescript
✅ Creados 63 registros de MuestraArray
Primeros 3 IDs generados: [
  { id_array: 13, posicion: '1A' },
  { id_array: 14, posicion: '2A' },
  { id_array: 15, posicion: '3A' }
]

✅ Preparadas 63 técnicas con id_array
Primeras 3 técnicas: [
  { id_array: 13, id_tecnica_proc: 5 },
  { id_array: 14, id_tecnica_proc: 5 },
  { id_array: 15, id_tecnica_proc: 5 }
]

✅ Técnicas del array creadas exitosamente
```

### Validaciones:

- ✅ Verifica que `bulkCreate` devuelva los IDs
- ✅ Lanza error si algún registro no tiene `id_array`
- ✅ Muestra los primeros 3 IDs y técnicas para debugging

## 🎯 Resultado Esperado

Ahora al crear una muestra con `array_config`:

```json
{
  "array_config": {
    "code": "PLACA_TEST",
    "width": 7,
    "heightLetter": "I",
    "totalPositions": 63
  },
  "tecnicas": [{ "id_tecnica_proc": 5 }]
}
```

Se debe obtener:

**Tabla `muestra_array`:**

```
id_array | id_muestra | posicion_placa | codigo_placa
---------|------------|----------------|-------------
13       | 115        | 1A             | PLACA_TEST
14       | 115        | 2A             | PLACA_TEST
15       | 115        | 3A             | PLACA_TEST
...      | ...        | ...            | ...
```

**Tabla `tecnicas`:**

```
id_tecnica | id_muestra | id_array | id_tecnica_proc | id_estado
-----------|------------|----------|-----------------|----------
250        | 115        | 13       | 5               | 8
251        | 115        | 14       | 5               | 8
252        | 115        | 15       | 5               | 8
...        | ...        | ...      | ...             | ...
```

✅ **`id_array` ahora se asigna correctamente a cada técnica**

## 📝 Notas

- La columna `id_array` ya existía en la BD como `smallint`
- Sequelize con PostgreSQL debe usar `returning: true` para obtener IDs en `bulkCreate`
- Los logs ayudan a debugging en desarrollo (pueden removerse en producción)
- El estado 8 corresponde al estado inicial de las técnicas de array

## 🔮 Queries Útiles

**Verificar técnicas con sus arrays:**

```sql
SELECT
  t.id_tecnica,
  t.id_muestra,
  t.id_array,
  ma.posicion_placa,
  ma.codigo_placa
FROM lims_pre.tecnicas t
LEFT JOIN lims_pre.muestra_array ma ON t.id_array = ma.id_array
WHERE t.id_muestra = 115
ORDER BY t.id_array;
```

**Contar técnicas por muestra:**

```sql
SELECT
  id_muestra,
  COUNT(*) as total_tecnicas,
  COUNT(id_array) as tecnicas_con_array
FROM lims_pre.tecnicas
WHERE id_muestra = 115
GROUP BY id_muestra;
```
