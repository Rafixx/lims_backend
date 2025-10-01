import { Router } from 'express';
import { EstadoController } from '../controllers/estado.controller';
// import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const estadoController = new EstadoController();

// ========== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) ==========
// NOTA: Para producción, descomentar la línea de autenticación abajo

// ========== RUTAS DE CONSULTA ==========

// GET /api/estados - Obtener todos los estados
router.get('/', estadoController.getAllEstados);

// GET /api/estados/entidad/:entidad - Obtener estados por entidad
router.get('/entidad/:entidad', estadoController.getEstadosByEntidad);

// GET /api/estados/:entidad - Alias corto para obtener estados por entidad (MUESTRA, TECNICA)
// IMPORTANTE: Solo acepta valores específicos para evitar conflicto con /:id numérico
router.get('/:entidad(MUESTRA|TECNICA)', estadoController.getEstadosByEntidad);

// GET /api/estados/entidad/:entidad/inicial - Obtener estado inicial por entidad
router.get('/entidad/:entidad/inicial', estadoController.getEstadoInicial);

// GET /api/estados/:entidad/inicial - Alias corto
router.get(
  '/:entidad(MUESTRA|TECNICA)/inicial',
  estadoController.getEstadoInicial
);

// GET /api/estados/entidad/:entidad/finales - Obtener estados finales por entidad
router.get('/entidad/:entidad/finales', estadoController.getEstadosFinales);

// GET /api/estados/:entidad/finales - Alias corto
router.get(
  '/:entidad(MUESTRA|TECNICA)/finales',
  estadoController.getEstadosFinales
);

// GET /api/estados/entidad/:entidad/disponibles/:estadoActualId? - Obtener estados disponibles
router.get(
  '/entidad/:entidad/disponibles/:estadoActualId?',
  estadoController.getEstadosDisponibles
);

// GET /api/estados/:id - Obtener estado por ID
// IMPORTANTE: Esta ruta va AL FINAL para no interferir con las rutas específicas arriba
router.get('/:id', estadoController.getEstadoById);

// ========== RUTAS DE VALIDACIÓN ==========

// POST /api/estados/validar-transicion - Validar si una transición es posible
router.post('/validar-transicion', estadoController.validarTransicion);

// ========== RUTAS DE CAMBIO DE ESTADO ==========

// POST /api/estados/cambiar/muestra/:muestraId - Cambiar estado de muestra
router.post(
  '/cambiar/muestra/:muestraId',
  estadoController.cambiarEstadoMuestra
);

// POST /api/estados/cambiar/tecnica/:tecnicaId - Cambiar estado de técnica
router.post(
  '/cambiar/tecnica/:tecnicaId',
  estadoController.cambiarEstadoTecnica
);

// ========== RUTAS DE ADMINISTRACIÓN ==========

// POST /api/estados - Crear nuevo estado
router.post('/', estadoController.createEstado);

// PUT /api/estados/:id - Actualizar estado
router.put('/:id', estadoController.updateEstado);

// DELETE /api/estados/:id - Desactivar estado (soft delete)
router.delete('/:id', estadoController.deleteEstado);

// POST /api/estados/:id/activate - Activar estado
router.post('/:id/activate', estadoController.activateEstado);

// ========== PARA ACTIVAR AUTENTICACIÓN ==========
// Descomentar esta línea para requerir autenticación en TODAS las rutas:
// router.use(authenticateToken);
// O mover específicamente antes de las rutas que quieras proteger

export default router;
