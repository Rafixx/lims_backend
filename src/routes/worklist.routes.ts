import { Router } from 'express';
import { worklistController } from '../controllers/worklist.controller';

const router = Router();

// ==================== RUTAS CRUD DE WORKLIST ====================

/**
 * @route POST /api/worklist
 * @desc Crea un nuevo worklist
 * @access Public
 * @body {string} nombre - Nombre del worklist (opcional)
 */
router.post('/', (req, res) => {
  worklistController.create(req, res);
});

/**
 * @route GET /api/worklist
 * @desc Obtiene todos los worklists
 * @access Public
 */
router.get('/', (req, res) => {
  worklistController.getAll(req, res);
});

/**
 * @route GET /api/worklist/tecnicas-sin-asignar
 * @desc Obtiene técnicas que no están asignadas a ningún worklist
 * @access Public
 */
router.get('/tecnicas-sin-asignar', (req, res) => {
  worklistController.getTecnicasSinAsignar(req, res);
});

/**
 * @route GET /api/worklist/procesos-disponibles
 * @desc Obtiene todos los procesos de técnicas disponibles
 * @access Public
 */
router.get('/procesos-disponibles', (req, res) => {
  worklistController.getProcesosDisponibles(req, res);
});

/**
 * @route GET /api/worklist/:id
 * @desc Obtiene un worklist por ID
 * @access Public
 * @param {number} id - ID del worklist
 */
router.get('/:id', (req, res) => {
  worklistController.getById(req, res);
});

/**
 * @route PUT /api/worklist/:id
 * @desc Actualiza un worklist
 * @access Public
 * @param {number} id - ID del worklist
 * @body {string} nombre - Nombre del worklist (opcional)
 */
router.put('/:id', (req, res) => {
  worklistController.update(req, res);
});

/**
 * @route DELETE /api/worklist/:id
 * @desc Elimina un worklist
 * @access Public
 * @param {number} id - ID del worklist
 */
router.delete('/:id', (req, res) => {
  worklistController.delete(req, res);
});

// ==================== RUTAS ESPECÍFICAS DE WORKLIST ====================

/**
 * @route POST /api/worklist/:id/asignar-tecnicas
 * @desc Asigna técnicas a un worklist
 * @access Public
 * @param {number} id - ID del worklist
 * @body {number[]} idsTecnicas - Array de IDs de técnicas a asignar
 */
router.post('/:id/asignar-tecnicas', (req, res) => {
  worklistController.setTecnicas(req, res);
});

/**
 * @route DELETE /api/worklist/:id/remover-tecnicas
 * @desc Remueve técnicas de un worklist
 * @access Public
 * @param {number} id - ID del worklist
 * @body {number[]} idsTecnicas - Array de IDs de técnicas a remover (opcional - sin body remueve todas)
 */
router.delete('/:id/remover-tecnicas', (req, res) => {
  worklistController.removeTecnicas(req, res);
});

/**
 * @route GET /api/worklist/:id/estadisticas
 * @desc Obtiene estadísticas de un worklist específico
 * @access Public
 * @param {number} id - ID del worklist
 */
router.get('/:id/estadisticas', (req, res) => {
  worklistController.getStats(req, res);
});

/**
 * @route GET /api/worklist/:id/tecnicas-agrupadas
 * @desc Obtiene técnicas agrupadas por proceso de un worklist específico
 * @access Public
 * @param {number} id - ID del worklist
 */
router.get('/:id/tecnicas-agrupadas', (req, res) => {
  worklistController.getTecnicasAgrupadasPorProceso(req, res);
});

// ==================== RUTAS PARA OPERACIONES DE TÉCNICA (delegación) ====================

/**
 * @route PATCH /api/worklist/tecnica/:idTecnica/asignar
 * @desc Asigna un técnico responsable a una técnica
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 * @body {number} id_tecnico_resp - ID del técnico responsable
 */
router.patch('/tecnica/:idTecnica/asignar', (req, res) => {
  worklistController.asignarTecnico(req, res);
});

/**
 * @route PATCH /api/worklist/tecnica/:idTecnica/iniciar
 * @desc Inicia una técnica (cambia estado a EN_PROGRESO)
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 */
router.patch('/tecnica/:idTecnica/iniciar', (req, res) => {
  worklistController.iniciarTecnica(req, res);
});

/**
 * @route PATCH /api/worklist/tecnica/:idTecnica/completar
 * @desc Completa una técnica (cambia estado a COMPLETADA)
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 * @body {string} comentarios - Comentarios opcionales
 */
router.patch('/tecnica/:idTecnica/completar', (req, res) => {
  worklistController.completarTecnica(req, res);
});

export { router as worklistRouter };
