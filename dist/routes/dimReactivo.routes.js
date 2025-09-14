"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimReactivoRoutes = void 0;
//src/routes/dimReactivo.routes.ts
const express_1 = require("express");
const dimReactivo_controller_1 = require("../controllers/dimReactivo.controller");
const router = (0, express_1.Router)();
exports.dimReactivoRoutes = router;
router.get('/', dimReactivo_controller_1.getDimReactivos);
router.get('/:id', dimReactivo_controller_1.getDimReactivoById);
router.post('/', dimReactivo_controller_1.createDimReactivo);
router.put('/:id', dimReactivo_controller_1.updateDimReactivo);
router.delete('/:id', dimReactivo_controller_1.deleteDimReactivo);
