# Procesamiento Automático de Datos Qubit

## 📋 Resumen

Se ha implementado un **flujo completo de procesamiento automático** para datos de fluorometría Qubit que transforma los datos desde el CSV hasta la tabla de resultados, siguiendo la misma arquitectura de **3 capas** que Nanodrop (Raw → Final → Resultado).

---

## 🏗️ Arquitectura Implementada

### Flujo de Datos

```
CSV Qubit
    ↓
ResRawQubit (staging - se trunca en cada import)
    ↓
ResFinalQubit (procesado - persistente)
    ↓
Resultado (tabla de negocio - con relación a Muestra)
```

---

## 📁 Archivos Creados/Modificados

### ✅ Nuevo: `src/services/resultadoQubit.service.ts`

**Propósito**: Capa de servicio que contiene la lógica de negocio para procesar datos de Qubit.

**Métodos principales**:

1. **`processRawToFinal(createdBy: number)`**

   - Lee todos los registros de `res_raw_qubit`
   - Transforma y guarda en `res_final_qubit`:
     - `test_name` → `codigo_epi` (identificador de muestra)
     - `orig_conc` → `valor` (concentración original)
     - `assay_name` → `tipo_ensayo` (dsDNA, RNA, etc.)
     - `qubit_tube_conc` → `qubit_valor`
     - Establece valores por defecto (`analizador='Qubit'`, `procesado=false`)
   - Busca la `Muestra` por `codigo_epi` (test_name)
   - Crea registro en `Resultado` con tipo `'FLUOROMETRIA'`
   - Marca el registro final como `procesado=true`
   - **Maneja transacciones atómicas**: rollback si falla

2. **`processUnprocessedFinal(createdBy: number)`**
   - Procesa solo registros de `res_final_qubit` con `procesado=false`
   - Útil para reprocesar datos que fallaron anteriormente

**Características clave**:

- ✅ **Mismo patrón que Nanodrop**: Arquitectura consistente
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
import resultadoQubitService from '../services/resultadoQubit.service';
```

2. **Método `importQubitDataResults()` refactorizado**:
   - **ANTES**: Lógica comentada que creaba resultados manualmente (incompleta)
   - **AHORA**: Delega el procesamiento al servicio

```typescript
// Guardar datos raw
await this.resRawQubitRepository.replaceAll(datosRawQubit);

// Procesar: raw → final → resultado
const procesamientoResult = await resultadoQubitService.processRawToFinal(0);

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
importQubitDataResults(idWorklist, csvBuffer)
```

### Paso 3: Guardado en Staging (worklist.repository.ts)

```typescript
// Mapea CSV → ResRawQubit
const datosRawQubit = registrosCSV.map((registro) => ({
  run_id: registro['Run ID'],
  assay_name: registro['Assay Name'],
  test_name: registro['Test Name'],
  test_date: registro['Test Date'],
  qubit_tube_conc: registro['Qubit tube conc.'],
  orig_conc: registro['Original sample conc.'],
  // ... 17 columnas totales
}));

// Trunca y reemplaza tabla staging
await resRawQubitRepository.replaceAll(datosRawQubit);
```

### Paso 4: Procesamiento Automático (resultadoQubit.service.ts)

```typescript
await resultadoQubitService.processRawToFinal(userId);
```

**Transacciones internas**:

```sql
-- 1. Insertar en res_final_qubit
INSERT INTO res_final_qubit (
  codigo_epi, valor, valor_uds, valor_fecha, tipo_ensayo,
  qubit_valor, qubit_uds, analizador, procesado
) VALUES (
  'test_name', 'orig_conc', 'orig_conc_units', 'test_date',
  'assay_name', 'qubit_tube_conc', 'qubit_units',
  'Qubit', false
);

-- 2. Buscar muestra
SELECT id_muestra FROM muestra WHERE codigo_epi = 'test_name';

-- 3. Insertar resultado
INSERT INTO resultado (
  id_muestra, id_tecnica, tipo_res, valor, valor_texto,
  unidades, f_resultado, validado
) VALUES (
  123, 0, 'FLUOROMETRIA', 'orig_conc',
  'dsDNA | Qubit: 15.5 ng/uL',
  'ng/uL', '2025-10-27', false
);

