# Procesamiento de CSV - Datos Espectrofotométricos (Nanodrop)

## Formato del CSV

### Delimitador

- **Separador**: Tabulador (`\t`)
- **Encoding**: UTF-8 con BOM support

### Columnas del CSV

El CSV debe contener **todas** las siguientes columnas:

| Columna                         | Descripción                     | Guardada en Raw | Usada en Resultado   |
| ------------------------------- | ------------------------------- | --------------- | -------------------- |
| `Fecha`                         | Fecha del resultado             | ✅              | ✅                   |
| `Nombre de muestra`             | Identificador de la muestra     | ✅              | ⏳ TODO              |
| `Ácido nucleico(ng/uL)`         | Concentración de ácido nucleico | ✅              | ✅ (valor principal) |
| `A260/A280`                     | Ratio de pureza proteica        | ✅              | ✅ (valor_texto)     |
| `A260/A230`                     | Ratio de pureza de sales        | ✅              | ✅ (valor_texto)     |
| `A260`                          | Absorbancia a 260nm             | ✅              | ❌                   |
| `A280`                          | Absorbancia a 280nm             | ✅              | ❌                   |
| `Factor de ácido nucleico`      | Factor multiplicador            | ✅              | ❌                   |
| `Corrección de línea base (nm)` | Corrección aplicada             | ✅              | ❌                   |
| `Absorbancia de línea base`     | Absorbancia base                | ✅              | ❌                   |
| ` Corregida (ng/uL)`            | Concentración corregida         | ✅              | ❌                   |
| ` % CV corregido`               | Coeficiente de variación        | ✅              | ❌                   |
| `Impureza 1`                    | Primera impureza detectada      | ✅              | ❌                   |
| `Impureza 1 A260`               | Absorbancia impureza 1          | ✅              | ❌                   |
| `Impureza 1 %CV`                | CV impureza 1                   | ✅              | ❌                   |
| `Impureza 1 mM`                 | Concentración impureza 1        | ✅              | ❌                   |
| `Impureza 2`                    | Segunda impureza detectada      | ✅              | ❌                   |
| `Impureza 2 A260`               | Absorbancia impureza 2          | ✅              | ❌                   |
| `Impureza 2 %CV`                | CV impureza 2                   | ✅              | ❌                   |
| `Impureza 2 mM`                 | Concentración impureza 2        | ✅              | ❌                   |
| `Impureza 3`                    | Tercera impureza detectada      | ✅              | ❌                   |
| `Impureza 3 A260`               | Absorbancia impureza 3          | ✅              | ❌                   |
| `Impureza 3 %CV`                | CV impureza 3                   | ✅              | ❌                   |
| `Impureza 3 mM`                 | Concentración impureza 3        | ✅              | ❌                   |

### Ejemplo de CSV

```csv
Fecha	Nombre de muestra	Ácido nucleico(ng/uL)	A260/A280	A260/A230	A260	A280	Factor de ácido nucleico	...
2025-01-15	M001	45.3	1.85	2.10	0.906	0.489	50	...
2025-01-15	M002	52.1	1.92	2.05	1.042	0.543	50	...
2025-01-15	M003	38.7	1.88	2.15	0.774	0.412	50	...
```

## Implementación

### 1. Parseo del CSV

```typescript
const registrosCSV = await parseCSV(csvBuffer, {
  delimiter: '\t', // Tabulador
  trim: true, // Elimina espacios
  skipEmptyLines: true, // Ignora líneas vacías
});
```

### 2. Validación de Columnas Requeridas

Solo valida las columnas esenciales para crear resultados:

```typescript
validateCSVColumns(registrosCSV, [
  'Fecha',
  'Nombre de muestra',
  'Ácido nucleico(ng/uL)',
  'A260/A280',
  'A260/A230',
]);
```

### 3. Guardado de Datos Raw en `res_raw_nanodrop`

**IMPORTANTE**: Antes de crear resultados, se guardan **TODOS** los datos del CSV en la tabla `res_raw_nanodrop`.

#### Comportamiento de Truncado

- ✅ **Cada importación TRUNCA la tabla** (elimina todos los registros anteriores)
- ✅ Solo se mantiene la **última importación**
- ✅ Todo ocurre en una **transacción atómica** (si falla, se hace rollback)

