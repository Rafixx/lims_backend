"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimCentroRoutes = void 0;
//src/models/DimCentro.ts
const express_1 = require("express");
const dimCentro_controller_1 = require("../controllers/dimCentro.controller");
const router = (0, express_1.Router)();
exports.dimCentroRoutes = router;
router.get('/', dimCentro_controller_1.getDimCentros);
router.get('/:id', dimCentro_controller_1.getDimCentroById);
router.post('/', dimCentro_controller_1.createDimCentro);
router.put('/:id', dimCentro_controller_1.updateDimCentro);
router.delete('/:id', dimCentro_controller_1.deleteDimCentro);
