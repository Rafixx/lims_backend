"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estado_controller_1 = require("../controllers/estado.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const estadoController = new estado_controller_1.EstadoController();
// Aplicar middleware de autenticación a todas las rutas
router.use(auth_middleware_1.authenticateToken);
// ========== RUTAS DE CONSULTA ==========
// GET /api/estados - Obtener todos los estados
router.get('/', estadoController.getAllEstados);
// GET /api/estados/:id - Obtener estado por ID
router.get('/:id', estadoController.getEstadoById);
// GET /api/estados/entidad/:entidad - Obtener estados por entidad
router.get('/entidad/:entidad', estadoController.getEstadosByEntidad);
// GET /api/estados/entidad/:entidad/inicial - Obtener estado inicial por entidad
router.get('/entidad/:entidad/inicial', estadoController.getEstadoInicial);
// GET /api/estados/entidad/:entidad/finales - Obtener estados finales por entidad
router.get('/entidad/:entidad/finales', estadoController.getEstadosFinales);
// GET /api/estados/entidad/:entidad/disponibles/:estadoActualId? - Obtener estados disponibles
router.get('/entidad/:entidad/disponibles/:estadoActualId?', estadoController.getEstadosDisponibles);
// ========== RUTAS DE VALIDACIÓN ==========
// POST /api/estados/validar-transicion - Validar si una transición es posible
router.post('/validar-transicion', estadoController.validarTransicion);
// ========== RUTAS DE CAMBIO DE ESTADO ==========
// POST /api/estados/cambiar/muestra/:muestraId - Cambiar estado de muestra
router.post('/cambiar/muestra/:muestraId', estadoController.cambiarEstadoMuestra);
// POST /api/estados/cambiar/tecnica/:tecnicaId - Cambiar estado de técnica
router.post('/cambiar/tecnica/:tecnicaId', estadoController.cambiarEstadoTecnica);
// ========== RUTAS DE ADMINISTRACIÓN ==========
// POST /api/estados - Crear nuevo estado
router.post('/', estadoController.createEstado);
// PUT /api/estados/:id - Actualizar estado
router.put('/:id', estadoController.updateEstado);
// DELETE /api/estados/:id - Desactivar estado (soft delete)
router.delete('/:id', estadoController.deleteEstado);
// POST /api/estados/:id/activate - Activar estado
router.post('/:id/activate', estadoController.activateEstado);
exports.default = router;