```typescript
// 1. Mapear TODAS las columnas del CSV
const datosRawNanodrop = registrosCSV.map((registro) => ({
  fecha: registro['Fecha'],
  sample_code: registro['Nombre de muestra'],
  an_cant: registro['Ácido nucleico(ng/uL)'],
  a260_280: registro['A260/A280'],
  a260_230: registro['A260/A230'],
  a260: registro['A260'],
  a280: registro['A280'],
  an_factor: registro['Factor de ácido nucleico'],
  // ... todas las 24 columnas
}));

// 2. Truncar y reemplazar (operación atómica)
await resRawNanodropRepository.replaceAll(datosRawNanodrop);
```

### 4. Creación de Resultados

Después de guardar los datos raw, se crean los registros en la tabla `resultado`:

```typescript
{
  id_tecnica: tecnica.id_tecnica,
  id_muestra: tecnica.id_muestra,
  valor: "45.3",                    // Ácido nucleico(ng/uL)
  valor_texto: "Ácido nucleico: 45.3 ng/uL | A260/A280: 1.85 | A260/A230: 2.10",
  tipo_res: "ESPECTROFOTOMETRIA",
  unidades: "ng/uL",
  f_resultado: Date                 // Parseado desde campo Fecha
}
```

## Arquitectura de Datos

### Tablas Involucradas

```
┌─────────────────────┐
│  res_raw_nanodrop   │  ← Datos completos del CSV (solo última importación)
│  (24 columnas)      │
└─────────────────────┘
          │
          │ Se trunca y reemplaza en cada import
          ▼
┌─────────────────────┐
│     resultado       │  ← Datos procesados para técnicas
│  (valores clave)    │
└─────────────────────┘
```

### Modelo `ResRawNanodrop`

**Tabla**: `res_raw_nanodrop`  
**Schema**: `lims_pre`  
**Timestamps**: Solo `createdAt` (automático)

**Campos**:

- `id` (PK, autoincremental)
- 24 campos de datos (todos VARCHAR(50))
- `createdAt` (timestamp automático)

### Repositorio `ResRawNanodropRepository`

**Métodos principales**:

```typescript
// Obtener todos los registros
findAll(): Promise<ResRawNanodrop[]>

// Obtener por ID
findById(id: number): Promise<ResRawNanodrop | null>

// TRUNCAR tabla (eliminar todos los registros)
truncate(transaction?): Promise<void>

// Crear un registro
create(data, transaction?): Promise<ResRawNanodrop>

// Crear múltiples registros
createBatch(dataArray, transaction?): Promise<ResRawNanodrop[]>

// REEMPLAZAR TODOS (trunca + inserta) - OPERACIÓN PRINCIPAL
replaceAll(dataArray, transaction?): Promise<{
  success: boolean;
  message: string;
  registrosCreados: number;
}>

// Contar registros
count(): Promise<number>

// Buscar por código de muestra
findBySampleCode(sampleCode: string): Promise<ResRawNanodrop[]>
```

## Flujo de Importación Actualizado

```
1. Usuario sube CSV desde Frontend
   ↓
2. Multer valida y carga el archivo
   ↓
3. parseCSV convierte buffer → array de objetos
   ↓
4. validateCSVColumns verifica columnas requeridas
   ↓
5. 🆕 GUARDAR DATOS RAW:
   - Mapear TODAS las columnas del CSV a ResRawNanodrop
   - Truncar tabla res_raw_nanodrop
   - Insertar todos los registros nuevos
   - Todo en transacción atómica
   ↓
6. Obtener técnicas del worklist sin resultados
   ↓
7. Por cada técnica sin resultado:
   - Tomar registro del CSV (por orden)
   - Parsear la fecha
   - Crear Resultado con 3 valores principales
   - Completar técnica
   ↓
8. Retorna conteo de resultados creados
```

## Limitaciones Actuales

### ⏳ Pendiente: Relación Nombre de Muestra ↔ Técnica

Actualmente, la asignación de resultados es **por orden**:

- 1ª técnica sin resultado → 1ª fila del CSV
- 2ª técnica sin resultado → 2ª fila del CSV
- etc.

### ✅ Implementado: Guardado de Datos Completos

