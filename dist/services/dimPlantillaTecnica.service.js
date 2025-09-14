"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPlantillaTecnicaService = void 0;
const DimPlantillaTecnica_1 = require("../models/DimPlantillaTecnica");
class DimPlantillaTecnicaService {
    async createPlantillaTecnica(data) {
        const plantilla = await DimPlantillaTecnica_1.DimPlantillaTecnica.create(data);
        return plantilla;
    }
    async getPlantillaTecnicaById(id) {
        const plantilla = await DimPlantillaTecnica_1.DimPlantillaTecnica.findByPk(id);
        if (!plantilla) {
            throw new Error('Plantilla Técnica no encontrada');
        }
        return plantilla;
    }
    async getAllPlantillasTecnicas() {
        return DimPlantillaTecnica_1.DimPlantillaTecnica.findAll();
    }
    async updatePlantillaTecnica(id, data) {
        const plantilla = await DimPlantillaTecnica_1.DimPlantillaTecnica.findByPk(id);
        if (!plantilla) {
            throw new Error('Plantilla Técnica no encontrada');
        }
        await plantilla.update(data);
        return plantilla;
    }
    async deletePlantillaTecnica(id) {
        const plantilla = await DimPlantillaTecnica_1.DimPlantillaTecnica.findByPk(id);
        if (!plantilla) {
            throw new Error('Plantilla Técnica no encontrada');
        }
        await plantilla.destroy();
        return { message: 'Plantilla Técnica eliminada correctamente' };
    }
}
exports.DimPlantillaTecnicaService = DimPlantillaTecnicaService;
