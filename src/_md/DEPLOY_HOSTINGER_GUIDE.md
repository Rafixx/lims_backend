# 🚀 Guía de Deploy a Hostinger - LIMS Backend

## 📋 Información del Servidor

```
Host: 185.166.39.240
Usuario: root
Puerto SSH: 22 (default)


Estructura de Directorios:
/home/rafa/dev/epidisease/lims/
├── lims_backend/          # Repositorio Git (código fuente)
│   ├── src/
│   ├── dist/              # Compilado TypeScript
│   ├── .env               # Variables de entorno
│   └── ecosystem.config.js
├── logs/                  # Logs de PM2
│   ├── backend-err.log
│   ├── backend-out.log
│   └── backend-combined.log
└── dist/                  # Deploy del frontend (si aplica)
```

---

## 🔧 Configuración Inicial del Servidor (Una sola vez)

### **Paso 1: Conectar por SSH**

```bash
ssh root@185.166.39.240

```

### **Paso 2: Verificar/Instalar Node.js**

```bash
# Verificar si Node está instalado
node -v
npm -v

# Si no está instalado, instalar Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalación
node -v  # Debería mostrar v20.x.x
npm -v
```

### **Paso 3: Instalar PM2**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar
pm2 -v

# Configurar PM2 para inicio automático
pm2 startup systemd
# Ejecutar el comando que te devuelve (copia y pega)
```

### **Paso 4: Crear Estructura de Directorios**

```bash
# Crear directorios necesarios
mkdir -p /home/rafa/dev/epidisease/lims/lims_backend
mkdir -p /home/rafa/dev/epidisease/lims/logs

# Verificar permisos
ls -la /home/rafa/dev/epidisease/lims/
```

### **Paso 5: Instalar Git (si no está)**

```bash
# Verificar
git --version

# Si no está, instalar
apt-get update
apt-get install -y git

# Configurar git
git config --global user.name "Rafa"
git config --global user.email "rafa@example.com"
```

### **Paso 6: Clonar Repositorio**

```bash
# Ir al directorio
cd /home/rafa/dev/epidisease/lims/lims_backend

# Clonar repositorio (HTTPS)
git clone https://github.com/Rafixx/lims_backend.git .

# Si pide credenciales de GitHub, usar:
# Usuario: Rafixx
# Password: Token de acceso personal de GitHub (no tu contraseña)
```

**⚠️ Nota sobre GitHub:** Si usa autenticación de 2 factores, necesitas crear un Personal Access Token:

1. Ve a: https://github.com/settings/tokens
2. Generate new token (classic)
3. Selecciona scope: `repo` (Full control of private repositories)
4. Copia el token y úsalo como password

### **Paso 7: Configurar Variables de Entorno**

```bash
# Ir al directorio del proyecto
cd /home/rafa/dev/epidisease/lims/lims_backend

# Crear/editar .env (ya existe según tu info)
nano .env
```

Asegúrate que contenga:

```bash
NODE_ENV=production
PORT=3002

# Base de datos (verificar valores)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lims_prod
DB_USER=lims_user
DB_PASSWORD=tu_password_aqui
DB_SCHEMA=lims_pre

# JWT
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://tu-dominio.com

# Otras variables específicas de tu proyecto
```

### **Paso 8: Instalar Dependencias y Compilar**

```bash
# Instalar dependencias
npm ci

# Compilar TypeScript
npm run build

# Verificar que se creó la carpeta dist
ls -la dist/
```

### **Paso 9: Iniciar con PM2**

```bash
# Iniciar aplicación
pm2 start ecosystem.config.js --env production

# Ver status
pm2 status

# Ver logs
pm2 logs lims-backend

# Si todo está bien, guardar configuración
pm2 save
```

---

## 🔄 Deploy de Actualizaciones (Proceso Regular)

### **Método 1: Actualización Manual (Recomendado)**

```bash
# 1. Conectar al servidor
ssh root@185.166.39.240

# 2. Ir al directorio
cd /home/rafa/dev/epidisease/lims/lims_backend

# 3. Hacer backup (opcional pero recomendado)
cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)

# 4. Pull de cambios
git pull origin main

# 5. Reinstalar dependencias (solo si cambió package.json)
npm ci

# 6. Recompilar
npm run build

# 7. Recargar PM2 sin downtime
pm2 reload lims-backend

# 8. Ver logs
pm2 logs lims-backend --lines 50
```

### **Método 2: Script de Deploy Automatizado**

Crea un script en el servidor:

```bash
# Crear script
nano /home/rafa/deploy-backend.sh
```

Contenido:

```bash
#!/bin/bash

# Script de deploy para LIMS Backend
# Uso: ./deploy-backend.sh

set -e  # Salir si hay error

echo "🚀 Iniciando deploy de LIMS Backend..."

# Variables
PROJECT_DIR="/home/rafa/dev/epidisease/lims/lims_backend"
BACKUP_DIR="$PROJECT_DIR/dist.backup.$(date +%Y%m%d_%H%M%S)"

# Ir al directorio
cd $PROJECT_DIR

echo "📦 Haciendo backup de dist actual..."
if [ -d "dist" ]; then
  cp -r dist $BACKUP_DIR
  echo "✅ Backup creado en: $BACKUP_DIR"
fi

echo "📥 Descargando cambios de GitHub..."
git pull origin main

echo "📦 Instalando dependencias..."
npm ci

echo "🔨 Compilando TypeScript..."
npm run build

echo "🔄 Recargando PM2..."
pm2 reload lims-backend

