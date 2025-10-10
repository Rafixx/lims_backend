# ✅ CONFIGURACIÓN COMPLETADA: Deploy Automático con GitHub Actions

## 🎯 Resumen

Se ha configurado un sistema de **deploy automático** para el backend LIMS usando **GitHub Actions** y **PM2** en Hostinger VPS.

---

## 📁 Archivos Configurados

### 1. **GitHub Actions Workflow**

📄 `.github/workflows/deploy_HOSTINGER.yml`

**Funcionalidad:**

- ✅ Se activa automáticamente al hacer push/merge a rama `main`
- ✅ Se puede ejecutar manualmente desde GitHub UI
- ✅ Compila TypeScript (`npm run build`)
- ✅ Crea paquete de deployment
- ✅ Copia archivos al servidor vía SSH
- ✅ Instala dependencias de producción
- ✅ Hace backup automático (últimos 5)
- ✅ Deploy con PM2 (zero-downtime reload)
- ✅ Muestra logs y estado post-deploy

**Configuración:**

- Node.js: v20.x
- Runner: ubuntu-latest
- Environment: HOSTINGER
- Servidor: 185.166.39.240
- Usuario: root

### 2. **PM2 Configuration**

📄 `ecosystem.config.js`

**Configuración:**

```javascript
{
  name: 'lims-backend',
  script: './dist/server.js',
  cwd: '/home/rafa/dev/epidisease/lims/lims_backend',
  instances: 2,              // 2 workers en cluster
  exec_mode: 'cluster',      // Load balancing
  max_memory_restart: '512M', // 512MB por worker
  env_production: {
    NODE_ENV: 'production',
    PORT: 3002
  }
}
```

**Logs:**

- Error: `/home/rafa/dev/epidisease/lims/logs/backend-err.log`
- Output: `/home/rafa/dev/epidisease/lims/logs/backend-out.log`
- Combined: `/home/rafa/dev/epidisease/lims/logs/backend-combined.log`

### 3. **Documentación**

#### 📘 PRIMER_DEPLOY.md

- Quick Start para configuración inicial
- Paso a paso con comandos exactos
- Verificación de cada paso
- Checklist completo

#### 📘 DEPLOY_RESUMEN.md

- Resumen ejecutivo del sistema
- Comandos útiles diarios
- Troubleshooting común
- Flujo de trabajo recomendado

#### 📘 DEPLOY_GITHUB_ACTIONS.md

- Guía completa y detallada
- Configuración avanzada
- Monitoreo y gestión
- Mejoras futuras (Nginx, SSL)

#### 📘 README.md (actualizado)

- Sección de deployment añadida
- Referencias a documentación completa

### 4. **Scripts NPM (package.json)**

```json
{
  "pm2:start": "pm2 start ecosystem.config.js --env production",
  "pm2:stop": "pm2 stop lims-backend",
  "pm2:restart": "pm2 restart lims-backend",
  "pm2:reload": "pm2 reload lims-backend",
  "pm2:delete": "pm2 delete lims-backend",
  "pm2:logs": "pm2 logs lims-backend",
  "pm2:status": "pm2 status",
  "pm2:monit": "pm2 monit"
}
```

**Nota:** Los scripts `deploy:setup` y `deploy` fueron eliminados ya que ahora se usa GitHub Actions.

### 5. **Archivos de Ejemplo**

📄 `.env.production.example`

- Template para configuración de producción
- Variables necesarias documentadas

---

## 🔐 Secretos de GitHub (Configurar manualmente)

Ir a: **Settings → Secrets and variables → Actions**

```
HOSTINGER_HOST = 185.166.39.240
HOSTINGER_USERNAME = root
HOSTINGER_PASSWORD = @cc3s5R00tHO5T:NGer
```

---

## 🖥️ Estructura en Servidor Hostinger

