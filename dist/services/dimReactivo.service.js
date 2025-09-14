"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimReactivoService = void 0;
// src/services/dimReactivos.service.ts
const DimReactivo_1 = require("../models/DimReactivo");
class DimReactivoService {
    async getAllDimReactivos() {
        return DimReactivo_1.DimReactivo.findAll();
    }
    async getDimReactivoById(id) {
        const reactivo = await DimReactivo_1.DimReactivo.findByPk(id);
        if (!reactivo) {
            throw new Error('Reactivo no encontrado');
        }
        return reactivo;
    }
    async createDimReactivo(data) {
        return DimReactivo_1.DimReactivo.create(data);
    }
    async updateDimReactivo(id, data) {
        const reactivo = await DimReactivo_1.DimReactivo.findByPk(id);
        if (!reactivo) {
            throw new Error('Reactivo no encontrado');
        }
        return reactivo.update(data);
    }
    async deleteDimReactivo(id) {
        const reactivo = await DimReactivo_1.DimReactivo.findByPk(id);
        if (!reactivo) {
            throw new Error('Reactivo no encontrado');
        }
        await reactivo.destroy();
    }
}
exports.DimReactivoService = DimReactivoService;
