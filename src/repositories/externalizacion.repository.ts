import { CreationAttributes, Op, WhereOptions } from 'sequelize';
import { Externalizacion } from '../models/Externalizacion';
import { Tecnica } from '../models/Tecnica';
import { sequelize } from '../config/db.config';

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
   * @param data Datos de la externalización
   * @returns Promise<Externalizacion>
   */
  async create(
    data: CreationAttributes<Externalizacion>
  ): Promise<Externalizacion> {
    const transaction = await sequelize.transaction();

    try {
      console.log(
        `🔵 [INICIO] Creando externalización para técnica ${data.id_tecnica}`
      );

      // Verificar estado de la técnica ANTES de crear externalización
      if (data.id_tecnica) {
        const tecnicaAntes = await Tecnica.findByPk(data.id_tecnica, {
          attributes: ['id_tecnica', 'id_estado', 'delete_dt'],
        });
        console.log(
          `📊 [ANTES] Técnica ${data.id_tecnica}:`,
          tecnicaAntes?.toJSON()
        );
      }

      // 1. Crear la externalización
      const externalizacion = await Externalizacion.create(data, {
        transaction,
      });
      console.log(
        `✅ [PASO 1] Externalización creada: ID ${externalizacion.id_externalizacion}`
      );

      // 2. Actualizar el estado de la técnica a EXTERNALIZADA (id_estado = 16)
      if (data.id_tecnica) {
        const [affectedRows] = await Tecnica.update(
          {
            id_estado: 16, // EXTERNALIZADA
            fecha_estado: new Date(),
          },
          {
            where: { id_tecnica: data.id_tecnica },
            transaction,
          }
        );

        console.log(
          `✅ [PASO 2] Técnica ${data.id_tecnica} actualizada. Filas afectadas: ${affectedRows}`
        );

        // Verificar estado DESPUÉS de actualizar
        const tecnicaDespues = await Tecnica.findByPk(data.id_tecnica, {
          attributes: ['id_tecnica', 'id_estado', 'delete_dt'],
          transaction,
        });
        console.log(
          `📊 [DESPUÉS] Técnica ${data.id_tecnica}:`,
          tecnicaDespues?.toJSON()
        );
      }

      // 3. Confirmar la transacción
      await transaction.commit();
      console.log(`✅ [COMMIT] Transacción confirmada exitosamente`);

      return externalizacion;
    } catch (error) {
      // Revertir en caso de error
      await transaction.rollback();
      console.error('❌ [ERROR] Error al crear externalización:', error);
      console.error('🔄 [ROLLBACK] Transacción revertida');
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
}
