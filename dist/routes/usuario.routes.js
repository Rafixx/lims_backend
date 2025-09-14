"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioRoutes = void 0;
// src/routes/usuario.routes.ts
const express_1 = require("express");
const usuario_controller_1 = require("../controllers/usuario.controller");
const router = (0, express_1.Router)();
exports.usuarioRoutes = router;
// Endpoints para usuarios
router.get('/', usuario_controller_1.getUsuarios);
router.get('/:id', usuario_controller_1.getUsuarioById);
router.post('/', usuario_controller_1.createUsuario);
router.put('/:id', usuario_controller_1.updateUsuario);
router.delete('/:id', usuario_controller_1.deleteUsuario);
