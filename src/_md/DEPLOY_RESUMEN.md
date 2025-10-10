# 🎯 RESUMEN: Deploy Automático con GitHub Actions

## ✅ Lo que se ha configurado

### 1. **GitHub Actions Workflow**

📁 `.github/workflows/deploy_HOSTINGER.yml`

**Trigger**: Push o merge a rama `main`

**Proceso**:

1. ✅ Checkout del código
2. ✅ Setup Node.js 20
3. ✅ Install dependencies (`npm ci`)
4. ✅ Build TypeScript → `dist/`
5. ✅ Crear paquete de deployment (dist + config)
6. ✅ Copiar a Hostinger via SSH
7. ✅ Extraer en servidor
8. ✅ Install dependencies en producción
9. ✅ Deploy con PM2 (zero-downtime reload)
10. ✅ Backup automático (últimos 5)

### 2. **PM2 Configuration**

📁 `ecosystem.config.js`

- **Instancias**: 2 workers en cluster mode
- **Memoria**: 512MB por worker (1GB total)
- **Puerto**: 3002
- **Logs**: `/home/rafa/dev/epidisease/lims/logs/`
- **Auto-restart**: Sí
- **Zero-downtime**: Reload en lugar de restart

### 3. **Secretos en GitHub**

🔐 Configurados en: Settings → Secrets → Actions

```
HOSTINGER_HOST = 185.166.39.240
HOSTINGER_USERNAME = root
HOSTINGER_PASSWORD = @cc3s5R00tHO5T:NGer
```

### 4. **Estructura en Servidor**

```
/home/rafa/
├── dev/epidisease/lims/
│   ├── lims_backend/           # Aplicación
│   │   ├── dist/               # Compilado
│   │   ├── node_modules/
│   │   ├── .env                # ⚠️ CREAR MANUALMENTE
│   │   ├── ecosystem.config.js
│   │   └── package.json
│   └── logs/                   # Logs centralizados
│       ├── backend-combined.log
│       ├── backend-err.log
│       └── backend-out.log
├── backups/lims_backend/       # Backups automáticos
└── deploy/epidisease/lims/     # Temp deployment
```

## 🚀 Cómo usar

### Desarrollo diario

```bash
# 1. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: descripción"
git push origin feature/nueva-funcionalidad

# 3. Crear PR en GitHub
# 4. Hacer merge a main
# 5. GitHub Actions despliega automáticamente ✨
```

### Ver el deploy en acción

1. Ve a: https://github.com/Rafixx/lims_backend/actions
2. Verás el workflow ejecutándose
3. Click en el workflow para ver logs detallados

## ⚙️ Configuración Inicial del Servidor (SOLO UNA VEZ)

**Conectarse al servidor:**

```bash
ssh root@185.166.39.240
```

**1. Instalar Node.js 20.x:**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verificar: v20.x
```

**2. Instalar PM2:**

```bash
npm install -g pm2
pm2 --version  # Verificar instalación
```

**3. Crear directorios:**

```bash
mkdir -p /home/rafa/dev/epidisease/lims/lims_backend
mkdir -p /home/rafa/dev/epidisease/lims/logs
mkdir -p /home/rafa/backups/lims_backend
mkdir -p /home/rafa/deploy/epidisease/lims
```

**4. Crear archivo .env de producción:**

```bash
cd /home/rafa/dev/epidisease/lims/lims_backend
nano .env
```

**Contenido del .env:**

```env
NODE_ENV=production
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lims_db
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db

# JWT
JWT_SECRET=un_secret_muy_seguro_aqui_cambialo
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://185.166.39.240:3000,https://tu-dominio.com
```

**5. Guardar y verificar:**

```bash
# Guardar: Ctrl+O, Enter
# Salir: Ctrl+X

# Verificar
cat .env

# Permisos seguros
chmod 600 .env
```

## 🎬 Primer Deploy

### Opción 1: Merge a main

```bash
# Desde tu local
git checkout main
git pull origin main
git push origin main
# GitHub Actions se activa automáticamente
```

### Opción 2: Manual desde GitHub

1. Ve a: https://github.com/Rafixx/lims_backend/actions
2. Click en "Deploy LIMS Backend to Hostinger"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

## 📊 Monitoreo

### Ver estado PM2

```bash
ssh root@185.166.39.240 "pm2 status"
```

### Ver logs en tiempo real

```bash
ssh root@185.166.39.240 "pm2 logs lims-backend"
```

### Ver logs del sistema

```bash
ssh root@185.166.39.240 "tail -f /home/rafa/dev/epidisease/lims/logs/backend-combined.log"
```

### Probar la API

```bash
# Desde local
curl http://185.166.39.240:3002/api/health

# Debería responder: {"status":"ok"}
```

## 🔧 Comandos Útiles

### En el servidor

```bash
# Conectarse
ssh root@185.166.39.240

