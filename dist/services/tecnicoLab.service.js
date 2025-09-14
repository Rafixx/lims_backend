"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TecnicoLabService = void 0;
//src/services/dimCentro.service.ts
const Usuario_1 = require("../models/Usuario");
class TecnicoLabService {
    async getAllTecnicoLabService() {
        const rows = await Usuario_1.Usuario.scope('tecnicosLab').findAll({
            attributes: ['id_usuario', 'nombre'],
            raw: true,
        });
        return rows;
    }
}
exports.TecnicoLabService = TecnicoLabService;
