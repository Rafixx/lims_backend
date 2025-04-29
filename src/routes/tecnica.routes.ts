//src/routes/tecnica.routes.ts
import { Router } from 'express';
import {
  getTecnicas,
  getTecnicaById,
  createTecnica,
  updateTecnica,
  deleteTecnica,
} from '../controllers/tecnica.controller';

const router = Router();

router.get('/', getTecnicas);
router.get('/:id', getTecnicaById);
router.post('/', createTecnica);
router.put('/:id', updateTecnica);
router.delete('/:id', deleteTecnica);

export { router as tecnicaRoutes };
