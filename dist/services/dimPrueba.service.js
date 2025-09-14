"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPruebaService = void 0;
const DimPrueba_1 = require("../models/DimPrueba");
const DimTecnicaProc_1 = require("../models/DimTecnicaProc");
class DimPruebaService {
    async createPrueba(data) {
        const prueba = await DimPrueba_1.DimPrueba.create(data);
        return prueba;
    }
    async getPruebaById(id) {
        const prueba = await DimPrueba_1.DimPrueba.findByPk(id);
        if (!prueba) {
            throw new Error('Prueba no encontrada');
        }
        return prueba;
    }
    //obtener dim_tecnica_proc por prueba
    async getTecnicasByPrueba(id) {
        const prueba = await DimPrueba_1.DimPrueba.findByPk(id, {
            include: [
                {
                    model: DimTecnicaProc_1.DimTecnicaProc,
                    as: 'tecnicas',
                    attributes: ['id', 'tecnica_proc'],
                },
            ],
        });
        if (!prueba) {
            throw new Error('Prueba no encontrada');
        }
        return prueba.tecnicas;
    }
    async getAllPruebas() {
        return DimPrueba_1.DimPrueba.findAll();
    }
    async updatePrueba(id, data) {
        const prueba = await DimPrueba_1.DimPrueba.findByPk(id);
        if (!prueba) {
            throw new Error('Prueba no encontrada');
        }
        await prueba.update(data);
        return prueba;
    }
    async deletePrueba(id) {
        const prueba = await DimPrueba_1.DimPrueba.findByPk(id);
        if (!prueba) {
            throw new Error('Prueba no encontrada');
        }
        await prueba.destroy();
        return { message: 'Prueba eliminada correctamente' };
    }
}
exports.DimPruebaService = DimPruebaService;
