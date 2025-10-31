import ResFinalNanodrop from '../models/ResFinalNanodrop';
import { Transaction, InferCreationAttributes, Op } from 'sequelize';

export type CreateResFinalNanodropDTO = Omit<
  InferCreationAttributes<ResFinalNanodrop>,
  'id' | 'create_dt' | 'update_dt'
>;

export class ResFinalNanodropRepository {
  /**
   * Obtiene todos los registros finales de Nanodrop
   */
  async findAll(): Promise<ResFinalNanodrop[]> {
    return ResFinalNanodrop.findAll({
      order: [['create_dt', 'DESC']],
    });
  }

  /**
   * Obtiene registros no procesados
   */
  async findUnprocessed(): Promise<ResFinalNanodrop[]> {
    return ResFinalNanodrop.findAll({
      where: {
        procesado: false,
      },
      order: [['create_dt', 'ASC']],
    });
  }

  /**
   * Obtiene un registro por ID
   */
  async findById(id: number): Promise<ResFinalNanodrop | null> {
    return ResFinalNanodrop.findByPk(id);
  }

  /**
   * Busca por código epidemiológico
   */
  async findByCodigoEpi(codigoEpi: string): Promise<ResFinalNanodrop[]> {
    return ResFinalNanodrop.findAll({
      where: {
        codigo_epi: codigoEpi,
      },
      order: [['create_dt', 'DESC']],
    });
  }

  /**
   * Crea un nuevo registro final de Nanodrop
   */
  async create(
    data: CreateResFinalNanodropDTO,
    transaction?: Transaction
  ): Promise<ResFinalNanodrop> {
    return ResFinalNanodrop.create(data, { transaction });
  }

  /**
   * Crea múltiples registros en batch
   */
  async createBatch(
    dataArray: CreateResFinalNanodropDTO[],
    transaction?: Transaction
  ): Promise<ResFinalNanodrop[]> {
    return ResFinalNanodrop.bulkCreate(dataArray, { transaction });
  }

  /**
   * Actualiza un registro
   */
  async update(
    id: number,
    data: Partial<CreateResFinalNanodropDTO>,
    transaction?: Transaction
  ): Promise<[number, ResFinalNanodrop[]]> {
    return ResFinalNanodrop.update(data, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Marca un registro como procesado
   */
  async markAsProcessed(
    id: number,
    updatedBy?: number,
    transaction?: Transaction
  ): Promise<[number, ResFinalNanodrop[]]> {
    return ResFinalNanodrop.update(
      {
        procesado: true,
        updated_by: updatedBy,
        update_dt: new Date(),
      },
      {
        where: { id },
        returning: true,
        transaction,
      }
    );
  }

  /**
   * Marca múltiples registros como procesados
   */
  async markBatchAsProcessed(
    ids: number[],
    updatedBy?: number,
    transaction?: Transaction
  ): Promise<number> {
    const [affectedCount] = await ResFinalNanodrop.update(
      {
        procesado: true,
        updated_by: updatedBy,
        update_dt: new Date(),
      },
      {
        where: {
          id: ids,
        },
        transaction,
      }
    );
    return affectedCount;
  }

  /**
   * Elimina un registro
   */
  async delete(id: number, transaction?: Transaction): Promise<number> {
    return ResFinalNanodrop.destroy({
      where: { id },
      transaction,
    });
  }

  /**
   * Cuenta registros totales
   */
  async count(): Promise<number> {
    return ResFinalNanodrop.count();
  }

  /**
   * Cuenta registros no procesados
   */
  async countUnprocessed(): Promise<number> {
    return ResFinalNanodrop.count({
      where: {
        procesado: false,
      },
    });
  }

  /**
   * Obtiene registros dentro de un rango de fechas
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ResFinalNanodrop[]> {
    return ResFinalNanodrop.findAll({
      where: {
        create_dt: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['create_dt', 'DESC']],
    });
  }
}

export default ResFinalNanodropRepository;
