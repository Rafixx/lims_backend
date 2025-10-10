# 🔧 Guía de Configuración de ecosystem.config.js

## 📋 **Checklist de Configuración**

### ✅ **1. Información del Servidor**

Necesitas completar estos datos en `ecosystem.config.js`:

```javascript
// Línea ~62
host: 'your-hostinger-ip-or-domain', // TODO: Cambiar
```

**Valores posibles:**

- IP del servidor: `123.45.67.89`
- Dominio: `lims.tudominio.com`
- Hostname SSH: `u123456789.hostinger.com`

### ✅ **2. Repositorio Git**

```javascript
// Línea ~64
repo: 'git@github.com:Rafixx/lims_backend.git', // TODO: Verificar
```

**Cómo obtenerlo:**

```bash
# Desde tu proyecto local:
git remote -v
```

Si usas HTTPS en vez de SSH, cambiar a:

```javascript
repo: 'https://github.com/Rafixx/lims_backend.git',
```

### ✅ **3. Ruta de Deploy en Producción**

```javascript
// Línea ~65
path: '/home/rafa/deploy/epidisease/lims/backend',
```

**Decidir dónde desplegar:**

- Opción 1 (recomendada): `/home/rafa/apps/lims/backend`
- Opción 2: `/var/www/lims/backend`
- Opción 3: `/home/rafa/deploy/epidisease/lims/backend` (actual)

### ✅ **4. Variables de Entorno**

**Crear archivo `.env.production`:**

```bash
# 1. Copiar plantilla
cp .env.production.example .env.production

# 2. Editar y completar valores reales
nano .env.production
```

**Valores que DEBES cambiar:**

```bash
# Base de datos
DB_HOST=localhost                    # ← IP del servidor de BD
DB_PASSWORD=PASSWORD_SEGURO          # ← Cambiar por contraseña real
DB_NAME=lims_prod                    # ← Nombre de BD en producción

# JWT
JWT_SECRET=SECRET_MINIMO_32_CHARS    # ← Generar con: openssl rand -base64 32

# CORS
CORS_ORIGIN=https://tu-dominio.com   # ← URL del frontend
```

### ✅ **5. Instancias/Workers**

```javascript
// Línea ~5
instances: 1, // En producción cambiar a 2-4 según CPU
```

**Recomendaciones:**

- **1 instancia**: Desarrollo o servidor con 1 CPU
- **2 instancias**: Servidor con 2 CPUs (recomendado para Hostinger básico)
- **4 instancias**: Servidor con 4+ CPUs
- **'max'**: PM2 detecta automáticamente (puede ser excesivo)

Para cambiar:

```javascript
instances: 2, // Usar 2 workers en producción
```

---

## 🚀 **Pasos para Configurar**

### **Paso 1: Actualizar ecosystem.config.js**

Edita el archivo y reemplaza los TODOs:

```bash
nano ecosystem.config.js
```

### **Paso 2: Crear .env.production**

```bash
# Copiar plantilla
cp .env.production.example .env.production

# Editar
nano .env.production
```

### **Paso 3: Generar JWT Secret**

```bash
# Generar secret seguro
openssl rand -base64 32

# Copiar el resultado a .env.production
```

### **Paso 4: Verificar Repositorio**

```bash
# Ver URL del repositorio
git remote -v

# Actualizar en ecosystem.config.js si es diferente
```

### **Paso 5: Preparar Servidor (Hostinger)**

**Conectar por SSH:**

```bash
ssh rafa@tu-servidor-hostinger.com
```

**Instalar PM2:**

```bash
# Instalar Node.js si no está instalado
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
npm install -g pm2

# Verificar
pm2 -v
node -v
```

**Crear estructura de directorios:**

```bash
# Crear directorio de deploy
mkdir -p /home/rafa/deploy/epidisease/lims/backend

# O si prefieres otra ubicación:
mkdir -p /home/rafa/apps/lims/backend
```

**Configurar PM2 para inicio automático:**

```bash
pm2 startup
# Ejecutar el comando que te devuelve
```

