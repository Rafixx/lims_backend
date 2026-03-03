import { CreationAttributes, Op, fn, col, Transaction } from 'sequelize';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';
import { Usuario } from '../models/Usuario';
import { Worklist } from '../models/Worklist';
import { DimEstado } from '../models/DimEstado';
import { sequelize } from '../config/db.config';
import { ESTADO_TECNICA, ESTADO_MUESTRA } from '../constants/estados.constants';
import { calcularEstadoMuestra } from '../utils/estadoSync';

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
 * Interfaz para técnica agrupada (para arrays)
 */
export interface TecnicaAgrupada {
  id_tecnica_proc: number;
  proceso_nombre: string;
  total_posiciones: number;
  pendientes: number;
  asignadas: number;
  en_proceso: number;
  completadas: number;
  resultado_erroneo: number;
  otros_estados: number;
  tecnico_resp?: {
    id_usuario: number;
    nombre: string;
  };
  estado_info?: {
    id: number;
    estado: string;
    color: string;
  };
  primera_tecnica_id: number;
  fecha_estado?: Date;
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

  /**
   * Obtiene técnicas agrupadas por proceso para una muestra
   * Si la muestra es de tipo array, agrupa las técnicas y devuelve resumen de estados
   * Si NO es de tipo array, devuelve todas las técnicas normalmente
   * @param id_muestra ID de la muestra
   * @returns Promise<Tecnica[] | TecnicaAgrupada[]>
   */
  async findByMuestraIdAgrupadas(
    id_muestra: number
  ): Promise<Tecnica[] | TecnicaAgrupada[]> {
    try {
      // 1. Consultar la muestra para verificar si es tipo array
      const muestra = await Muestra.findByPk(id_muestra, {
        attributes: ['id_muestra', 'tipo_array'],
      });

      if (!muestra) {
        throw new Error('Muestra no encontrada');
      }

      // 2. Si NO es array, devolver todas las técnicas normalmente
      if (!muestra.tipo_array) {
        return this.findByMuestraId(id_muestra);
      }

      // 3. Si ES array, agrupar por id_tecnica_proc
      const tecnicas = await Tecnica.findAll({
        where: {
          id_muestra,
          delete_dt: { [Op.is]: null },
        },
        include: [
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc',
            attributes: ['id', 'tecnica_proc'],
            required: true,
          },
          {
            model: DimEstado,
            as: 'estadoInfo',
            attributes: ['id', 'estado', 'color'],
            required: false,
          },
          {
            model: Usuario,
            as: 'tecnico_resp',
            attributes: ['id_usuario', 'nombre'],
            required: false,
          },
        ],
        order: [['id_tecnica_proc', 'ASC']],
      });

      // 4. Agrupar técnicas por id_tecnica_proc
      const gruposPorProceso = new Map<number, Tecnica[]>();

      for (const tecnica of tecnicas) {
        const idProc = tecnica.id_tecnica_proc;
        if (!gruposPorProceso.has(idProc)) {
          gruposPorProceso.set(idProc, []);
        }
        gruposPorProceso.get(idProc)!.push(tecnica);
      }

      // 5. Construir el resumen de cada grupo
      const tecnicasAgrupadas: TecnicaAgrupada[] = [];

      for (const [idProc, tecnicasGrupo] of gruposPorProceso.entries()) {
        // Contar estados
        let pendientes = 0;
        let asignadas = 0;
        let en_proceso = 0;
        let completadas = 0;
        let resultado_erroneo = 0;
        let otros_estados = 0;

        for (const t of tecnicasGrupo) {
          switch (t.id_estado) {
            case ESTADO_TECNICA.CREADA:
              pendientes++;
              break;
            case ESTADO_TECNICA.ASIGNADA:
              asignadas++;
              break;
            case ESTADO_TECNICA.EN_PROCESO:
              en_proceso++;
              break;
            case ESTADO_TECNICA.COMPLETADA_TECNICA:
              completadas++;
              break;
            case ESTADO_TECNICA.REINTENTANDO:
              resultado_erroneo++;
              break;
            default:
              otros_estados++;
          }
        }

        // Obtener la primera técnica del grupo (para información base)
        const primeraTecnica = tecnicasGrupo[0];
        const tecnicaConRefs = primeraTecnica as Tecnica & {
          tecnica_proc?: { id: number; tecnica_proc: string };
          estadoInfo?: { id: number; estado: string; color: string };
          tecnico_resp?: { id_usuario: number; nombre: string };
        };

        // Verificar si todas las técnicas tienen el mismo técnico responsable
        const tecnicoComun = tecnicasGrupo.every(
          (t) => t.id_tecnico_resp === primeraTecnica.id_tecnico_resp
        )
          ? tecnicaConRefs.tecnico_resp
          : undefined;

        tecnicasAgrupadas.push({
          id_tecnica_proc: idProc,
          proceso_nombre: tecnicaConRefs.tecnica_proc?.tecnica_proc || '',
          total_posiciones: tecnicasGrupo.length,
          pendientes,
          asignadas,
          en_proceso,
          completadas,
          resultado_erroneo,
          otros_estados,
          tecnico_resp: tecnicoComun,
          estado_info: tecnicaConRefs.estadoInfo,
          primera_tecnica_id: primeraTecnica.id_tecnica,
          fecha_estado: primeraTecnica.fecha_estado || undefined,
        });
      }

      return tecnicasAgrupadas;
    } catch (error) {
      console.error('Error al obtener técnicas agrupadas:', error);
      throw new Error('Error al obtener técnicas de la muestra');
    }
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
   * Fuerza el estado de la muestra a REGISTRADA (1).
   * Se llama al crear una técnica nueva sobre una muestra existente (regla 3.1).
   */
  async resetMuestraARegistrada(idMuestra: number): Promise<void> {
    await Muestra.update(
      { id_estado: ESTADO_MUESTRA.REGISTRADA },
      { where: { id_muestra: idMuestra } }
    );
  }

