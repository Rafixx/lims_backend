# 📑 API Documentation - Sistema LIMS

## 📌 Descripción General

Sistema de gestión de información de laboratorio (LIMS) que proporciona endpoints para la gestión de usuarios, autenticación y worklist de técnicas pendientes.

**Base URL**

```
http://localhost:3000/api
```

---

## 🔑 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para la autenticación.  
Debes incluir el token en los headers:

```
Authorization: Bearer <token>
```

---

## 📁 Módulo de Autenticación

**Base URL:** `/api/auth`

### 1. Login de Usuario

`POST /login`

Autentica un usuario y devuelve un JWT token.

#### Request Body

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

#### Respuesta de Éxito (200)

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "TECNICO"
    }
  },
  "message": "Login exitoso"
}
```

#### Respuesta de Error (401)

```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

---

### 2. Registro de Usuario

`POST /register`

#### Request Body

```json
{
  "email": "nuevo@ejemplo.com",
  "password": "password123",
  "nombre": "María",
  "apellido": "García",
  "rol": "TECNICO"
}
```

#### Respuesta de Éxito (201)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "nuevo@ejemplo.com",
      "nombre": "María",
      "apellido": "García",
      "rol": "TECNICO"
    }
  },
  "message": "Usuario registrado exitosamente"
}
```

---

### 3. Verificar Token

`GET /verify`

**Headers:**

```
Authorization: Bearer <token>
```

#### Respuesta de Éxito (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "TECNICO"
    }
  },
  "message": "Token válido"
}
```

---

## 👥 Módulo de Usuarios

**Base URL:** `/api/usuarios`

### 1. Obtener Todos los Usuarios

`GET /`

**Headers:**

```
Authorization: Bearer <token>
```

