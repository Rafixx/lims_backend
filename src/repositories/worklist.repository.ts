import { Op, fn, col, WhereOptions } from 'sequelize';
import { Worklist } from '../models/Worklist';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';
import { DimTipoMuestra } from '../models/DimTipoMuestra';
import { Usuario } from '../models/Usuario';
import { DimPaciente } from '../models/DimPaciente';

/**
 * Interfaz para los datos de creación de un worklist
 */
export interface CrearWorklistData {
  nombre?: string;
  created_by?: number;
}

/**
 * Interfaz para los datos de actualización de un worklist
 */
export interface ActualizarWorklistData {
  nombre?: string;
  id_tecnica_proc?: number;
  updated_by?: number;
}

/**
 * Interfaz para el resultado agrupado de técnicas por proceso en un worklist
 */
export interface TecnicasPorProceso {
  id_tecnica_proc: number;
  tecnica_proc: string;
  count: number;
}

/**
 * Interfaz para estadísticas de worklist
 */
export interface WorklistStats {
  totalTecnicas: number;
  tecnicasCompletadas: number;
  tecnicasPendientes: number;
  tecnicasEnProceso: number;
  porcentajeCompletado: number;
}

/**
 * Repositorio para manejar las operaciones CRUD de Worklist
 */
export class WorklistRepository {
  // ==================== OPERACIONES CRUD ====================

  /**
   * Crea un nuevo worklist
   * @param data Datos para crear el worklist
   * @returns Promise<Worklist> Worklist creado
   */
  async create(data: CrearWorklistData): Promise<Worklist> {
    try {
      return await Worklist.create({
        ...data,
        create_dt: new Date(),
        update_dt: new Date(),
      });
    } catch (error) {
      console.error('Error al crear worklist:', error);
      throw new Error('Error al crear worklist');
    }
  }

  /**
   * Obtiene todos los worklists activos
   * @returns Promise<Worklist[]> Lista de worklists
   */
  async getAll(): Promise<Worklist[]> {
    try {
      return await Worklist.findAll({
        where: {
          delete_dt: {
            [Op.is]: null,
          },
        },
        include: [
          {
            model: Tecnica,
            as: 'tecnicas',
            required: false,
            where: {
              delete_dt: {
                [Op.is]: null,
              },
            },
            include: [
              {
                model: DimTecnicaProc,
                as: 'tecnica_proc',
                attributes: ['id', 'tecnica_proc'],
                required: false,
              },
            ],
          },
          { model: DimTecnicaProc, as: 'tecnica_proc' },
        ],
        order: [['create_dt', 'DESC']],
      });
    } catch (error) {
      console.error('Error al obtener worklists:', error);
      throw new Error('Error al obtener worklists');
    }
  }

