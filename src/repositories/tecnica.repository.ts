import { CreationAttributes, Op, fn, col } from 'sequelize';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
// import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';
import { Usuario } from '../models/Usuario';
import { Worklist } from '../models/Worklist';
// import { DimTipoMuestra } from '../models/DimTipoMuestra';
// import { DimEstado } from '../models/DimEstado';
import { ESTADO_TECNICA } from '../constants/estados.constants';

/**
 * Interfaz para técnica con información completa de muestra
 */
export interface TecnicaConMuestra {
  id: number;
  id_muestra: number;
  id_tecnica_proc: number;
  id_tecnico_resp?: number;
  estado: string;
  fecha_inicio_tec?: string;
  fecha_estado?: string;
  comentarios?: string;
  proceso_nombre: string;
  proceso_descripcion?: string;
  codigo_muestra?: string;
  tipo_muestra?: string;
  tecnico_responsable?: string;
}

/**
 * Interfaz para estadísticas del worklist
 */
export interface WorklistStats {
  totalPendientes: number;
  procesosPendientes: number;
  total_tecnicas_en_progreso: number;
  total_tecnicas_completadas_hoy: number;
  promedio_tiempo_procesamiento: number | null;
  tecnicasPorProceso: Array<{
    id_tecnica_proc: number;
    tecnica_proc: string;
    count: number;
  }>;
}

export class TecnicaRepository {
  async findById(id: number) {
    return Tecnica.scope('withRefs').findByPk(id);
  }
  async findByMuestraId(id_muestra: number) {
    return Tecnica.scope('withRefs').findAll({
      where: { id_muestra },
    });
  }

  async findAll() {
    return Tecnica.scope('withRefs').findAll();
  }
  async create(data: CreationAttributes<Tecnica>) {
    return Tecnica.create(data);
  }
  async update(tecnica: Tecnica, data: Partial<Tecnica>) {
    return tecnica.update(data);
  }
  async delete(tecnica: Tecnica) {
    return tecnica.destroy();
  }

  /**
   * Asigna un técnico responsable a una técnica
   * @param idTecnica ID de la técnica
   * @param idTecnicoResp ID del técnico responsable
   * @returns Promise<Tecnica> Técnica actualizada
   */
  async asignarTecnico(
    idTecnica: number,
    idTecnicoResp: number
  ): Promise<Tecnica> {
    try {
      const tecnica = await Tecnica.findByPk(idTecnica);
      if (!tecnica) {
        throw new Error('Técnica no encontrada');
      }

      // Verificar que el técnico existe
      const tecnico = await Usuario.findByPk(idTecnicoResp);
      if (!tecnico) {
        throw new Error('Técnico no encontrado');
      }

      await tecnica.update({
        id_tecnico_resp: idTecnicoResp,
        fecha_estado: new Date(),
      });
      // console.log('tecnica', tecnica);

      // Solo cambiar el estado a ASIGNADA si la técnica está PENDIENTE
      // Si ya está ASIGNADA o en otro estado, solo actualizar el técnico
      if (tecnica.id_estado === ESTADO_TECNICA.PENDIENTE) {
        await this.asignarTecnica(idTecnica);
      }

      return tecnica;
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      throw new Error('Error al asignar técnico a la técnica');
    }
  }

  /**
   * Inicia una técnica (cambia estado a ASIGNADA)
   * @param idTecnica ID de la técnica
   * @returns Promise<Tecnica> Técnica actualizada
   */
  async asignarTecnica(idTecnica: number): Promise<Tecnica> {
    return await this.cambiarEstadoTecnica(
      idTecnica,
      ESTADO_TECNICA.PENDIENTE,
      ESTADO_TECNICA.ASIGNADA
    );
  }

  /**
   * Inicia una técnica (cambia estado a EN_PROCESO)
   * @param idTecnica ID de la técnica
   * @returns Promise<Tecnica> Técnica actualizada
   */
  async iniciarTecnica(idTecnica: number): Promise<Tecnica> {
    return await this.cambiarEstadoTecnica(
      idTecnica,
      ESTADO_TECNICA.ASIGNADA,
      ESTADO_TECNICA.EN_PROCESO
    );
  }

