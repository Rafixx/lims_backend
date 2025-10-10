# ⚡ Quick Start: Primer Deploy a Hostinger

## 🎯 Objetivo

Configurar el servidor Hostinger y hacer el primer deploy del backend LIMS usando GitHub Actions.

---

## 📋 PASO 1: Configurar Secretos en GitHub (2 minutos)

1. Ve a tu repositorio: https://github.com/Rafixx/lims_backend

2. Click en **Settings** → **Secrets and variables** → **Actions**

3. Click en **New repository secret** y añade estos 3 secretos:

   **Secret 1:**

   ```
   Name: HOSTINGER_HOST
   Value: 185.166.39.240
   ```

   **Secret 2:**

   ```
   Name: HOSTINGER_USERNAME
   Value: root
   ```

   **Secret 3:**

   ```
   Name: HOSTINGER_PASSWORD
   Value: @cc3s5R00tHO5T:NGer
   ```

4. ✅ Verifica que los 3 secretos estén creados

---

## 🖥️ PASO 2: Preparar Servidor Hostinger (5-10 minutos)

### 2.1 Conectarse al servidor

```bash
ssh root@185.166.39.240
# Password: @cc3s5R00tHO5T:NGer
```

### 2.2 Instalar Node.js 20.x

```bash
# Descargar e instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
# Debe mostrar: v20.x.x

npm --version
# Debe mostrar: 10.x.x
```

### 2.3 Instalar PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalación
pm2 --version
# Debe mostrar: 5.x.x

# Configurar PM2 para iniciar en boot
pm2 startup systemd -u root --hp /root
```

### 2.4 Crear estructura de directorios

```bash
# Crear todos los directorios necesarios
mkdir -p /home/rafa/dev/epidisease/lims/lims_backend
mkdir -p /home/rafa/dev/epidisease/lims/logs
mkdir -p /home/rafa/backups/lims_backend
mkdir -p /home/rafa/deploy/epidisease/lims

# Verificar creación
ls -la /home/rafa/dev/epidisease/lims/
# Debe mostrar: lims_backend, logs
```

### 2.5 Crear archivo .env de producción

```bash
cd /home/rafa/dev/epidisease/lims/lims_backend

# Crear .env
nano .env
```

**Pega este contenido (ajusta los valores según tu configuración):**

```env
NODE_ENV=production
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lims_db
DB_USER=lims_user
DB_PASSWORD=TU_PASSWORD_DB_AQUI
DB_SCHEMA=lims_pre

# JWT
JWT_SECRET=un_secret_muy_seguro_de_minimo_32_caracteres
JWT_EXPIRES_IN=24h

# CORS (ajusta según tus dominios)
CORS_ORIGIN=http://185.166.39.240:3000,https://tu-dominio.com

# Logs
LOG_LEVEL=info
```

**Guardar:**

- Presiona `Ctrl + O` (guardar)
- Presiona `Enter` (confirmar)
- Presiona `Ctrl + X` (salir)

**Asegurar el archivo:**

```bash
chmod 600 .env

# Verificar
cat .env
ls -la .env
# Debe mostrar: -rw------- (solo el propietario puede leer/escribir)
```

### 2.6 Verificar PostgreSQL (opcional)

Si la base de datos no está configurada:

```bash
# Instalar PostgreSQL (si no está instalado)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE lims_db;
CREATE USER lims_user WITH PASSWORD 'TU_PASSWORD_AQUI';
GRANT ALL PRIVILEGES ON DATABASE lims_db TO lims_user;
\q

# Verificar conexión
psql -h localhost -U lims_user -d lims_db -c "SELECT 1"
```

### 2.7 Verificar firewall (opcional)

```bash
# Ver reglas actuales
sudo ufw status

# Si el firewall está activo y el puerto 3002 no está permitido:
sudo ufw allow 3002/tcp

# Recargar
sudo ufw reload
```

### 2.8 Resumen de verificación

```bash
# Ejecutar todos estos comandos para verificar
echo "=== Verificación del Servidor ==="
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo ""
echo "Directorios:"
ls -la /home/rafa/dev/epidisease/lims/
echo ""
echo ".env existe:"
ls -la /home/rafa/dev/epidisease/lims/lims_backend/.env
echo ""
echo "PostgreSQL:"
psql -h localhost -U lims_user -d lims_db -c "SELECT version()"
```

**✅ Si todo muestra versiones y no hay errores, el servidor está listo.**

---

## 🚀 PASO 3: Primer Deploy desde GitHub (2 minutos)

### Opción A: Deploy Automático (Recomendado)

```bash
# Desde tu máquina local
cd /home/rafa/dev/epidisease/lims/backend

# Asegúrate de estar en main y tener los últimos cambios
git checkout main
git pull origin main

# Hacer un pequeño cambio para trigger el deploy
# Por ejemplo, actualizar el README
echo "\n<!-- Deploy $(date) -->" >> README.md

