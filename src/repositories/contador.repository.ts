import { Transaction } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Contador } from '../models/Contador';

export interface NextCounterValue {
  year: number;
  value: number;
}

export class ContadorRepository {
  async getNextValue(
    contador: string,
    year: number,
    transaction?: Transaction
  ): Promise<NextCounterValue> {
    const execute = async (t: Transaction): Promise<NextCounterValue> => {
      const [counter] = await Contador.findOrCreate({
        where: { contador, year },
        defaults: { contador, year, current_value: 0 },
        transaction: t,
      });

      await counter.increment('current_value', { by: 1, transaction: t });
      await counter.reload({ transaction: t });

      const currentValue = Number(counter.current_value);
      if (Number.isNaN(currentValue)) {
        throw new Error('No se pudo calcular el nuevo valor del contador');
      }

      return { year: counter.year, value: currentValue };
    };

    if (transaction) {
      return execute(transaction);
    }

    return sequelize.transaction(execute);
  }
}
