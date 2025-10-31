# Procesamiento Automático de Datos Nanodrop

## 📋 Resumen

Se ha implementado un **flujo completo de procesamiento automático** para datos de espectrofotometría Nanodrop que transforma los datos desde el CSV hasta la tabla de resultados, siguiendo una arquitectura de **3 capas** (Raw → Final → Resultado).

---

## 🏗️ Arquitectura Implementada

### Flujo de Datos

```
CSV Nanodrop
    ↓
ResRawNanodrop (staging - se trunca en cada import)
    ↓
ResFinalNanodrop (procesado - persistente)
    ↓
Resultado (tabla de negocio - con relación a Muestra)
```

---

## 📁 Archivos Creados/Modificados

### ✅ Nuevo: `src/services/resultadoNanodrop.service.ts`

**Propósito**: Capa de servicio que contiene la lógica de negocio para procesar datos de Nanodrop.

**Métodos principales**:

1. **`processRawToFinal(createdBy: number)`**

   - Lee todos los registros de `res_raw_nanodrop`
   - Transforma y guarda en `res_final_nanodrop` con conversiones:
     - Reemplaza comas por puntos en valores numéricos
     - Parsea fechas
     - Establece valores por defecto (`analizador='NanoDrop'`, `procesado=false`)
   - Busca la `Muestra` por `codigo_epi`
   - Crea registro en `Resultado` con tipo `'ESPECTROFOTOMETRIA'`
   - Marca el registro final como `procesado=true`
   - **Maneja transacciones atómicas**: rollback si falla

2. **`processUnprocessedFinal(createdBy: number)`**
   - Procesa solo registros de `res_final_nanodrop` con `procesado=false`
   - Útil para reprocesar datos que fallaron anteriormente

**Características clave**:

- ✅ **Transacciones atómicas**: Todo o nada
- ✅ **Manejo robusto de errores**: Captura errores por registro sin detener el proceso
- ✅ **Logging detallado**: Console logs para debugging
- ✅ **Clean Code**: Separación de responsabilidades (SRP)
- ✅ **Type-safe**: TypeScript con interfaces bien definidas

---

### 🔧 Modificado: `src/repositories/worklist.repository.ts`

**Cambios**:

1. **Import del servicio**:

```typescript
import resultadoNanodropService from '../services/resultadoNanodrop.service';
```

2. **Método `importNanoDropDataResults()` refactorizado**:
   - **ANTES**: Lógica comentada que creaba resultados manualmente (incompleta)
   - **AHORA**: Delega el procesamiento al servicio

```typescript
// Guardar datos raw
await this.resRawNanodropRepository.replaceAll(datosRawNanodrop);

// Procesar: raw → final → resultado
const procesamientoResult = await resultadoNanodropService.processRawToFinal(0);

return {
  success: true,
  message: `✅ ${procesamientoResult.recordsProcessed} registros procesados, ${procesamientoResult.resultsCreated} resultados creados`,
  resultadosCreados: procesamientoResult.resultsCreated,
};
```

---

## 🔄 Flujo Completo de Importación

### Paso 1: Upload CSV (Frontend → Controller)

```
POST /worklist/:id/import-results
```

### Paso 2: Parseo y Detección (worklist.repository.ts)

```typescript
importDataResults(idWorklist, csvBuffer)
  ↓
// Auto-detecta tipo CSV (Qubit vs Nanodrop)
  ↓
importNanoDropDataResults(idWorklist, csvBuffer)
```

### Paso 3: Guardado en Staging (worklist.repository.ts)

```typescript
// Mapea CSV → ResRawNanodrop
const datosRawNanodrop = registrosCSV.map((registro) => ({
  fecha: registro['Fecha'],
  sample_code: registro['Nombre de muestra'],
  an_cant: registro['Ácido nucleico(ng/uL)'],
  a260_280: registro['A260/A280'],
  // ... 24 columnas totales
}));

// Trunca y reemplaza tabla staging
await resRawNanodropRepository.replaceAll(datosRawNanodrop);
```

### Paso 4: Procesamiento Automático (resultadoNanodrop.service.ts)

```typescript
await resultadoNanodropService.processRawToFinal(userId);
```

**Transacciones internas**:

