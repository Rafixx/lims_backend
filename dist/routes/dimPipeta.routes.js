"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimPipetaRoutes = void 0;
//src/routes/dimPipeta.routes.ts
const express_1 = require("express");
const dimPipeta_controller_1 = require("../controllers/dimPipeta.controller");
const router = (0, express_1.Router)();
exports.dimPipetaRoutes = router;
router.get('/', dimPipeta_controller_1.getDimPipetas);
router.get('/:id', dimPipeta_controller_1.getDimPipetaById);
router.post('/', dimPipeta_controller_1.createDimPipeta);
router.put('/:id', dimPipeta_controller_1.updateDimPipeta);
router.delete('/:id', dimPipeta_controller_1.deleteDimPipeta);