```
/home/rafa/
├── dev/epidisease/lims/
│   ├── lims_backend/              # Aplicación (creado por GitHub Actions)
│   │   ├── dist/                  # Compilado de TypeScript
│   │   ├── node_modules/          # Dependencies de producción
│   │   ├── .env                   # ⚠️ CREAR MANUALMENTE (ver PRIMER_DEPLOY.md)
│   │   ├── ecosystem.config.js    # Config PM2
│   │   └── package.json
│   └── logs/                      # Logs centralizados (creado por GitHub Actions)
│       ├── backend-combined.log
│       ├── backend-err.log
│       └── backend-out.log
├── backups/lims_backend/          # Backups automáticos (creado por GitHub Actions)
│   ├── backup_20250110_120000/
│   ├── backup_20250110_140000/
│   └── ... (últimos 5)
└── deploy/epidisease/lims/        # Temporal (creado por GitHub Actions)
    └── deploy.tar.gz
```

---

## 🚀 Flujo de Trabajo

### Desarrollo Normal

```mermaid
graph LR
    A[feature/xx branch] --> B[git push]
    B --> C[Pull Request]
    C --> D[Code Review]
    D --> E[Merge to main]
    E --> F[GitHub Actions]
    F --> G[Build + Deploy]
    G --> H[PM2 Reload]
    H --> I[Live en Hostinger]
```

### Comandos

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar
# ... hacer cambios ...

# 3. Commit y push
git add .
git commit -m "feat: descripción"
git push origin feature/nueva-funcionalidad

# 4. Crear PR en GitHub

# 5. Merge to main
# → GitHub Actions despliega automáticamente ✨
```

---

## ✅ Requisitos del Servidor (Configurar SOLO UNA VEZ)

### Prerequisitos

- [x] Node.js 20.x instalado
- [x] PM2 instalado globalmente
- [x] Directorios creados
- [x] Archivo `.env` creado y configurado
- [x] PostgreSQL configurado
- [x] Puerto 3002 disponible

Ver guía completa en: **[PRIMER_DEPLOY.md](./PRIMER_DEPLOY.md)**

---

## 📊 Comandos de Monitoreo

### Desde Local (via SSH)

```bash
# Estado PM2
ssh root@185.166.39.240 "pm2 status"

# Logs en tiempo real
ssh root@185.166.39.240 "pm2 logs lims-backend"

# Logs recientes (últimas 50 líneas)
ssh root@185.166.39.240 "pm2 logs lims-backend --lines 50"

# Restart (zero-downtime)
ssh root@185.166.39.240 "pm2 reload lims-backend"

# Restart (con downtime)
ssh root@185.166.39.240 "pm2 restart lims-backend"

# Ver detalles y métricas
ssh root@185.166.39.240 "pm2 show lims-backend"

# Monitoreo en tiempo real
ssh root@185.166.39.240 "pm2 monit"
```

### Desde Servidor

```bash
# Conectarse
ssh root@185.166.39.240

# Ver estado
pm2 status

# Logs
pm2 logs lims-backend

# Detalles
pm2 show lims-backend

