"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimMaquinaService = void 0;
// src/services/dimMaquinas.service.ts
const DimMaquina_1 = require("../models/DimMaquina");
class DimMaquinaService {
    async getAllDimMaquinas() {
        return DimMaquina_1.DimMaquina.findAll();
    }
    async getDimMaquinaById(id) {
        const maquina = await DimMaquina_1.DimMaquina.findByPk(id);
        if (!maquina) {
            throw new Error('Máquina no encontrada');
        }
        return maquina;
    }
    async createDimMaquina(data) {
        return DimMaquina_1.DimMaquina.create(data);
    }
    async updateDimMaquina(id, data) {
        const maquina = await DimMaquina_1.DimMaquina.findByPk(id);
        if (!maquina) {
            throw new Error('Máquina no encontrada');
        }
        return maquina.update(data);
    }
    async deleteDimMaquina(id) {
        const maquina = await DimMaquina_1.DimMaquina.findByPk(id);
        if (!maquina) {
            throw new Error('Máquina no encontrada');
        }
        await maquina.destroy();
    }
}
exports.DimMaquinaService = DimMaquinaService;
