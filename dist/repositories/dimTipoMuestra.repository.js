"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimTipoMuestraRepository = void 0;
// src/repositories/dimTipoMuestra.repository.ts
const DimTipoMuestra_1 = require("../models/DimTipoMuestra");
class DimTipoMuestraRepository {
    async findAll() {
        return DimTipoMuestra_1.DimTipoMuestra.findAll({ order: [['tipo_muestra', 'ASC']] });
    }
    async findById(id) {
        return DimTipoMuestra_1.DimTipoMuestra.findByPk(id);
    }
    async create(data) {
        return DimTipoMuestra_1.DimTipoMuestra.create(data);
    }
    async update(tipoMuestra, data) {
        return tipoMuestra.update(data);
    }
    async delete(tipoMuestra) {
        return tipoMuestra.destroy();
    }
}
exports.DimTipoMuestraRepository = DimTipoMuestraRepository;
