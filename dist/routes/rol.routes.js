"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolRoutes = void 0;
//src/routes/rol.routes.ts
const express_1 = require("express");
const rol_controller_1 = require("../controllers/rol.controller");
const router = (0, express_1.Router)();
exports.rolRoutes = router;
router.get('/:id', rol_controller_1.getRolById);
router.get('/', rol_controller_1.getRoles);
router.post('/', rol_controller_1.createRol);
router.put('/:id', rol_controller_1.updateRol);
router.delete('/:id', rol_controller_1.deleteRol);
