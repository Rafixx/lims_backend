// src/routes/tecnicaReactivo.routes.ts
import { Router } from 'express';
import {
  getAllTecnicaReactivos,
  getTecnicaReactivoById,
  createTecnicaReactivo,
  updateTecnicaReactivo,
  deleteTecnicaReactivo,
} from '../controllers/tecnicaReactivo.controller';

const router = Router();

// GET /api/tecnicasReactivos - Obtener todas las relaciones técnica-reactivo
router.get('/', getAllTecnicaReactivos);

// GET /api/tecnicasReactivos/:id - Obtener relación por ID
router.get('/:id', getTecnicaReactivoById);

// POST /api/tecnicasReactivos - Crear nueva relación
router.post('/', createTecnicaReactivo);

// PUT /api/tecnicasReactivos/:id - Actualizar relación
router.put('/:id', updateTecnicaReactivo);

// DELETE /api/tecnicasReactivos/:id - Eliminar relación (soft delete)
router.delete('/:id', deleteTecnicaReactivo);

export { router as tecnicaReactivoRoutes };
