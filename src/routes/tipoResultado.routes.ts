import { Router } from 'express';
import {
  getTiposResultado,
  getTipoResultadoById,
} from '../controllers/tipoResultado.controller';

const tipoResultadoRoutes = Router();

//endppoits para la entidad "tipoResultado"
tipoResultadoRoutes.get('/', getTiposResultado);
tipoResultadoRoutes.get('/:id', getTipoResultadoById);

export default tipoResultadoRoutes;
