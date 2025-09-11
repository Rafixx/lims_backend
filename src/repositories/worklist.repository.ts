import { Op, fn, col } from 'sequelize';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';
import { DimTipoMuestra } from '../models/DimTipoMuestra';

/**
 * Interfaz para el resultado agrupado de técnicas por proceso
 */
export interface TecnicasPorProceso {
  id_tecnica_proc: number;
  tecnica_proc: string;
  count: number;
}

/**
 * Repositorio para manejar las operaciones de worklist
 */
export class WorklistRepository {
  /**
   * Obtiene todas las técnicas pendientes
   * @returns Promise<Tecnica[]> Lista de técnicas pendientes
   */
  async getTecnicasPendientes(): Promise<Tecnica[]> {
    try {
      return await Tecnica.findAll({
        where: {
          delete_dt: {
            [Op.is]: null,
          },
          estado: 'PENDIENTE',
        },
        order: [['id_tecnica_proc', 'ASC']],
      });
    } catch (error) {
      console.error('Error al obtener técnicas pendientes:', error);
      throw new Error('Error al obtener técnicas pendientes');
    }
  }

  /**
   * Obtiene el conteo de técnicas agrupadas por proceso usando ORM
   * @returns Promise<TecnicasPorProceso[]> Lista de técnicas agrupadas por proceso
   */
  async getTecnicasAgrupadasPorProceso(): Promise<TecnicasPorProceso[]> {
    try {
      const resultado = await Tecnica.findAll({
        attributes: [
          'id_tecnica_proc',
          [col('tecnica_proc.tecnica_proc'), 'tecnica_proc'], // Cambiar aquí: usar el alias
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
          delete_dt: {
            [Op.is]: null,
          },
          estado: 'PENDIENTE',
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
   * Obtiene técnicas pendientes con información del proceso
   * @returns Promise<Tecnica[]> Lista de técnicas pendientes con datos del proceso
   */
  async getTecnicasPendientesConProceso(): Promise<Tecnica[]> {
    try {
      return await Tecnica.findAll({
        include: [
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc', // Agregar alias aquí también
            required: true,
          },
        ],
        where: {
          delete_dt: {
            [Op.is]: null,
          },
          estado: 'PENDIENTE',
        },
        order: [['id_tecnica_proc', 'ASC']],
      });
    } catch (error) {
      console.error('Error al obtener técnicas pendientes con proceso:', error);
      throw new Error('Error al obtener técnicas pendientes con proceso');
    }
  }

  /**
   * Obtiene técnicas pendientes por ID de proceso específico
   * @param idTecnicaProc ID del proceso de técnica
   * @returns Promise<Tecnica[]> Lista de técnicas pendientes para el proceso
   */
  async getTecnicasPendientesPorProceso(
    idTecnicaProc: number
  ): Promise<Tecnica[]> {
    try {
      return await Tecnica.findAll({
        include: [
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc', // Agregar alias aquí también
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
        where: {
          delete_dt: {
            [Op.is]: null,
          },
          estado: 'PENDIENTE',
          id_tecnica_proc: idTecnicaProc,
        },
        order: [['id_tecnica_proc', 'ASC']],
      });
    } catch (error) {
      console.error(
        `Error al obtener técnicas pendientes para proceso ${idTecnicaProc}:`,
        error
      );
      throw new Error(
        `Error al obtener técnicas pendientes para proceso ${idTecnicaProc}`
      );
    }
  }

  /**
   * Obtiene el conteo total de técnicas pendientes
   * @returns Promise<number> Número total de técnicas pendientes
   */
  async getConteoTecnicasPendientes(): Promise<number> {
    try {
      return await Tecnica.count({
        where: {
          delete_dt: {
            [Op.is]: null,
          },
          estado: 'PENDIENTE',
        },
      });
    } catch (error) {
      console.error('Error al obtener conteo de técnicas pendientes:', error);
      throw new Error('Error al obtener conteo de técnicas pendientes');
    }
  }

  /**
   * Obtiene los procesos que tienen técnicas pendientes
   * @returns Promise<DimTecnicaProc[]> Lista de procesos con técnicas pendientes
   */
  async getProcesosPendientes(): Promise<DimTecnicaProc[]> {
    try {
      return await DimTecnicaProc.findAll({
        include: [
          {
            model: Tecnica,
            as: 'tecnicas',
            where: {
              delete_dt: {
                [Op.is]: null,
              },
              estado: 'PENDIENTE',
            },
            attributes: [],
            required: true,
          },
        ],
        group: ['DimTecnicaProc.id'],
        order: [['id', 'ASC']],
      });
    } catch (error) {
      console.error('Error al obtener procesos pendientes:', error);
      throw new Error('Error al obtener procesos pendientes');
    }
  }
}
