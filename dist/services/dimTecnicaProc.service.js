"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimTecnicaProcService = void 0;
const DimTecnicaProc_1 = require("../models/DimTecnicaProc");
class DimTecnicaProcService {
    async createTecnicaProc(data) {
        const tecnicaProc = await DimTecnicaProc_1.DimTecnicaProc.create(data);
        return tecnicaProc;
    }
    async getTecnicaProcById(id) {
        const tecnicaProc = await DimTecnicaProc_1.DimTecnicaProc.findByPk(id);
        if (!tecnicaProc) {
            throw new Error('Técnica Proc no encontrada');
        }
        return tecnicaProc;
    }
    async getAllTecnicasProc() {
        return DimTecnicaProc_1.DimTecnicaProc.findAll();
    }
    async updateTecnicaProc(id, data) {
        const tecnicaProc = await DimTecnicaProc_1.DimTecnicaProc.findByPk(id);
        if (!tecnicaProc) {
            throw new Error('Técnica Proc no encontrada');
        }
        await tecnicaProc.update(data);
        return tecnicaProc;
    }
    async deleteTecnicaProc(id) {
        const tecnicaProc = await DimTecnicaProc_1.DimTecnicaProc.findByPk(id);
        if (!tecnicaProc) {
            throw new Error('Técnica Proc no encontrada');
        }
        await tecnicaProc.destroy();
        return { message: 'Técnica Proc eliminada correctamente' };
    }
}
exports.DimTecnicaProcService = DimTecnicaProcService;