```sql
-- 1. Insertar en res_final_nanodrop
INSERT INTO res_final_nanodrop (
  codigo_epi, valor_conc_nucleico, valor_uds, ratio260_280, ratio260_230,
  abs_260, abs_280, analizador, procesado
) VALUES (
  'sample_code', REPLACE('an_cant',',','.')::numeric, 'ng/uL',
  REPLACE('a260_280',',','.')::numeric, REPLACE('a260_230',',','.')::numeric,
  REPLACE('a260',',','.')::numeric, REPLACE('a280',',','.')::numeric,
  'NanoDrop', false
);

-- 2. Buscar muestra
SELECT id_muestra FROM muestra WHERE codigo_epi = 'sample_code';

-- 3. Insertar resultado
INSERT INTO resultado (
  id_muestra, id_tecnica, tipo_res, valor, valor_texto,
  unidades, f_resultado, validado
) VALUES (
  123, 0, 'ESPECTROFOTOMETRIA', 'an_cant',
  'A260/280: 1.80 | A260/230: 2.20',
  'ng/uL', '2025-10-27', false
);

-- 4. Marcar como procesado
UPDATE res_final_nanodrop SET procesado = true WHERE id = 1;
```

---

## 📊 Mapeo de Campos

### CSV → ResRawNanodrop (24 columnas)

| Campo CSV               | Campo Raw     |
| ----------------------- | ------------- |
| `Fecha`                 | `fecha`       |
| `Nombre de muestra`     | `sample_code` |
| `Ácido nucleico(ng/uL)` | `an_cant`     |
| `A260/A280`             | `a260_280`    |
| `A260/A230`             | `a260_230`    |
| `A260`                  | `a260`        |
| `A280`                  | `a280`        |
| ...                     | ...           |

### ResRawNanodrop → ResFinalNanodrop

| Campo Raw     | Campo Final           | Transformación            |
| ------------- | --------------------- | ------------------------- |
| `sample_code` | `codigo_epi`          | Sin cambios               |
| `an_cant`     | `valor_conc_nucleico` | REPLACE(,→.) + ::numeric  |
| `fecha`       | `valor_fecha`         | String (mantiene formato) |
| `a260_280`    | `ratio260_280`        | REPLACE(,→.) + ::numeric  |
| `a260_230`    | `ratio260_230`        | REPLACE(,→.) + ::numeric  |
| `a260`        | `abs_260`             | REPLACE(,→.) + ::numeric  |
| `a280`        | `abs_280`             | REPLACE(,→.) + ::numeric  |
| -             | `analizador`          | DEFAULT 'NanoDrop'        |
| -             | `procesado`           | DEFAULT false             |

### ResFinalNanodrop → Resultado

| Campo Final           | Campo Resultado | Notas                        |
| --------------------- | --------------- | ---------------------------- |
| `codigo_epi`          | `id_muestra`    | JOIN con muestra             |
| `valor_conc_nucleico` | `valor`         | Valor principal              |
| -                     | `valor_texto`   | "A260/280: X \| A260/230: Y" |
| `valor_uds`           | `unidades`      | 'ng/uL'                      |
| `valor_fecha`         | `f_resultado`   | Parseado a Date              |
| -                     | `tipo_res`      | 'ESPECTROFOTOMETRIA'         |
| -                     | `validado`      | false                        |
| -                     | `id_tecnica`    | 0 (TODO: implementar)        |

---

## 🎯 Decisiones de Diseño (Clean Code)

### ✅ Por qué un Servicio y no en el Repository

**INCORRECTO** ❌:

```typescript
// Lógica de negocio en repository
class WorklistRepository {
  async importNanoDropDataResults() {
    // Parse CSV
    // Guardar raw
    // Transformar datos
    // Buscar muestras
    // Crear resultados
    // Validar rangos
    // ... 200 líneas de lógica
  }
}
```

**CORRECTO** ✅:

```typescript
// Repository: solo acceso a datos
class WorklistRepository {
  async importNanoDropDataResults() {
    await this.resRawNanodropRepository.replaceAll(data);
    return await resultadoNanodropService.processRawToFinal(userId);
  }
}

// Service: lógica de negocio
class ResultadoNanodropService {
  async processRawToFinal(createdBy) {
    // Toda la lógica de transformación
    // Relaciones entre tablas
    // Validaciones de negocio
  }
}
```

**Ventajas**:

1. **Single Responsibility**: Repository maneja datos, Service maneja lógica
2. **Reusabilidad**: El servicio puede llamarse desde múltiples controladores
3. **Testability**: Fácil mockear dependencias en tests
4. **Mantenibilidad**: Código más legible y organizado
5. **Escalabilidad**: Fácil añadir nuevas transformaciones

---

### ✅ Por qué NO en onCreate de ResRawNanodrop

**INCORRECTO** ❌:

```typescript
// Hooks de Sequelize con lógica de negocio
ResRawNanodrop.addHook('afterCreate', async (instance) => {
  // Crear res_final_nanodrop
  // Buscar muestra
  // Crear resultado
  // ... lógica compleja
});
```

**Problemas**:

