import { CreationAttributes, Op, WhereOptions } from 'sequelize';
import { Externalizacion } from '../models/Externalizacion';
import { Tecnica } from '../models/Tecnica';
import { sequelize } from '../config/db.config';
import { ConflictError } from '../errors/ConflictError';

export class ExternalizacionRepository {
  /**
   * Busca una externalización por ID
   * @param id ID de la externalización
   * @returns Promise<Externalizacion | null>
   */
  async findById(id: number): Promise<Externalizacion | null> {
    return Externalizacion.scope('withRefs').findByPk(id);
  }

  /**
   * Busca externalizaciones por ID de técnica
   * @param idTecnica ID de la técnica
   * @returns Promise<Externalizacion[]>
   */
  async findByTecnicaId(idTecnica: number): Promise<Externalizacion[]> {
    return Externalizacion.scope('withRefs').findAll({
      where: {
        id_tecnica: idTecnica,
        delete_dt: { [Op.is]: null },
      },
      order: [['f_envio', 'DESC']],
    });
  }

  /**
   * Obtiene todas las externalizaciones
   * @returns Promise<Externalizacion[]>
   */
  async findAll(): Promise<Externalizacion[]> {
    return Externalizacion.scope('withRefs').findAll({
      where: {
        delete_dt: { [Op.is]: null },
      },
      order: [['f_envio', 'DESC']],
    });
  }

  /**
   * Crea una nueva externalización y actualiza el estado de la técnica a EXTERNALIZADA
   * OPTIMIZACIÓN: Validaciones FUERA de transacción para minimizar tiempo de bloqueo
   * @param data Datos de la externalización
   * @returns Promise<Externalizacion>
   */
  async create(
    data: CreationAttributes<Externalizacion>
  ): Promise<Externalizacion> {
    // OPTIMIZACIÓN 1: Verificar duplicados FUERA de la transacción
    if (data.id_tecnica) {
      const externalizacionExistente = await Externalizacion.findOne({
        where: {
          id_tecnica: data.id_tecnica,
          delete_dt: { [Op.is]: null },
        },
        attributes: ['id_externalizacion', 'id_tecnica'],
      });

      if (externalizacionExistente) {
        throw new ConflictError(
          `Ya existe una externalización activa para la técnica ${data.id_tecnica} (ID: ${externalizacionExistente.id_externalizacion})`
        );
      }
    }

    // OPTIMIZACIÓN 2: Transacción corta - solo operaciones de escritura
    const transaction = await sequelize.transaction();

    try {
      // 1. Crear la externalización
      const externalizacion = await Externalizacion.create(data, {
        transaction,
      });

      // 2. Actualizar el estado de la técnica a EXTERNALIZADA (id_estado = 16)
      if (data.id_tecnica) {
        await Tecnica.update(
          {
            id_estado: 16, // EXTERNALIZADA
            fecha_estado: new Date(),
          },
          {
            where: { id_tecnica: data.id_tecnica },
            transaction,
          }
        );
      }

      // 3. Confirmar la transacción
      await transaction.commit();

      return externalizacion;
    } catch (error) {
      // Revertir en caso de error
      await transaction.rollback();
      console.error('❌ [ERROR] Error al crear externalización:', error);
      throw error;
    }
  }

  /**
   * Actualiza una externalización
   * @param externalizacion Instancia de Externalizacion
   * @param data Datos a actualizar
   * @returns Promise<Externalizacion>
   */
  async update(
    externalizacion: Externalizacion,
    data: Partial<Externalizacion>
  ): Promise<Externalizacion> {
    return externalizacion.update(data);
  }

  /**
   * Marca externalizaciones como enviadas y actualiza técnicas a estado ENVIADA_EXT
   * @param ids Array de IDs de externalizaciones
   * @param data Datos de envío
   * @returns Promise<{ updated: number; externalizaciones: Externalizacion[] }>
   */
  async marcarComoEnviadas(
    ids: number[],
    data: {
      f_envio: Date;
      servicio?: string;
      agencia?: string;
      id_centro?: number;
      id_tecnico_resp?: number;
      observaciones?: string;
    }
  ): Promise<{ updated: number; externalizaciones: Externalizacion[] }> {
    const transaction = await sequelize.transaction();

    try {
      console.log(
        `🔵 [ENVÍO] Marcando ${ids.length} externalizaciones como enviadas`
      );

      // 1. Buscar las externalizaciones y sus técnicas asociadas
      const externalizaciones = await Externalizacion.findAll({
        where: {
          id_externalizacion: { [Op.in]: ids },
          delete_dt: { [Op.is]: null },
        },
        attributes: ['id_externalizacion', 'id_tecnica'],
        transaction,
      });

      if (externalizaciones.length === 0) {
        throw new Error('No se encontraron externalizaciones válidas');
      }

      console.log(
        `✅ [PASO 1] Encontradas ${externalizaciones.length} externalizaciones`
      );

      // 2. Actualizar las externalizaciones
      const [updatedCount] = await Externalizacion.update(
        {
          f_envio: data.f_envio,
          servicio: data.servicio,
          agencia: data.agencia,
          id_centro: data.id_centro,
          id_tecnico_resp: data.id_tecnico_resp,
          observaciones: data.observaciones,
        },
        {
          where: {
            id_externalizacion: { [Op.in]: ids },
            delete_dt: { [Op.is]: null },
          },
          transaction,
        }
      );

      console.log(
        `✅ [PASO 2] Actualizadas ${updatedCount} externalizaciones`
      );

      // 3. Actualizar el estado de las técnicas a ENVIADA_EXT (id_estado = 17)
      const tecnicaIds = externalizaciones.map((e) => e.id_tecnica);

      const [tecnicasUpdated] = await Tecnica.update(
        {
          id_estado: 17, // ENVIADA_EXT
          fecha_estado: new Date(),
        },
        {
          where: {
            id_tecnica: { [Op.in]: tecnicaIds },
          },
          transaction,
        }
      );

      console.log(
        `✅ [PASO 3] Actualizadas ${tecnicasUpdated} técnicas a estado ENVIADA_EXT (17)`
      );

      // 4. Obtener las externalizaciones actualizadas con sus referencias
      const externalizacionesActualizadas = await Externalizacion.scope(
        'withRefs'
      ).findAll({
        where: {
          id_externalizacion: { [Op.in]: ids },
        },
        transaction,
      });

      await transaction.commit();
      console.log(`✅ [COMMIT] Envío registrado exitosamente`);

      return {
        updated: updatedCount,
        externalizaciones: externalizacionesActualizadas,
      };
    } catch (error) {
      await transaction.rollback();
      console.error('❌ [ERROR] Error al marcar como enviadas:', error);
      console.error('🔄 [ROLLBACK] Transacción revertida');
      throw error;
    }
  }

