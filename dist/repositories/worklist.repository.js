"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorklistRepository = void 0;
const sequelize_1 = require("sequelize");
const Worklist_1 = require("../models/Worklist");
const Tecnica_1 = require("../models/Tecnica");
const DimTecnicaProc_1 = require("../models/DimTecnicaProc");
const Muestra_1 = require("../models/Muestra");
const DimEstado_1 = require("../models/DimEstado");
class WorklistRepository {
    async findById(id) {
        return Worklist_1.Worklist.scope('withRefs').findByPk(id);
    }
    async findAll() {
        return Worklist_1.Worklist.scope('withRefs').findAll();
    }
    async findTecnicasById(id_worklist) {
        return Tecnica_1.Tecnica.scope('withRefs').findAll({
            where: { id_worklist },
        });
    }
    /**
     * Obtiene las técnicas_proc únicas que tienen técnicas disponibles
     * (no completadas, no canceladas, sin worklist asignado)
     */
    async getPosiblesTecnicaProc() {
        // Obtener IDs de estados finales para TECNICA
        const estadosFinales = await DimEstado_1.DimEstado.findAll({
            where: {
                entidad: 'TECNICA',
                es_final: true,
                activo: true,
            },
            attributes: ['id'],
            raw: true,
        });
        const idsEstadosFinales = estadosFinales.map((e) => e.id);
        return DimTecnicaProc_1.DimTecnicaProc.findAll({
            attributes: ['tecnica_proc'],
            include: [
                {
                    model: Tecnica_1.Tecnica,
                    as: 'tecnicas',
                    where: (0, sequelize_1.literal)(`
            "tecnicas"."delete_dt" IS NULL
            AND "tecnicas"."id_worklist" IS NULL
            ${idsEstadosFinales.length > 0 ? `AND ("tecnicas"."id_estado" IS NULL OR "tecnicas"."id_estado" NOT IN (${idsEstadosFinales.join(',')}))` : ''}
          `),
                    attributes: [],
                    required: true,
                },
            ],
            group: ['DimTecnicaProc.tecnica_proc'],
            raw: true,
        });
    }
    /**
     * Obtiene técnicas disponibles para un proceso específico
     * (no completadas, no canceladas, sin worklist asignado)
     */
    async getPosiblesTecnicas(tecnicaProc) {
        // Obtener IDs de estados finales para TECNICA
        const estadosFinales = await DimEstado_1.DimEstado.findAll({
            where: {
                entidad: 'TECNICA',
                es_final: true,
                activo: true,
            },
            attributes: ['id'],
            raw: true,
        });
        const idsEstadosFinales = estadosFinales.map((e) => e.id);
        return Tecnica_1.Tecnica.findAll({
            attributes: ['id_tecnica', 'id_estado'],
            include: [
                {
                    model: DimEstado_1.DimEstado,
                    as: 'estadoInfo',
                    attributes: ['id', 'estado', 'color', 'descripcion'],
                    where: { entidad: 'TECNICA' },
                    required: false,
                },
                {
                    model: DimTecnicaProc_1.DimTecnicaProc,
                    as: 'tecnica_proc',
                    where: { tecnica_proc: tecnicaProc },
                    attributes: [],
                    required: true,
                },
                {
                    model: Muestra_1.Muestra,
                    as: 'muestra',
                    attributes: ['codigo_epi', 'codigo_externo'],
                },
            ],
            where: (0, sequelize_1.literal)(`
        "Tecnica"."delete_dt" IS NULL
        AND "Tecnica"."id_worklist" IS NULL
        ${idsEstadosFinales.length > 0 ? `AND ("Tecnica"."id_estado" IS NULL OR "Tecnica"."id_estado" NOT IN (${idsEstadosFinales.join(',')}))` : ''}
      `),
        });
    }
    async create(data) {
        // Extraer las técnicas del objeto de datos
        const { tecnicas, ...worklistData } = data;
        // Crear la worklist
        const nuevaWorklist = await Worklist_1.Worklist.create(worklistData);
        // Si se proporcionaron técnicas, asignarlas a la worklist
        if (tecnicas && tecnicas.length > 0) {
            // Validar y filtrar IDs válidos
            // const idsToUpdate = tecnicas
            //   .map((t) => t.id_tecnica)
            //   .filter((id) => id !== undefined && id !== null && !isNaN(Number(id)))
            //   .map(Number);
            // Solo ejecutar UPDATE si hay IDs válidos
            if (tecnicas.length > 0) {
                await Tecnica_1.Tecnica.update({ id_worklist: nuevaWorklist.id_worklist }, {
                    where: (0, sequelize_1.literal)(`
            id_tecnica IN (${tecnicas.join(',')}) 
            AND id_worklist IS NULL
          `),
                });
            }
        }
        return nuevaWorklist;
    }
    async update(worklist, data) {
        return worklist.update(data);
    }
    async delete(worklist) {
        return worklist.destroy();
    }
    async setTecnicoLab(idWorklist, idTecnico) {
        return Tecnica_1.Tecnica.update({ id_tecnico_resp: idTecnico }, {
            where: { id_worklist: idWorklist },
        });
    }
}
exports.WorklistRepository = WorklistRepository;
