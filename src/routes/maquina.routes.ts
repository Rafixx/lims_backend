// src/routes/maquina.routes.ts
import { Router } from 'express';
import {
  getMaquinas,
  getMaquinaById,
  createMaquina,
  updateMaquina,
  deleteMaquina,
} from '../controllers/maquina.controller';

const maquinaRoutes = Router();

// Endpoints para la entidad "maquina"
maquinaRoutes.get('/', getMaquinas);
maquinaRoutes.get('/:id', getMaquinaById);
maquinaRoutes.post('/', createMaquina);
maquinaRoutes.put('/:id', updateMaquina);
maquinaRoutes.delete('/:id', deleteMaquina);

export default maquinaRoutes;
