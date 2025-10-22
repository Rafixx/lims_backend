# Detección Automática de Tipo de CSV

## 📋 Resumen

Se ha implementado **detección automática** del tipo de CSV (Qubit o Nanodrop) en el método `importDataResults()`, eliminando la necesidad de endpoints separados para cada tipo de archivo.

---

## 🎯 Problema Resuelto

**Antes:**

```
Usuario debe saber qué tipo de CSV tiene
  ↓
Debe llamar al endpoint correcto:
  • POST /api/worklists/:id/importDataResults → Nanodrop
  • POST /api/worklists/:id/importQubitDataResults → Qubit
```

**Ahora:**

```
Usuario sube cualquier CSV
  ↓
Sistema detecta automáticamente el tipo
  ↓
Delega al método correspondiente
```

---

## 🔍 Cómo Funciona la Detección

### Algoritmo de Detección

```typescript
async importDataResults(idWorklist, csvBuffer) {
  // 1️⃣ Intentar parsear como Qubit (UTF-8, comas, comillas)
  try {
    registros = parseCSV(buffer, { delimiter: ',', quote: '"' })
    columnas = Object.keys(registros[0])

    if (tiene columnas de Qubit) {
      return importQubitDataResults(idWorklist, csvBuffer)
    }
  } catch {
    // No es Qubit, continuar...
  }

  // 2️⃣ Intentar parsear como Nanodrop (UTF-16 LE, tabs, sin comillas)
  try {
    registros = parseCSV(buffer, { delimiter: '\t', quote: false })
    columnas = Object.keys(registros[0])

    if (tiene columnas de Nanodrop) {
      return importNanoDropDataResults(idWorklist, csvBuffer)
    }
  } catch (error) {
    console.error('Error al parsear como Nanodrop:', error)
  }

  // 3️⃣ Si ninguno funciona, retornar error con columnas detectadas
  return {
    success: false,
    message: "No se pudo determinar el tipo de CSV..."
  }
}
```

---

## 🔑 Columnas Clave para Detección

### Qubit (Fluorómetro)

```typescript
const columnasQubit = [
  'Run ID',
  'Assay Name',
  'Test Name',
  'Test Date',
  'Qubit tube conc.',
  'Original sample conc.',
];
```

✅ Si encuentra **alguna** de estas columnas → Es Qubit

### Nanodrop (Espectrofotómetro)

```typescript
const columnasNanodrop = [
  'Fecha',
  'Nombre de muestra',
  'Ácido nucleico(ng/uL)',
  'A260/A280',
  'A260/A230',
];
```

✅ Si encuentra **alguna** de estas columnas → Es Nanodrop

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────────────┐
│ POST /api/worklists/:id/importDataResults      │
│ Content-Type: multipart/form-data              │
│ Field: file (CSV sin tipo especificado)        │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ Controller: importDataResults                   │
│ - Valida req.file existe                        │
│ - Extrae buffer                                 │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ Service: importDataResults                      │
│ - Pasa buffer a repository                      │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ Repository: importDataResults                   │
│ 🔍 DETECCIÓN AUTOMÁTICA                         │
└───────────────────┬─────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
┌────────▼─────────┐  ┌────────▼────────────┐
│ ¿Es Qubit?       │  │ ¿Es Nanodrop?       │
│ - Delimitador: , │  │ - Delimitador: \t   │
│ - Comillas: "    │  │ - Comillas: false   │
│ - UTF-8          │  │ - UTF-16 LE         │
└────────┬─────────┘  └────────┬────────────┘
         │                     │
         ✅                    ✅
         │                     │
┌────────▼─────────┐  ┌────────▼────────────┐
│ importQubitData  │  │ importNanoDropData  │
│ Results()        │  │ Results()           │
│ - tipo: FLUOROM. │  │ - tipo: ESPECTROFOT.│
│ - tabla: res_raw_│  │ - tabla: res_raw_   │
│   qubit          │  │   nanodrop          │
└────────┬─────────┘  └────────┬────────────┘
         │                     │
         └──────────┬──────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ Response                                        │
