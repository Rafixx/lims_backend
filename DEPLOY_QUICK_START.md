# 🚀 Deploy Rápido - LIMS Backend

## 📋 Resumen de Configuración

```
Servidor:  185.166.39.240
Usuario:   root
Repo:      https://github.com/Rafixx/lims_backend.git
Path:      /home/rafa/dev/epidisease/lims/lims_backend
Logs:      /home/rafa/dev/epidisease/lims/logs
Puerto:    3002
Workers:   2 instancias
```

---

## 🎯 Comandos Rápidos

### **Primera vez - Setup Inicial**

```bash
# Ejecutar script de setup (automático)
npm run deploy:setup

# O manualmente:
bash scripts/setup-hostinger.sh
```

### **Actualizaciones - Deploy Regular**

```bash
# Deploy rápido (automático)
npm run deploy

# O manualmente:
bash scripts/deploy-to-hostinger.sh
```

### **Gestión de PM2 (en servidor)**

```bash
# Conectar al servidor
ssh root@185.166.39.240

# Ver estado
pm2 status
npm run pm2:status

# Ver logs
pm2 logs lims-backend
npm run pm2:logs

# Recargar sin downtime
pm2 reload lims-backend
npm run pm2:reload

# Reiniciar
pm2 restart lims-backend
npm run pm2:restart

# Detener
pm2 stop lims-backend
npm run pm2:stop

# Monitoreo en tiempo real
pm2 monit
npm run pm2:monit
```

---

## 📚 Documentación Completa

- **`DEPLOY_HOSTINGER_GUIDE.md`** - Guía detallada paso a paso
- **`ECOSYSTEM_CONFIG_GUIDE.md`** - Configuración de PM2
- **`ecosystem.config.js`** - Configuración actual

---

## ⚡ Scripts NPM Disponibles

```json
{
  "dev": "Iniciar en desarrollo con nodemon",
  "build": "Compilar TypeScript a dist/",
  "start": "Ejecutar servidor compilado",

  "pm2:start": "Iniciar con PM2 en producción",
  "pm2:stop": "Detener PM2",
  "pm2:restart": "Reiniciar PM2",
  "pm2:reload": "Recargar sin downtime",
  "pm2:logs": "Ver logs de PM2",
  "pm2:status": "Ver estado de PM2",
  "pm2:monit": "Monitor de PM2",

  "deploy:setup": "Setup inicial en Hostinger (solo 1 vez)",
  "deploy": "Deploy/actualización a Hostinger"
}
```

---

## 🔍 Verificación Post-Deploy

### **Desde el servidor:**

```bash
# Conectar
ssh root@185.166.39.240

# Ver estado
pm2 status

# Ver logs
pm2 logs lims-backend --lines 50

# Probar endpoint
curl http://localhost:3002/api/health
curl http://localhost:3002/api/estados
```

### **Desde tu máquina:**

```bash
# Probar endpoint externo
curl http://185.166.39.240:3002/api/health
```

---

## ⚠️ Solución de Problemas

### **PM2 no está corriendo**

```bash
ssh root@185.166.39.240
pm2 start ecosystem.config.js --env production
pm2 save
```

### **Puerto ocupado**

```bash
ssh root@185.166.39.240
lsof -i :3002
kill -9 [PID]
pm2 restart lims-backend
```

### **Error de compilación**

```bash
ssh root@185.166.39.240
cd /home/rafa/dev/epidisease/lims/lims_backend
rm -rf node_modules dist
npm ci
npm run build
pm2 restart lims-backend
```

### **Ver logs de error**

```bash
ssh root@185.166.39.240
pm2 logs lims-backend --err --lines 100
```

---

## 📞 Ayuda

Si tienes problemas, consulta:

1. `DEPLOY_HOSTINGER_GUIDE.md` - Guía completa
2. Logs de PM2: `pm2 logs lims-backend`
3. Logs del sistema: `/home/rafa/dev/epidisease/lims/logs/`

---

**¡Listo para deploy!** 🚀
