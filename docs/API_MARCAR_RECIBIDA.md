# API: Marcar Externalización como Recibida

## Endpoint

```
PATCH /api/externalizaciones/:id/marcar-recibida
```

## Descripción

Marca una externalización como recibida, actualiza las observaciones (concatenándolas con las existentes si las hay) y cambia el estado de la técnica asociada a `RECIBIDA_EXT` (id_estado = 18).

## Parámetros

### URL Parameters
- `id` (number, requerido): ID de la externalización

### Body Parameters (JSON)
```typescript
{
  f_recepcion: string;      // Fecha de recepción en formato ISO (requerido)
  observaciones?: string;   // Observaciones adicionales (opcional, max 255 chars)
}
```

## Validaciones

- El ID debe ser un número válido mayor a 0
- La fecha de recepción es obligatoria
- Las observaciones no pueden exceder 255 caracteres
- La externalización debe existir
- La externalización debe tener fecha de envío (f_envio)
- La externalización NO debe haber sido recibida previamente

## Comportamiento

1. **Actualiza la externalización**:
   - Establece `f_recepcion` con la fecha proporcionada
   - Concatena las observaciones nuevas con las existentes usando ` | ` como separador

2. **Actualiza la técnica asociada**:
   - Cambia `id_estado` a 18 (RECIBIDA_EXT)
   - Actualiza `fecha_estado` con la fecha actual

3. **Transaccionalidad**:
   - Toda la operación se ejecuta en una transacción
   - Si algo falla, se revierte todo (rollback)

## Ejemplos de Uso

### Ejemplo 1: Recepción básica

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/externalizaciones/123/marcar-recibida \
  -H "Content-Type: application/json" \
  -d '{
    "f_recepcion": "2026-01-26T10:30:00.000Z"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Externalización marcada como recibida correctamente",
  "data": {
    "id_externalizacion": 123,
    "id_tecnica": 456,
    "f_envio": "2026-01-20T08:00:00.000Z",
    "f_recepcion": "2026-01-26T10:30:00.000Z",
    "observaciones": null,
    "tecnica": {
      "id_tecnica": 456,
      "id_estado": 18,
      "fecha_estado": "2026-01-26T10:30:15.000Z",
      ...
    }
  }
}
```

### Ejemplo 2: Recepción con observaciones

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/externalizaciones/123/marcar-recibida \
  -H "Content-Type: application/json" \
  -d '{
    "f_recepcion": "2026-01-26T10:30:00.000Z",
    "observaciones": "Muestra recibida en buen estado"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Externalización marcada como recibida correctamente",
  "data": {
    "id_externalizacion": 123,
    "id_tecnica": 456,
    "f_envio": "2026-01-20T08:00:00.000Z",
    "f_recepcion": "2026-01-26T10:30:00.000Z",
    "observaciones": "Muestra recibida en buen estado",
    ...
  }
}
```

### Ejemplo 3: Concatenación de observaciones

Si la externalización ya tiene observaciones previas:

**Estado inicial:**
```json
{
  "observaciones": "Enviada por courier XYZ"
}
```

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/externalizaciones/123/marcar-recibida \
  -H "Content-Type: application/json" \
  -d '{
    "f_recepcion": "2026-01-26T10:30:00.000Z",
    "observaciones": "Recibida con retraso de 2 días"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Externalización marcada como recibida correctamente",
  "data": {
    "observaciones": "Enviada por courier XYZ | Recibida con retraso de 2 días",
    ...
  }
}
```

## Errores Comunes

### 400 Bad Request - ID inválido
```json
{
  "success": false,
  "message": "ID de externalización inválido"
}
```

### 400 Bad Request - Fecha de recepción no proporcionada
```json
{
  "success": false,
  "message": "La fecha de recepción es requerida"
}
```

### 400 Bad Request - Observaciones muy largas
```json
{
  "success": false,
  "message": "Las observaciones no pueden exceder 255 caracteres"
}
```

### 400 Bad Request - Sin fecha de envío
```json
{
  "success": false,
  "message": "No se puede registrar recepción sin fecha de envío"
}
```

### 400 Bad Request - Ya recibida
```json
{
  "success": false,
  "message": "La externalización ya ha sido recibida"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Externalización no encontrada"
}
```

## Relación con otros endpoints

- **POST /api/externalizaciones/enviar**: Debe ejecutarse antes para establecer `f_envio`
- **PATCH /api/externalizaciones/:id/recepcion**: Endpoint alternativo (sin observaciones ni historial)
- **PATCH /api/externalizaciones/:id/recepcion-datos**: Se ejecuta después para registrar datos

## Logs

El endpoint genera logs detallados para facilitar el debugging:

```
🔵 [RECEPCIÓN] Marcando externalización 123 como recibida
✅ [PASO 1] Externalización encontrada (técnica: 456)
✅ [PASO 2] Externalización actualizada con f_recepcion
✅ [PASO 3] Técnica 456 actualizada a estado RECIBIDA_EXT (18)
✅ [COMMIT] Recepción registrada exitosamente
```

En caso de error:
```
❌ [ERROR] Error al marcar como recibida: <mensaje de error>
🔄 [ROLLBACK] Transacción revertida
```

## Notas Técnicas

- Usa transacciones de Sequelize para garantizar atomicidad
- El scope `withRefs` devuelve la externalización con todas sus relaciones
- Las observaciones se concatenan con ` | ` como separador
- La fecha de estado de la técnica se actualiza automáticamente