  /**
   * Completa una técnica (cambia estado a COMPLETADA_TECNICA)
   * @param idTecnica ID de la técnica
   * @param comentarios Comentarios opcionales
   * @returns Promise<Tecnica> Técnica actualizada
   */
  async completarTecnica(
    idTecnica: number,
    comentarios?: string
  ): Promise<Tecnica> {
    return await this.cambiarEstadoTecnica(
      idTecnica,
      ESTADO_TECNICA.EN_PROCESO,
      ESTADO_TECNICA.COMPLETADA_TECNICA,
      comentarios
    );
  }

  async cambiarEstadoTecnica(
    idTecnica: number,
    estadoOrigen: number,
    estadoDestino: number,
    observaciones?: string
  ): Promise<Tecnica> {
    try {
      const tecnica = await Tecnica.findByPk(idTecnica);
      if (!tecnica) {
        throw new Error('Técnica no encontrada');
      }

      if (tecnica.id_estado !== estadoOrigen) {
        throw new Error(
          `No se puede cambiar el estado a ${estadoDestino} de una técnica en estado ${tecnica.id_estado}`
        );
      }

      const updateData: Partial<Tecnica> = {
        id_estado: estadoDestino,
        fecha_estado: new Date(),
      };

      if (observaciones) {
        updateData.comentarios = observaciones;
      }

      await tecnica.update(updateData);
      return tecnica;
    } catch (error) {
      console.error('Error al cambiar estado de técnica:', error);
      throw new Error('Error al cambiar estado de la técnica');
    }
  }

  /**
   * Obtiene técnicas con información completa de muestra
   * @param idTecnicaProc ID del proceso (opcional)
   * @returns Promise<TecnicaConMuestra[]> Lista de técnicas con información de muestra
   */
  async getTecnicasConMuestra(
    idTecnicaProc?: number
  ): Promise<TecnicaConMuestra[]> {
    try {
      const whereCondition: Record<string, unknown> = {
        delete_dt: { [Op.is]: null },
      };

      if (idTecnicaProc) {
        whereCondition.id_tecnica_proc = idTecnicaProc;
        whereCondition.id_estado = ESTADO_TECNICA.PENDIENTE;
      }

      const resultado = await Tecnica.scope('withRefs').findAll({
        where: whereCondition,
        order: [['id_tecnica_proc', 'ASC']],
      });

      return resultado.map(
        (
          tecnica: Tecnica & {
            tecnica_proc?: { tecnica_proc: string; descripcion?: string };
            muestra?: {
              id: number;
              codigo_muestra: string;
              tipo_muestra?: { tipo_muestra: string };
            };
            tecnico?: { nombre: string; apellido: string };
          }
        ): TecnicaConMuestra => ({
          id: tecnica.id_tecnica,
          id_muestra: tecnica.id_muestra,
          id_tecnica_proc: tecnica.id_tecnica_proc,
          id_tecnico_resp: tecnica.id_tecnico_resp,
          estado: tecnica.estado || '',
          fecha_inicio_tec: tecnica.fecha_inicio_tec?.toISOString(),
          fecha_estado: tecnica.fecha_estado?.toISOString(),
          comentarios: tecnica.comentarios,
          proceso_nombre: tecnica.tecnica_proc?.tecnica_proc || '',
          proceso_descripcion: tecnica.tecnica_proc?.descripcion,
          codigo_muestra: tecnica.muestra?.codigo_muestra,
          tipo_muestra: tecnica.muestra?.tipo_muestra?.tipo_muestra,
          tecnico_responsable: tecnica.tecnico
            ? `${tecnica.tecnico.nombre} ${tecnica.tecnico.apellido}`
            : undefined,
        })
      );
    } catch (error) {
      console.error('Error al obtener técnicas con muestra:', error);
      throw new Error('Error al obtener técnicas con información de muestra');
    }
  }

  /**
   * Obtiene estadísticas completas del worklist calculadas en backend
   * @returns Promise<WorklistStats> Estadísticas del worklist
   */
  async getWorklistStatsCalculadas(): Promise<WorklistStats> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(hoy.getDate() + 1);

