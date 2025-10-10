# 📋 Gestión de Estados - Guía para Frontend

Esta guía explica cómo utilizar el sistema de gestión de estados del backend desde el frontend para las entidades **Muestra** y **Técnica**.

## 📌 Índice

1. [Conceptos Generales](#conceptos-generales)
2. [Estructura de Estados](#estructura-de-estados)
3. [API Endpoints](#api-endpoints)
4. [Ejemplos de Uso Frontend](#ejemplos-de-uso-frontend)
5. [Estados por Entidad](#estados-por-entidad)
6. [Validación de Transiciones](#validación-de-transiciones)
7. [Manejo de Errores](#manejo-de-errores)
8. [Ejemplos Completos](#ejemplos-completos)

---

## 🎯 Conceptos Generales

### ¿Qué es la Gestión de Estados?

El sistema de gestión de estados centraliza el control de los estados de las entidades **Muestra** y **Técnica** mediante:

- **Estados definidos en BD**: Tabla `dim_estados` con configuración centralizada
- **Validación de transiciones**: Solo se permiten cambios de estado válidos
- **Integridad referencial**: Foreign keys garantizan estados consistentes
- **Metadatos UI**: Colores, descripciones y orden para el frontend

### Entidades Afectadas

| Entidad     | Campo Estado | Descripción                            |
| ----------- | ------------ | -------------------------------------- |
| **Muestra** | `id_estado`  | Estado del procesamiento de la muestra |
| **Técnica** | `id_estado`  | Estado de ejecución de la técnica      |

---

## 🏗️ Estructura de Estados

### Modelo DimEstado

```typescript
interface DimEstado {
  id: number; // ID único del estado
  estado: string; // Código del estado (ej: 'PENDIENTE')
  entidad: string; // 'MUESTRA' | 'TECNICA'
  descripcion?: string; // Descripción legible
  orden?: number; // Orden secuencial
  activo: boolean; // Si está activo
  color?: string; // Color para UI (hex)
  es_inicial: boolean; // Estado por defecto
  es_final: boolean; // Estado terminal
}
```

### Ejemplo de Respuesta

```json
{
  "id": 1,
  "estado": "PENDIENTE",
  "entidad": "TECNICA",
  "descripcion": "Técnica pendiente de ejecución",
  "orden": 1,
  "activo": true,
  "color": "#e3f2fd",
  "es_inicial": true,
  "es_final": false
}
```

---

## 🔗 API Endpoints

### 1. Obtener Estados por Entidad

**GET** `/api/estados/:entidad`

Obtiene todos los estados activos para una entidad específica.

#### Parámetros

- `entidad`: `'MUESTRA'` | `'TECNICA'`

#### Ejemplo

```bash
GET /api/estados/MUESTRA
GET /api/estados/TECNICA
```

#### Respuesta

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "estado": "REGISTRADA",
      "entidad": "MUESTRA",
      "descripcion": "Muestra registrada en el sistema",
      "orden": 1,
      "color": "#e3f2fd",
      "es_inicial": true,
      "es_final": false
    },
    {
      "id": 2,
      "estado": "RECIBIDA",
      "entidad": "MUESTRA",
      "descripcion": "Muestra recibida en laboratorio",
      "orden": 2,
      "color": "#fff3e0",
      "es_inicial": false,
      "es_final": false
    }
  ]
}
```

### 2. Obtener Estados Disponibles para Transición

**GET** `/api/estados/:entidad/disponibles?estadoActual=:estadoId`

Obtiene los estados a los que se puede transicionar desde el estado actual.

#### Parámetros

- `entidad`: `'MUESTRA'` | `'TECNICA'`
- `estadoActual` (query): ID del estado actual (opcional)

#### Ejemplo

```bash
GET /api/estados/MUESTRA/disponibles?estadoActual=1
```

#### Respuesta

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "estado": "REGISTRADA",
      "descripcion": "Estado actual"
    },
    {
      "id": 2,
      "estado": "RECIBIDA",
      "descripcion": "Siguiente estado permitido"
    }
  ]
}
```

### 3. Cambiar Estado de Muestra

**PUT** `/api/muestras/:id/estado`

Cambia el estado de una muestra específica.

#### Parámetros

- `id`: ID de la muestra

#### Body

```json
{
  "id_estado": 2,
  "comentario": "Muestra recibida correctamente"
}
```

#### Respuesta

```json
{
  "success": true,
  "data": {
    "id_muestra": 123,
    "id_estado": 2,
    "fecha_estado": "2025-10-01T10:30:00.000Z",
    "comentarios": "Muestra recibida correctamente",
    "estadoInfo": {
      "id": 2,
      "estado": "RECIBIDA",
      "descripcion": "Muestra recibida en laboratorio",
      "color": "#fff3e0"
    }
  },
  "message": "Estado actualizado correctamente"
}
```

### 4. Cambiar Estado de Técnica

**PUT** `/api/tecnicas/:id/estado`

Cambia el estado de una técnica específica.

#### Parámetros

- `id`: ID de la técnica

#### Body

```json
{
  "id_estado": 2,
  "comentario": "Iniciando procesamiento"
}
```

#### Respuesta

```json
{
  "success": true,
  "data": {
    "id_tecnica": 456,
    "id_estado": 2,
    "fecha_estado": "2025-10-01T10:30:00.000Z",
    "comentarios": "Iniciando procesamiento",
    "estadoInfo": {
      "id": 2,
      "estado": "EN_PROCESO",
      "descripcion": "Técnica en ejecución",
      "color": "#fff3e0"
    }
  },
  "message": "Estado actualizado correctamente"
}
```

---

## 💻 Ejemplos de Uso Frontend

### JavaScript/TypeScript

#### 1. Cargar Estados Disponibles

```typescript
interface Estado {
  id: number;
  estado: string;
  entidad: string;
  descripcion?: string;
  orden?: number;
  color?: string;
  es_inicial: boolean;
  es_final: boolean;
}

class EstadosService {
  private baseURL = '/api/estados';

  // Obtener todos los estados de una entidad
  async getEstadosPorEntidad(
    entidad: 'MUESTRA' | 'TECNICA'
  ): Promise<Estado[]> {
    try {
      const response = await fetch(`${this.baseURL}/${entidad}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error('Error al cargar estados');
      }

      return result.data;
    } catch (error) {
      console.error('Error cargando estados:', error);
      throw error;
    }
  }

  // Obtener estados disponibles para transición
  async getEstadosDisponibles(
    entidad: 'MUESTRA' | 'TECNICA',
    estadoActual?: number
  ): Promise<Estado[]> {
    try {
      const url = `${this.baseURL}/${entidad}/disponibles${
        estadoActual ? `?estadoActual=${estadoActual}` : ''
      }`;

      const response = await fetch(url);
      const result = await response.json();

      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error cargando estados disponibles:', error);
      return [];
    }
  }

  // Cambiar estado de muestra
  async cambiarEstadoMuestra(
    id: number,
    nuevoEstadoId: number,
    comentario?: string
  ) {
    try {
      const response = await fetch(`/api/muestras/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_estado: nuevoEstadoId,
          comentario,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al cambiar estado');
      }

      return result.data;
    } catch (error) {
      console.error('Error cambiando estado de muestra:', error);
      throw error;
    }
  }

  // Cambiar estado de técnica
  async cambiarEstadoTecnica(
    id: number,
    nuevoEstadoId: number,
    comentario?: string
  ) {
    try {
      const response = await fetch(`/api/tecnicas/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_estado: nuevoEstadoId,
          comentario,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al cambiar estado');
      }

      return result.data;
    } catch (error) {
      console.error('Error cambiando estado de técnica:', error);
      throw error;
    }
  }
}
```

#### 2. Componente React de Ejemplo

```tsx
import React, { useState, useEffect } from 'react';

interface Estado {
  id: number;
  estado: string;
  descripcion?: string;
  color?: string;
}

interface CambiarEstadoProps {
  entidad: 'MUESTRA' | 'TECNICA';
  itemId: number;
  estadoActual?: number;
  onEstadoCambiado: (nuevoEstado: any) => void;
}

const CambiarEstado: React.FC<CambiarEstadoProps> = ({
  entidad,
  itemId,
  estadoActual,
  onEstadoCambiado,
}) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<number | ''>('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estadosService = new EstadosService();

  useEffect(() => {
    cargarEstados();
  }, [entidad, estadoActual]);

  const cargarEstados = async () => {
    try {
      const estadosDisponibles = await estadosService.getEstadosDisponibles(
        entidad,
        estadoActual
      );
      setEstados(estadosDisponibles);
    } catch (err) {
      setError('Error al cargar estados disponibles');
    }
  };

  const handleCambiarEstado = async () => {
    if (!estadoSeleccionado) {
      setError('Selecciona un estado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let resultado;

      if (entidad === 'MUESTRA') {
        resultado = await estadosService.cambiarEstadoMuestra(
          itemId,
          Number(estadoSeleccionado),
          comentario || undefined
        );
      } else {
        resultado = await estadosService.cambiarEstadoTecnica(
          itemId,
          Number(estadoSeleccionado),
          comentario || undefined
        );
      }

      onEstadoCambiado(resultado);
      setEstadoSeleccionado('');
      setComentario('');
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cambiar-estado">
      <h3>Cambiar Estado {entidad}</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label>Nuevo Estado:</label>
        <select
          value={estadoSeleccionado}
          onChange={(e) => setEstadoSeleccionado(e.target.value)}
          disabled={loading}
        >
          <option value="">Seleccionar estado...</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.estado} - {estado.descripcion}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Comentario (opcional):</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Agregar comentario sobre el cambio de estado..."
          disabled={loading}
          rows={3}
        />
      </div>

      <button
        onClick={handleCambiarEstado}
        disabled={loading || !estadoSeleccionado}
        className="btn btn-primary"
      >
        {loading ? 'Cambiando...' : 'Cambiar Estado'}
      </button>
    </div>
  );
};

export default CambiarEstado;
```

#### 3. Componente de Indicador de Estado

```tsx
import React from 'react';

interface IndicadorEstadoProps {
  estado?: {
    id: number;
    estado: string;
    descripcion?: string;
    color?: string;
  };
  size?: 'small' | 'medium' | 'large';
}

const IndicadorEstado: React.FC<IndicadorEstadoProps> = ({
  estado,
  size = 'medium',
}) => {
  if (!estado) {
    return <span className="estado-badge sin-estado">Sin estado</span>;
  }

  const sizeClass = `estado-badge-${size}`;
  const backgroundColor = estado.color || '#gray';

  return (
    <span
      className={`estado-badge ${sizeClass}`}
      style={{
        backgroundColor,
        color: getContrastColor(backgroundColor),
      }}
      title={estado.descripcion}
    >
      {estado.estado}
    </span>
  );
};

// Función auxiliar para obtener color de texto contrastante
function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

export default IndicadorEstado;
```

---

## 📊 Estados por Entidad

### Estados de Muestra

| ID  | Estado     | Descripción                      | Color   | Inicial | Final |
| --- | ---------- | -------------------------------- | ------- | ------- | ----- |
| 1   | REGISTRADA | Muestra registrada en el sistema | #e3f2fd | ✅      | ❌    |
| 2   | RECIBIDA   | Muestra recibida en laboratorio  | #fff3e0 | ❌      | ❌    |
| 3   | EN_PROCESO | Muestra en proceso de análisis   | #f3e5f5 | ❌      | ❌    |
| 4   | COMPLETADA | Análisis completado              | #e8f5e8 | ❌      | ✅    |
| 5   | RECHAZADA  | Muestra rechazada                | #ffebee | ❌      | ✅    |

### Estados de Técnica

| ID  | Estado         | Descripción                    | Color   | Inicial | Final |
| --- | -------------- | ------------------------------ | ------- | ------- | ----- |
| 6   | PENDIENTE      | Técnica pendiente de ejecución | #e3f2fd | ✅      | ❌    |
| 7   | EN_PROCESO     | Técnica en ejecución           | #fff3e0 | ❌      | ❌    |
| 8   | COMPLETADA_TEC | Técnica completada             | #e8f5e8 | ❌      | ✅    |
| 9   | CANCELADA_TEC  | Técnica cancelada              | #ffebee | ❌      | ✅    |

---

## ⚡ Validación de Transiciones

### Reglas de Transición

El sistema valida que solo se puedan hacer transiciones válidas:

- **Regla general**: Solo se puede avanzar o retroceder **1 nivel** en el orden
- **Estados finales**: No permiten transiciones salientes
- **Estados iniciales**: Punto de partida por defecto

### Ejemplos de Transiciones Válidas

#### Para Muestra:

```
REGISTRADA (1) → RECIBIDA (2)     ✅
RECIBIDA (2) → EN_PROCESO (3)     ✅
EN_PROCESO (3) → COMPLETADA (4)   ✅
REGISTRADA (1) → EN_PROCESO (3)   ❌ (salto de nivel)
COMPLETADA (4) → EN_PROCESO (3)   ❌ (estado final)
```

#### Para Técnica:

```
PENDIENTE (6) → EN_PROCESO (7)      ✅
EN_PROCESO (7) → COMPLETADA_TEC (8) ✅
PENDIENTE (6) → COMPLETADA_TEC (8)  ❌ (salto de nivel)
```

---

## ❌ Manejo de Errores

### Códigos de Error Comunes

| Código | Error            | Descripción           | Solución                         |
| ------ | ---------------- | --------------------- | -------------------------------- |
| 400    | BAD_REQUEST      | Datos inválidos       | Verificar el body de la petición |
| 404    | NOT_FOUND        | Entidad no encontrada | Verificar que el ID existe       |
| 422    | VALIDATION_ERROR | Transición no válida  | Verificar estados disponibles    |
| 500    | INTERNAL_ERROR   | Error del servidor    | Contactar soporte                |

### Ejemplos de Respuestas de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Transición no permitida desde estado actual a EN_PROCESO",
    "details": {
      "estadoActual": "REGISTRADA",
      "estadoDestino": "EN_PROCESO",
      "transicionesValidas": ["RECIBIDA"]
    }
  }
}
```

### Manejo en Frontend

```typescript
try {
  await estadosService.cambiarEstadoMuestra(id, nuevoEstado, comentario);
} catch (error: any) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      showAlert('La transición de estado no es válida', 'warning');
      break;
    case 'NOT_FOUND':
      showAlert('Muestra no encontrada', 'error');
      break;
    default:
      showAlert('Error inesperado al cambiar estado', 'error');
  }
}
```

---

## 📝 Ejemplos Completos

### 1. Lista de Muestras con Cambio de Estado

```tsx
import React, { useState, useEffect } from 'react';

interface Muestra {
  id_muestra: number;
  codigo_epi: string;
  id_estado?: number;
  estadoInfo?: {
    id: number;
    estado: string;
    descripcion: string;
    color: string;
  };
}

const ListaMuestras: React.FC = () => {
  const [muestras, setMuestras] = useState<Muestra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMuestras();
  }, []);

  const cargarMuestras = async () => {
    try {
      const response = await fetch('/api/muestras');
      const result = await response.json();
      setMuestras(result.data || []);
    } catch (error) {
      console.error('Error cargando muestras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoCambiado = (muestraId: number, nuevoEstado: any) => {
    setMuestras((prevMuestras) =>
      prevMuestras.map((muestra) =>
        muestra.id_muestra === muestraId
          ? { ...muestra, ...nuevoEstado }
          : muestra
      )
    );
  };

  if (loading) return <div>Cargando muestras...</div>;

  return (
    <div className="lista-muestras">
      <h2>Gestión de Muestras</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Código EPI</th>
            <th>Estado Actual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {muestras.map((muestra) => (
            <tr key={muestra.id_muestra}>
              <td>{muestra.codigo_epi}</td>
              <td>
                <IndicadorEstado estado={muestra.estadoInfo} />
              </td>
              <td>
                <CambiarEstado
                  entidad="MUESTRA"
                  itemId={muestra.id_muestra}
                  estadoActual={muestra.id_estado}
                  onEstadoCambiado={(nuevoEstado) =>
                    handleEstadoCambiado(muestra.id_muestra, nuevoEstado)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaMuestras;
```

### 2. Dashboard de Estados

```tsx
import React, { useState, useEffect } from 'react';

interface EstadisticasEstado {
  entidad: string;
  estados: Array<{
    estado: string;
    count: number;
    color: string;
    descripcion: string;
  }>;
}

const DashboardEstados: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasEstado[]>([]);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [muestrasStats, tecnicasStats] = await Promise.all([
        fetch('/api/estadisticas/muestras/estados').then((r) => r.json()),
        fetch('/api/estadisticas/tecnicas/estados').then((r) => r.json()),
      ]);

      setEstadisticas([
        { entidad: 'MUESTRAS', estados: muestrasStats.data },
        { entidad: 'TÉCNICAS', estados: tecnicasStats.data },
      ]);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  return (
    <div className="dashboard-estados">
      <h2>Dashboard de Estados</h2>

      {estadisticas.map((stat) => (
        <div key={stat.entidad} className="entidad-stats">
          <h3>{stat.entidad}</h3>
          <div className="estados-grid">
            {stat.estados.map((estado) => (
              <div
                key={estado.estado}
                className="estado-card"
                style={{ borderLeft: `4px solid ${estado.color}` }}
              >
                <div className="estado-count">{estado.count}</div>
                <div className="estado-nombre">{estado.estado}</div>
                <div className="estado-descripcion">{estado.descripcion}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardEstados;
```

---

## 🎨 Estilos CSS Recomendados

```css
/* Componente Estado Badge */
.estado-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.estado-badge-small {
  padding: 2px 6px;
  font-size: 10px;
}

.estado-badge-medium {
  padding: 4px 8px;
  font-size: 12px;
}

.estado-badge-large {
  padding: 6px 12px;
  font-size: 14px;
}

.sin-estado {
  background-color: #f5f5f5;
  color: #666;
}

/* Componente Cambiar Estado */
.cambiar-estado {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Dashboard Estados */
.dashboard-estados {
  padding: 20px;
}

.entidad-stats {
  margin-bottom: 32px;
}

.estados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.estado-card {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.estado-count {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.estado-nombre {
  font-size: 14px;
  font-weight: 500;
  margin: 4px 0;
  text-transform: uppercase;
}

.estado-descripcion {
  font-size: 12px;
  color: #666;
}

/* Alertas */
.alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.alert-error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.alert-warning {
  background-color: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffcc02;
}

.alert-success {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
```

---

## 🚀 Próximos Pasos

### Funcionalidades Avanzadas

1. **Historial de Estados**: Track de cambios con timestamps
2. **Notificaciones**: Alerts automáticos en cambios críticos
3. **Permisos por Rol**: Restricciones de transición según usuario
4. **Workflows**: Automatización de transiciones según reglas
5. **Bulk Operations**: Cambio masivo de estados

### Integración con Otras Entidades

- **Solicitudes**: Estados de procesamiento de solicitudes
- **Reportes**: Estados de generación y entrega
- **Auditoría**: Estados de revisión y aprobación

---

## 📞 Soporte

Para dudas o problemas con la implementación:

- **Backend Issues**: Revisar logs del servicio `EstadoService`
- **API Errors**: Verificar endpoints y payloads
- **Frontend Integration**: Consultar ejemplos de este documento

---

_Última actualización: 1 de Octubre, 2025_
