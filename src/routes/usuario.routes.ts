// src/routes/usuario.routes.ts
import { Router } from 'express';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../controllers/usuario.controller';

const router = Router();

// Endpoints para usuarios
router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export { router as usuarioRoutes };
