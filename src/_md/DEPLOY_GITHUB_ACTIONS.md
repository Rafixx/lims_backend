# 🚀 Despliegue Automático con GitHub Actions

## 📋 Resumen

Este proyecto usa **GitHub Actions** para despliegue automático a Hostinger cuando se hace merge a la rama `main`.

## 🔄 Flujo de Trabajo

```
1. Trabajar en rama feature/xx
2. Hacer commit y push de cambios
3. Crear Pull Request a main
4. Review y merge a main
5. GitHub Actions se activa automáticamente
6. Deploy a Hostinger con PM2 (zero-downtime)
```

## ⚙️ Configuración Inicial

### 1. Secretos de GitHub

Configura estos secretos en tu repositorio (Settings → Secrets and variables → Actions):

```bash
HOSTINGER_HOST=185.166.39.240
HOSTINGER_USERNAME=root
HOSTINGER_PASSWORD=
```

### 2. Preparar Servidor (Primera Vez)

Conéctate al servidor y prepara el entorno:

```bash
ssh root@185.166.39.240
```

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
npm install -g pm2

# Crear estructura de directorios
mkdir -p /home/rafa/dev/epidisease/lims/lims_backend
mkdir -p /home/rafa/dev/epidisease/lims/logs
mkdir -p /home/rafa/backups/lims_backend
mkdir -p /home/rafa/deploy/epidisease/lims

# Crear archivo .env en el servidor
cd /home/rafa/dev/epidisease/lims/lims_backend
nano .env
```

**Contenido del .env en producción:**

```bash
NODE_ENV=production
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lims_db
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db

# JWT
JWT_SECRET=tu_secret_seguro_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://185.166.39.240:3000,https://tu-dominio.com
```

### 3. Verificar Configuración

```bash
# Verificar Node.js
node --version  # Debe ser v20.x

# Verificar PM2
pm2 --version

# Verificar estructura
ls -la /home/rafa/dev/epidisease/lims/
```

## 🎯 Uso Diario

### Trabajar en Nueva Feature

```bash
# Crear rama feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios...
git add .
git commit -m "feat: descripción de cambios"

# Push a GitHub
git push origin feature/nueva-funcionalidad
```

### Desplegar a Producción

```bash
# 1. Crear Pull Request en GitHub
# Ve a: https://github.com/Rafixx/lims_backend/compare

# 2. Review del código

# 3. Merge to main
# GitHub Actions se ejecuta automáticamente

# 4. Ver progreso del deploy
# Ve a: https://github.com/Rafixx/lims_backend/actions
```

### Despliegue Manual (Opcional)

Puedes activar el workflow manualmente desde GitHub:

1. Ve a **Actions** → **Deploy LIMS Backend to Hostinger**
2. Click en **Run workflow**
3. Selecciona branch `main` y environment `production`
4. Click **Run workflow**

## 📊 Monitoreo Post-Deploy

### Ver Estado de PM2

```bash
ssh root@185.166.39.240

# Ver procesos
pm2 status

# Ver logs en tiempo real
pm2 logs lims-backend

# Ver logs recientes
pm2 logs lims-backend --lines 50
```

### Ver Logs del Sistema

```bash
# Logs de PM2
tail -f /home/rafa/dev/epidisease/lims/logs/backend-combined.log

# Logs de errores
tail -f /home/rafa/dev/epidisease/lims/logs/backend-err.log

# Logs de salida
tail -f /home/rafa/dev/epidisease/lims/logs/backend-out.log
```

### Verificar Aplicación

```bash
# Desde local
curl http://185.166.39.240:3002/api/health

# Desde el servidor
curl http://localhost:3002/api/health
```

## 🔧 Gestión de PM2

### Comandos Útiles

```bash
# Ver estado detallado
pm2 show lims-backend

# Reiniciar (con downtime)
pm2 restart lims-backend

# Reload (zero-downtime)
pm2 reload lims-backend

# Detener
pm2 stop lims-backend

# Ver logs
pm2 logs lims-backend

# Monitoreo en tiempo real
pm2 monit

# Limpiar logs antiguos
pm2 flush

# Ver información de memoria/CPU
pm2 describe lims-backend
```

### Escalar Instancias

```bash
# Aumentar a 4 instancias
pm2 scale lims-backend 4

# Reducir a 1 instancia
pm2 scale lims-backend 1

