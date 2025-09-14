"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tecnicoLabRoutes = void 0;
//src/routes/tecnicoLab.routes.ts
const express_1 = require("express");
const tecnicoLab_controller_1 = require("../controllers/tecnicoLab.controller");
const router = (0, express_1.Router)();
exports.tecnicoLabRoutes = router;
router.get('/', tecnicoLab_controller_1.getAllTecnicoLab);
