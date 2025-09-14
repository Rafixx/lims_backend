"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimPlantillaTecnicaRoutes = void 0;
//src/routes/dimPlantillaTecnica.routes.ts
const express_1 = require("express");
const dimPlantillaTecnica_controller_1 = require("../controllers/dimPlantillaTecnica.controller");
const router = (0, express_1.Router)();
exports.dimPlantillaTecnicaRoutes = router;
router.get('/', dimPlantillaTecnica_controller_1.getPlantillasTecnicas);
router.get('/:id', dimPlantillaTecnica_controller_1.getPlantillaTecnicaById);
router.post('/', dimPlantillaTecnica_controller_1.createPlantillaTecnica);
router.put('/:id', dimPlantillaTecnica_controller_1.updatePlantillaTecnica);
router.delete('/:id', dimPlantillaTecnica_controller_1.deletePlantillaTecnica);