- ❌ Hooks se disparan en CADA insert (incluso en tests)
- ❌ Difícil controlar transacciones
- ❌ Imposible deshabilitar temporalmente
- ❌ No se puede pasar contexto (userId, worklistId)
- ❌ Viola principio de responsabilidad única

**CORRECTO** ✅:

```typescript
// Procesamiento explícito y controlado
await resultadoNanodropService.processRawToFinal(userId);
```

---

## 🔧 TODOs Pendientes

### 1. **Relación con Técnica** ⚠️

```typescript
// Actualmente: id_tecnica = 0 (placeholder)
// TODO: Implementar lógica para encontrar técnica correcta
const tecnica = await Tecnica.findOne({
  where: {
    id_muestra: muestra.id_muestra,
    id_worklist: idWorklist,
    id_tecnica_proc: // ¿Cómo determinar?
  }
});
```

**Preguntas**:

- ¿Cómo relacionar `sample_code` del CSV con la técnica específica?
- ¿Usar el orden del worklist?
- ¿Hay un campo en el CSV que indique la técnica?

### 2. **Validación de Rangos** ⚠️

```typescript
// TODO: Comparar contra tabla de valores de referencia
dentro_rango: null, // Actualmente siempre null
```

**Necesita**:

- Tabla `dim_valores_referencia` con rangos por tipo de análisis
- Lógica de comparación (min, max, tolerancia)

### 3. **Usuario Autenticado** ⚠️

```typescript
// Actualmente: hardcoded a 0
await resultadoNanodropService.processRawToFinal(0);

// TODO: Obtener del contexto de autenticación
const userId = req.user.id;
await resultadoNanodropService.processRawToFinal(userId);
```

### 4. **Implementar Qubit** 📝

- Crear `resultadoQubit.service.ts` análogo
- Modificar `importQubitDataResults()` para usar el servicio
- Procesar datos de `res_raw_qubit` → `res_final_qubit` → `resultado`

---

## 🧪 Testing

### Casos de Prueba Recomendados

```typescript
describe('ResultadoNanodropService', () => {
  describe('processRawToFinal', () => {
    it('debe procesar todos los registros raw correctamente', async () => {
      // Arrange: insertar datos en res_raw_nanodrop
      // Act: ejecutar processRawToFinal
      // Assert: verificar res_final_nanodrop y resultado
    });

    it('debe manejar errores de muestra no encontrada', async () => {
      // Raw con codigo_epi que no existe en muestra
    });

    it('debe hacer rollback si falla la transacción', async () => {
      // Forzar error y verificar que no se guardó nada
    });

    it('debe reemplazar comas por puntos en valores numéricos', async () => {
      // "1,80" → 1.80
    });

    it('debe marcar registros como procesado=true', async () => {
      // Verificar flag después del proceso
    });
  });
});
```

---

## 📈 Mejoras Futuras

1. **Batch Processing**: Procesar en lotes grandes para mejor performance
2. **Queue System**: Usar Bull/BullMQ para procesamiento asíncrono
3. **Retry Logic**: Reintentos automáticos con exponential backoff
4. **Audit Log**: Tabla de auditoría para cambios en resultados
5. **Validaciones Avanzadas**: Detectar outliers, validar ratios
6. **Notificaciones**: Alertas cuando fallan validaciones

---

## 🎉 Resumen de Beneficios

### Antes ❌

- Lógica de procesamiento comentada e incompleta
- No había transformación de datos
- No se creaban registros en `res_final_nanodrop`
- No se relacionaba con `Muestra`
- Código mezclado en repository

### Ahora ✅

- ✅ Flujo completo automatizado (CSV → Raw → Final → Resultado)
- ✅ Transformaciones de datos (comas → puntos, fechas)
- ✅ Transacciones atómicas (todo o nada)
- ✅ Manejo robusto de errores
- ✅ Arquitectura limpia (Service Layer Pattern)
- ✅ Código reutilizable y testeable
- ✅ Logging para debugging
- ✅ Type-safe con TypeScript

---

## 📞 Próximos Pasos

1. **Probar en desarrollo**:

   ```bash
   npm run dev
   # Subir CSV de Nanodrop
   # Verificar logs en consola
   # Revisar tablas: res_raw_nanodrop, res_final_nanodrop, resultado
   ```

2. **Implementar TODOs**:

   - Relación con Técnica
   - Usuario autenticado
   - Validación de rangos

3. **Crear servicio para Qubit**:

   - Copiar patrón de Nanodrop
   - Ajustar mapeos de campos

4. **Agregar tests unitarios**

5. **Documentar API** (Swagger/OpenAPI)

---

**Implementado por**: GitHub Copilot  
**Fecha**: 27 de octubre de 2025  
**Branch**: `feat/resultados`  
**Commits**: Pendiente de commit