  /**
   * Asigna un técnico responsable a una técnica
   * @param idTecnica ID de la técnica
   * @param idTecnicoResp ID del técnico responsable
   * @returns Promise<Tecnica> Técnica actualizada
   *
   * NOTA: la actualización de id_tecnico_resp ocurre fuera de la transacción
   * que cambia el estado. Si la transición de estado falla, el técnico
   * ya quedó asignado. Pendiente de refactorizar en una única transacción.
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

      // Solo cambiar el estado a ASIGNADA si la técnica está CREADA
      if (tecnica.id_estado === ESTADO_TECNICA.CREADA) {
        await this.asignarTecnica(idTecnica);
      }

      return tecnica;
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      throw new Error('Error al asignar técnico a la técnica');
    }
  }

  /**
   * Transición CREADA (8) → ASIGNADA (9).
   * Sincroniza muestra → EN_PROCESO (3).
   */
  async asignarTecnica(idTecnica: number): Promise<Tecnica> {
    return await this.cambiarEstadoTecnica(
      idTecnica,
      ESTADO_TECNICA.CREADA,
      ESTADO_TECNICA.ASIGNADA
    );
  }

  /**
   * Transición ASIGNADA (9) → EN_PROCESO (10).
   * No modifica el estado de la muestra.
   */
  async iniciarTecnica(idTecnica: number): Promise<Tecnica> {
    return await this.cambiarEstadoTecnica(
      idTecnica,
      ESTADO_TECNICA.ASIGNADA,
      ESTADO_TECNICA.EN_PROCESO
    );
  }

  /**
   * Transiciona la técnica a COMPLETADA_TECNICA (12) si su estado es activo
   * ({8,9,10} o cualquier no-final). Si ya está en estado final ({12,13,14}),
   * devuelve sin cambios para permitir múltiples resultados sobre la misma técnica.
   *
   * Debe llamarse SIEMPRE dentro de una transacción externa.
   */
  async completarParaResultado(
    idTecnica: number,
    transaction: Transaction
  ): Promise<{ tecnica: Tecnica; estadoPrevio: number; estadoCambio: boolean }> {
    const tecnica = await Tecnica.findByPk(idTecnica, { transaction });
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }

    const estadoPrevio = tecnica.id_estado as number;
    const ESTADOS_FINALES: number[] = [
      ESTADO_TECNICA.COMPLETADA_TECNICA,
      ESTADO_TECNICA.CANCELADA_TECNICA,
      ESTADO_TECNICA.ERROR_TECNICA,
    ];

    if (ESTADOS_FINALES.includes(estadoPrevio)) {
      // Técnica ya en estado final → permitir resultado sin modificar estado
      return { tecnica, estadoPrevio, estadoCambio: false };
    }