# Ver estado
pm2 status

# Ver logs
pm2 logs lims-backend

# Ver detalles
pm2 show lims-backend

# Reiniciar (con downtime)
pm2 restart lims-backend

# Reload (zero-downtime)
pm2 reload lims-backend

# Escalar instancias
pm2 scale lims-backend 4  # 4 workers
pm2 scale lims-backend 2  # volver a 2

# Monitoreo
pm2 monit
```

### Desde local (via SSH)

```bash
# Status
ssh root@185.166.39.240 "pm2 status"

# Logs
ssh root@185.166.39.240 "pm2 logs lims-backend --lines 50"

# Restart
ssh root@185.166.39.240 "pm2 restart lims-backend"
```

## 🐛 Troubleshooting

### Deploy falla en GitHub Actions

1. Ve a Actions en GitHub
2. Click en el workflow fallido
3. Revisa el log del step que falló

**Causas comunes:**

- ❌ Secretos mal configurados
- ❌ Servidor inaccesible
- ❌ .env no existe en servidor
- ❌ PM2 no instalado

### PM2 no inicia

```bash
ssh root@185.166.39.240

# Ver error específico
pm2 logs lims-backend --err

# Intentar inicio manual
cd /home/rafa/dev/epidisease/lims/lims_backend
pm2 start ecosystem.config.js --env production
```

### Puerto 3002 ocupado

```bash
ssh root@185.166.39.240

# Ver qué usa el puerto
lsof -i :3002
netstat -tlnp | grep 3002

# Matar proceso
kill -9 <PID>

# O detener PM2 y reiniciar
pm2 stop all
pm2 start ecosystem.config.js --env production
```

### Restaurar backup

```bash
ssh root@185.166.39.240

# Ver backups
ls -lh /home/rafa/backups/lims_backend/

# Restaurar
cd /home/rafa/dev/epidisease/lims/lims_backend
rm -rf dist/
cp -r /home/rafa/backups/lims_backend/backup_YYYYMMDD_HHMMSS/dist .
pm2 reload lims-backend
```

## 📋 Checklist Pre-Deploy

Antes del primer deploy, verifica:

- [ ] Secretos de GitHub configurados (HOSTINGER_HOST, USERNAME, PASSWORD)
- [ ] Node.js 20.x instalado en servidor
- [ ] PM2 instalado globalmente
- [ ] Directorios creados en servidor
- [ ] Archivo .env creado en servidor
- [ ] PostgreSQL configurado y accesible
- [ ] Puerto 3002 disponible
- [ ] Firewall permite conexiones al 3002 (si aplica)

## 🎓 Flujo de Trabajo Recomendado

```
1. feature/nueva-funcionalidad  →  Desarrollo local
   ↓
2. git push origin feature/nueva-funcionalidad
   ↓
3. Pull Request en GitHub
   ↓
4. Code Review
   ↓
5. Merge to main
   ↓
6. GitHub Actions se activa automáticamente
   ↓
7. Build → Deploy → PM2 Reload
   ↓
8. Verificar en 185.166.39.240:3002
```

## 📚 Documentación Adicional

- **Completa**: [DEPLOY_GITHUB_ACTIONS.md](./DEPLOY_GITHUB_ACTIONS.md)
- **README**: [README.md](./README.md) (sección Deployment)
- **PM2**: https://pm2.keymetrics.io/docs/
- **GitHub Actions**: https://docs.github.com/en/actions

## ⚡ Ventajas de este Setup

✅ **Deploy Automático**: Merge a main = deploy automático  
✅ **Zero-Downtime**: PM2 reload sin interrupciones  
✅ **Backups**: Automáticos antes de cada deploy  
✅ **Logs Centralizados**: Fácil troubleshooting  
✅ **Escalable**: Fácil aumentar workers  
✅ **Seguro**: Secretos en GitHub, no en código  
✅ **Rollback**: Backups disponibles  
✅ **Monitoreable**: PM2 logs y status en tiempo real

## 🎯 Próximos Pasos Opcionales

1. **Nginx Reverse Proxy** (recomendado)

   - Proxy pass a localhost:3002
   - Mejor manejo de SSL
   - Load balancing adicional

2. **SSL con Let's Encrypt** (recomendado)

   - HTTPS gratis
   - Auto-renovación

3. **Monitoreo Avanzado**

   - PM2 Plus (keymetrics.io)
   - Notificaciones Slack/Telegram

4. **CI/CD Avanzado**
   - Tests automáticos antes de deploy
   - Deploy a staging primero
   - Smoke tests post-deploy

---

**¿Listo para el primer deploy?**

1. ✅ Configura secretos en GitHub
2. ✅ Prepara el servidor (Node.js, PM2, directorios, .env)
3. ✅ Haz merge a main
4. ✅ GitHub Actions hace el resto ✨
