//src/routes/tecnica.routes.ts
import { Router } from 'express';
import {
  getTecnicas,
  getTecnicaById,
  // getTecnicasBySolicitudId,
  getTecnicasByMuestraId,
  getTecnicasByMuestraIdAgrupadas,
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
  marcarResultadoErroneo,
  getTecnicasPendientesExternalizacion,
  getTecnicasFromGroup,
} from '../controllers/tecnica.controller';

const router = Router();

// Rutas específicas (DEBEN IR ANTES de /:id para evitar colisiones)
/**
 * @route GET /api/tecnicas/pendientes-externalizacion
 * @desc Obtiene técnicas pendientes de externalización (sin worklist y sin estado final)
 * @access Public
 */
router.get('/pendientes-externalizacion', getTecnicasPendientesExternalizacion);

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
 * @route GET /api/tecnicas/muestra/:id/agrupadas
 * @desc Obtiene técnicas de una muestra, agrupadas por proceso si es tipo array
 * @access Public
 * @param {number} id - ID de la muestra
 */
router.get('/muestra/:id/agrupadas', getTecnicasByMuestraIdAgrupadas);

/**
 * @route GET /api/tecnicas/grupo/:id
 * @desc Obtiene todas las técnicas individuales de un grupo (técnica agrupada)
 * @access Public
 * @param {number} id - ID de la primera técnica del grupo
 */
router.get('/grupo/:id', getTecnicasFromGroup);

// Rutas genéricas
router.get('/', getTecnicas);
router.get('/:id', getTecnicaById);
// router.get('/solicitud/:id', getTecnicasBySolicitudId);
router.get('/muestra/:id', getTecnicasByMuestraId);
router.post('/', createTecnica);
router.put('/:id', updateTecnica);
router.delete('/:id', deleteTecnica);

/**
 * @route POST /api/tecnicas/deleteTecnica
 * @desc Elimina/cancela una técnica (alternativa POST)
 * @access Public
 * @body {number} id_tecnica - ID de la técnica a eliminar
 */
router.post('/deleteTecnica', async (req, res, next) => {
  req.params = { id: String(req.body.id_tecnica) };
  return deleteTecnica(req, res, next);
});

// Otras rutas específicas

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

/**
 * @route POST /api/tecnicas/resultado-erroneo
 * @desc Marca técnicas como resultado erróneo (estado 15), limpia técnico responsable y worklist
 * @access Public
 * @body {number[]} ids_tecnicas - Array de IDs de técnicas a marcar como erróneas (1..n elementos)
 * @returns {object} - Resultado del proceso con número de técnicas actualizadas y posibles errores
 */
router.post('/resultado-erroneo', marcarResultadoErroneo);

export { router as tecnicaRoutes };
