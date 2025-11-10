# Implementación de Importación de Datos CSV

## Resumen

Se ha implementado la funcionalidad para recibir y procesar archivos CSV en el endpoint `POST /api/worklists/:id/importDataResults`.

## Componentes Creados

### 1. Middleware de Upload (`src/middlewares/upload.middleware.ts`)

**Responsabilidad**: Manejar la carga de archivos CSV usando Multer.

**Características**:

- Almacenamiento en memoria (no se guardan archivos en disco)
- Validación de tipo de archivo (solo `.csv`)
- Límite de tamaño: 10 MB
- Filtro de extensiones permitidas

```typescript
export const uploadCSV = multer({
  storage: multer.memoryStorage(),
  fileFilter: // valida solo .csv
  limits: { fileSize: 10 * 1024 * 1024 }
});
```

### 2. Utilidad de Parseo CSV (`src/utils/csvParser.ts`)

**Responsabilidad**: Parsear archivos CSV y validar su estructura.

**Funciones principales**:

#### `parseCSV(buffer: Buffer, options?): Promise<CSVRow[]>`

- Parsea un buffer CSV y retorna un array de objetos
- Maneja delimitadores personalizados (por defecto `,`)
- Soporta columnas como primera fila (headers)
- Maneja BOM (Byte Order Mark) de archivos UTF-8
- Limpia espacios en blanco automáticamente

#### `validateCSVColumns(records: CSVRow[], requiredColumns: string[]): void`

- Valida que el CSV tenga las columnas requeridas
- Lanza error si falta alguna columna obligatoria
- Valida que el CSV no esté vacío

### 3. Modificaciones en el Controlador

**Archivo**: `src/controllers/worklist.controller.ts`

**Cambios**:

```typescript
export const importDataResults = async (req, res, next) => {
  // 1. Valida que se haya subido un archivo
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se ha proporcionado ningún archivo CSV',
    });
  }

  // 2. Pasa el buffer al servicio
  const resultado = await worklistService.importDataResults(
    idWorklist,
    req.file.buffer
  );
};
```

### 4. Modificaciones en el Servicio

**Archivo**: `src/services/worklist.service.ts`

**Firma actualizada**:

```typescript
async importDataResults(idWorklist: number, csvBuffer: Buffer)
```

### 5. Modificaciones en el Repositorio

**Archivo**: `src/repositories/worklist.repository.ts`

**Firma actualizada**:

```typescript
async importDataResults(
  idWorklist: number,
  csvBuffer: Buffer
): Promise<{
  success: boolean;
  message: string;
  resultadosCreados?: number;
}>
```

**Estado actual**:

- ✅ Recibe el buffer del CSV
- ⏳ Pendiente: Procesar el contenido del CSV (marcado con TODO)
- ✅ Mantiene lógica de valores aleatorios por ahora

### 6. Modificaciones en las Rutas

**Archivo**: `src/routes/worklist.routes.ts`

**Cambio**:

```typescript
// Antes
router.post('/:id/importDataResults', importDataResults);

// Ahora
router.post(
  '/:id/importDataResults',
  uploadCSV.single('file'),
  importDataResults
);
```

El middleware `uploadCSV.single('file')` se ejecuta antes del controlador y:

1. Valida que el archivo sea CSV
2. Valida el tamaño (máx 10 MB)
3. Almacena el archivo en memoria
4. Lo hace disponible en `req.file`

## Dependencias Instaladas

```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",
    "csv-parse": "^5.x.x"
  },
  "devDependencies": {
    "@types/multer": "^1.4.x"
  }
}
```

## Flujo de Datos

```
Frontend (FormData con CSV)
    ↓
Middleware uploadCSV.single('file')
    ↓ (valida y parsea)
Controller (req.file.buffer)
    ↓
Service (csvBuffer: Buffer)
    ↓
Repository (csvBuffer: Buffer)
    ↓ TODO: parseCSV()
Procesamiento del CSV
```

## Siguiente Paso

**Pendiente**: Definir el formato del CSV y implementar el procesamiento en el repositorio.

Una vez que me indiques el formato del CSV (columnas esperadas y estructura), implementaré:

1. Llamada a `parseCSV()` en el repositorio
2. Validación de columnas con `validateCSVColumns()`
3. Mapeo de datos CSV a objetos `CreateResultadoDTO`
4. Creación de resultados desde los datos del CSV en lugar de valores aleatorios

## Ejemplo de Uso desde Frontend

```typescript
async importDataResults(id: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    `${this.basePath}/${id}/importDataResults`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
}
```

## Posibles Errores

- **400**: "No se ha proporcionado ningún archivo CSV"
- **400**: "Tipo de archivo no permitido. Solo se permiten archivos: .csv"
- **413**: Archivo mayor a 10 MB (límite de Multer)
- **500**: Error al parsear CSV o crear resultados
