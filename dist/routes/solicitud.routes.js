"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solicitudRoutes = void 0;
// src/routes/solicitud.routes.ts
const express_1 = require("express");
const solicitud_controller_1 = require("../controllers/solicitud.controller");
const router = (0, express_1.Router)();
exports.solicitudRoutes = router;
router.get('/', solicitud_controller_1.getSolicitudes);
router.get('/:id', solicitud_controller_1.getSolicitudById);
// router.get('/:id/tecnicas', getTecnicasBySolicitud);
router.post('/', solicitud_controller_1.createSolicitud);
router.put('/:id', solicitud_controller_1.updateSolicitud);
router.delete('/:id', solicitud_controller_1.deleteSolicitud);
