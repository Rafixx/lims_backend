"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorklistService = void 0;
const worklist_repository_1 = require("../repositories/worklist.repository");
class WorklistService {
    constructor(workListRepo = new worklist_repository_1.WorklistRepository()) {
        this.workListRepo = workListRepo;
    }
    async getWorklistById(id) {
        const worklist = await this.workListRepo.findById(id);
        if (!worklist) {
            throw new Error('Worklist no encontrada');
        }
        return worklist;
    }
    async getAllWorklists() {
        return this.workListRepo.findAll();
    }
    async getTecnicasById(id_worklist) {
        const worklist = await this.workListRepo.findTecnicasById(id_worklist);
        if (!worklist) {
            throw new Error('Técnicas no encontradas');
        }
        return worklist;
    }
    async getPosiblesTecnicaProc() {
        const posiblesTecnicasProc = await this.workListRepo.getPosiblesTecnicaProc();
        if (!posiblesTecnicasProc) {
            throw new Error('Técnicas no encontradas');
        }
        return posiblesTecnicasProc;
    }
    async getPosiblesTecnicas(tecnicaProc) {
        const posiblesTecnicas = await this.workListRepo.getPosiblesTecnicas(tecnicaProc);
        if (!posiblesTecnicas) {
            throw new Error('Técnicas no encontradas');
        }
        return posiblesTecnicas;
    }
    async createWorklist(data) {
        // Validar que si se proporcionan técnicas, no estén vacías
        if (data.tecnicas && data.tecnicas.length === 0) {
            throw new Error('Si se proporcionan técnicas, el array no puede estar vacío');
        }
        const nuevaWorklist = await this.workListRepo.create({
            ...data,
            create_dt: new Date(),
        });
        return {
            ...nuevaWorklist.toJSON(),
            tecnicasAsignadas: data.tecnicas ? data.tecnicas.length : 0,
            mensaje: data.tecnicas
                ? `Worklist creada con ${data.tecnicas.length} técnicas asignadas`
                : 'Worklist creada sin técnicas asignadas',
        };
    }
    async updateWorklist(id, data) {
        const worklist = await this.workListRepo.findById(id);
        if (!worklist) {
            throw new Error('Worklist no encontrada');
        }
        return this.workListRepo.update(worklist, data);
    }
    async deleteWorklist(id) {
        const worklist = await this.workListRepo.findById(id);
        if (!worklist) {
            throw new Error('Worklist no encontrada');
        }
        await this.workListRepo.delete(worklist);
        return { message: 'Worklist eliminada correctamente' };
    }
    async setTecnicoLab(idWorklist, idTecnico) {
        // Verificar que la worklist existe
        const worklist = await this.workListRepo.findById(idWorklist);
        if (!worklist) {
            throw new Error('Worklist no encontrada');
        }
        const resultado = await this.workListRepo.setTecnicoLab(idWorklist, idTecnico);
        if (resultado[0] === 0) {
            throw new Error('No se encontraron técnicas para actualizar en esta worklist');
        }
        return {
            message: 'Técnico de laboratorio asignado correctamente',
            tecnicasActualizadas: resultado[0],
        };
    }
}
exports.WorklistService = WorklistService;