      // Consultas paralelas para mejor rendimiento
      const [
        totalPendientes,
        totalEnProgreso,
        totalCompletadasHoy,
        tecnicasPorProceso,
        procesosPendientes,
      ] = await Promise.all([
        // Total pendientes
        Tecnica.count({
          where: {
            id_estado: ESTADO_TECNICA.PENDIENTE,
            delete_dt: { [Op.is]: null },
          },
        }),

        // Total en progreso
        Tecnica.count({
          where: {
            id_estado: ESTADO_TECNICA.EN_PROCESO,
            delete_dt: { [Op.is]: null },
          },
        }),

        // Total completadas hoy
        Tecnica.count({
          where: {
            id_estado: ESTADO_TECNICA.COMPLETADA_TECNICA,
            fecha_estado: {
              [Op.gte]: hoy,
              [Op.lt]: mañana,
            },
            delete_dt: { [Op.is]: null },
          },
        }),

        // Técnicas agrupadas por proceso
        Tecnica.findAll({
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
            },
          ],
          where: {
            id_estado: ESTADO_TECNICA.PENDIENTE,
            delete_dt: { [Op.is]: null },
          },
          group: ['Tecnica.id_tecnica_proc', 'tecnica_proc.tecnica_proc'],
          order: [['id_tecnica_proc', 'ASC']],
          raw: true,
        }),

        // Procesos únicos con técnicas pendientes
        Tecnica.findAll({
          attributes: [
            [fn('DISTINCT', col('id_tecnica_proc')), 'id_tecnica_proc'],
          ],
          where: {
            id_estado: ESTADO_TECNICA.PENDIENTE,
            delete_dt: { [Op.is]: null },
          },
          raw: true,
        }),
      ]);

      return {
        totalPendientes,
        procesosPendientes: procesosPendientes.length,
        total_tecnicas_en_progreso: totalEnProgreso,
        total_tecnicas_completadas_hoy: totalCompletadasHoy,
        promedio_tiempo_procesamiento: null, // Se puede calcular por separado si es necesario
        tecnicasPorProceso: tecnicasPorProceso.map((item: unknown) => {
          const tecnicaItem = item as {
            id_tecnica_proc: number;
            tecnica_proc: string;
            count: string;
          };
          return {
            id_tecnica_proc: tecnicaItem.id_tecnica_proc,
            tecnica_proc: tecnicaItem.tecnica_proc,
            count: parseInt(tecnicaItem.count),
          };
        }),
      };
    } catch (error) {
      console.error('Error al calcular estadísticas del worklist:', error);
      throw new Error('Error al calcular estadísticas del worklist');
    }
  }

  /**
   * Marca técnicas como resultado erróneo
   * - Asigna id_estado = 15 (REINTENTANDO/RESULTADO_ERRONEO)
   * - Elimina id_tecnico_resp (null)
   * - Actualiza fecha_estado a now()
   * - Elimina id_worklist (null)
   * - Elimina id_tecnico_resp del worklist asociado (null)
   * @param idsTecnicas Array de IDs de técnicas
   * @param idWorklist ID del worklist asociado
   * @returns Promise<{ success: boolean; updated: number; errors: string[] }>
   */
  async marcarResultadoErroneo(
    idsTecnicas: number[],
    idWorklist: number
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;
    const ID_ESTADO_RESULTADO_ERRONEO = 15;

    // Primero limpiar el técnico responsable del worklist (solo una vez)
    try {
      await Worklist.update(
        {
          id_tecnico_resp: null as unknown as number,
        },
        {
          where: { id_worklist: idWorklist },
        }
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      errors.push(`Error al actualizar worklist ${idWorklist}: ${message}`);
    }

    // Luego procesar cada técnica
    for (const idTecnica of idsTecnicas) {
      try {
        const tecnica = await Tecnica.findByPk(idTecnica);
        if (!tecnica) {
          errors.push(`Técnica ${idTecnica} no encontrada`);
          continue;
        }

        if (tecnica.delete_dt) {
          errors.push(`Técnica ${idTecnica} está eliminada`);
          continue;
        }

        // Usar update estático para poder asignar null a los campos
        await Tecnica.update(
          {
            id_estado: ID_ESTADO_RESULTADO_ERRONEO,
            id_tecnico_resp: null as unknown as number,
            fecha_estado: new Date(),
            id_worklist: null as unknown as number,
          },
          {
            where: { id_tecnica: idTecnica },
          }
        );

        updated++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Error desconocido';
        errors.push(`Error al procesar técnica ${idTecnica}: ${message}`);
      }
    }

    return {
      success: errors.length === 0,
      updated,
      errors,
    };
  }
}