- **Todos** los datos del CSV se guardan en `res_raw_nanodrop`
- Solo la **última importación** se mantiene (trunca automáticamente)
- Permite consultar datos raw completos para análisis posteriores
- Transacción atómica garantiza consistencia

## Manejo de Errores

### Error al Guardar Datos Raw

```json
{
  "success": false,
  "message": "Error al guardar datos raw: [detalle]"
}
```

### Errores de Parseo

```json
{
  "success": false,
  "message": "Error al parsear el archivo CSV: [detalle]"
}
```

### Errores de Validación

```json
{
  "success": false,
  "message": "Faltan columnas requeridas en el CSV: Fecha, A260/A280"
}
```

## Ejemplo de Uso

### Request

```http
POST /api/worklists/123/importDataResults
Content-Type: multipart/form-data

file: [datos_nanodrop.csv]
```

### Response (Éxito)

```json
{
  "success": true,
  "message": "Importación completada. 15 resultados creados",
  "resultadosCreados": 15
}
```

**Efecto Secundario**:

- Tabla `res_raw_nanodrop` se truncó y se llenó con 15 registros
- Se crearon 15 registros en tabla `resultado`
- Se completaron 15 técnicas

### Response (Error)

```json
{
  "success": false,
  "message": "Error al guardar datos raw: Connection timeout"
}
```

## Consultas de Datos Raw

### Obtener última importación completa

```typescript
const todosLosRegistros = await resRawNanodropRepository.findAll();
```

### Buscar por código de muestra

```typescript
const registrosMuestra =
  await resRawNanodropRepository.findBySampleCode('M001');
```

### Contar registros actuales

```typescript
const total = await resRawNanodropRepository.count();
```

## Notas Técnicas

- ✅ Soporte para BOM (Byte Order Mark) en UTF-8
- ✅ Trimming automático de espacios
- ✅ Parseo flexible de fechas (múltiples formatos)
- ✅ Guardado completo de datos raw (24 columnas)
- ✅ Truncado automático antes de cada importación
- ✅ Transacciones atómicas para consistencia
- ✅ Manejo de errores individuales sin detener el proceso
- ✅ Idempotencia: solo técnicas sin resultados previos
- ✅ Auto-completar técnicas después de crear resultado
- ⏳ TODO: Relacionar por nombre de muestra en lugar de orden

## Archivos Creados/Modificados

### Nuevos

- ✅ `src/repositories/resRawNanodrop.repository.ts` - Repositorio completo
- ✅ `src/models/importResult/ResRawNanodrop.ts` - Ya existía

### Modificados

- ✅ `src/models/index.ts` - Registrado ResRawNanodrop
- ✅ `src/repositories/worklist.repository.ts` - Integrado guardado de datos raw
- ✅ Este documento actualizado

## Formato del CSV

### Delimitador

- **Separador**: Tabulador (`\t`)
- **Encoding**: UTF-8 con BOM support

### Columnas del CSV

El CSV debe contener las siguientes columnas (en cualquier orden):

| Columna                 | Descripción                     | Requerida | Formato                                       |
| ----------------------- | ------------------------------- | --------- | --------------------------------------------- |
| `Fecha`                 | Fecha del resultado             | ✅ Sí     | Fecha estándar (YYYY-MM-DD, DD/MM/YYYY, etc.) |
| `Nombre de muestra`     | Identificador de la muestra     | ✅ Sí     | Texto                                         |
| `Ácido nucleico(ng/uL)` | Concentración de ácido nucleico | ✅ Sí     | Número decimal                                |
| `A260/A280`             | Ratio de pureza proteica        | ✅ Sí     | Número decimal                                |
| `A260/A230`             | Ratio de pureza de sales        | ✅ Sí     | Número decimal                                |

### Ejemplo de CSV

```csv
Fecha	Nombre de muestra	Ácido nucleico(ng/uL)	A260/A280	A260/A230	A260	A280	Factor de ácido nucleico	...
2025-01-15	M001	45.3	1.85	2.10	0.906	0.489	50	...
2025-01-15	M002	52.1	1.92	2.05	1.042	0.543	50	...
2025-01-15	M003	38.7	1.88	2.15	0.774	0.412	50	...
```

## Implementación

### 1. Parseo del CSV

```typescript
const registrosCSV = await parseCSV(csvBuffer, {
  delimiter: '\t', // Tabulador
  trim: true, // Elimina espacios
  skipEmptyLines: true, // Ignora líneas vacías
});
```

