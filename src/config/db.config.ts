// src/config/db.config.ts

export const dbConfig = {
  // Modo de operación: "json" para datos desde archivos, "postgres" para PostgreSQL en el futuro.
  mode: 'json',

  // Configuración para el modo "json":
  json: {
    // Ruta relativa a los archivos JSON que simulan la base de datos.
    dataPath: './src/data',
  },

  // Configuración para PostgreSQL (a implementar en el futuro)
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'lims_db',
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || 'password',
    dialect: 'postgres',
  },
};
