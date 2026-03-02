/**
 * Global test setup for Jest.
 * Configures SQLite in-memory DB, initializes all models, and seeds reference data.
 *
 * Referenced by jest.config.js → setupFilesAfterEnv.
 */
import { sequelize } from '../../config/db.config';
import { initModels } from '../../models';
import { DimEstado } from '../../models/DimEstado';

let initialized = false;

beforeAll(async () => {
  // SQLite in-memory does not support schemas.
  // Set DB_SCHEMA to '' so dotenv (which runs in db.config) cannot re-set it to 'lims_pre'.
  process.env.DB_SCHEMA = '';

  if (!initialized) {
    initModels(sequelize);
    initialized = true;
  }
});

/**
 * Recreate all tables and re-seed reference data before each test.
 * This avoids FK cleanup issues from models that reference tables not present in tests.
 */
beforeEach(async () => {
  await sequelize.sync({ force: true });

  // Seed dim_estados with the definitive production IDs
  await DimEstado.bulkCreate(
    [
      // --- MUESTRA ---
      {
        id: 1,
        estado: 'REGISTRADA',
        entidad: 'MUESTRA',
        es_inicial: true,
        es_final: false,
        activo: true,
      },
      {
        id: 3,
        estado: 'EN_PROCESO',
        entidad: 'MUESTRA',
        es_inicial: false,
        es_final: false,
        activo: true,
      },
      {
        id: 4,
        estado: 'COMPLETADA',
        entidad: 'MUESTRA',
        es_inicial: false,
        es_final: true,
        activo: true,
      },
      {
        id: 7,
        estado: 'COMPLETADA_ERROR',
        entidad: 'MUESTRA',
        es_inicial: false,
        es_final: true,
        activo: true,
      },
      // --- TECNICA ---
      {
        id: 8,
        estado: 'CREADA',
        entidad: 'TECNICA',
        es_inicial: true,
        es_final: false,
        activo: true,
      },
      {
        id: 9,
        estado: 'ASIGNADA',
        entidad: 'TECNICA',
        es_inicial: false,
        es_final: false,
        activo: true,
      },
      {
        id: 10,
        estado: 'EN_PROCESO',
        entidad: 'TECNICA',
        es_inicial: false,
        es_final: false,
        activo: true,
      },
      {
        id: 12,
        estado: 'COMPLETADA_TECNICA',
        entidad: 'TECNICA',
        es_inicial: false,
        es_final: true,
        activo: true,
      },
      {
        id: 13,
        estado: 'CANCELADA_TECNICA',
        entidad: 'TECNICA',
        es_inicial: false,
        es_final: true,
        activo: true,
      },
      {
        id: 14,
        estado: 'ERROR_TECNICA',
        entidad: 'TECNICA',
        es_inicial: false,
        es_final: true,
        activo: true,
      },
      {
        id: 15,
        estado: 'REINTENTANDO',
        entidad: 'TECNICA',
        es_inicial: false,
        es_final: false,
        activo: true,
      },
    ],
    { ignoreDuplicates: true }
  );
});

afterAll(async () => {
  await sequelize.close();
});
