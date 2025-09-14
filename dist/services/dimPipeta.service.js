"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPipetaService = void 0;
// src/services/dimPipetas.service.ts
const DimPipeta_1 = require("../models/DimPipeta");
class DimPipetaService {
    async getAllDimPipetas() {
        return DimPipeta_1.DimPipeta.findAll();
    }
    async getDimPipetaById(id) {
        const pipeta = await DimPipeta_1.DimPipeta.findByPk(id);
        if (!pipeta) {
            throw new Error('Pipeta no encontrada');
        }
        return pipeta;
    }
    async createDimPipeta(data) {
        return DimPipeta_1.DimPipeta.create(data);
    }
    async updateDimPipeta(id, data) {
        const pipeta = await DimPipeta_1.DimPipeta.findByPk(id);
        if (!pipeta) {
            throw new Error('Pipeta no encontrada');
        }
        return pipeta.update(data);
    }
    async deleteDimPipeta(id) {
        const pipeta = await DimPipeta_1.DimPipeta.findByPk(id);
        if (!pipeta) {
            throw new Error('Pipeta no encontrada');
        }
        await pipeta.destroy();
    }
}
exports.DimPipetaService = DimPipetaService;