### **Paso 6: Configurar SSH Keys (si usas git con SSH)**

```bash
# En tu máquina local
ssh-copy-id rafa@tu-servidor-hostinger.com

# En el servidor, generar clave SSH para GitHub
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Mostrar clave pública
cat ~/.ssh/id_ed25519.pub

# Copiar y añadir a GitHub:
# https://github.com/settings/keys
```

---

## 📝 **Valores a Completar**

Copia esta plantilla y completa los valores:

```
┌─────────────────────────────────────────────────────┐
│ DATOS DE CONFIGURACIÓN                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Servidor Hostinger:                                 │
│   - Host/IP: _______________________________       │
│   - Usuario SSH: rafa                               │
│   - Ruta deploy: ____________________________      │
│                                                     │
│ Git:                                                │
│   - URL Repo: _______________________________      │
│   - SSH o HTTPS: ___________________________       │
│                                                     │
│ Base de Datos:                                      │
│   - Host: ___________________________________       │
│   - Puerto: 5432                                    │
│   - Nombre BD: _______________________________     │
│   - Usuario: _________________________________     │
│   - Password: ________________________________     │
│                                                     │
│ JWT:                                                │
│   - Secret: ___________________________________    │
│   - Expires: 24h                                    │
│                                                     │
│ Frontend:                                           │
│   - URL producción: ___________________________    │
│                                                     │
│ Performance:                                        │
│   - Instancias PM2: _____ (recomendado: 2)        │
│   - Memoria max: 1G                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 **Testing Local**

Antes de desplegar a producción, prueba localmente:

```bash
# 1. Compilar
npm run build

# 2. Iniciar con PM2 (desarrollo)
pm2 start ecosystem.config.js --env development

# 3. Ver logs
pm2 logs lims-backend

# 4. Verificar que funciona
curl http://localhost:3002/api/health

# 5. Detener
pm2 stop lims-backend
pm2 delete lims-backend
```

---

## 🚀 **Deploy a Producción**

Una vez configurado todo:

### **Opción A: Deploy Manual**

```bash
# Desde tu máquina local
pm2 deploy ecosystem.config.js production setup    # Solo primera vez
pm2 deploy ecosystem.config.js production          # Deploy
```

### **Opción B: Deploy desde Servidor**

```bash
# Conectar al servidor
ssh rafa@tu-servidor

# Clonar repositorio (solo primera vez)
cd /home/rafa/deploy/epidisease/lims/backend
git clone git@github.com:Rafixx/lims_backend.git .

# Instalar dependencias
npm ci

# Copiar .env.production
nano .env.production  # Completar variables

# Compilar
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Guardar configuración
pm2 save

# Ver status
pm2 status
```

---

## ❓ **Preguntas Frecuentes**

### **¿Cómo cambio el puerto en producción?**

```javascript
// ecosystem.config.js
env_production: {
  NODE_ENV: 'production',
  PORT: 8080, // Cambiar aquí
},
```

### **¿Cómo uso más workers?**

```javascript
instances: 4, // O 'max' para usar todos los CPUs
```

### **¿Cómo actualizo el código en producción?**

```bash
# SSH al servidor
ssh rafa@servidor

# Ir al directorio
cd /home/rafa/deploy/epidisease/lims/backend

# Pull de cambios
git pull

# Reinstalar si hay cambios en package.json
npm ci

# Recompilar
npm run build

# Recargar sin downtime
pm2 reload lims-backend
```

---

## 📚 **Próximos Pasos**

1. [ ] Completar valores en ecosystem.config.js
2. [ ] Crear .env.production con valores reales
3. [ ] Configurar servidor Hostinger (instalar PM2)
4. [ ] Probar deploy local
5. [ ] Deploy a producción
6. [ ] Configurar Nginx como reverse proxy
7. [ ] Configurar SSL (Let's Encrypt)
8. [ ] Configurar monitoring (PM2 Plus opcional)

---

**¿Necesitas ayuda con algún paso específico?** 🚀
