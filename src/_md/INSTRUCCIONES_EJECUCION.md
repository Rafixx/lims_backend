# 🚀 Instrucciones de Ejecución del Servidor

## Estado Actual

✅ **Todos los errores resueltos**
✅ **Código compilado correctamente**
✅ **Base de datos configurada**

## Ejecutar el Servidor

### Opción 1: Modo Desarrollo (Recomendado)

```bash
npm run dev
```

- Auto-recarga cuando cambias archivos
- Muestra errores detallados
- Puerto: 3002

### Opción 2: Modo Producción

```bash
# 1. Compilar TypeScript
npm run build

# 2. Ejecutar
npm start
# o directamente
node dist/server.js
```

## Verificar que Funciona

### 1. Comprobar que el servidor está corriendo

```bash
curl http://localhost:3002/api/muestras/
```

**Respuesta esperada**: JSON con array de muestras

### 2. Ver logs del servidor

El servidor debería mostrar:

```
Conexión a la base de datos establecida correctamente.
Servidor escuchando en el puerto 3002
```

### 3. Verificar puerto

```bash
ss -tlnp | grep 3002
# o
lsof -i :3002
```

## Problemas Comunes

### Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :3002

# Matar el proceso (reemplaza PID con el número que veas)
kill <PID>

# O matar todos los procesos node
pkill -9 node
```

### Error de compilación TypeScript

```bash
# Limpiar y recompilar
rm -rf dist
npm run build
```

### Error de conexión a base de datos

Verificar archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_datos
DB_SCHEMA=lims_pre
PORT=3002
```

## Endpoints Disponibles

### Muestras

```bash
# Listar todas las muestras (con estados)
GET http://localhost:3002/api/muestras/

# Obtener una muestra específica
GET http://localhost:3002/api/muestras/:id
```

### Técnicas

```bash
# Listar todas las técnicas
GET http://localhost:3002/api/tecnicas/

# Obtener técnicas de una muestra
GET http://localhost:3002/api/tecnicas/muestra/:id_muestra
```

### Estados (requiere autenticación)

```bash
# Listar todos los estados
GET http://localhost:3002/api/estados

# Estados por entidad
GET http://localhost:3002/api/estados/MUESTRA
GET http://localhost:3002/api/estados/TECNICA

# Estados iniciales/finales
GET http://localhost:3002/api/estados/MUESTRA/iniciales
GET http://localhost:3002/api/estados/MUESTRA/finales
```

## Notas Importantes

1. **El servidor debe mostrar ambos mensajes** (conexión BD + escuchando) antes de hacer peticiones
2. **Esperar 2-3 segundos** después de iniciar antes de hacer la primera petición
3. **Los endpoints de estados requieren autenticación** (token JWT)
4. **El endpoint de muestras NO requiere autenticación** (para pruebas)

## Archivo de Logs

Los logs aparecen directamente en la consola. Para guardarlos en un archivo:

```bash
# Modo desarrollo con logs en archivo
npm run dev 2>&1 | tee server.log

# Modo producción con logs en archivo
node dist/server.js > server.log 2>&1 &
```

## Detener el Servidor

### Si está en primer plano

```
Ctrl + C
```

### Si está en segundo plano

```bash
# Ver procesos
ps aux | grep node

# Matar por PID
kill <PID>

# O matar todos
pkill node
```

## Scripts Disponibles

```json
{
  "dev": "nodemon src/server.ts", // Desarrollo con auto-recarga
  "build": "tsc", // Compilar TypeScript
  "start": "node dist/server.js", // Ejecutar compilado
  "test": "jest" // Ejecutar tests (si existen)
}
```

## ✅ Todo Listo

El servidor está configurado y listo para ejecutarse. Simplemente ejecuta:

```bash
npm run dev
```

Y comienza a desarrollar! 🚀
