"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worklistRouter = void 0;
const express_1 = require("express");
const worklist_controller_1 = require("../controllers/worklist.controller");
const router = (0, express_1.Router)();
exports.worklistRouter = router;
// ========== RUTAS ESPECÍFICAS (DEBEN IR PRIMERO) ==========
// GET /api/worklists/posibles-tecnicas-proc - Obtener procesos con técnicas disponibles
router.get('/posibles-tecnicas-proc', worklist_controller_1.getPosiblesTecnicaProc);
// Alias para compatibilidad con URL antigua (camelCase)
router.get('/posiblesTecnicasProc', worklist_controller_1.getPosiblesTecnicaProc);
// GET /api/worklists/posibles-tecnicas/:tecnicaProc - Obtener técnicas disponibles por proceso
router.get('/posibles-tecnicas/:tecnicaProc', worklist_controller_1.getPosiblesTecnicas);
// Alias para compatibilidad con URL antigua (camelCase)
router.get('/posiblesTecnicas/:tecnicaProc', worklist_controller_1.getPosiblesTecnicas);
// ========== RUTAS GENERALES ==========
// GET /api/worklists - Listar todos los worklists
router.get('/', worklist_controller_1.getWorklists);
// GET /api/worklists/:id - Obtener worklist por ID
router.get('/:id', worklist_controller_1.getWorklistById);
// GET /api/worklists/:id/tecnicas - Obtener técnicas de un worklist
router.get('/:id/tecnicas', worklist_controller_1.getTecnicasById);
// POST /api/worklists - Crear nuevo worklist
router.post('/', worklist_controller_1.createWorklist);
// PUT /api/worklists/:id - Actualizar worklist
router.put('/:id', worklist_controller_1.updateWorklist);
// PUT /api/worklists/:id/setTecnicoLab - Asignar técnico a worklist
router.put('/:id/setTecnicoLab', worklist_controller_1.setTecnicoLab);
// DELETE /api/worklists/:id - Eliminar worklist
router.delete('/:id', worklist_controller_1.deleteWorklist);