  /**
   * Obtiene un worklist por ID
   * @param id ID del worklist
   * @returns Promise<Worklist | null> Worklist encontrado o null
   */
  async getById(id: number): Promise<Worklist | null> {
    try {
      return await Worklist.findOne({
        where: {
          id_worklist: id,
          delete_dt: {
            [Op.is]: null,
          },
        },
        include: [
          {
            model: Tecnica,
            as: 'tecnicas',
            required: false,
            where: {
              delete_dt: {
                [Op.is]: null,
              },
            },
            include: [
              {
                model: DimTecnicaProc,
                as: 'tecnica_proc',
              },
              {
                model: Muestra,
                as: 'muestra',
                required: false,
                include: [
                  {
                    model: DimTipoMuestra,
                    as: 'tipo_muestra',
                    attributes: ['tipo_muestra'],
                  },
                  {
                    model: DimPaciente,
                    as: 'paciente',
                    attributes: ['nombre'],
                  },
                ],
              },
              {
                model: Usuario,
                as: 'tecnico',
                attributes: ['nombre'],
                required: false,
              },
            ],
          },
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc',
          },
        ],
      });
    } catch (error) {
      console.error('Error al obtener worklist por ID:', error);
      throw new Error('Error al obtener worklist por ID');
    }
  }

  /**
   * Actualiza un worklist
   * @param id ID del worklist
   * @param data Datos para actualizar
   * @returns Promise<Worklist | null> Worklist actualizado o null
   */
  async update(
    id: number,
    data: ActualizarWorklistData
  ): Promise<Worklist | null> {
    try {
      const [affectedCount] = await Worklist.update(
        {
          ...data,
          update_dt: new Date(),
        },
        {
          where: {
            id_worklist: id,
            delete_dt: {
              [Op.is]: null,
            },
          },
        }
      );

      if (affectedCount === 0) {
        return null;
      }

      return await this.getById(id);
    } catch (error) {
      console.error('Error al actualizar worklist:', error);
      throw new Error('Error al actualizar worklist');
    }
  }

  /**
   * Elimina un worklist (soft delete)
   * @param id ID del worklist
   * @param deletedBy ID del usuario que elimina
   * @returns Promise<boolean> true si se eliminó, false si no se encontró
   */
  async delete(id: number, deletedBy?: number): Promise<boolean> {
    try {
      const [affectedCount] = await Worklist.update(
        {
          delete_dt: new Date(),
          updated_by: deletedBy,
          update_dt: new Date(),
        },
        {
          where: {
            id_worklist: id,
            delete_dt: {
              [Op.is]: null,
            },
          },
        }
      );

      return affectedCount > 0;
    } catch (error) {
      console.error('Error al eliminar worklist:', error);
      throw new Error('Error al eliminar worklist');
    }
  }

  // ==================== OPERACIONES ESPECÍFICAS DE WORKLIST ====================

  /**
   * Asigna técnicas a un worklist
   * @param idWorklist ID del worklist
   * @param idsTecnicas IDs de las técnicas a asignar
   * @param updatedBy ID del usuario que realiza la operación
   * @returns Promise<number> Número de técnicas asignadas
   */
  async setTecnicas(
    idWorklist: number,
    idsTecnicas: number[],
    updatedBy?: number
  ): Promise<number> {
    try {
      const [affectedCount] = await Tecnica.update(
        {
          id_worklist: idWorklist,
          updated_by: updatedBy,
          update_dt: new Date(),
        },
        {
          where: {
            id_tecnica: {
              [Op.in]: idsTecnicas,
            },
            delete_dt: {
              [Op.is]: null,
            },
          },
        }
      );

      return affectedCount;
    } catch (error) {
      console.error('Error al asignar técnicas al worklist:', error);
      throw new Error('Error al asignar técnicas al worklist');
    }
  }

  /**
   * Remueve técnicas de un worklist
   * @param idWorklist ID del worklist
   * @param idsTecnicas IDs de las técnicas a remover (opcional, si no se proporciona remueve todas)
   * @param updatedBy ID del usuario que realiza la operación
   * @returns Promise<number> Número de técnicas removidas
   */
  async removeTecnicas(
    idWorklist: number,
    idsTecnicas?: number[],
    updatedBy?: number
  ): Promise<number> {
    try {
      const whereCondition: WhereOptions = {
        id_worklist: idWorklist,
        delete_dt: {
          [Op.is]: null,
        },
      };

      if (idsTecnicas && idsTecnicas.length > 0) {
        whereCondition.id_tecnica = { [Op.in]: idsTecnicas };
      }

      const [affectedCount] = await Tecnica.update(
        {
          id_worklist: undefined,
          updated_by: updatedBy,
          update_dt: new Date(),
        },
        {
          where: whereCondition,
        }
      );

      return affectedCount;
    } catch (error) {
      console.error('Error al remover técnicas del worklist:', error);
      throw new Error('Error al remover técnicas del worklist');
    }
  }

  /**
   * Obtiene estadísticas de un worklist
   * @param idWorklist ID del worklist
   * @returns Promise<WorklistStats> Estadísticas del worklist
   */
  async getStats(idWorklist: number): Promise<WorklistStats> {
    try {
      const totalTecnicas = await Tecnica.count({
        where: {
          id_worklist: idWorklist,
          delete_dt: {
            [Op.is]: null,
          },
        },
      });

      const tecnicasCompletadas = await Tecnica.count({
        where: {
          id_worklist: idWorklist,
          estado: 'COMPLETADA',
          delete_dt: {
            [Op.is]: null,
          },
        },
      });

      const tecnicasPendientes = await Tecnica.count({
        where: {
          id_worklist: idWorklist,
          estado: 'PENDIENTE',
          delete_dt: {
            [Op.is]: null,
          },
        },
      });

      const tecnicasEnProceso = await Tecnica.count({
        where: {
          id_worklist: idWorklist,
          estado: 'EN_PROCESO',
          delete_dt: {
            [Op.is]: null,
          },
        },
      });

      const porcentajeCompletado =
        totalTecnicas > 0 ? (tecnicasCompletadas / totalTecnicas) * 100 : 0;

      return {
        totalTecnicas,
        tecnicasCompletadas,
        tecnicasPendientes,
        tecnicasEnProceso,
        porcentajeCompletado: Math.round(porcentajeCompletado * 100) / 100, // Redondear a 2 decimales
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del worklist:', error);
      throw new Error('Error al obtener estadísticas del worklist');
    }
  }

  /**
   * Obtiene técnicas agrupadas por proceso de un worklist específico
   * @param idWorklist ID del worklist
   * @returns Promise<TecnicasPorProceso[]> Lista de técnicas agrupadas por proceso
   */
  async getTecnicasAgrupadasPorProceso(
    idWorklist: number
  ): Promise<TecnicasPorProceso[]> {
    try {
      const resultado = await Tecnica.findAll({
        attributes: [
          'id_tecnica_proc',
          [col('tecnica_proc.tecnica_proc'), 'tecnica_proc'],
          [fn('COUNT', col('Tecnica.id_tecnica_proc')), 'count'],
        ],
        include: [
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc',
            attributes: [],
            required: true,
            duplicating: false,
          },
        ],
        where: {
          id_worklist: idWorklist,
          delete_dt: {
            [Op.is]: null,
          },
        },
        group: ['Tecnica.id_tecnica_proc', 'tecnica_proc.tecnica_proc'],
        order: [['id_tecnica_proc', 'ASC']],
        raw: true,
        nest: false,
      });

      return resultado as unknown as TecnicasPorProceso[];
    } catch (error) {
      console.error('Error al obtener técnicas agrupadas por proceso:', error);
      throw new Error('Error al obtener técnicas agrupadas por proceso');
    }
  }

  /**
   * Obtiene técnicas sin asignar a ningún worklist
   * @returns Promise<Tecnica[]> Lista de técnicas sin asignar
   */
  async getTecnicasSinAsignar(): Promise<Tecnica[]> {
    try {
      return await Tecnica.findAll({
        where: {
          id_worklist: {
            [Op.is]: null,
          },
          delete_dt: {
            [Op.is]: null,
          },
        } as WhereOptions,
        include: [
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc',
            required: true,
          },
          {
            model: Muestra,
            as: 'muestra',
            required: false,
            include: [
              {
                model: DimTipoMuestra,
                as: 'tipo_muestra',
                attributes: ['tipo_muestra'],
                required: false,
              },
            ],
          },
        ],
        order: [['id_tecnica_proc', 'ASC']],
      });
    } catch (error) {
      console.error('Error al obtener técnicas sin asignar:', error);
      throw new Error('Error al obtener técnicas sin asignar');
    }
  }

  /**
   * Obtiene todos los procesos de técnicas disponibles
   * @returns Promise<DimTecnicaProc[]> Lista de procesos disponibles
   */
  async getProcesosDisponibles() {
    try {
      return await DimTecnicaProc.findAll({
        where: {
          activa: true,
        },
        order: [['orden', 'ASC']],
      });
    } catch (error) {
      console.error('Error al obtener procesos disponibles:', error);
      throw new Error('Error al obtener procesos disponibles');
    }
  }
}
