// src/routes/solicitud.routes.ts
import { Router } from 'express';
import {
  getSolicitudes,
  getSolicitudById,
  // getTecnicasBySolicitud,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
} from '../controllers/solicitud.controller';

const router = Router();

router.get('/', getSolicitudes);
router.get('/:id', getSolicitudById);
// router.get('/:id/tecnicas', getTecnicasBySolicitud);
router.post('/', createSolicitud);
router.put('/:id', updateSolicitud);
router.delete('/:id', deleteSolicitud);

export { router as solicitudRoutes };