echo "✅ Deploy completado!"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Últimos logs:"
pm2 logs lims-backend --lines 20 --nostream
```

Dar permisos:

```bash
chmod +x /home/rafa/deploy-backend.sh
```

Usar:

```bash
/home/rafa/deploy-backend.sh
```

---

## 📊 Comandos Útiles de PM2

```bash
# Ver estado de los procesos
pm2 status

# Ver logs en tiempo real
pm2 logs lims-backend

# Ver logs con más líneas
pm2 logs lims-backend --lines 100

# Ver solo errores
pm2 logs lims-backend --err

# Limpiar logs
pm2 flush

# Reiniciar (con downtime)
pm2 restart lims-backend

# Recargar (sin downtime, recomendado)
pm2 reload lims-backend

# Detener
pm2 stop lims-backend

# Iniciar
pm2 start lims-backend

# Ver información detallada
pm2 show lims-backend

# Monitoreo en tiempo real
pm2 monit

# Ver uso de recursos
pm2 list
```

---

## 🔍 Verificación del Deploy

### **1. Verificar que PM2 está corriendo**

```bash
pm2 status
```

Deberías ver:

```
┌─────┬────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name           │ mode    │ ↺      │ status   │ cpu    │
├─────┼────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ lims-backend   │ cluster │ 0       │ online   │ 0%     │
│ 1   │ lims-backend   │ cluster │ 0       │ online   │ 0%     │
└─────┴────────────────┴─────────┴─────────┴──────────┴────────┘
```

### **2. Verificar logs**

```bash
pm2 logs lims-backend --lines 50
```

Buscar:

- ✅ "Servidor escuchando en el puerto 3002"
- ✅ "Conexión a la base de datos establecida"
- ❌ Errores de conexión
- ❌ Errores de variables de entorno

### **3. Probar endpoint**

```bash
# Desde el servidor
curl http://localhost:3002/api/health

# O si tienes un endpoint específico
curl http://localhost:3002/api/estados
```

### **4. Verificar desde fuera**

```bash
# Desde tu máquina local
curl http://185.166.39.240:3002/api/health
```

**⚠️ Nota:** Si no responde desde fuera, verifica:

- Firewall del servidor
- Puerto 3002 abierto
- Nginx/Apache configurado como reverse proxy

---

## 🛡️ Configuración de Nginx (Reverse Proxy)

Si quieres acceder al backend a través de dominio:

### **Instalar Nginx**

```bash
apt-get update
apt-get install -y nginx
```

### **Crear configuración**

```bash
nano /etc/nginx/sites-available/lims-backend
```

Contenido:

```nginx
server {
    listen 80;
    server_name api.tudominio.com;  # O 185.166.39.240

    # Logs
    access_log /var/log/nginx/lims-backend-access.log;
    error_log /var/log/nginx/lims-backend-error.log;

    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Cache
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Habilitar sitio**

```bash
# Crear enlace simbólico
ln -s /etc/nginx/sites-available/lims-backend /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx
```

---

## 🔐 Configurar SSL con Let's Encrypt (Opcional pero Recomendado)

```bash
# Instalar Certbot
apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d api.tudominio.com

# El certificado se renovará automáticamente
```

---

## ⚠️ Troubleshooting

### **Problema: Puerto 3002 ocupado**

```bash
# Ver qué está usando el puerto
lsof -i :3002

# Matar proceso
kill -9 [PID]

# O reiniciar PM2
pm2 restart lims-backend
```

### **Problema: Error de conexión a BD**

```bash
# Verificar variables de entorno
cat /home/rafa/dev/epidisease/lims/lims_backend/.env

# Ver logs de error
pm2 logs lims-backend --err

# Verificar que PostgreSQL está corriendo
systemctl status postgresql
```

### **Problema: PM2 no inicia al reiniciar servidor**

```bash
# Regenerar configuración de startup
pm2 unstartup
pm2 startup systemd

# Guardar procesos actuales
pm2 save

# Reiniciar para probar
reboot
```

### **Problema: Logs muy grandes**

```bash
# Rotar logs manualmente
pm2 flush

# Configurar logrotate
nano /etc/logrotate.d/pm2-lims
```

Contenido:

```
/home/rafa/dev/epidisease/lims/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 📝 Checklist de Deploy

- [ ] Servidor actualizado (`apt-get update && apt-get upgrade`)
- [ ] Node.js 20.x instalado
- [ ] PM2 instalado globalmente
- [ ] PM2 configurado para inicio automático
- [ ] Directorios creados
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas en `.env`
- [ ] Dependencias instaladas (`npm ci`)
- [ ] Proyecto compilado (`npm run build`)
- [ ] PM2 iniciado con `ecosystem.config.js`
- [ ] Logs verificados (sin errores críticos)
- [ ] Endpoint de prueba respondiendo
- [ ] PM2 guardado (`pm2 save`)
- [ ] Nginx configurado (opcional)
- [ ] SSL configurado (opcional)
- [ ] Firewall configurado (puerto 3002 abierto si es necesario)

---

## 🎯 Resumen de Rutas Importantes

```
Código fuente:  /home/rafa/dev/epidisease/lims/lims_backend/
Variables env:  /home/rafa/dev/epidisease/lims/lims_backend/.env
Logs PM2:       /home/rafa/dev/epidisease/lims/logs/
Compilado:      /home/rafa/dev/epidisease/lims/lims_backend/dist/
Script deploy:  /home/rafa/deploy-backend.sh (crear según guía)
```

---

**¿Necesitas ayuda con algún paso específico?** 🚀
