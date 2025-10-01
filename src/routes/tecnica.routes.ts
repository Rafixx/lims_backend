//src/routes/tecnica.routes.ts
import { Router } from 'express';
import {
  getTecnicas,
  getTecnicaById,
  // getTecnicasBySolicitudId,
  getTecnicasByMuestraId,
  createTecnica,
  updateTecnica,
  deleteTecnica,
  asignarTecnico,
  iniciarTecnica,
  completarTecnica,
  getTecnicasPendientesPorProceso,
  getTecnicasConMuestra,
  getEstadisticasWorklist,
  cambiarEstadoTecnica,
} from '../controllers/tecnica.controller';

const router = Router();

// Rutas existentes
router.get('/', getTecnicas);
router.get('/:id', getTecnicaById);
// router.get('/solicitud/:id', getTecnicasBySolicitudId);
router.get('/muestra/:id', getTecnicasByMuestraId);
router.post('/', createTecnica);
router.put('/:id', updateTecnica);
router.delete('/:id', deleteTecnica);

// Nuevas rutas para funcionalidades del frontend

/**
 * @route GET /api/tecnicas/con-muestra
 * @desc Obtiene todas las técnicas con información de muestra
 * @access Public
 */
router.get('/con-muestra', getTecnicasConMuestra);

/**
 * @route GET /api/tecnicas/estadisticas
 * @desc Obtiene estadísticas del worklist calculadas en backend
 * @access Public
 */
router.get('/estadisticas', getEstadisticasWorklist);

/**
 * @route GET /api/tecnicas/proceso/:idTecnicaProc/tecnicas
 * @desc Obtiene técnicas pendientes para un proceso específico con información de muestra
 * @access Public
 * @param {number} idTecnicaProc - ID del proceso de técnica
 */
router.get('/proceso/:idTecnicaProc/tecnicas', getTecnicasPendientesPorProceso);

/**
 * @route PATCH /api/tecnicas/:idTecnica/asignar
 * @desc Asigna un técnico responsable a una técnica
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 * @body {number} id_tecnico_resp - ID del técnico responsable
 */
router.patch('/:idTecnica/asignar', asignarTecnico);

/**
 * @route PATCH /api/tecnicas/:idTecnica/iniciar
 * @desc Inicia una técnica (cambia estado a EN_PROGRESO)
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 */
router.patch('/:idTecnica/iniciar', iniciarTecnica);

/**
 * @route PATCH /api/tecnicas/:idTecnica/completar
 * @desc Completa una técnica (cambia estado a COMPLETADA)
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 * @body {string} comentarios - Comentarios opcionales
 */
router.patch('/:idTecnica/completar', completarTecnica);

/**
 * @route POST /api/tecnicas/:id/cambiar-estado
 * @desc Cambia el estado de una técnica
 * @access Public
 * @param {number} id - ID de la técnica
 * @body {number} nuevoEstadoId - ID del nuevo estado
 * @body {string} observaciones - Observaciones opcionales
 */
router.post('/:id/cambiar-estado', cambiarEstadoTecnica);

export { router as tecnicaRoutes };
