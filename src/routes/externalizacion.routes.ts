// src/routes/externalizacion.routes.ts
import { Router } from 'express';
import {
  getExternalizaciones,
  getExternalizacionById,
  getExternalizacionesByTecnicaId,
  getExternalizacionesByCentro,
  getExternalizacionesPendientes,
  createExternalizacion,
  updateExternalizacion,
  deleteExternalizacion,
  registrarRecepcion,
  registrarRecepcionDatos,
} from '../controllers/externalizacion.controller';

const router = Router();

/**
 * @route GET /api/externalizaciones
 * @desc Obtiene todas las externalizaciones
 * @access Public
 */
router.get('/', getExternalizaciones);

/**
 * @route GET /api/externalizaciones/pendientes
 * @desc Obtiene externalizaciones pendientes (enviadas pero sin recepción)
 * @access Public
 */
router.get('/pendientes', getExternalizacionesPendientes);

/**
 * @route GET /api/externalizaciones/tecnica/:idTecnica
 * @desc Obtiene externalizaciones por ID de técnica
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 */
router.get('/tecnica/:idTecnica', getExternalizacionesByTecnicaId);

/**
 * @route GET /api/externalizaciones/centro/:idCentro
 * @desc Obtiene externalizaciones por centro
 * @access Public
 * @param {number} idCentro - ID del centro
 */
router.get('/centro/:idCentro', getExternalizacionesByCentro);

/**
 * @route GET /api/externalizaciones/:id
 * @desc Obtiene una externalización por ID
 * @access Public
 * @param {number} id - ID de la externalización
 */
router.get('/:id', getExternalizacionById);

/**
 * @route POST /api/externalizaciones
 * @desc Crea una nueva externalización
 * @access Public
 * @body {CreateExternalizacionDTO} - Datos de la externalización
 */
router.post('/', createExternalizacion);

/**
 * @route PUT /api/externalizaciones/:id
 * @desc Actualiza una externalización
 * @access Public
 * @param {number} id - ID de la externalización
 * @body {UpdateExternalizacionDTO} - Datos a actualizar
 */
router.put('/:id', updateExternalizacion);

/**
 * @route DELETE /api/externalizaciones/:id
 * @desc Elimina una externalización (soft delete)
 * @access Public
 * @param {number} id - ID de la externalización
 */
router.delete('/:id', deleteExternalizacion);

/**
 * @route PATCH /api/externalizaciones/:id/recepcion
 * @desc Registra la recepción de una externalización
 * @access Public
 * @param {number} id - ID de la externalización
 * @body {Date} f_recepcion - Fecha de recepción (opcional, usa fecha actual por defecto)
 * @body {number} updated_by - ID del usuario que registra la recepción
 */
router.patch('/:id/recepcion', registrarRecepcion);

/**
 * @route PATCH /api/externalizaciones/:id/recepcion-datos
 * @desc Registra la recepción de datos de una externalización
 * @access Public
 * @param {number} id - ID de la externalización
 * @body {Date} f_recepcion_datos - Fecha de recepción de datos (opcional, usa fecha actual por defecto)
 * @body {number} updated_by - ID del usuario que registra la recepción de datos
 */
router.patch('/:id/recepcion-datos', registrarRecepcionDatos);

export { router as externalizacionRoutes };