-- 4. Marcar como procesado
UPDATE res_final_qubit SET procesado = true WHERE id = 1;
```

---

## 📊 Mapeo de Campos

### CSV → ResRawQubit (17 columnas)

| Campo CSV                     | Campo Raw          |
| ----------------------------- | ------------------ |
| `Run ID`                      | `run_id`           |
| `Assay Name`                  | `assay_name`       |
| `Test Name`                   | `test_name`        |
| `Test Date`                   | `test_date`        |
| `Qubit tube conc.`            | `qubit_tube_conc`  |
| `Qubit tube conc. units`      | `qubit_units`      |
| `Original sample conc.`       | `orig_conc`        |
| `Original sample conc. units` | `orig_conc_units`  |
| `Sample Volume (uL)`          | `sample_volume_ul` |
| `Dilution Factor`             | `dilution_factor`  |
| ...                           | ...                |

### ResRawQubit → ResFinalQubit

| Campo Raw         | Campo Final   | Transformación                    |
| ----------------- | ------------- | --------------------------------- |
| `test_name`       | `codigo_epi`  | Sin cambios (es el ID de muestra) |
| `orig_conc`       | `valor`       | Sin cambios (string)              |
| `orig_conc_units` | `valor_uds`   | Sin cambios                       |
| `test_date`       | `valor_fecha` | String (formato fecha)            |
| `assay_name`      | `tipo_ensayo` | Sin cambios (dsDNA, RNA, etc.)    |
| `qubit_tube_conc` | `qubit_valor` | Sin cambios                       |
| `qubit_units`     | `qubit_uds`   | Sin cambios                       |
| -                 | `analizador`  | DEFAULT 'Qubit'                   |
| -                 | `procesado`   | DEFAULT false                     |

### ResFinalQubit → Resultado

| Campo Final   | Campo Resultado | Notas                        |
| ------------- | --------------- | ---------------------------- |
| `codigo_epi`  | `id_muestra`    | JOIN con muestra             |
| `valor`       | `valor`         | Concentración original       |
| -             | `valor_texto`   | "dsDNA \| Qubit: 15.5 ng/uL" |
| `valor_uds`   | `unidades`      | 'ng/uL'                      |
| `valor_fecha` | `f_resultado`   | Parseado a Date              |
| -             | `tipo_res`      | 'FLUOROMETRIA'               |
| -             | `validado`      | false                        |
| -             | `id_tecnica`    | 0 (TODO: implementar)        |

---

## 🔍 Diferencias Clave: Qubit vs Nanodrop

| Aspecto               | Nanodrop                    | Qubit                                |
| --------------------- | --------------------------- | ------------------------------------ |
| **Técnica**           | Espectrofotometría          | Fluorometría                         |
| **tipo_res**          | 'ESPECTROFOTOMETRIA'        | 'FLUOROMETRIA'                       |
| **Identificador**     | `sample_code`               | `test_name`                          |
| **Valor principal**   | `an_cant` (ácido nucleico)  | `orig_conc` (concentración original) |
| **Datos adicionales** | Ratios (260/280, 260/230)   | Tipo de ensayo (dsDNA, RNA)          |
| **Columnas CSV**      | 24                          | 17                                   |
| **Encoding CSV**      | UTF-16 LE                   | UTF-8                                |
| **Delimitador**       | Tabulador (`\t`)            | Coma (`,`)                           |
| **Comillas**          | No                          | Sí (`"`)                             |
| **Transformaciones**  | Reemplazo de comas → puntos | Parseo de fechas                     |

---

## 🎯 Decisiones de Diseño

### ✅ Por qué el mismo patrón que Nanodrop

**Ventajas de la consistencia**:

1. **Fácil mantenimiento**: Mismo código, diferentes datos
2. **Reutilización**: Patrones probados y funcionando
3. **Menor curva de aprendizaje**: Desarrolladores conocen la estructura
4. **Testing similar**: Mismos casos de prueba adaptados
5. **Escalabilidad**: Fácil añadir nuevos tipos (PCR, Gel, etc.)

---

## 🔧 TODOs Pendientes

### 1. **Relación con Técnica** ⚠️

```typescript
// Actualmente: id_tecnica = 0 (placeholder)
// TODO: Implementar lógica para encontrar técnica correcta
```

**Preguntas**:

- ¿El `test_name` del CSV coincide exactamente con `codigo_epi` de la muestra?
- ¿Cómo relacionar con la técnica específica del worklist?

