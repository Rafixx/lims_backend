import { Router } from 'express';
import { worklistController } from '../controllers/worklist.controller';

const router = Router();

/**
 * @route GET /api/worklist/tecnicas-pendientes
 * @desc Obtiene todas las técnicas pendientes
 * @access Public
 */
router.get('/tecnicas-pendientes', (req, res) => {
  worklistController.getTecnicasPendientes(req, res);
});

/**
 * @route GET /api/worklist/tecnicas-agrupadas
 * @desc Obtiene técnicas agrupadas por proceso con conteos
 * @access Public
 */
router.get('/tecnicas-agrupadas', (req, res) => {
  worklistController.getTecnicasAgrupadasPorProceso(req, res);
});

/**
 * @route GET /api/worklist/tecnicas-con-proceso
 * @desc Obtiene técnicas pendientes con información del proceso incluida
 * @access Public
 */
router.get('/tecnicas-con-proceso', (req, res) => {
  worklistController.getTecnicasPendientesConProceso(req, res);
});

/**
 * @route GET /api/worklist/estadisticas
 * @desc Obtiene estadísticas completas del worklist
 * @access Public
 */
router.get('/estadisticas', (req, res) => {
  worklistController.getWorklistStats(req, res);
});

/**
 * @route GET /api/worklist/procesos-pendientes
 * @desc Obtiene procesos que tienen técnicas pendientes
 * @access Public
 */
router.get('/procesos-pendientes', (req, res) => {
  worklistController.getProcesosPendientes(req, res);
});

/**
 * @route GET /api/worklist/conteo
 * @desc Obtiene el conteo total de técnicas pendientes
 * @access Public
 */
router.get('/conteo', (req, res) => {
  worklistController.getConteoTecnicasPendientes(req, res);
});

/**
 * @route GET /api/worklist/proceso/:idTecnicaProc/tecnicas
 * @desc Obtiene técnicas pendientes para un proceso específico
 * @access Public
 * @param {number} idTecnicaProc - ID del proceso de técnica
 */
router.get('/proceso/:idTecnicaProc/tecnicas', (req, res) => {
  worklistController.getTecnicasPendientesPorProceso(req, res);
});

/**
 * @route GET /api/worklist/proceso/:idTecnicaProc/existe
 * @desc Valida si existe un proceso específico con técnicas pendientes
 * @access Public
 * @param {number} idTecnicaProc - ID del proceso de técnica
 */
router.get('/proceso/:idTecnicaProc/existe', (req, res) => {
  worklistController.existeProcesoConTecnicasPendientes(req, res);
});

export { router as worklistRouter };
