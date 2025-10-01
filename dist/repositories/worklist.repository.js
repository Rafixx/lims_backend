"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorklistRepository = void 0;
const sequelize_1 = require("sequelize");
const Worklist_1 = require("../models/Worklist");
const Tecnica_1 = require("../models/Tecnica");
const DimTecnicaProc_1 = require("../models/DimTecnicaProc");
const Muestra_1 = require("../models/Muestra");
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
    //getPosiblesTecnicaProc me devuelve las técnicas_proc únicas que tienen técnicas asociadas
    // que no están completadas o canceladas
    async getPosiblesTecnicaProc() {
        return DimTecnicaProc_1.DimTecnicaProc.findAll({
            attributes: ['tecnica_proc'],
            include: [
                {
                    model: Tecnica_1.Tecnica,
                    as: 'tecnicas',
                    where: (0, sequelize_1.literal)(`
            "tecnicas"."estado" NOT IN ('COMPLETADA_TECNICA', 'CANCELADA_TECNICA') 
            AND "tecnicas"."delete_dt" IS NULL
            AND id_worklist IS NULL
          `),
                    attributes: [],
                    required: true,
                },
            ],
            group: ['DimTecnicaProc.tecnica_proc'],
            raw: true,
        });
    }
    async getPosiblesTecnicas(tecnicaProc) {
        return Tecnica_1.Tecnica.findAll({
            attributes: ['id_tecnica'],
            include: [
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
        "Tecnica"."estado" NOT IN ('COMPLETADA_TECNICA', 'CANCELADA_TECNICA') 
        AND "Tecnica"."delete_dt" IS NULL
        AND id_worklist IS NULL
      `),
            // raw: true,
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
