"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuestraService = void 0;
const muestra_repository_1 = require("../repositories/muestra.repository");
class MuestraService {
    constructor(muestraRepo = new muestra_repository_1.MuestraRepository()) {
        this.muestraRepo = muestraRepo;
    }
    async createMuestra(data) {
        // Validar que los datos obligatorios estén presentes
        if (!data.solicitud?.cliente?.id) {
            throw new Error('El cliente es obligatorio para crear una muestra');
        }
        // Establecer fecha de recepción por defecto si no se proporciona
        if (!data.f_recepcion) {
            data.f_recepcion = new Date().toISOString();
        }
        const resultado = await this.muestraRepo.create(data);
        return {
            ...resultado.toJSON(),
            mensaje: 'Muestra, solicitud y técnicas creadas correctamente',
            tecnicasCreadas: data.tecnicas ? data.tecnicas.length : 0,
        };
    }
    async getMuestraById(id) {
        const muestra = await this.muestraRepo.findById(id);
        if (!muestra) {
            throw new Error('Muestra no encontrada');
        }
        return muestra;
    }
    async getTecnicasById(id_muestra) {
        const muestra = await this.muestraRepo.findTecnicasById(id_muestra);
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
    async getMuestrasStats() {
        return this.muestraRepo.getMuestrasStats();
    }
}
exports.MuestraService = MuestraService;
