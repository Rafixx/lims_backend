import { literal } from 'sequelize';
import { Worklist } from '../models/Worklist';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';
import { DimEstado } from '../models/DimEstado';
import { ResultadoRepository } from './resultado.repository';
import { Resultado } from '../models/Resultado';
import { TecnicaRepository } from './tecnica.repository';

interface CrearWorklistData extends Partial<Worklist> {
  tecnicas?: Array<{ id_tecnica: number }>;
}

// Interfaz para Tecnica con resultados cargados
interface TecnicaConResultados extends Tecnica {
  resultados?: Resultado[];
}

export class WorklistRepository {
  private resultadoRepository: ResultadoRepository;
  private tecnicaRepository: TecnicaRepository;

  constructor() {
    this.resultadoRepository = new ResultadoRepository();
    this.tecnicaRepository = new TecnicaRepository();
  }

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

  /**
   * Obtiene las técnicas_proc únicas que tienen técnicas disponibles
   * (no completadas, no canceladas, sin worklist asignado)
   */
  async getPosiblesTecnicaProc() {
    // Obtener IDs de estados finales para TECNICA
    const estadosFinales = await DimEstado.findAll({
      where: {
        entidad: 'TECNICA',
        es_final: true,
        activo: true,
      },
      attributes: ['id'],
      raw: true,
    });

    const idsEstadosFinales = estadosFinales.map((e) => e.id);

    return DimTecnicaProc.findAll({
      attributes: ['tecnica_proc'],
      include: [
        {
          model: Tecnica,
          as: 'tecnicas',
          where: literal(`
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
  async getPosiblesTecnicas(tecnicaProc: string) {
    // Obtener IDs de estados finales para TECNICA
    const estadosFinales = await DimEstado.findAll({
      where: {
        entidad: 'TECNICA',
        es_final: true,
        activo: true,
      },
      attributes: ['id'],
      raw: true,
    });

    const idsEstadosFinales = estadosFinales.map((e) => e.id);

    return Tecnica.findAll({
      attributes: ['id_tecnica', 'id_estado'],
      include: [
        {
          model: DimEstado,
          as: 'estadoInfo',
          attributes: ['id', 'estado', 'color', 'descripcion'],
          where: { entidad: 'TECNICA' },
          required: false,
        },
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
        "Tecnica"."delete_dt" IS NULL
        AND "Tecnica"."id_worklist" IS NULL
        ${idsEstadosFinales.length > 0 ? `AND ("Tecnica"."id_estado" IS NULL OR "Tecnica"."id_estado" NOT IN (${idsEstadosFinales.join(',')}))` : ''}
      `),
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
    // Obtener todas las técnicas del worklist
    const tecnicas = await this.findTecnicasById(idWorklist);

    if (!tecnicas || tecnicas.length === 0) {
      throw new Error(
        `No se encontraron técnicas para el worklist ${idWorklist}`
      );
    }

    // Asignar el técnico a cada técnica del worklist
    for (const tecnica of tecnicas) {
      await this.tecnicaRepository.asignarTecnico(
        tecnica.id_tecnica,
        idTecnico
      );
    }
  }

  /**
   * Importa datos de resultados para un worklist
   * @param idWorklist ID del worklist
   * @returns Promise<{ success: boolean; message: string; resultadosCreados: number }>
   */
  async importDataResults(idWorklist: number): Promise<{
    success: boolean;
    message: string;
    resultadosCreados?: number;
  }> {
    // Validar que el worklist existe
    const worklist = await Worklist.findByPk(idWorklist);
    if (!worklist) {
      return {
        success: false,
        message: `Worklist con ID ${idWorklist} no encontrado`,
      };
    }

    // Obtener todas las técnicas del worklist que no tienen resultados
    const tecnicas = await this.findTecnicasById(idWorklist);

    // Filtrar solo las técnicas que NO tienen resultados asociados
    // Cast a TecnicaConResultados para acceder a la propiedad resultados
    const tecnicasSinResultados = (tecnicas as TecnicaConResultados[]).filter(
      (tecnica) => !tecnica.resultados || tecnica.resultados.length === 0
    );

    if (!tecnicasSinResultados || tecnicasSinResultados.length === 0) {
      return {
        success: false,
        message: `Las Tecnicas ya tienen resultados en el worklist ${idWorklist}`,
      };
    }

    // Generar resultados para cada técnica
    const resultadosCreados = [];

    for (const tecnica of tecnicasSinResultados) {
      // Generar valor aleatorio entre 0.00 y 5.99
      const valorAleatorio = (Math.random() * 6).toFixed(2);

      try {
        const resultado = await this.resultadoRepository.create({
          id_tecnica: tecnica.id_tecnica,
          id_muestra: tecnica.id_muestra,
          valor: valorAleatorio,
          tipo_res: 'NUMERICO',
          f_resultado: new Date(),
        });

        resultadosCreados.push(resultado);
        await this.tecnicaRepository.completarTecnica(tecnica.id_tecnica);
      } catch (error) {
        console.error(
          `Error al crear resultado para técnica ${tecnica.id_tecnica}:`,
          error
        );
        // Continuar con las demás técnicas
      }
    }

    return {
      success: true,
      message: `Importación completada. ${resultadosCreados.length} resultados creados de ${tecnicasSinResultados.length} técnicas sin resultados previos`,
      resultadosCreados: resultadosCreados.length,
    };
  }
}