### 2. **Validación de Rangos** ⚠️

```typescript
// TODO: Comparar contra tabla de valores de referencia
dentro_rango: null, // Actualmente siempre null
```

### 3. **Usuario Autenticado** ⚠️

```typescript
// Actualmente: hardcoded a 0
await resultadoQubitService.processRawToFinal(0);
```

### 4. **Validar tipo de ensayo** 📝

- ¿Hay tipos de ensayo válidos? (dsDNA, RNA, ssDNA, etc.)
- ¿Crear tabla `dim_tipo_ensayo`?
- ¿Validar contra lista permitida?

---

## 🧪 Testing

### Casos de Prueba Recomendados

```typescript
describe('ResultadoQubitService', () => {
  describe('processRawToFinal', () => {
    it('debe procesar registros raw de Qubit correctamente', async () => {
      // Arrange: insertar datos en res_raw_qubit
      // Act: ejecutar processRawToFinal
      // Assert: verificar res_final_qubit y resultado
    });

    it('debe manejar diferentes tipos de ensayo (dsDNA, RNA)', async () => {
      // Verificar que tipo_ensayo se guarda correctamente
    });

    it('debe relacionar test_name con codigo_epi de muestra', async () => {
      // Verificar búsqueda de muestra
    });

    it('debe crear resultado con tipo FLUOROMETRIA', async () => {
      // Verificar tipo_res correcto
    });

    it('debe manejar errores de muestra no encontrada', async () => {
      // Raw con test_name que no existe
    });

    it('debe hacer rollback si falla la transacción', async () => {
      // Forzar error y verificar que no se guardó nada
    });
  });
});
```

---

## 📈 Mejoras Futuras

1. **Validación de tipos de ensayo**: Lista permitida de assay_name
2. **Cálculos automáticos**: Validar dilution_factor vs concentraciones
3. **Alertas de calidad**: Detectar RFU fuera de rango (standards)
4. **Gráficas de calibración**: Visualizar std1_rfu, std2_rfu, std3_rfu
5. **Comparación Qubit vs Nanodrop**: Para misma muestra
6. **Export de reportes**: PDF con resultados formateados

---

## 🎉 Resumen de Beneficios

### Antes ❌

- Lógica de procesamiento comentada e incompleta
- No había transformación de datos
- No se creaban registros en `res_final_qubit`
- No se relacionaba con `Muestra`
- Código mezclado en repository

### Ahora ✅

- ✅ Flujo completo automatizado (CSV → Raw → Final → Resultado)
- ✅ Arquitectura consistente con Nanodrop
- ✅ Transacciones atómicas (todo o nada)
- ✅ Manejo robusto de errores
- ✅ Código reutilizable y testeable
- ✅ Logging para debugging
- ✅ Type-safe con TypeScript
- ✅ Servicio independiente (fácil de testear)

---

## 📞 Próximos Pasos

1. **Probar en desarrollo**:

   ```bash
   npm run dev
   # Subir CSV de Qubit
   # Verificar logs en consola
   # Revisar tablas: res_raw_qubit, res_final_qubit, resultado
   ```

2. **Comparar con Nanodrop**:

   - Misma muestra en ambos equipos
   - Verificar consistencia de resultados
   - Documentar diferencias esperadas

3. **Implementar TODOs**:

   - Relación con Técnica
   - Usuario autenticado
   - Validación de rangos

4. **Agregar tests unitarios** (copiar estructura de tests Nanodrop)

5. **Documentar API** (Swagger/OpenAPI)

---

## 🔗 Archivos Relacionados

- **Servicio Nanodrop**: `src/services/resultadoNanodrop.service.ts`
- **Servicio Qubit**: `src/services/resultadoQubit.service.ts`
- **Repository**: `src/repositories/worklist.repository.ts`
- **Modelo Raw**: `src/models/ResRawQubit.ts`
- **Modelo Final**: `src/models/importResult/ResFinalQubit.ts`
- **Repository Final**: `src/repositories/resFinalQubit.repository.ts`
- **Documentación Nanodrop**: `src/_md/PROCESAMIENTO_NANODROP.md`

---

**Implementado por**: GitHub Copilot  
**Fecha**: 27 de octubre de 2025  
**Branch**: `feat/resultados`  
**Patrón**: Service Layer Pattern (igual que Nanodrop)