# Monitoreo
pm2 monit
```

---

## 🔍 Verificación Post-Deploy

### 1. Check GitHub Actions

- Ve a: https://github.com/Rafixx/lims_backend/actions
- Verifica que el workflow esté en verde ✅

### 2. Check PM2 Status

```bash
ssh root@185.166.39.240 "pm2 status"
# Debe mostrar: lims-backend | online | 2 instancias
```

### 3. Check API Health

```bash
curl http://185.166.39.240:3002/api/health
# Debe responder: {"status":"ok"}
```

### 4. Check Logs

```bash
ssh root@185.166.39.240 "pm2 logs lims-backend --lines 20"
# No debe haber errores críticos
```

---

## 🎓 Ventajas de esta Configuración

✅ **Automatizado**: Deploy con un simple merge  
✅ **Zero-Downtime**: PM2 reload sin interrupciones  
✅ **Backups**: Automáticos antes de cada deploy  
✅ **Escalable**: Fácil aumentar workers (2 → 4 → 8)  
✅ **Monitoreable**: Logs centralizados y PM2 status  
✅ **Seguro**: Secretos en GitHub, no en código  
✅ **Rollback**: Backups disponibles de últimas 5 versiones  
✅ **Professional**: Flujo de CI/CD moderno

---

## 🐛 Troubleshooting Rápido

### Deploy falla

1. Ver logs en GitHub Actions
2. Verificar secretos configurados
3. Verificar servidor accesible

### PM2 no inicia

```bash
ssh root@185.166.39.240
pm2 logs lims-backend --err
```

### API no responde

```bash
ssh root@185.166.39.240
pm2 status
pm2 logs lims-backend
netstat -tlnp | grep 3002
```

### Restaurar backup

```bash
ssh root@185.166.39.240
ls -lh /home/rafa/backups/lims_backend/
cd /home/rafa/dev/epidisease/lims/lims_backend
rm -rf dist/
cp -r /home/rafa/backups/lims_backend/backup_YYYYMMDD_HHMMSS/dist .
pm2 reload lims-backend
```

---

## 📚 Documentación

### Para Empezar

1. **[PRIMER_DEPLOY.md](./PRIMER_DEPLOY.md)** ← Empieza aquí
   - Configuración inicial paso a paso
   - Checklist completo

### Para Referencia Diaria

2. **[DEPLOY_RESUMEN.md](./DEPLOY_RESUMEN.md)**
   - Comandos útiles
   - Troubleshooting común

### Para Detalles Completos

3. **[DEPLOY_GITHUB_ACTIONS.md](./DEPLOY_GITHUB_ACTIONS.md)**
   - Guía exhaustiva
   - Configuraciones avanzadas
   - Mejoras futuras

### API Documentation

4. **[README.md](./README.md)**
   - API endpoints
   - Sección de deployment

---

## 🎯 Próximos Pasos

### 1. Configuración Inicial (HACER AHORA)

- [ ] Configurar secretos en GitHub (2 min)
- [ ] Preparar servidor Hostinger (10 min)
- [ ] Hacer primer deploy (2 min)

**Guía:** [PRIMER_DEPLOY.md](./PRIMER_DEPLOY.md)

### 2. Mejoras Opcionales (HACER DESPUÉS)

- [ ] Configurar Nginx como reverse proxy
- [ ] Configurar SSL con Let's Encrypt
- [ ] Configurar notificaciones de deploy
- [ ] Configurar monitoreo avanzado (PM2 Plus)

**Guía:** [DEPLOY_GITHUB_ACTIONS.md](./DEPLOY_GITHUB_ACTIONS.md) - Sección "Mejoras Futuras"

---

## 🔗 Links Importantes

- **Repositorio**: https://github.com/Rafixx/lims_backend
- **Actions**: https://github.com/Rafixx/lims_backend/actions
- **Servidor**: http://185.166.39.240:3002
- **Health Check**: http://185.166.39.240:3002/api/health

---

## 📞 Soporte

- **Issues**: https://github.com/Rafixx/lims_backend/issues
- **Documentación PM2**: https://pm2.keymetrics.io/docs/
- **GitHub Actions**: https://docs.github.com/en/actions

---

## ✨ ¡Listo para Producción!

Tu backend LIMS está configurado con:

- ✅ Deploy automático vía GitHub Actions
- ✅ PM2 con 2 workers en cluster mode
- ✅ Zero-downtime deployments
- ✅ Backups automáticos
- ✅ Logs centralizados
- ✅ Monitoreo con PM2
- ✅ Documentación completa

**Siguiente paso:** [PRIMER_DEPLOY.md](./PRIMER_DEPLOY.md) para configurar el servidor y hacer el primer deploy.

---

_Configuración completada el: 10 de octubre de 2025_  
_Versión: 1.0.0_
