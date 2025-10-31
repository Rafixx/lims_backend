import { Router } from 'express';
import {
  getResultados,
  getResultadoById,
  getResultadosByMuestra,
  getResultadosByTecnica,
  createResultado,
  createResultadosBatch,
  updateResultado,
  deleteResultado,
  getRawNanodropResultados,
  getRawQubitResultados,
  setCSVtoRAW,
} from '../controllers/resultado.controller';
import { uploadCSV } from '../middlewares/upload.middleware';

const router = Router();

// ========== RUTAS ESPECÍFICAS (DEBEN IR PRIMERO) ==========

// GET /api/resultados/muestra/:id_muestra - Obtener resultados por muestra
router.get('/muestra/:id_muestra', getResultadosByMuestra);

// GET /api/resultados/tecnica/:id_tecnica - Obtener resultados por técnica
router.get('/tecnica/:id_tecnica', getResultadosByTecnica);

// GET /api/resultados/raw/nanodrop - Obtener resultados crudos de Nanodrop
router.get('/raw/nanodrop', getRawNanodropResultados);

// GET /api/resultados/raw/qubit - Obtener resultados crudos de Qubit
router.get('/raw/qubit', getRawQubitResultados);

// POST /api/resultados/batch - Crear múltiples resultados
router.post('/batch', createResultadosBatch);

// POST /api/resultados/setCSVtoRAW - Establecer datos CSV a RAW
router.post('/setCSVtoRAW', uploadCSV.single('file'), setCSVtoRAW);

// ========== RUTAS GENERALES ==========

// GET /api/resultados - Listar todos los resultados
router.get('/', getResultados);

// GET /api/resultados/:id - Obtener resultado por ID
router.get('/:id', getResultadoById);

// POST /api/resultados - Crear nuevo resultado
router.post('/', createResultado);

// PUT /api/resultados/:id - Actualizar resultado
router.put('/:id', updateResultado);

// DELETE /api/resultados/:id - Eliminar resultado (soft delete)
router.delete('/:id', deleteResultado);

export { router as resultadoRouter };