    await tecnica.update(
      { id_estado: ESTADO_TECNICA.COMPLETADA_TECNICA, fecha_estado: new Date() },
      { transaction }
    );

    await this.sincronizarEstadoMuestra(
      tecnica.id_muestra,
      ESTADO_TECNICA.COMPLETADA_TECNICA,
      transaction
    );

    return { tecnica, estadoPrevio, estadoCambio: true };
  }

  /**
   * Transición EN_PROCESO (10) → COMPLETADA_TECNICA (12).
   * Recalcula el estado de la muestra a partir de todas sus técnicas.
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

  /**
   * Cambia el estado de una técnica y sincroniza el estado de la muestra,
   * todo dentro de una única transacción.
   *
   * Sincronización:
   *   → ASIGNADA (9)          : muestra → EN_PROCESO (3)
   *   → EN_PROCESO (10)       : sin cambio en muestra
   *   → COMPLETADA_TECNICA (12): recalcula muestra a partir de todas sus técnicas
   */
  async cambiarEstadoTecnica(
    idTecnica: number,
    estadoOrigen: number,
    estadoDestino: number,
    observaciones?: string,
    externalTransaction?: Transaction
  ): Promise<Tecnica> {
    const ejecutar = async (t: Transaction): Promise<Tecnica> => {
      const tecnica = await Tecnica.findByPk(idTecnica, { transaction: t });
      if (!tecnica) {
        throw new Error('Técnica no encontrada');
      }

      if (tecnica.id_estado !== estadoOrigen) {
        throw new Error(
          `No se puede cambiar el estado a ${estadoDestino}: la técnica está en estado ${tecnica.id_estado}, se esperaba ${estadoOrigen}`
        );
      }

      const updateData: Partial<Tecnica> = {
        id_estado: estadoDestino,
        fecha_estado: new Date(),
      };

      if (observaciones) {
        updateData.comentarios = observaciones;
      }

      await tecnica.update(updateData, { transaction: t });

      // Sincronizar estado de muestra
      await this.sincronizarEstadoMuestra(tecnica.id_muestra, estadoDestino, t);

      return tecnica;
    };

    if (externalTransaction) {
      return ejecutar(externalTransaction);
    }
    return sequelize.transaction(ejecutar);
  }

  /**
   * Sincroniza el estado de la muestra en función del nuevo estado de la técnica.
   * Debe llamarse dentro de la misma transacción que actualiza la técnica.
   */
  private async sincronizarEstadoMuestra(
    idMuestra: number,
    nuevoEstadoTecnica: number,
    transaction: Transaction
  ): Promise<void> {
    if (nuevoEstadoTecnica === ESTADO_TECNICA.ASIGNADA) {
      // Regla 3.2: técnica ASIGNADA → muestra EN_PROCESO
      await Muestra.update(
        { id_estado: ESTADO_MUESTRA.EN_PROCESO },
        { where: { id_muestra: idMuestra }, transaction }
      );
    } else if (
      nuevoEstadoTecnica === ESTADO_TECNICA.COMPLETADA_TECNICA ||
      nuevoEstadoTecnica === ESTADO_TECNICA.CANCELADA_TECNICA
    ) {
      // Regla 3.4: técnica COMPLETADA o CANCELADA → recalcular desde todas las técnicas
      const todasTecnicas = await Tecnica.findAll({
        where: { id_muestra: idMuestra },
        attributes: ['id_estado'],
        transaction,
      });

      const estados = todasTecnicas
        .map((tec) => tec.id_estado)
        .filter((id): id is number => id !== undefined && id !== null);

      const nuevoEstadoMuestra = calcularEstadoMuestra(estados);

      await Muestra.update(
        { id_estado: nuevoEstadoMuestra },
        { where: { id_muestra: idMuestra }, transaction }
      );
    }
    // Regla 3.3: EN_PROCESO (10) → sin cambio en muestra
  }

  /**
   * Cancela atómicamente todas las técnicas de un grupo (mismo id_muestra + id_tecnica_proc).
   * Ninguna técnica puede estar en estado final, externalizada o asignada a worklist.
   * Sincroniza el estado de la muestra en la misma transacción.
   */
  async cancelarGrupoTecnicas(
    primeraTecnicaId: number
  ): Promise<{ canceladas: number; tecnica_ids: number[] }> {
    const pivot = await Tecnica.findByPk(primeraTecnicaId, {
      attributes: ['id_tecnica', 'id_muestra', 'id_tecnica_proc'],
    });
    if (!pivot) throw new Error(`Técnica ${primeraTecnicaId} no encontrada`);

    const tecnicasGrupo = await Tecnica.findAll({
      where: {
        id_muestra: pivot.id_muestra,
        id_tecnica_proc: pivot.id_tecnica_proc,
        delete_dt: { [Op.is]: null },
      },
      attributes: ['id_tecnica', 'id_estado', 'id_worklist'],
    });

    const ESTADOS_FINALES: number[] = [
      ESTADO_TECNICA.COMPLETADA_TECNICA,
      ESTADO_TECNICA.CANCELADA_TECNICA,
      ESTADO_TECNICA.ERROR_TECNICA,
    ];
    const ESTADOS_EXTERNALIZACION: number[] = [
      ESTADO_TECNICA.EXTERNALIZADA,
      ESTADO_TECNICA.ENVIADA_EXT,
      ESTADO_TECNICA.RECIBIDA_EXT,
    ];

    const noElegibles = tecnicasGrupo.filter(
      (t) =>
        ESTADOS_FINALES.includes(t.id_estado as number) ||
        ESTADOS_EXTERNALIZACION.includes(t.id_estado as number) ||
        t.id_worklist !== null
    );

    if (noElegibles.length > 0) {
      throw new Error(
        `No se puede cancelar el grupo: ${noElegibles.length} técnica(s) están en estado final, ` +
        `externalizadas o asignadas a un worklist. IDs: ${noElegibles.map((t) => t.id_tecnica).join(', ')}`
      );
    }

    const transaction = await sequelize.transaction();
    try {
      const ahora = new Date();
      const ids: number[] = [];

      for (const tecnica of tecnicasGrupo) {
        await tecnica.update(
          { id_estado: ESTADO_TECNICA.CANCELADA_TECNICA, fecha_estado: ahora },
          { transaction }
        );
        ids.push(tecnica.id_tecnica);
      }

      await this.sincronizarEstadoMuestra(
        pivot.id_muestra,
        ESTADO_TECNICA.CANCELADA_TECNICA,
        transaction
      );

      await transaction.commit();
      return { canceladas: ids.length, tecnica_ids: ids };
    } catch (err) {
      await transaction.rollback();
      throw err;
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
        whereCondition.id_estado = ESTADO_TECNICA.CREADA;
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
        // Total creadas (pendientes de asignar)
        Tecnica.count({
          where: {
            id_estado: ESTADO_TECNICA.CREADA,
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
            id_estado: ESTADO_TECNICA.CREADA,
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
            id_estado: ESTADO_TECNICA.CREADA,
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
        promedio_tiempo_procesamiento: null,
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
   * Marca técnicas como resultado erróneo (REINTENTANDO, id=15).
   * - Limpia id_tecnico_resp y id_worklist
   * - Actualiza fecha_estado a now()
   * - Limpia el técnico responsable del worklist asociado
   */
  async marcarResultadoErroneo(
    idsTecnicas: number[],
    idWorklist: number
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    // Limpiar el técnico responsable del worklist (una sola vez)
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

    // Procesar cada técnica
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

        await Tecnica.update(
          {
            id_estado: ESTADO_TECNICA.REINTENTANDO,
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

  /**
   * Obtiene técnicas pendientes de externalización (estado CREADA, sin worklist).
   */
  async findPendientesExternalizacion(): Promise<Tecnica[]> {
    try {
      const { MuestraArray } = await import('../models/MuestraArray');
      const { Resultado } = await import('../models/Resultado');

      const tecnicas = await Tecnica.findAll({
        where: {
          id_worklist: null as unknown as number,
          id_estado: ESTADO_TECNICA.CREADA,
          delete_dt: null as unknown as Date,
        },
        attributes: [
          'id_tecnica',
          'id_muestra',
          'id_array',
          'fecha_inicio_tec',
          'fecha_estado',
          'comentarios',
          'id_estado',
          'id_worklist',
          'id_tecnico_resp',
        ],
        include: [
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc',
            attributes: ['id', 'tecnica_proc', 'orden'],
            required: true,
          },
          {
            model: DimEstado,
            as: 'estadoInfo',
            attributes: ['id', 'estado', 'color', 'entidad'],
            required: false,
          },
          {
            model: Usuario,
            as: 'tecnico_resp',
            attributes: ['id_usuario', 'nombre'],
            required: false,
          },
          {
            model: Muestra,
            as: 'muestra',
            attributes: [
              'id_muestra',
              'codigo_epi',
              'codigo_externo',
              'estudio',
              'tipo_array',
            ],
            required: true,
          },
          {
            model: MuestraArray,
            as: 'muestraArray',
            attributes: [
              'id_array',
              'id_muestra',
              'codigo_placa',
              'posicion_placa',
              'codigo_epi',
              'codigo_externo',
              'num_array',
              'pos_array',
            ],
            required: false,
          },
          {
            model: Resultado,
            as: 'resultados',
            attributes: [
              'id_resultado',
              'tipo_res',
              'valor',
              'valor_texto',
              'valor_fecha',
              'unidades',
            ],
            required: false,
          },
        ],
        order: [
          [{ model: Muestra, as: 'muestra' }, 'estudio', 'ASC'],
          [
            { model: DimTecnicaProc, as: 'tecnica_proc' },
            'tecnica_proc',
            'ASC',
          ],
          [
            { model: MuestraArray, as: 'muestraArray' },
            'posicion_placa',
            'ASC',
          ],
          ['id_tecnica', 'ASC'],
        ],
      });

      return tecnicas;
    } catch (error) {
      console.error(
        'Error al obtener técnicas pendientes de externalización:',
        error
      );
      throw new Error(
        'Error al obtener técnicas pendientes de externalización'
      );
    }
  }

  /**
   * Obtiene todas las técnicas individuales de un grupo (técnica agrupada)
   * @param primeraTecnicaId ID de la primera técnica del grupo
   * @returns Promise con array de técnicas del grupo con información de muestraArray
   */
  async findTecnicasFromGroup(primeraTecnicaId: number): Promise<Tecnica[]> {
    console.log('[findTecnicasFromGroup] Iniciando búsqueda con ID:', primeraTecnicaId);

    try {
      const { MuestraArray } = await import('../models/MuestraArray');
      console.log('[findTecnicasFromGroup] MuestraArray importado');

      // 1. Obtener la primera técnica para saber el id_muestra y id_tecnica_proc
      const primeraTecnica = await Tecnica.findByPk(primeraTecnicaId, {
        attributes: ['id_muestra', 'id_tecnica_proc'],
      });

      console.log('[findTecnicasFromGroup] Primera técnica:', primeraTecnica?.toJSON());

      if (!primeraTecnica) {
        throw new Error('Técnica no encontrada');
      }

      // 2. Obtener todas las técnicas del mismo grupo (mismo id_muestra y id_tecnica_proc)
      const tecnicas = await Tecnica.findAll({
        where: {
          id_muestra: primeraTecnica.id_muestra,
          id_tecnica_proc: primeraTecnica.id_tecnica_proc,
          delete_dt: { [Op.is]: null },
        },
        include: [
          {
            model: DimTecnicaProc,
            as: 'tecnica_proc',
            attributes: ['id', 'tecnica_proc'],
            required: false,
          },
          {
            model: DimEstado,
            as: 'estadoInfo',
            attributes: ['id', 'estado', 'color'],
            required: false,
          },
          {
            model: Usuario,
            as: 'tecnico_resp',
            attributes: ['id_usuario', 'nombre'],
            required: false,
          },
          {
            model: Muestra,
            as: 'muestra',
            attributes: ['id_muestra', 'codigo_epi', 'codigo_externo', 'estudio', 'tipo_array'],
            required: false,
          },
          {
            model: MuestraArray,
            as: 'muestraArray',
            attributes: [
              'id_array',
              'id_muestra',
              'posicion_placa',
              'codigo_epi',
              'codigo_externo',
            ],
            required: false,
          },
        ],
        order: [
          [{ model: MuestraArray, as: 'muestraArray' }, 'posicion_placa', 'ASC'],
          ['id_tecnica', 'ASC'],
        ],
      });

      console.log('[findTecnicasFromGroup] Técnicas encontradas:', tecnicas.length);
      return tecnicas;
    } catch (error) {
      console.error('[findTecnicasFromGroup] Error:', error);
      throw error;
    }
  }
}
