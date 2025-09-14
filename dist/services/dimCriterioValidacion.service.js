"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimCriterioValidacionService = void 0;
const DimCriterioValidacion_1 = require("../models/DimCriterioValidacion");
class DimCriterioValidacionService {
    async getAllDimCriteriosValidacion() {
        return DimCriterioValidacion_1.DimCriterioValidacion.findAll();
    }
    async getDimCriterioValidacionById(id) {
        const criterio = await DimCriterioValidacion_1.DimCriterioValidacion.findByPk(id);
        if (!criterio)
            throw new Error('Criterio no encontrado');
        return criterio;
    }
    async createDimCriterioValidacion(data) {
        return DimCriterioValidacion_1.DimCriterioValidacion.create(data);
    }
    async updateDimCriterioValidacion(id, data) {
        const criterio = await DimCriterioValidacion_1.DimCriterioValidacion.findByPk(id);
        if (!criterio)
            throw new Error('Criterio no encontrado');
        return criterio.update(data);
    }
    async deleteDimCriterioValidacion(id) {
        const criterio = await DimCriterioValidacion_1.DimCriterioValidacion.findByPk(id);
        if (!criterio)
            throw new Error('Criterio no encontrado');
        await criterio.destroy();
    }
}
exports.DimCriterioValidacionService = DimCriterioValidacionService;
