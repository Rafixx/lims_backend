// src/repositories/resFinalQubit.repository.ts
import { Transaction, InferCreationAttributes, Op } from 'sequelize';
import { ResFinalQubit } from '../models/ResFinalQubit';

export type CreateResFinalQubitDTO = Omit<
  InferCreationAttributes<ResFinalQubit>,
  'id' | 'create_dt' | 'update_dt'
>;

export class ResFinalQubitRepository {
  /**
   * Busca todos los registros de resultados finales de Qubit
   */
  async findAll(): Promise<ResFinalQubit[]> {
    return ResFinalQubit.findAll({
      order: [['create_dt', 'DESC']],
    });
  }

  /**
   * Busca registros no procesados
   */
  async findUnprocessed(): Promise<ResFinalQubit[]> {
    return ResFinalQubit.findAll({
      where: {
        procesado: false,
      },
      order: [['create_dt', 'DESC']],
    });
  }

  /**
   * Busca un registro por ID
   */
  async findById(id: number): Promise<ResFinalQubit | null> {
    return ResFinalQubit.findByPk(id);
  }

  /**
   * Busca registros por código epidemiológico
   */
  async findByCodigoEpi(codigoEpi: string): Promise<ResFinalQubit[]> {
    return ResFinalQubit.findAll({
      where: {
        codigo_epi: codigoEpi,
      },
      order: [['create_dt', 'DESC']],
    });
  }

  /**
   * Busca registros por rango de fechas
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ResFinalQubit[]> {
    return ResFinalQubit.findAll({
      where: {
        create_dt: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['create_dt', 'DESC']],
    });
  }

  /**
   * Crea un nuevo registro de resultado final de Qubit
   */
  async create(
    data: CreateResFinalQubitDTO,
    transaction?: Transaction
  ): Promise<ResFinalQubit> {
    return ResFinalQubit.create(
      {
        ...data,
        create_dt: new Date(),
        update_dt: new Date(),
      },
      { transaction }
    );
  }

  /**
   * Crea múltiples registros en una operación atómica
   */
  async createBatch(
    dataArray: CreateResFinalQubitDTO[],
    transaction?: Transaction
  ): Promise<ResFinalQubit[]> {
    const now = new Date();
    const recordsToCreate = dataArray.map((data) => ({
      ...data,
      create_dt: now,
      update_dt: now,
    }));

    return ResFinalQubit.bulkCreate(recordsToCreate, { transaction });
  }

  /**
   * Actualiza un registro existente
   */
  async update(
    id: number,
    data: Partial<CreateResFinalQubitDTO>,
    updatedBy?: number,
    transaction?: Transaction
  ): Promise<[affectedCount: number]> {
    return ResFinalQubit.update(
      {
        ...data,
        update_dt: new Date(),
        updated_by: updatedBy,
      },
      {
        where: { id },
        transaction,
      }
    );
  }

  /**
   * Marca un registro como procesado
   */
  async markAsProcessed(
    id: number,
    updatedBy?: number,
    transaction?: Transaction
  ): Promise<[affectedCount: number]> {
    return ResFinalQubit.update(
      {
        procesado: true,
        update_dt: new Date(),
        updated_by: updatedBy,
      },
      {
        where: { id },
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
  ): Promise<[affectedCount: number]> {
    return ResFinalQubit.update(
      {
        procesado: true,
        update_dt: new Date(),
        updated_by: updatedBy,
      },
      {
        where: {
          id: ids,
        },
        transaction,
      }
    );
  }

  /**
   * Elimina un registro
   */
  async delete(id: number, transaction?: Transaction): Promise<number> {
    return ResFinalQubit.destroy({
      where: { id },
      transaction,
    });
  }

  /**
   * Cuenta todos los registros
   */
  async count(): Promise<number> {
    return ResFinalQubit.count();
  }

  /**
   * Cuenta registros no procesados
   */
  async countUnprocessed(): Promise<number> {
    return ResFinalQubit.count({
      where: {
        procesado: false,
      },
    });
  }
}

export default new ResFinalQubitRepository();
