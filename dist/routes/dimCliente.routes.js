"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dimClienteRoutes = void 0;
//src/routes/dimCliente.routes.ts
const express_1 = require("express");
const dimCliente_controller_1 = require("../controllers/dimCliente.controller");
const router = (0, express_1.Router)();
exports.dimClienteRoutes = router;
router.get('/', dimCliente_controller_1.getClientes);
router.get('/:id', dimCliente_controller_1.getClienteById);
router.post('/', dimCliente_controller_1.createCliente);
router.put('/:id', dimCliente_controller_1.updateCliente);
router.delete('/:id', dimCliente_controller_1.deleteCliente);
