"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuestraService = void 0;
const muestra_repository_1 = require("../repositories/muestra.repository");
class MuestraService {
    constructor(muestraRepo = new muestra_repository_1.MuestraRepository()) {
        this.muestraRepo = muestraRepo;
    }
    async createMuestra(data) {
        return this.muestraRepo.create({
            ...data,
            f_recepcion: data.f_recepcion ?? new Date(),
        });
    }
    async getMuestraById(id) {
        const muestra = await this.muestraRepo.findById(id);
        if (!muestra) {
            throw new Error('Muestra no encontrada');
        }
        return muestra;
    }
    async getBySolicitudId(id_solicitud) {
        const muestra = await this.muestraRepo.findBySolicitudId(id_solicitud);
        if (!muestra) {
            throw new Error('Muestra no encontrada');
        }
        return muestra;
    }
    async getAllMuestras() {
        return this.muestraRepo.findAll();
    }
    async updateMuestra(id, data) {
        const muestra = await this.muestraRepo.findById(id);
        if (!muestra) {
            throw new Error('Muestra no encontrada');
        }
        return this.muestraRepo.update(muestra, data);
    }
    async deleteMuestra(id) {
        const muestra = await this.muestraRepo.findById(id);
        if (!muestra) {
            throw new Error('Muestra no encontrada');
        }
        await this.muestraRepo.delete(muestra);
        return { message: 'Muestra eliminada correctamente' };
    }
}
exports.MuestraService = MuestraService;
