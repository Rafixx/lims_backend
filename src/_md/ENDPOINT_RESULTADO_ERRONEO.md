# Endpoint: Marcar Técnicas como Resultado Erróneo

## 📋 Información General

**Endpoint:** `POST /api/tecnicas/resultado-erroneo`  
**Propósito:** Marcar una o varias técnicas como resultado erróneo y permitir su reasignación

---

## 🔧 Funcionalidad

Este endpoint permite marcar técnicas con resultado erróneo, reiniciándolas para que puedan ser reasignadas y procesadas nuevamente.

### Cambios realizados por el endpoint:

- ✅ Asigna `id_estado = 15` (RESULTADO_ERRONEO)
- ✅ Elimina el técnico responsable (`id_tecnico_resp = NULL`)
- ✅ Elimina la asignación a worklist (`id_worklist = NULL`)
- ✅ Actualiza `fecha_estado` con la fecha/hora actual

---

## 📥 Request

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "ids_tecnicas": [1, 2, 3]
}
```

### Parámetros

| Campo          | Tipo       | Requerido | Descripción                                           |
| -------------- | ---------- | --------- | ----------------------------------------------------- |
| `ids_tecnicas` | `number[]` | ✅ Sí     | Array de IDs de técnicas a marcar (mínimo 1 elemento) |

---

## 📤 Response

### Caso exitoso (200 OK)

```json
{
  "success": true,
  "message": "3 técnica(s) marcada(s) como resultado erróneo",
  "data": {
    "updated": 3
  }
}
```

### Caso de error parcial (207 Multi-Status)

```json
{
  "success": false,
  "message": "Proceso completado con errores",
  "data": {
    "updated": 2,
    "errors": [
      {
        "id_tecnica": 999,
        "error": "Técnica no encontrada"
      }
    ]
  }
}
```

### Errores de validación (400 Bad Request)

#### Array vacío

```json
{
  "success": false,
  "message": "El array de IDs de técnicas no puede estar vacío"
}
```

#### Campo incorrecto o ausente

```json
{
  "success": false,
  "message": "Se requiere un array de IDs de técnicas en el campo ids_tecnicas"
}
```

---

## 💡 Casos de Uso Frontend

### 1️⃣ Botón individual por técnica

```typescript
async function marcarTecnicaErronea(idTecnica: number) {
  try {
    const response = await fetch('/api/tecnicas/resultado-erroneo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_tecnicas: [idTecnica] }),
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar UI, mostrar notificación de éxito
      console.log('Técnica marcada como errónea exitosamente');
      // Recargar lista de técnicas o actualizar estado local
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}
```

### 2️⃣ Acción múltiple (selección de técnicas)

```typescript
async function marcarVariasTecnicasErroneas(idsTecnicas: number[]) {
  if (idsTecnicas.length === 0) {
    alert('Debe seleccionar al menos una técnica');
    return;
  }

  try {
    const response = await fetch('/api/tecnicas/resultado-erroneo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_tecnicas: idsTecnicas }),
    });

    const data = await response.json();

    if (response.status === 207) {
      // Éxito parcial
      alert(`${data.data.updated} técnicas actualizadas. 
             ${data.data.errors?.length || 0} fallaron.`);
    } else if (data.success) {
      // Éxito total
      alert(`${data.data.updated} técnicas marcadas como erróneas`);
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}
```

---

## 🎨 Recomendaciones UI/UX

1. **Confirmación antes de ejecutar:**

   ```
   "¿Está seguro que desea marcar esta(s) técnica(s) como resultado erróneo?
   Esto eliminará el técnico asignado y permitirá su reasignación."
   ```

2. **Iconografía sugerida:**

   - ⚠️ Icono de advertencia o error
   - 🔄 Icono de reinicio/reciclar

3. **Ubicación del botón/acción:**

   - En ficha detalle de técnica
   - En tabla de técnicas (acción por fila)
   - En barra de acciones múltiples (con checkbox de selección)

4. **Notificaciones:**

   - ✅ Success: "X técnica(s) marcada(s) como erróneas y listas para reasignación"
   - ⚠️ Parcial: "Se actualizaron X de Y técnicas. Revise los errores"
   - ❌ Error: "No se pudo completar la operación"

5. **Actualización de estados:**
   - Tras ejecutar exitosamente, actualizar la lista de técnicas
   - Mostrar el nuevo estado "RESULTADO_ERRONEO" en la UI
   - Limpiar campos de técnico asignado y worklist en la vista

---

## 🔍 Testing

### Test casos recomendados:

1. ✅ Marcar 1 técnica válida
2. ✅ Marcar múltiples técnicas válidas
3. ❌ Enviar array vacío
4. ❌ Enviar ID inexistente
5. ❌ Enviar datos sin el campo `ids_tecnicas`
6. ⚠️ Mezcla de IDs válidos e inválidos

---

## 📞 Contacto Backend

Si tienen dudas sobre la implementación, contactar al equipo de backend.

**Fecha de documentación:** 19 de enero de 2026
