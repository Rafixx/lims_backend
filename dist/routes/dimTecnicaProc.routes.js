"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimTecnicaProcRoutes = void 0;
//src/routes/dimTecnicaProc.routes.ts
const express_1 = require("express");
const dimTecnicaProc_controller_1 = require("../controllers/dimTecnicaProc.controller");
const router = (0, express_1.Router)();
exports.dimTecnicaProcRoutes = router;
router.get('/', dimTecnicaProc_controller_1.getTecnicasProc);
router.get('/:id', dimTecnicaProc_controller_1.getTecnicaProcById);
router.post('/', dimTecnicaProc_controller_1.createTecnicaProc);
router.put('/:id', dimTecnicaProc_controller_1.updateTecnicaProc);
router.delete('/:id', dimTecnicaProc_controller_1.deleteTecnicaProc);
