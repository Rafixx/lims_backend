//src/routes/tecnica.routes.ts
import { Router } from 'express';
import {
  getTecnicas,
  getTecnicaById,
  getTecnicasBySolicitudId,
  getTecnicasByMuestraId,
  createTecnica,
  updateTecnica,
  deleteTecnica,
} from '../controllers/tecnica.controller';

const router = Router();

router.get('/', getTecnicas);
router.get('/:id', getTecnicaById);
router.get('/solicitud/:id', getTecnicasBySolicitudId);
router.get('/muestra/:id', getTecnicasByMuestraId);
router.post('/', createTecnica);
router.put('/:id', updateTecnica);
router.delete('/:id', deleteTecnica);

export { router as tecnicaRoutes };
