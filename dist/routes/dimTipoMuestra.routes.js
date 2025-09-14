"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimTipoMuestraRoutes = void 0;
// src/routes/dimTipoMuestra.routes.ts
const express_1 = require("express");
const dimTipoMuestra_controller_1 = require("../controllers/dimTipoMuestra.controller");
const router = (0, express_1.Router)();
exports.dimTipoMuestraRoutes = router;
router.get('/', dimTipoMuestra_controller_1.getTiposMuestra);
router.get('/:id', dimTipoMuestra_controller_1.getTipoMuestraById);
router.post('/', dimTipoMuestra_controller_1.createTipoMuestra);
router.put('/:id', dimTipoMuestra_controller_1.updateTipoMuestra);
router.delete('/:id', dimTipoMuestra_controller_1.deleteTipoMuestra);
