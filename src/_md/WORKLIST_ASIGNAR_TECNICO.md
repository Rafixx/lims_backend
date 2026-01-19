# Endpoint: Asignar Técnico a Worklist

## 📋 Resumen

**Endpoint:** `PATCH /api/worklists/:id/asignar-tecnico`  
**Propósito:** Asignar un técnico responsable directamente al worklist (actualiza `id_tecnico_resp`)

---

## 🔧 Diferencia con setTecnicoLab

| Aspecto               | `asignar-tecnico` (NUEVO)        | `setTecnicoLab` (EXISTENTE)                 |
| --------------------- | -------------------------------- | ------------------------------------------- |
| **Método**            | PATCH                            | PUT                                         |
| **URL**               | `/worklists/:id/asignar-tecnico` | `/worklists/:id/setTecnicoLab`              |
| **Campo actualizado** | `worklist.id_tecnico_resp`       | `tecnica.id_tecnico_resp` (de cada técnica) |
| **Alcance**           | Solo el worklist                 | Todas las técnicas del worklist             |
| **Uso**               | Asignar responsable del worklist | Asignar técnico a cada técnica individual   |

---

## 📥 Request

### URL

```
PATCH /api/worklists/:id/asignar-tecnico
```

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "id_tecnico_resp": 5
}
```

### Parámetros

| Campo             | Tipo     | Ubicación | Requerido | Descripción                |
| ----------------- | -------- | --------- | --------- | -------------------------- |
| `id`              | `number` | URL path  | ✅ Sí     | ID del worklist            |
| `id_tecnico_resp` | `number` | Body      | ✅ Sí     | ID del técnico responsable |

---

## 📤 Response

### Caso exitoso (200 OK)

```json
{
  "success": true,
  "message": "Técnico asignado al worklist correctamente",
  "data": {
    "id_worklist": 123,
    "nombre": "WL-2026-001",
    "tecnica_proc": "Extracción DNA",
    "id_tecnico_resp": 5,
    "update_dt": "2026-01-19T10:30:00.000Z"
  }
}
```

### Errores (400 Bad Request)

```json
{
  "error": "El id_tecnico_resp es requerido en el cuerpo de la petición"
}
```

### Worklist no encontrado (404 Not Found)

```json
{
  "error": "Worklist con ID 999 no encontrado"
}
```

---

## 💡 Ejemplo de uso Frontend

```typescript
async function asignarTecnicoAWorklist(idWorklist: number, idTecnico: number) {
  try {
    const response = await fetch(
      `/api/worklists/${idWorklist}/asignar-tecnico`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_tecnico_resp: idTecnico }),
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('✅ Técnico asignado:', data.message);
      return data.data;
    } else {
      console.error('❌ Error:', data.message);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}
```

---

## ✅ Validaciones implementadas

1. ✅ Valida que el ID del worklist sea un número positivo
2. ✅ Valida que `id_tecnico_resp` esté presente en el body
3. ✅ Valida que el ID del técnico sea un número positivo
4. ✅ Verifica que el worklist exista antes de actualizar
5. ✅ Actualiza solo el campo `id_tecnico_resp` del worklist

---

## 📝 Notas de implementación

### Modelo Worklist

El campo `id_tecnico_resp` está correctamente definido:

```typescript
declare id_tecnico_resp?: number;
```

### Repository

```typescript
async asignarTecnico(idWorklist: number, idTecnico: number) {
  const worklist = await this.findById(idWorklist);
  if (!worklist) {
    throw new Error(`Worklist con ID ${idWorklist} no encontrado`);
  }
  return worklist.update({ id_tecnico_resp: idTecnico });
}
```

### Service

```typescript
async asignarTecnico(idWorklist: number, idTecnico: number) {
  const worklistActualizada = await this.workListRepo.asignarTecnico(
    idWorklist,
    idTecnico
  );
  return {
    success: true,
    message: 'Técnico asignado al worklist correctamente',
    data: worklistActualizada,
  };
}
```

---

**Fecha de documentación:** 19 de enero de 2026
