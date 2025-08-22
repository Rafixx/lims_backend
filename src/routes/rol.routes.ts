//src/routes/rol.routes.ts
import { Router } from 'express';
import {
  getRolById,
  getRoles,
  createRol,
  updateRol,
  deleteRol,
} from '../controllers/rol.controller';

const router = Router();

router.get('/:id', getRolById);
router.get('/', getRoles);
router.post('/', createRol);
router.put('/:id', updateRol);
router.delete('/:id', deleteRol);

export { router as rolRoutes };