# Volver a configuración por defecto (2 instancias)
pm2 reload ecosystem.config.js --env production
```

## 🐛 Troubleshooting

### Deploy Falla en GitHub Actions

**Ver logs del workflow:**

1. Ve a Actions en GitHub
2. Selecciona el workflow fallido
3. Revisa cada step

**Causas comunes:**

- Secretos mal configurados
- Servidor inaccesible
- Puerto 3002 ya en uso
- Permisos insuficientes

### PM2 No Inicia

```bash
# Ver logs de error
pm2 logs lims-backend --err

# Verificar archivo de configuración
cat /home/rafa/dev/epidisease/lims/lims_backend/ecosystem.config.js

# Intentar iniciar manualmente
cd /home/rafa/dev/epidisease/lims/lims_backend
pm2 start ecosystem.config.js --env production

# Ver procesos huérfanos
ps aux | grep node
```

### Puerto 3002 en Uso

```bash
# Ver qué proceso usa el puerto
lsof -i :3002
netstat -tlnp | grep 3002

# Matar proceso específico
kill -9 <PID>

# O detener PM2 y reiniciar
pm2 stop all
pm2 start ecosystem.config.js --env production
```

### Restaurar Backup

```bash
# Ver backups disponibles
ls -lh /home/rafa/backups/lims_backend/

# Restaurar backup específico
cd /home/rafa/dev/epidisease/lims/lims_backend
rm -rf dist/
cp -r /home/rafa/backups/lims_backend/backup_YYYYMMDD_HHMMSS/dist .

# Reiniciar PM2
pm2 reload lims-backend
```

### Aplicación No Responde

```bash
# 1. Verificar estado
pm2 status

# 2. Ver logs
pm2 logs lims-backend --lines 100

# 3. Verificar memoria
pm2 describe lims-backend

# 4. Reiniciar si necesario
pm2 restart lims-backend

# 5. Verificar base de datos
psql -U tu_usuario -d lims_db -c "SELECT 1"

# 6. Verificar .env
cat /home/rafa/dev/epidisease/lims/lims_backend/.env
```

### Error de Dependencias

```bash
# Limpiar e instalar de nuevo
cd /home/rafa/dev/epidisease/lims/lims_backend
rm -rf node_modules package-lock.json
npm ci --only=production

# Reiniciar PM2
pm2 restart lims-backend
```

## 📂 Estructura de Archivos en Servidor

```
/home/rafa/
├── dev/epidisease/lims/
│   ├── lims_backend/              # Aplicación principal
│   │   ├── dist/                  # Código compilado
│   │   ├── node_modules/          # Dependencias
│   │   ├── .env                   # Variables de entorno
│   │   ├── ecosystem.config.js    # Configuración PM2
│   │   └── package.json
│   └── logs/                      # Logs centralizados
│       ├── backend-combined.log
│       ├── backend-err.log
│       └── backend-out.log
├── backups/lims_backend/          # Backups automáticos
│   ├── backup_20250110_120000/
│   ├── backup_20250110_140000/
│   └── ...
└── deploy/epidisease/lims/        # Directorio temporal
    └── deploy.tar.gz
```

## 🔐 Seguridad

### Variables Sensibles

❌ **NUNCA** hagas commit de:

- `.env` con valores reales
- Contraseñas o tokens
- Claves privadas SSH

✅ **SIEMPRE** usa:

- GitHub Secrets para credenciales
- `.env.example` para plantillas
- `.gitignore` para archivos sensibles

### Permisos de Archivos

```bash
# .env debe ser privado
chmod 600 /home/rafa/dev/epidisease/lims/lims_backend/.env

# Verificar permisos
ls -la /home/rafa/dev/epidisease/lims/lims_backend/.env
```

## 📈 Mejoras Futuras

### Configurar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
apt-get install nginx

# Configurar proxy
nano /etc/nginx/sites-available/lims-backend
```

**Contenido:**

```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar configuración
ln -s /etc/nginx/sites-available/lims-backend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
apt-get install certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d api.tudominio.com

# Renovación automática (cron)
crontab -e
# Añadir: 0 0 * * * certbot renew --quiet
```

### Notificaciones de Deploy

Añade un step al final del workflow:

```yaml
- name: Notify deployment
  if: success()
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      ✅ LIMS Backend deployed successfully!
      Branch: ${{ github.ref_name }}
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}
```

## 📞 Contacto y Soporte

- **Repositorio**: https://github.com/Rafixx/lims_backend
- **Issues**: https://github.com/Rafixx/lims_backend/issues
- **Servidor**: 185.166.39.240

## 📚 Referencias

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