  /**
   * Elimina (soft delete) una externalización
   * @param externalizacion Instancia de Externalizacion
   * @returns Promise<void>
   */
  async delete(externalizacion: Externalizacion): Promise<void> {
    await externalizacion.destroy();
  }

  /**
   * Busca externalizaciones por centro
   * @param idCentro ID del centro
   * @returns Promise<Externalizacion[]>
   */
  async findByCentro(idCentro: number): Promise<Externalizacion[]> {
    return Externalizacion.scope('withRefs').findAll({
      where: {
        id_centro: idCentro,
        delete_dt: { [Op.is]: null },
      },
      order: [['f_envio', 'DESC']],
    });
  }

  /**
   * Busca externalizaciones pendientes (enviadas pero sin recepción)
   * @returns Promise<Externalizacion[]>
   */
  async findPendientes(): Promise<Externalizacion[]> {
    return Externalizacion.scope('withRefs').findAll({
      where: {
        f_envio: { [Op.ne]: null },
        f_recepcion: { [Op.is]: null },
        delete_dt: { [Op.is]: null },
      } as WhereOptions<Externalizacion>,
      order: [['f_envio', 'ASC']],
    });
  }

  /**
   * Marca una externalización como recibida, actualiza observaciones y cambia técnica a RECIBIDA_EXT
   * @param id ID de la externalización
   * @param data Datos de recepción
   * @returns Promise<Externalizacion>
   */
  async marcarComoRecibida(
    id: number,
    data: {
      f_recepcion: Date;
      observaciones?: string;
    }
  ): Promise<Externalizacion> {
    const transaction = await sequelize.transaction();

    try {
      console.log(
        `🔵 [RECEPCIÓN] Marcando externalización ${id} como recibida`
      );

      // 1. Buscar la externalización
      const externalizacion = await Externalizacion.findByPk(id, {
        attributes: ['id_externalizacion', 'id_tecnica', 'observaciones'],
        transaction,
      });

      if (!externalizacion) {
        throw new Error('Externalización no encontrada');
      }

      console.log(
        `✅ [PASO 1] Externalización encontrada (técnica: ${externalizacion.id_tecnica})`
      );

      // 2. Preparar observaciones (concatenar si ya existen)
      let observacionesFinales = data.observaciones || '';
      if (externalizacion.observaciones && data.observaciones) {
        observacionesFinales = `${externalizacion.observaciones} | ${data.observaciones}`;
      } else if (externalizacion.observaciones) {
        observacionesFinales = externalizacion.observaciones;
      }

      // 3. Actualizar la externalización
      await Externalizacion.update(
        {
          f_recepcion: data.f_recepcion,
          observaciones: observacionesFinales,
        },
        {
          where: { id_externalizacion: id },
          transaction,
        }
      );

      console.log(`✅ [PASO 2] Externalización actualizada con f_recepcion`);

      // 4. Actualizar el estado de la técnica a RECIBIDA_EXT (id_estado = 18)
      await Tecnica.update(
        {
          id_estado: 18, // RECIBIDA_EXT
          fecha_estado: new Date(),
        },
        {
          where: { id_tecnica: externalizacion.id_tecnica },
          transaction,
        }
      );

      console.log(
        `✅ [PASO 3] Técnica ${externalizacion.id_tecnica} actualizada a estado RECIBIDA_EXT (18)`
      );

      // 5. Obtener la externalización actualizada con sus referencias
      const externalizacionActualizada = await Externalizacion.scope(
        'withRefs'
      ).findByPk(id, {
        transaction,
      });

      await transaction.commit();
      console.log(`✅ [COMMIT] Recepción registrada exitosamente`);

      return externalizacionActualizada!;
    } catch (error) {
      await transaction.rollback();
      console.error('❌ [ERROR] Error al marcar como recibida:', error);
      console.error('🔄 [ROLLBACK] Transacción revertida');
      throw error;
    }
  }
}
