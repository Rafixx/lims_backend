import { CreationAttributes, Op, WhereOptions } from 'sequelize';
import { Externalizacion } from '../models/Externalizacion';

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
   * Crea una nueva externalización
   * @param data Datos de la externalización
   * @returns Promise<Externalizacion>
   */
  async create(
    data: CreationAttributes<Externalizacion>
  ): Promise<Externalizacion> {
    return Externalizacion.create(data);
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
