/* eslint-disable */
// @ts-nocheck
// PM2 Ecosystem Configuration for LIMS Backend
// Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'lims-backend',
      script: './dist/server.js',
      cwd: '/home/rafa/dev/epidisease/lims/lims_backend',
      instances: 2, // 2 instancias para balanceo de carga
      exec_mode: 'cluster',
      
      // Variables de entorno (Development)
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        // Las demás variables se cargan del .env local
      },
      
      // Variables de entorno (Production - Hostinger)
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        // Las demás variables se cargan del .env en Hostinger
      },
      
      // Configuración de logs (Hostinger)
      error_file: '/home/rafa/dev/epidisease/lims/logs/backend-err.log',
      out_file: '/home/rafa/dev/epidisease/lims/logs/backend-out.log',
      log_file: '/home/rafa/dev/epidisease/lims/logs/backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configuración de reinicio automático
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist', '.git'],
      max_memory_restart: '512M', // 512MB por instancia (1GB total con 2 instancias)
      
      // Configuración de reintentos
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Configuración de desarrollo
      watch_delay: 1000,
      
      // Kill timeout
      kill_timeout: 5000,
      
      // Configuración de cron para reinicio
      // cron_restart: '0 0 * * *', // Reiniciar cada día a medianoche
      
      // Merge logs
      merge_logs: true,
      
      // Configuración de interpretador
      interpreter: 'node',
      interpreter_args: '--max-old-space-size=2048'
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '185.166.39.240',
      ref: 'origin/main',
      repo: 'https://github.com/Rafixx/lims_backend.git',
      path: '/home/rafa/dev/epidisease/lims/lims_backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /home/rafa/dev/epidisease/lims/logs',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};