"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimCentroService = void 0;
//src/services/dimCentro.service.ts
const DimCentro_1 = require("../models/DimCentro");
class DimCentroService {
    async getAllDimCentros() {
        return DimCentro_1.DimCentro.findAll();
    }
    async getDimCentroById(id) {
        const centro = await DimCentro_1.DimCentro.findByPk(id);
        if (!centro)
            throw new Error('Centro no encontrado');
        return centro;
    }
    async createDimCentro(data) {
        return DimCentro_1.DimCentro.create(data);
    }
    async updateDimCentro(id, data) {
        const centro = await DimCentro_1.DimCentro.findByPk(id);
        if (!centro)
            throw new Error('Centro no encontrado');
        return centro.update(data);
    }
    async deleteDimCentro(id) {
        const centro = await DimCentro_1.DimCentro.findByPk(id);
        if (!centro)
            throw new Error('Centro no encontrado');
        await centro.destroy();
    }
}
exports.DimCentroService = DimCentroService;
