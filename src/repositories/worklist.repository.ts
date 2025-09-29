import { literal } from 'sequelize';
import { Worklist } from '../models/Worklist';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';

interface CrearWorklistData extends Partial<Worklist> {
  tecnicas?: Array<{ id_tecnica: number }>;
}

export class WorklistRepository {
  async findById(id: number) {
    return Worklist.scope('withRefs').findByPk(id);
  }

  async findAll() {
    return Worklist.scope('withRefs').findAll();
  }

  async findTecnicasById(id_worklist: number) {
    return Tecnica.scope('withRefs').findAll({
      where: { id_worklist },
    });
  }

  //getPosiblesTecnicaProc me devuelve las técnicas_proc únicas que tienen técnicas asociadas
  // que no están completadas o canceladas
  async getPosiblesTecnicaProc() {
    return DimTecnicaProc.findAll({
      attributes: ['tecnica_proc'],
      include: [
        {
          model: Tecnica,
          as: 'tecnicas',
          where: literal(`
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

  async getPosiblesTecnicas(tecnicaProc: string) {
    return Tecnica.findAll({
      attributes: ['id_tecnica'],
      include: [
        {
          model: DimTecnicaProc,
          as: 'tecnica_proc',
          where: { tecnica_proc: tecnicaProc },
          attributes: [],
          required: true,
        },
        {
          model: Muestra,
          as: 'muestra',
          attributes: ['codigo_epi', 'codigo_externo'],
        },
      ],
      where: literal(`
        "Tecnica"."estado" NOT IN ('COMPLETADA_TECNICA', 'CANCELADA_TECNICA') 
        AND "Tecnica"."delete_dt" IS NULL
        AND id_worklist IS NULL
      `),
      // raw: true,
    });
  }

  async create(data: CrearWorklistData) {
    // Extraer las técnicas del objeto de datos
    const { tecnicas, ...worklistData } = data;

    // Crear la worklist
    const nuevaWorklist = await Worklist.create(worklistData);

    // Si se proporcionaron técnicas, asignarlas a la worklist
    if (tecnicas && tecnicas.length > 0) {
      // Validar y filtrar IDs válidos
      // const idsToUpdate = tecnicas
      //   .map((t) => t.id_tecnica)
      //   .filter((id) => id !== undefined && id !== null && !isNaN(Number(id)))
      //   .map(Number);

      // Solo ejecutar UPDATE si hay IDs válidos
      if (tecnicas.length > 0) {
        await Tecnica.update(
          { id_worklist: nuevaWorklist.id_worklist },
          {
            where: literal(`
            id_tecnica IN (${tecnicas.join(',')}) 
            AND id_worklist IS NULL
          `),
          }
        );
      }
    }

    return nuevaWorklist;
  }

  async update(worklist: Worklist, data: Partial<Worklist>) {
    return worklist.update(data);
  }

  async delete(worklist: Worklist) {
    return worklist.destroy();
  }

  async setTecnicoLab(idWorklist: number, idTecnico: number) {
    return Tecnica.update(
      { id_tecnico_resp: idTecnico },
      {
        where: { id_worklist: idWorklist },
      }
    );
  }
}
