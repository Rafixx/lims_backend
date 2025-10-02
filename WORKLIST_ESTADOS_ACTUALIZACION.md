# 🔄 Actualización de WorklistRepository - Nueva Gestión de Estados

## 📋 Resumen de Cambios

Se ha actualizado el `WorklistRepository` para usar la **nueva gestión de estados** basada en la tabla `dim_estados` en lugar de strings hardcodeados.

---

## ✅ Cambios Implementados

### 1. **Import de DimEstado**

```typescript
import { DimEstado } from '../models/DimEstado';
```

### 2. **Método `getPosiblesTecnicaProc()`**

#### ❌ **ANTES** (Hardcoded):

```typescript
where: literal(`
  "tecnicas"."estado" NOT IN ('COMPLETADA_TECNICA', 'CANCELADA_TECNICA') 
  AND "tecnicas"."delete_dt" IS NULL
  AND id_worklist IS NULL
`);
```

**Problemas:**

- Estados hardcodeados que no existen en `dim_estados`
- No flexible - requiere cambios de código para nuevos estados
- No sincronizado con la tabla de estados

#### ✅ **AHORA** (Dinámico):

```typescript
// 1. Consultar estados finales dinámicamente
const estadosFinales = await DimEstado.findAll({
  where: {
    entidad: 'TECNICA',
    es_final: true,
    activo: true,
  },
  attributes: ['id'],
  raw: true,
});

const idsEstadosFinales = estadosFinales.map((e) => e.id);

// 2. Usar IDs de estados finales en la query
where: literal(`
  "tecnicas"."delete_dt" IS NULL
  AND "tecnicas"."id_worklist" IS NULL
  ${idsEstadosFinales.length > 0 ? `AND ("tecnicas"."id_estado" IS NULL OR "tecnicas"."id_estado" NOT IN (${idsEstadosFinales.join(',')}))` : ''}
`);
```

**Ventajas:**
✅ Estados obtenidos dinámicamente de `dim_estados`  
✅ Usa el campo `es_final` para determinar estados finales  
✅ Flexible - nuevos estados finales se incluyen automáticamente  
✅ Maneja técnicas sin estado asignado (`id_estado IS NULL`)

---

### 3. **Método `getPosiblesTecnicas()`**

#### ❌ **ANTES**:

```typescript
attributes: ['id_tecnica'],
include: [
  {
    model: DimTecnicaProc,
    as: 'tecnica_proc',
    where: { tecnica_proc: tecnicaProc },
  },
  {
    model: Muestra,
    as: 'muestra',
    attributes: ['codigo_epi', 'codigo_externo'],
  },
],
where: literal(`
  "Tecnica"."estado" NOT IN ('COMPLETADA_TECNICA', 'CANCELADA_TECNICA')
  AND "Tecnica"."delete_dt" IS NULL
  AND id_worklist IS NULL
`)
```

#### ✅ **AHORA**:

```typescript
// 1. Consultar estados finales
const estadosFinales = await DimEstado.findAll({
  where: {
    entidad: 'TECNICA',
    es_final: true,
    activo: true,
  },
  attributes: ['id'],
  raw: true,
});

const idsEstadosFinales = estadosFinales.map((e) => e.id);

// 2. Incluir estadoInfo y usar es_final
attributes: ['id_tecnica', 'id_estado'],
include: [
  {
    model: DimEstado,
    as: 'estadoInfo',
    attributes: ['id', 'estado', 'color', 'descripcion'],
    where: { entidad: 'TECNICA' },
    required: false,
  },
  {
    model: DimTecnicaProc,
    as: 'tecnica_proc',
    where: { tecnica_proc: tecnicaProc },
  },
  {
    model: Muestra,
    as: 'muestra',
    attributes: ['codigo_epi', 'codigo_externo'],
  },
],
where: literal(`
  "Tecnica"."delete_dt" IS NULL
  AND "Tecnica"."id_worklist" IS NULL
  ${idsEstadosFinales.length > 0 ? `AND ("Tecnica"."id_estado" IS NULL OR "Tecnica"."id_estado" NOT IN (${idsEstadosFinales.join(',')}))` : ''}
`)
```

**Ventajas adicionales:**
✅ Ahora devuelve `estadoInfo` con color y descripción  
✅ Frontend puede mostrar estados con colores correctos  
✅ Incluye `id_estado` para referencia

---

## 🎯 Lógica de Estados

### **Estados Finales en TECNICA**

Según `dim_estados`, los estados finales (`es_final = true`) para TECNICA son:

