"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.muestraRoutes = void 0;
// src/routes/muestra.routes.ts
const express_1 = require("express");
const muestra_controller_1 = require("../controllers/muestra.controller");
const router = (0, express_1.Router)();
exports.muestraRoutes = router;
router.get('/', muestra_controller_1.getMuestras);
router.get('/estadisticas', muestra_controller_1.getMuestrasStats);
router.get('/:id', muestra_controller_1.getMuestraById);
router.get('/:id/tecnicas', muestra_controller_1.getTecnicasById);
router.post('/', muestra_controller_1.createMuestra);
router.put('/:id', muestra_controller_1.updateMuestra);
router.delete('/:id', muestra_controller_1.deleteMuestra);
