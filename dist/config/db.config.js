"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.dbConfig = exports.sequelize = void 0;
// src/db.ts
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
// Carga variables de entorno desde .env
dotenv_1.default.config();
const isTest = process.env.NODE_ENV === 'test';
/**
 * Variables de entorno comunes
 */
const { DB_HOST = 'localhost', DB_PORT = '5432', DB_DATABASE, DB_SCHEMA, DB_USER, DB_PASS, } = process.env;
if (!isTest && (!DB_DATABASE || !DB_USER || !DB_PASS)) {
    throw new Error('❌ Faltan variables de entorno requeridas: revisa DB_DATABASE, DB_USER y DB_PASS');
}
const port = Number(DB_PORT);
if (!isTest && (isNaN(port) || port <= 0)) {
    throw new Error(`❌ DB_PORT inválido: ${DB_PORT}`);
}
/**
 * Opciones comunes de definición de modelos
 */
const defineOptions = isTest
    ? {} // no schema en SQLite-in-memory
    : {
        ...(DB_SCHEMA ? { schema: DB_SCHEMA } : {}),
    };
/**
 * Opciones específicas para PostgreSQL
 */
const postgresOptions = {
    host: DB_HOST,
    port,
    dialect: 'postgres',
    define: defineOptions,
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
};
/**
 * Creación de la instancia Sequelize
 */
exports.sequelize = isTest
    ? new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: defineOptions,
    })
    : new sequelize_1.Sequelize(DB_DATABASE, DB_USER, DB_PASS, postgresOptions);
exports.dbConfig = isTest
    ? null
    : {
        host: DB_HOST,
        port,
        database: DB_DATABASE,
        username: DB_USER,
        password: DB_PASS,
        dialect: 'postgres',
        ...(DB_SCHEMA ? { schema: DB_SCHEMA } : {}),
    };
/**
 * Test de conexión (uso manual)
 */
const testConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Conexión a la base de datos OK');
        return true;
    }
    catch (err) {
        console.error('❌ Error al conectar a la base de datos:', err);
        return false;
    }
};
exports.testConnection = testConnection;
