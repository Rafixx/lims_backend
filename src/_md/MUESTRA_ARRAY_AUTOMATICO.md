# Creación Automática de Arrays en Muestras

## 📋 Descripción

Se ha implementado la funcionalidad de creación automática de posiciones de array y técnicas asociadas cuando se crea una muestra de tipo array.

## 🔧 Funcionamiento

### Estructura de Datos de Entrada

Cuando se crea una muestra a través del endpoint POST `/api/muestras`, se puede incluir el campo `array_config` con la siguiente estructura:

```json
{
  "array_config": {
    "code": "PLACA001ABCD",
    "width": 7,
    "heightLetter": "I",
    "height": 9,
    "totalPositions": 63
  }
}
```

**Campos:**

- `code`: Código único de la placa
- `width`: Número de columnas (ancho)
- `heightLetter`: Letra final de las filas (A-Z)
- `height`: Número de filas (calculado automáticamente)
- `totalPositions`: Total de posiciones (width × height)

### Proceso Automático

Cuando se detecta `array_config` en los datos de entrada:

1. **Marca la muestra como array:**

   - Se establece `tipo_array = true` automáticamente

2. **Genera todas las posiciones:**

   - Recorre las filas desde 'A' hasta `heightLetter`
   - Para cada fila, genera columnas del 1 al `width`
   - Formato de posición: `{columna}{fila}` (ejemplo: 1A, 2A, 3A... 7I)

3. **Crea registros en `muestra_array`:**

   - Un registro por cada posición generada
   - Todos con el mismo `codigo_placa`
   - Cada uno con su `posicion_placa` única
   - `id_posicion` secuencial (1, 2, 3... n)

4. **Crea técnicas asociadas:**
   - Una técnica por cada registro de array creado
   - Todas las técnicas relacionadas con `id_array` correspondiente
   - Usa la primera técnica especificada en `data.tecnicas[0]`
   - Estado inicial: 'PENDIENTE_TECNICA'

## 📊 Ejemplo de Generación

### Entrada:

```json
{
  "array_config": {
    "code": "PLACA_25_ARRAY",
    "width": 7,
    "heightLetter": "I",
    "height": 9,
    "totalPositions": 63
  },
  "tecnicas": [
    {
      "id_tecnica_proc": 5,
      "comentarios": "Array completo para AgingMETRIX"
    }
  ]
}
```

### Resultado:

Se crean **63 registros** en `muestra_array` con posiciones:

```
1A, 2A, 3A, 4A, 5A, 6A, 7A,
1B, 2B, 3B, 4B, 5B, 6B, 7B,
1C, 2C, 3C, 4C, 5C, 6C, 7C,
...
1I, 2I, 3I, 4I, 5I, 6I, 7I
```

Y **63 técnicas** asociadas, cada una vinculada a su posición del array.

## 🔗 Relaciones Creadas

```
Muestra (tipo_array=true)
  ↓
  ├── MuestraArray (posición 1A) → Tecnica (id_array → posición 1A)
  ├── MuestraArray (posición 2A) → Tecnica (id_array → posición 2A)
  ├── MuestraArray (posición 3A) → Tecnica (id_array → posición 3A)
  └── ... (hasta totalPositions)
```

## ⚠️ Validaciones

- **Requerido:** Al menos una técnica en `data.tecnicas` si se proporciona `array_config`
- **Validación:** `id_tecnica_proc` debe ser un número válido
- **Transaccional:** Todo se crea dentro de una transacción (rollback si falla)

## 🚀 Ventajas

1. **Creación masiva eficiente:** Usa `bulkCreate` para insertar múltiples registros
2. **Atómico:** Transacción garantiza integridad (todo o nada)
3. **Automático:** No requiere crear manualmente cada posición
4. **Consistente:** Todas las posiciones siguen el mismo formato
5. **Relaciones correctas:** Cada técnica queda vinculada a su array

## 📝 Código Modificado

**Archivo:** `src/repositories/muestra.repository.ts`

**Método:** `create(data: CrearMuestraData)`

**Líneas modificadas:** ~210-283

## 🧪 Testing

Formato de posiciones verificado con:

- width=7, heightLetter=I → 63 posiciones (7×9)
- Orden: Primero columnas, luego filas
- Formato correcto: 1A, 2A... 7A, 1B, 2B... 7I

## 📌 Notas Importantes

1. Si **NO** se proporciona `array_config`, el comportamiento es el normal (técnicas sin array)
2. La primera técnica de `data.tecnicas` se usa como plantilla para todas las posiciones
3. Todos los comentarios de esa técnica se copian a todas las posiciones
4. El campo `tipo_array` se establece automáticamente según la presencia de `array_config`

## 🔮 Mejoras Futuras

- [ ] Validar que `totalPositions` coincida con `width × height`
- [ ] Permitir configurar técnica diferente por posición
- [ ] Soporte para layouts personalizados (no rectangulares)
- [ ] Validación de rangos de letras (A-Z)
- [ ] Numeración alternativa (por columnas primero)
