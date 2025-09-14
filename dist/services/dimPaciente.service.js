"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPacienteService = void 0;
// src/services/dimPaciente.service.ts
const DimPaciente_1 = require("../models/DimPaciente");
class DimPacienteService {
    async getAll() {
        return DimPaciente_1.DimPaciente.findAll();
    }
    async getById(id) {
        const paciente = await DimPaciente_1.DimPaciente.findByPk(id);
        if (!paciente)
            throw new Error('Paciente no encontrado');
        return paciente;
    }
    async create(data) {
        return DimPaciente_1.DimPaciente.create(data);
    }
    async update(id, data) {
        const paciente = await this.getById(id);
        return paciente.update(data);
    }
    async delete(id) {
        const paciente = await this.getById(id);
        return paciente.destroy();
    }
}
exports.DimPacienteService = DimPacienteService;