#### Respuesta de Éxito (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "usuario1@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "TECNICO",
      "activo": true,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Usuarios obtenidos correctamente"
}
```

---

### 2. Obtener Usuario por ID

`GET /:id`

---

### 3. Actualizar Usuario

`PUT /:id`

#### Request Body

```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez López",
  "rol": "SUPERVISOR"
}
```

---

### 4. Eliminar Usuario

`DELETE /:id`

---

## 📋 Módulo de Worklist

**Base URL:** `/api/worklist`

### 1. Obtener Técnicas Pendientes

`GET /tecnicas-pendientes`

---

### 2. Obtener Técnicas Agrupadas por Proceso

`GET /tecnicas-agrupadas`

---

### 3. Obtener Estadísticas del Worklist

`GET /estadisticas`

---

### 4. Obtener Técnicas por Proceso Específico

`GET /proceso/:idTecnicaProc/tecnicas`

---

### 5. Otros Endpoints

- `GET /tecnicas-con-proceso` - Técnicas con información del proceso
- `GET /procesos-pendientes` - Procesos con técnicas pendientes
- `GET /conteo` - Conteo total de técnicas pendientes
- `GET /proceso/:id/existe` - Validar existencia de proceso con técnicas

---

## 🏥 Módulo de Muestras _(Futuro)_

**Base URL:** `/api/muestras`

- `GET /` - Obtener todas las muestras
- `GET /:id` - Obtener muestra por ID
- `POST /` - Crear nueva muestra
- `PUT /:id` - Actualizar muestra
- `DELETE /:id` - Eliminar muestra
- `GET /paciente/:idPaciente` - Muestras por paciente

---

## 🧪 Módulo de Técnicas _(Futuro)_

**Base URL:** `/api/tecnicas`

- `GET /` - Obtener todas las técnicas
- `GET /:id` - Obtener técnica por ID
- `POST /` - Crear nueva técnica
- `PUT /:id/estado` - Cambiar estado de técnica
- `GET /muestra/:idMuestra` - Técnicas por muestra

---

## 📊 Módulo de Reportes _(Futuro)_

**Base URL:** `/api/reportes`

- `GET /dashboard` - Datos para dashboard
- `GET /productividad` - Reportes de productividad
- `GET /tiempos` - Análisis de tiempos de proceso
- `GET /export/:tipo` - Exportar reportes (PDF, Excel)

---

## 📋 Estructura de Respuestas Estándar

### Éxito

```json
{ "success": true, "data": any, "message": "string" }
```

### Error

```json
{ "success": false, "message": "string", "error": any }
```

### Validación

```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [{ "field": "email", "message": "Email es requerido" }]
}
```

---

## 🔒 Códigos de Estado HTTP

| Código | Descripción                                |
| ------ | ------------------------------------------ |
| 200    | OK - Operación exitosa                     |
| 201    | Created - Recurso creado exitosamente      |
| 400    | Bad Request - Parámetros inválidos         |
| 401    | Unauthorized - Token inválido o faltante   |
| 403    | Forbidden - Sin permisos suficientes       |
| 404    | Not Found - Recurso no encontrado          |
| 409    | Conflict - Conflicto (ej: email ya existe) |
| 500    | Internal Server Error - Error del servidor |

---

## 🎯 Tipos de Datos Principales

### Usuario

```ts
interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'ADMIN' | 'SUPERVISOR' | 'TECNICO';
  activo: boolean;
  created_at: string;
  updated_at: string;
}
```

### Técnica

```ts
interface Tecnica {
  id: number;
  id_muestra: number;
  id_tecnica_proc: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  create_dt: string;
  delete_dt: string | null;
  tecnica_proc?: DimTecnicaProc;
}
```

### Proceso de Técnica

```ts
interface DimTecnicaProc {
  id: number;
  tecnica_proc: string;
  descripcion?: string;
  tiempo_estimado?: number;
}
```

---

## 🚀 Guía de Inicio Rápido para Frontend

### 1. Autenticación

```js
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  if (result.success) {
    localStorage.setItem('token', result.data.token);
    return result.data.user;
  }
  throw new Error(result.message);
};
```

### 2. Requests Autenticados

```js
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return response.json();
};
```

### 3. Manejo de Estados

```js
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await apiCall('/worklist/estadisticas');
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError('Error de conexión');
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 Notas Importantes

- **Tokens JWT:** Expiran en 24 horas, implementar refresh automático
- **Rate Limiting:** Máximo 100 requests por minuto por IP
- **CORS:** Configurado para desarrollo local
- **Logs:** Todos los errores se registran en el servidor
- **Validaciones:** Usar los mensajes de error para mostrar al usuario
- **Paginación:** Será implementada en endpoints que retornen listas grandes

---

## � Deployment

### Despliegue Automático con GitHub Actions

Este proyecto usa **GitHub Actions** para despliegue automático a Hostinger VPS.

#### Flujo de Trabajo

1. Desarrolla en rama `feature/xx`
2. Crea Pull Request a `main`
3. Merge a `main` → Deploy automático con PM2

#### Configuración

- **Servidor**: 185.166.39.240 (Hostinger VPS)
- **PM2**: 2 instancias en cluster mode
- **Puerto**: 3002
- **Logs**: `/home/rafa/dev/epidisease/lims/logs/`

#### Comandos Útiles

```bash
# Ver estado en servidor
ssh root@185.166.39.240 "pm2 status"

# Ver logs
ssh root@185.166.39.240 "pm2 logs lims-backend"

# Reiniciar aplicación
ssh root@185.166.39.240 "pm2 reload lims-backend"
```

📚 **Documentación completa**: Ver [DEPLOY_GITHUB_ACTIONS.md](./src/_md/DEPLOY_GITHUB_ACTIONS.md)

---

## �🔄 Versionado de API

Actualmente en versión **v1**.  
Futuros cambios _breaking_ serán versionados como `/api/v2/`

---

## 📞 Soporte

Para dudas o problemas con la API, contactar al equipo de backend o revisar los logs del servidor.
