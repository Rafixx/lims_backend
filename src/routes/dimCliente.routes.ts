//src/routes/dimCliente.routes.ts
import { Router } from 'express';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../controllers/dimCliente.controller';

const router = Router();

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export { router as dimClienteRoutes };
