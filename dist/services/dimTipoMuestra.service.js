"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimTipoMuestraService = void 0;
// src/services/dimTipoMuestra.service.ts
const dimTipoMuestra_repository_1 = require("../repositories/dimTipoMuestra.repository");
class DimTipoMuestraService {
    constructor(repo = new dimTipoMuestra_repository_1.DimTipoMuestraRepository()) {
        this.repo = repo;
    }
    async getAll() {
        return this.repo.findAll();
    }
    async getById(id) {
        const tipo = await this.repo.findById(id);
        if (!tipo) {
            throw new Error('Tipo de muestra no encontrado');
        }
        return tipo;
    }
    async create(data) {
        return this.repo.create(data);
    }
    async update(id, data) {
        const tipo = await this.repo.findById(id);
        if (!tipo) {
            throw new Error('Tipo de muestra no encontrado');
        }
        return this.repo.update(tipo, data);
    }
    async delete(id) {
        const tipo = await this.repo.findById(id);
        if (!tipo) {
            throw new Error('Tipo de muestra no encontrado');
        }
        return this.repo.delete(tipo);
    }
}
exports.DimTipoMuestraService = DimTipoMuestraService;