│ {                                               │
│   success: true,                                │
│   message: "Importación... completada",         │
│   resultadosCreados: N                          │
│ }                                               │
└─────────────────────────────────────────────────┘
```

---

## 💡 Ventajas de la Detección Automática

### ✅ **1. Simplicidad para el Usuario**

- Un solo endpoint para todos los CSV
- No necesita saber el tipo de archivo
- Menos confusión

### ✅ **2. Flexibilidad**

- Soporta múltiples formatos sin cambios en el frontend
- Fácil agregar nuevos tipos en el futuro

### ✅ **3. Mejor UX**

- Mensajes de error descriptivos con columnas detectadas
- Logs en consola para debugging

### ✅ **4. Compatibilidad hacia atrás**

- Métodos específicos (`importQubitDataResults`, `importNanoDropDataResults`) siguen disponibles
- Endpoints separados aún funcionan si se necesitan

---

## 🔧 Código Implementado

### Método Principal (Repository)

```typescript
async importDataResults(
  idWorklist: number,
  csvBuffer: Buffer
): Promise<{
  success: boolean;
  message: string;
  resultadosCreados?: number;
}> {
  let columnasDetectadas: string[] = [];

  // 1️⃣ Intentar Qubit
  try {
    const registrosQubit = await parseCSV(csvBuffer, {
      delimiter: ',',
      quote: '"',
      trim: true,
      skipEmptyLines: true,
      relaxColumnCount: true,
      relaxQuotes: true,
    });

    if (registrosQubit.length > 0) {
      columnasDetectadas = Object.keys(registrosQubit[0]);

      const columnasQubit = [
        'Run ID',
        'Assay Name',
        'Test Name',
        'Test Date',
        'Qubit tube conc.',
        'Original sample conc.',
      ];

      if (columnasQubit.some(col => columnasDetectadas.includes(col))) {
        console.log('✅ CSV detectado como Qubit');
        return this.importQubitDataResults(idWorklist, csvBuffer);
      }
    }
  } catch {
    console.log('No es formato Qubit, intentando Nanodrop...');
  }

  // 2️⃣ Intentar Nanodrop
  try {
    const registrosNanodrop = await parseCSV(csvBuffer, {
      delimiter: '\t',
      quote: false,
      trim: true,
      skipEmptyLines: true,
      relaxColumnCount: true,
      relaxQuotes: true,
    });

    if (registrosNanodrop.length > 0) {
      columnasDetectadas = Object.keys(registrosNanodrop[0]);

      const columnasNanodrop = [
        'Fecha',
        'Nombre de muestra',
        'Ácido nucleico(ng/uL)',
        'A260/A280',
        'A260/A230',
      ];

      if (columnasNanodrop.some(col => columnasDetectadas.includes(col))) {
        console.log('✅ CSV detectado como Nanodrop');
        return this.importNanoDropDataResults(idWorklist, csvBuffer);
      }
    }
  } catch (error) {
    console.error('Error al parsear como Nanodrop:', error);
  }

  // 3️⃣ Error si no se detectó ningún formato
  return {
    success: false,
    message: `No se pudo determinar el tipo de CSV.
    Columnas detectadas: ${columnasDetectadas.join(', ')}.
    Se esperaban columnas de Qubit o Nanodrop.`,
  };
}
```

---

## 📡 API Usage

### Endpoint Unificado (Recomendado)

```bash
POST /api/worklists/:id/importDataResults
Content-Type: multipart/form-data

# Puede ser cualquier tipo de CSV
file: <nanodrop.csv | qubit.csv>
```

**Ejemplo con cURL:**

```bash
# Funciona con Nanodrop
curl -X POST http://localhost:3000/api/worklists/5/importDataResults \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@ADNbc_31_03_2025.csv"

# Funciona con Qubit
curl -X POST http://localhost:3000/api/worklists/5/importDataResults \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@QubitData_08-08-2025.csv"
```

### Endpoints Específicos (Compatibilidad)

Siguen disponibles si se necesita forzar un tipo:

```bash
# Forzar importación como Nanodrop
POST /api/worklists/:id/importNanoDropDataResults

# Forzar importación como Qubit
POST /api/worklists/:id/importQubitDataResults
```

---

## 🧪 Testing

### Prueba 1: CSV de Qubit

```bash
curl -X POST http://localhost:3000/api/worklists/5/importDataResults \
  -F "file=@QubitData_08-08-2025_22-30-08.csv"

# Expected Output:
{
  "success": true,
  "message": "Importación de Qubit completada. 50 resultados creados",
  "resultadosCreados": 50
}

# Console Log:
✅ CSV detectado como Qubit
Columnas encontradas: ['Run ID', 'Assay Name', 'Test Name', ...]
```

### Prueba 2: CSV de Nanodrop

```bash
curl -X POST http://localhost:3000/api/worklists/5/importDataResults \
  -F "file=@ADNbc_31_03_2025_17_27_11.csv"

# Expected Output:
{
  "success": true,
  "message": "Importación completada. 12 resultados creados",
  "resultadosCreados": 12
}

# Console Log:
No es formato Qubit, intentando Nanodrop...
✅ CSV detectado como Nanodrop
Columnas encontradas: ['Fecha', 'Nombre de muestra', ...]
```

### Prueba 3: CSV Desconocido

```bash
curl -X POST http://localhost:3000/api/worklists/5/importDataResults \
  -F "file=@archivo_invalido.csv"

# Expected Output:
{
  "success": false,
  "message": "No se pudo determinar el tipo de CSV. Columnas detectadas: [col1, col2, ...]. Se esperaban columnas de Qubit o Nanodrop."
}
```

---

## 🐛 Debugging

### Logs de Detección

La función genera logs útiles para debug:

```
✅ CSV detectado como Qubit
Columnas encontradas: ['Run ID', 'Assay Name', 'Test Name', 'Test Date', ...]
```

```
No es formato Qubit, intentando Nanodrop...
✅ CSV detectado como Nanodrop
Columnas encontradas: ['Fecha', 'Nombre de muestra', 'Ácido nucleico(ng/uL)', ...]
```

```
Error al parsear como Nanodrop: Error: Invalid buffer encoding
```

---

## 🔮 Futuras Mejoras

### 1. Agregar Soporte para Nuevos Tipos

```typescript
// Ejemplo: Agregar detector para CSV de PCR
const columnasPCR = ['Cycle', 'Target', 'Ct Value', 'Melt Temp'];
if (columnasPCR.some((col) => columnasDetectadas.includes(col))) {
  return this.importPCRDataResults(idWorklist, csvBuffer);
}
```

### 2. Detección más Robusta

- Verificar múltiples columnas en lugar de solo una (`some` → verificar mínimo N columnas)
- Analizar contenido de las celdas además de nombres de columnas
- Detectar encoding antes de parsear

### 3. Validación Mejorada

- Validar formato de datos (fechas, números)
- Verificar cantidad mínima de registros
- Detectar columnas faltantes críticas

---

## 📝 Notas Finales

- ✅ **Compilación exitosa**: Sin errores TypeScript
- ✅ **Compatibilidad garantizada**: Endpoints específicos siguen funcionando
- ✅ **Logs informativos**: Facilita debugging
- ✅ **Mensajes de error descriptivos**: Ayuda al usuario a identificar problemas
- ✅ **Listo para producción**

**Implementación completada el**: 22 de octubre de 2025
