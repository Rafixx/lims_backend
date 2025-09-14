"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimPruebaRoutes = void 0;
//src/routes/dimPrueba.routes.ts
const express_1 = require("express");
const dimPrueba_controller_1 = require("../controllers/dimPrueba.controller");
const router = (0, express_1.Router)();
exports.dimPruebaRoutes = router;
router.get('/', dimPrueba_controller_1.getPruebas);
router.get('/:id', dimPrueba_controller_1.getPruebaById);
router.get('/:id/tecnicas', dimPrueba_controller_1.getTecnicasByPrueba);
router.post('/', dimPrueba_controller_1.createPrueba);
router.put('/:id', dimPrueba_controller_1.updatePrueba);
router.delete('/:id', dimPrueba_controller_1.deletePrueba);
