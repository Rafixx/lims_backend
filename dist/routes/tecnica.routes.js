"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tecnicaRoutes = void 0;
//src/routes/tecnica.routes.ts
const express_1 = require("express");
const tecnica_controller_1 = require("../controllers/tecnica.controller");
const router = (0, express_1.Router)();
exports.tecnicaRoutes = router;
// Rutas existentes
router.get('/', tecnica_controller_1.getTecnicas);
router.get('/:id', tecnica_controller_1.getTecnicaById);
// router.get('/solicitud/:id', getTecnicasBySolicitudId);
router.get('/muestra/:id', tecnica_controller_1.getTecnicasByMuestraId);
router.post('/', tecnica_controller_1.createTecnica);
router.put('/:id', tecnica_controller_1.updateTecnica);
router.delete('/:id', tecnica_controller_1.deleteTecnica);
// Nuevas rutas para funcionalidades del frontend
/**
 * @route GET /api/tecnicas/con-muestra
 * @desc Obtiene todas las técnicas con información de muestra
 * @access Public
 */
router.get('/con-muestra', tecnica_controller_1.getTecnicasConMuestra);
/**
 * @route GET /api/tecnicas/estadisticas
 * @desc Obtiene estadísticas del worklist calculadas en backend
 * @access Public
 */
router.get('/estadisticas', tecnica_controller_1.getEstadisticasWorklist);
/**
 * @route GET /api/tecnicas/proceso/:idTecnicaProc/tecnicas
 * @desc Obtiene técnicas pendientes para un proceso específico con información de muestra
 * @access Public
 * @param {number} idTecnicaProc - ID del proceso de técnica
 */
router.get('/proceso/:idTecnicaProc/tecnicas', tecnica_controller_1.getTecnicasPendientesPorProceso);
/**
 * @route PATCH /api/tecnicas/:idTecnica/asignar
 * @desc Asigna un técnico responsable a una técnica
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 * @body {number} id_tecnico_resp - ID del técnico responsable
 */
router.patch('/:idTecnica/asignar', tecnica_controller_1.asignarTecnico);
/**
 * @route PATCH /api/tecnicas/:idTecnica/iniciar
 * @desc Inicia una técnica (cambia estado a EN_PROGRESO)
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 */
router.patch('/:idTecnica/iniciar', tecnica_controller_1.iniciarTecnica);
/**
 * @route PATCH /api/tecnicas/:idTecnica/completar
 * @desc Completa una técnica (cambia estado a COMPLETADA)
 * @access Public
 * @param {number} idTecnica - ID de la técnica
 * @body {string} comentarios - Comentarios opcionales
 */
router.patch('/:idTecnica/completar', tecnica_controller_1.completarTecnica);
/**
 * @route POST /api/tecnicas/:id/cambiar-estado
 * @desc Cambia el estado de una técnica
 * @access Public
 * @param {number} id - ID de la técnica
 * @body {number} nuevoEstadoId - ID del nuevo estado
 * @body {string} observaciones - Observaciones opcionales
 */
router.post('/:id/cambiar-estado', tecnica_controller_1.cambiarEstadoTecnica);