| ID  | Estado    | Descripción                 | Color     |
| --- | --------- | --------------------------- | --------- |
| ?   | VALIDADA  | Resultados validados        | `#20c997` |
| ?   | RECHAZADA | Técnica rechazada o fallida | `#dc3545` |

### **Técnicas Disponibles para Worklist**

Una técnica está **disponible** si:

1. ✅ **No está eliminada**: `delete_dt IS NULL`
2. ✅ **No tiene worklist asignado**: `id_worklist IS NULL`
3. ✅ **No está en estado final**: `id_estado NOT IN (estados con es_final = true)`
4. ✅ **O no tiene estado asignado**: `id_estado IS NULL` (recién creada)

---

## 📊 Impacto en Frontend

### **Antes:**

```json
{
  "id_tecnica": 123,
  "muestra": {
    "codigo_epi": "EPI-001",
    "codigo_externo": "EXT-001"
  }
}
```

### **Ahora:**

```json
{
  "id_tecnica": 123,
  "id_estado": 2,
  "estadoInfo": {
    "id": 2,
    "estado": "ASIGNADA",
    "color": "#17a2b8",
    "descripcion": "Técnica asignada a técnico"
  },
  "muestra": {
    "codigo_epi": "EPI-001",
    "codigo_externo": "EXT-001"
  }
}
```

**Beneficios para el Frontend:**
✅ Puede mostrar badges con colores correctos  
✅ Tooltips con descripciones de estados  
✅ Filtrado visual por estado  
✅ Indicadores de progreso más claros

---

## 🔧 Métodos No Modificados

Los siguientes métodos **NO requieren cambios** porque no dependen de estados:

- ✅ `findById()` - Usa scope `withRefs` que ya incluye `estadoInfo`
- ✅ `findAll()` - Usa scope `withRefs` que ya incluye `estadoInfo`
- ✅ `findTecnicasById()` - Usa scope `withRefs` de Tecnica
- ✅ `create()` - Solo asigna worklist, no valida estados
- ✅ `update()` - Operación genérica
- ✅ `delete()` - Soft delete
- ✅ `setTecnicoLab()` - Solo actualiza técnico

---

## 🧪 Testing Recomendado

### 1. **Verificar técnicas disponibles**

```http
GET /api/worklists/posibles-tecnica-proc
```

**Debería devolver** procesos que tienen técnicas NO finales y sin worklist.

### 2. **Verificar técnicas de un proceso**

```http
GET /api/worklists/posibles-tecnicas/:tecnicaProc
```

**Debería devolver** técnicas con `estadoInfo` incluido.

### 3. **Crear worklist**

```http
POST /api/worklists
{
  "nombre": "Worklist Test",
  "tecnicas": [123, 456, 789]
}
```

**Debería funcionar** igual que antes.

---

## 📝 Notas Importantes

### **Manejo de `id_estado IS NULL`**

Las técnicas recién creadas pueden tener `id_estado = NULL` si el hook `beforeCreate` falla o no está configurado. El código ahora maneja esto correctamente:

```sql
WHERE (id_estado IS NULL OR id_estado NOT IN (ids_finales))
```

Esto significa:

- ✅ Técnicas sin estado → **DISPONIBLES**
- ✅ Técnicas con estado no final → **DISPONIBLES**
- ❌ Técnicas con estado final → **NO DISPONIBLES**

### **Performance**

La consulta de estados finales se ejecuta **una vez por método**. Si el performance es crítico, considera:

1. **Cachear estados finales** en memoria
2. **Usar un singleton** para cargar estados al inicio
3. **Crear un índice** en `dim_estados(entidad, es_final, activo)`

---

## ✅ Checklist de Validación

- [x] Importado `DimEstado`
- [x] `getPosiblesTecnicaProc()` usa `es_final`
- [x] `getPosiblesTecnicas()` usa `es_final` e incluye `estadoInfo`
- [x] Manejo de `id_estado IS NULL`
- [x] Sin errores de compilación
- [x] Documentación creada

---

## 🚀 Próximos Pasos

1. **Probar endpoints** de worklist
2. **Verificar que el frontend** muestra correctamente los estados
3. **Considerar cache** de estados finales si es necesario
4. **Actualizar tests** unitarios/integración

---

## 📚 Referencias

- `SISTEMA_ESTADOS_COMPLETO.md` - Sistema de estados completo
- `GESTION_ESTADOS_API.md` - API de gestión de estados
- `src/models/Tecnica.ts` - Modelo con `estadoInfo`
- `src/repositories/estado.repository.ts` - Repositorio de estados

---

**Fecha de actualización:** 1 de octubre de 2025  
**Autor:** Sistema de gestión de estados LIMS
