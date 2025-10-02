import { Router } from 'express';
import {
  getTecnicasById,
  getWorklists,
  getWorklistById,
  getPosiblesTecnicaProc,
  createWorklist,
  deleteWorklist,
  updateWorklist,
  getPosiblesTecnicas,
  setTecnicoLab,
} from '../controllers/worklist.controller';

const router = Router();

// ========== RUTAS ESPECÍFICAS (DEBEN IR PRIMERO) ==========

// GET /api/worklists/posibles-tecnicas-proc - Obtener procesos con técnicas disponibles
router.get('/posibles-tecnicas-proc', getPosiblesTecnicaProc);
// Alias para compatibilidad con URL antigua (camelCase)
router.get('/posiblesTecnicasProc', getPosiblesTecnicaProc);

// GET /api/worklists/posibles-tecnicas/:tecnicaProc - Obtener técnicas disponibles por proceso
router.get('/posibles-tecnicas/:tecnicaProc', getPosiblesTecnicas);
// Alias para compatibilidad con URL antigua (camelCase)
router.get('/posiblesTecnicas/:tecnicaProc', getPosiblesTecnicas);

// ========== RUTAS GENERALES ==========

// GET /api/worklists - Listar todos los worklists
router.get('/', getWorklists);

// GET /api/worklists/:id - Obtener worklist por ID
router.get('/:id', getWorklistById);

// GET /api/worklists/:id/tecnicas - Obtener técnicas de un worklist
router.get('/:id/tecnicas', getTecnicasById);

// POST /api/worklists - Crear nuevo worklist
router.post('/', createWorklist);

// PUT /api/worklists/:id - Actualizar worklist
router.put('/:id', updateWorklist);

// PUT /api/worklists/:id/setTecnicoLab - Asignar técnico a worklist
router.put('/:id/setTecnicoLab', setTecnicoLab);

// DELETE /api/worklists/:id - Eliminar worklist
router.delete('/:id', deleteWorklist);

export { router as worklistRouter };