### 2. Validación de Columnas

```typescript
validateCSVColumns(registrosCSV, [
  'Fecha',
  'Nombre de muestra',
  'Ácido nucleico(ng/uL)',
  'A260/A280',
  'A260/A230',
]);
```

### 3. Mapeo a Resultado

Cada registro del CSV se convierte en un `Resultado`:

```typescript
{
  id_tecnica: tecnica.id_tecnica,
  id_muestra: tecnica.id_muestra,
  valor: "45.3",                    // Ácido nucleico(ng/uL)
  valor_texto: "Ácido nucleico: 45.3 ng/uL | A260/A280: 1.85 | A260/A230: 2.10",
  tipo_res: "ESPECTROFOTOMETRIA",
  unidades: "ng/uL",
  f_resultado: Date                 // Parseado desde campo Fecha
}
```

### Campos del Modelo Resultado

- **`valor`**: Contiene el valor de `Ácido nucleico(ng/uL)` como string
- **`valor_texto`**: Contiene todos los datos en formato legible:
  - Ácido nucleico
  - Ratio A260/A280 (pureza proteica)
  - Ratio A260/A230 (pureza de sales)
- **`tipo_res`**: "ESPECTROFOTOMETRIA"
- **`unidades`**: "ng/uL"
- **`f_resultado`**: Fecha parseada del CSV

## Flujo de Importación

```
1. Usuario sube CSV desde Frontend
   ↓
2. Multer valida y carga el archivo
   ↓
3. parseCSV convierte buffer → array de objetos
   ↓
4. validateCSVColumns verifica columnas requeridas
   ↓
5. Se obtienen técnicas del worklist sin resultados
   ↓
6. Por cada técnica sin resultado:
   - Se toma un registro del CSV (por orden)
   - Se parsea la fecha
   - Se crea el Resultado con los 3 valores
   - Se completa la técnica
   ↓
7. Retorna conteo de resultados creados
```

## Limitaciones Actuales

### ⏳ Pendiente: Relación Nombre de Muestra ↔ Técnica

Actualmente, la importación es **por orden**:

- 1ª técnica sin resultado → 1ª fila del CSV
- 2ª técnica sin resultado → 2ª fila del CSV
- etc.

### 🔜 Próxima Implementación

Se necesita implementar la relación entre:

- **Campo CSV**: `Nombre de muestra`
- **Técnica**: Debe relacionarse por código de muestra

Posibles estrategias:

1. Buscar muestra por `codigo_epi` o `codigo_externo`
2. Relacionar técnica con muestra del CSV
3. Solo crear resultado si hay coincidencia

## Manejo de Errores

### Errores de Parseo

```json
{
  "success": false,
  "message": "Error al parsear el archivo CSV: [detalle]"
}
```

### Errores de Validación

```json
{
  "success": false,
  "message": "Faltan columnas requeridas en el CSV: Fecha, A260/A280"
}
```

### Errores Parciales

Si algunas técnicas fallan pero otras tienen éxito:

```json
{
  "success": true,
  "message": "Importación completada. 8 resultados creados. Errores: 2 (Técnica 123: Error; Técnica 456: Error)",
  "resultadosCreados": 8
}
```

### Sin Técnicas Disponibles

```json
{
  "success": false,
  "message": "Las Tecnicas ya tienen resultados en el worklist 42"
}
```

## Ejemplo de Uso

### Request

```http
POST /api/worklists/123/importDataResults
Content-Type: multipart/form-data

file: [datos_espectrofotometria.csv]
```

### Response (Éxito)

```json
{
  "success": true,
  "message": "Importación completada. 15 resultados creados",
  "resultadosCreados": 15
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Faltan columnas requeridas en el CSV: A260/A280, A260/A230"
}
```

## Notas Técnicas

- ✅ Soporte para BOM (Byte Order Mark) en UTF-8
- ✅ Trimming automático de espacios
- ✅ Parseo flexible de fechas (múltiples formatos)
- ✅ Manejo de errores individuales sin detener el proceso
- ✅ Idempotencia: solo técnicas sin resultados previos
- ✅ Auto-completar técnicas después de crear resultado
- ⏳ TODO: Relacionar por nombre de muestra en lugar de orden
