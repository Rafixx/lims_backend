"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimUbicacionService = void 0;
// src/services/dimUbicacion.service.ts
const DimUbicacion_1 = require("../models/DimUbicacion");
class DimUbicacionService {
    async getAll() {
        return DimUbicacion_1.DimUbicacion.findAll();
    }
    async getById(id) {
        const ubicacion = await DimUbicacion_1.DimUbicacion.findByPk(id);
        if (!ubicacion)
            throw new Error('Ubicación no encontrada');
        return ubicacion;
    }
    async create(data) {
        return DimUbicacion_1.DimUbicacion.create(data);
    }
    async update(id, data) {
        const ubicacion = await this.getById(id);
        return ubicacion.update(data);
    }
    async delete(id) {
        const ubicacion = await this.getById(id);
        return ubicacion.destroy();
    }
}
exports.DimUbicacionService = DimUbicacionService;
