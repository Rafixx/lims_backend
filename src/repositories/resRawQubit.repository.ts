import ResRawQubit from '../models/ResRawQubit';
import { Transaction, InferCreationAttributes } from 'sequelize';

export type CreateResRawQubitDTO = Omit<
  InferCreationAttributes<ResRawQubit>,
  'id' | 'createdAt'
>;

export class ResRawQubitRepository {
  /**
   * Obtener todos los registros raw de Qubit
   */
  async findAll(): Promise<ResRawQubit[]> {
    return ResRawQubit.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Obtener un registro por ID
   */
  async findById(id: number): Promise<ResRawQubit | null> {
    return ResRawQubit.findByPk(id);
  }

  /**
   * Truncar (vaciar) la tabla de datos raw
   */
  async truncate(transaction?: Transaction): Promise<void> {
    await ResRawQubit.destroy({
      where: {},
      truncate: true,
      transaction,
    });
  }

  /**
   * Crear un registro
   */
  async create(
    data: CreateResRawQubitDTO,
    transaction?: Transaction
  ): Promise<ResRawQubit> {
    return ResRawQubit.create(data, { transaction });
  }

  /**
   * Crear múltiples registros en batch
   */
  async createBatch(
    dataArray: CreateResRawQubitDTO[],
    transaction?: Transaction
  ): Promise<ResRawQubit[]> {
    return ResRawQubit.bulkCreate(dataArray, { transaction });
  }

  /**
   * Reemplazar todos los datos: trunca y luego inserta nuevos registros
   * Esta operación es atómica (todo o nada)
   */
  async replaceAll(
    dataArray: CreateResRawQubitDTO[],
    transaction?: Transaction
  ): Promise<ResRawQubit[]> {
    // Si no hay transacción, creamos una para garantizar atomicidad
    if (transaction) {
      await this.truncate(transaction);
      return this.createBatch(dataArray, transaction);
    }

    // Usar sequelize del modelo para crear transacción
    return ResRawQubit.sequelize!.transaction(async (t) => {
      await this.truncate(t);
      return this.createBatch(dataArray, t);
    });
  }

  /**
   * Contar registros
   */
  async count(): Promise<number> {
    return ResRawQubit.count();
  }

  /**
   * Buscar por nombre de test (test_name)
   */
  async findByTestName(testName: string): Promise<ResRawQubit[]> {
    return ResRawQubit.findAll({
      where: {
        test_name: testName,
      },
      order: [['createdAt', 'DESC']],
    });
  }
}
