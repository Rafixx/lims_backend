"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimMaquinaRoutes = void 0;
//src/routes/dimMaquina.routes.ts
const express_1 = require("express");
const dimMaquina_controller_1 = require("../controllers/dimMaquina.controller");
const router = (0, express_1.Router)();
exports.dimMaquinaRoutes = router;
router.get('/', dimMaquina_controller_1.getDimMaquinas);
router.get('/:id', dimMaquina_controller_1.getDimMaquinaById);
router.post('/', dimMaquina_controller_1.createDimMaquina);
router.put('/:id', dimMaquina_controller_1.updateDimMaquina);
router.delete('/:id', dimMaquina_controller_1.deleteDimMaquina);
