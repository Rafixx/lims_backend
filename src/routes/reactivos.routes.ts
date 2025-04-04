//src/routes/reactivos.routes.ts
import { Router } from 'express';
import {
  getReactivos,
  getReactivoById,
} from '../controllers/reactivos.controller';

const reactivoRoutes = Router();
reactivoRoutes.get('/', getReactivos);
reactivoRoutes.get('/:id', getReactivoById);

export default reactivoRoutes;
