// src/routes/muestra.routes.ts
import { Router } from 'express';
import {
  getMuestras,
  getMuestraById,
  getTecnicasById,
  createMuestra,
  updateMuestra,
  deleteMuestra,
  getMuestrasStats,
  cambiarEstadoMuestra,
  getCodigoEpi,
} from '../controllers/muestra.controller';

const router = Router();

router.get('/', getMuestras);
router.get('/estadisticas', getMuestrasStats);
router.get('/codigo-epi', getCodigoEpi);
router.get('/:id', getMuestraById);
router.get('/:id/tecnicas', getTecnicasById);
router.post('/', createMuestra);
router.put('/:id', updateMuestra);
router.delete('/:id', deleteMuestra);
router.post('/:id/cambiar-estado', cambiarEstadoMuestra);

export { router as muestraRoutes };
