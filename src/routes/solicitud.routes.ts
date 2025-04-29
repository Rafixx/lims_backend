// src/routes/solicitud.routes.ts
import { Router } from 'express';
import {
  getSolicitudes,
  getSolicitudById,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
} from '../controllers/solicitud.controller';

const router = Router();

router.get('/', getSolicitudes);
router.get('/:id', getSolicitudById);
router.post('/', createSolicitud);
router.put('/:id', updateSolicitud);
router.delete('/:id', deleteSolicitud);

export { router as solicitudRoutes };