# Commit y push
git add .
git commit -m "chore: trigger first deployment"
git push origin main
```

### Opción B: Deploy Manual desde GitHub

1. Ve a: https://github.com/Rafixx/lims_backend/actions
2. Click en **Deploy LIMS Backend to Hostinger**
3. Click en **Run workflow**
4. Selecciona:
   - Branch: `main`
   - Environment: `production`
5. Click **Run workflow**

### 3.1 Monitorear el Deploy

1. En GitHub Actions verás el workflow ejecutándose
2. Click en el workflow para ver logs en tiempo real
3. Espera a que todos los steps estén en verde ✅

**El proceso toma ~3-5 minutos:**

- ⏳ Checkout code
- ⏳ Setup Node.js
- ⏳ Install dependencies
- ⏳ Build TypeScript
- ⏳ Copy to server
- ⏳ Deploy with PM2

---

## ✅ PASO 4: Verificar el Deploy (1 minuto)

### 4.1 Verificar desde el servidor

```bash
# Conectarse al servidor
ssh root@185.166.39.240

# Ver estado de PM2
pm2 status
# Debe mostrar: lims-backend | online | 2 instancias

# Ver logs
pm2 logs lims-backend --lines 20
# Debe mostrar logs sin errores graves

# Ver detalles
pm2 show lims-backend
```

### 4.2 Verificar desde local

```bash
# Probar endpoint de health
curl http://185.166.39.240:3002/api/health

# Debe responder:
# {"status":"ok"}

# O desde el navegador:
# http://185.166.39.240:3002/api/health
```

### 4.3 Probar endpoints de la API

```bash
# Listar estados (endpoint público)
curl http://185.166.39.240:3002/api/estados

# Debe responder con un JSON de estados

# Probar login
curl -X POST http://185.166.39.240:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🎉 ¡Deploy Completado!

Si todos los checks anteriores funcionaron:

✅ Servidor configurado correctamente  
✅ GitHub Actions funcionando  
✅ PM2 ejecutando la aplicación  
✅ API respondiendo correctamente

---

## 🔄 Próximos Deploys

Ahora que todo está configurado, los próximos deploys son automáticos:

```bash
# 1. Trabajar en feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... editar archivos ...

# 3. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub

# 5. Merge a main
# GitHub Actions despliega automáticamente ✨
```

---

## 📊 Comandos de Monitoreo Diario

```bash
# Ver estado (desde local)
ssh root@185.166.39.240 "pm2 status"

# Ver logs en tiempo real (desde local)
ssh root@185.166.39.240 "pm2 logs lims-backend"

# Ver logs recientes
ssh root@185.166.39.240 "pm2 logs lims-backend --lines 100"

# Reiniciar si necesario
ssh root@185.166.39.240 "pm2 reload lims-backend"

# Ver uso de recursos
ssh root@185.166.39.240 "pm2 monit"
```

---

## 🐛 Troubleshooting Rápido

### Deploy falla en GitHub Actions

1. Ve a Actions → Click en workflow fallido
2. Lee el error del step que falló
3. Verifica secretos en GitHub
4. Verifica que el servidor sea accesible

### PM2 no inicia

```bash
ssh root@185.166.39.240
cd /home/rafa/dev/epidisease/lims/lims_backend
pm2 logs lims-backend --err
```

### API no responde

```bash
# Verificar que PM2 esté corriendo
ssh root@185.166.39.240 "pm2 status"

# Verificar puerto
ssh root@185.166.39.240 "netstat -tlnp | grep 3002"

# Verificar logs
ssh root@185.166.39.240 "pm2 logs lims-backend --lines 50"
```

### Base de datos no conecta

```bash
# Verificar .env
ssh root@185.166.39.240 "cat /home/rafa/dev/epidisease/lims/lims_backend/.env"

# Probar conexión
ssh root@185.166.39.240 "psql -h localhost -U lims_user -d lims_db -c 'SELECT 1'"
```

---

## 📚 Documentación Completa

- **Resumen General**: [DEPLOY_RESUMEN.md](./DEPLOY_RESUMEN.md)
- **Guía Detallada**: [DEPLOY_GITHUB_ACTIONS.md](./DEPLOY_GITHUB_ACTIONS.md)
- **README**: [README.md](./README.md)

---

## 🎓 Checklist Final

Antes de dar por terminada la configuración:

- [ ] Secretos de GitHub configurados
- [ ] Node.js 20.x instalado en servidor
- [ ] PM2 instalado y configurado para startup
- [ ] Directorios creados
- [ ] .env creado y configurado
- [ ] PostgreSQL funcionando
- [ ] Primer deploy exitoso
- [ ] `pm2 status` muestra app online
- [ ] API responde en puerto 3002
- [ ] Endpoints funcionan correctamente

---

**¿Todo listo? 🚀**

¡Felicidades! Tu backend LIMS está desplegado en producción con deploy automático vía GitHub Actions.

Cualquier merge a `main` ahora desplegará automáticamente con zero-downtime gracias a PM2.
