import { MuestraArray } from '../models/MuestraArray';
import { Muestra } from '../models/Muestra';
import { Transaction, Op } from 'sequelize';
import { sequelize } from '../config/db.config';

export interface CreateMuestraArrayDTO {
  id_muestra: number;
  id_posicion?: number;
  codigo_placa?: string;
  posicion_placa?: string;
  codigo_epi?: string;
  codigo_externo?: string;
  f_envio_escanear?: Date;
  num_array?: number;
  num_serie?: string;
  pos_array?: string;
  created_by?: number;
}

export interface UpdateMuestraArrayDTO {
  id_posicion?: number;
  codigo_placa?: string;
  posicion_placa?: string;
  codigo_epi?: string;
  codigo_externo?: string;
  f_envio_escanear?: Date;
  num_array?: number;
  num_serie?: string;
  pos_array?: string;
  updated_by?: number;
}

export class MuestraArrayRepository {
  /**
   * Obtener todos los arrays con sus relaciones
   */
  async findAll(): Promise<MuestraArray[]> {
    return MuestraArray.scope('withRefs').findAll({
      order: [
        ['id_muestra', 'ASC'],
        ['id_posicion', 'ASC'],
      ],
    });
  }

  /**
   * Obtener un array por ID con sus relaciones
   */
  async findById(id: number): Promise<MuestraArray | null> {
    return MuestraArray.scope('withRefs').findOne({
      where: {
        id_array: id,
      },
    });
  }

  /**
   * Obtener todos los arrays de una muestra específica
   */
  async findByMuestraId(id_muestra: number): Promise<MuestraArray[]> {
    return MuestraArray.scope('withRefs').findAll({
      where: {
        id_muestra,
      },
      order: [['id_posicion', 'ASC']],
    });
  }

  /**
   * Crear un nuevo array
   */
  async create(
    data: CreateMuestraArrayDTO,
    transaction?: Transaction
  ): Promise<MuestraArray> {
    const t = transaction || (await sequelize.transaction());

    try {
      // Validar que la muestra existe y es tipo array
      const muestra = await Muestra.findByPk(data.id_muestra, {
        transaction: t,
      });

      if (!muestra) {
        throw new Error(`Muestra con ID ${data.id_muestra} no encontrada`);
      }

      if (!muestra.tipo_array) {
        throw new Error(
          `La muestra ${data.id_muestra} no es de tipo array. No se puede crear un registro de array para ella.`
        );
      }

      // Crear el array
      const nuevoArray = await MuestraArray.create(
        {
          ...data,
          f_creacion: new Date(),
        },
        { transaction: t }
      );

      if (!transaction) {
        await t.commit();
      }

      // Recargar con relaciones
      return (await this.findById(nuevoArray.id_array))!;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Actualizar un array existente
   */
  async update(
    id: number,
    data: UpdateMuestraArrayDTO,
    transaction?: Transaction
  ): Promise<MuestraArray> {
    const t = transaction || (await sequelize.transaction());

    try {
      const array = await MuestraArray.findOne({
        where: { id_array: id },
        transaction: t,
      });

      if (!array) {
        throw new Error(`Array con ID ${id} no encontrado`);
      }

      await array.update(
        {
          ...data,
          update_dt: new Date(),
        },
        { transaction: t }
      );

      if (!transaction) {
        await t.commit();
      }

      return (await this.findById(id))!;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Soft delete de un array
   */
  async delete(id: number, updated_by?: number): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const array = await MuestraArray.findOne({
        where: { id_array: id },
        transaction,
      });

      if (!array) {
        throw new Error(`Array con ID ${id} no encontrado`);
      }

      await array.update(
        {
          delete_dt: new Date(),
          updated_by,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Crear múltiples arrays en batch (para cuando se crean todas las posiciones de un array)
   */
  async createBatch(
    arrays: CreateMuestraArrayDTO[],
    transaction?: Transaction
  ): Promise<MuestraArray[]> {
    const t = transaction || (await sequelize.transaction());

    try {
      // Validar que todas las muestras existen y son tipo array
      if (arrays.length > 0) {
        const id_muestra = arrays[0].id_muestra;
        const muestra = await Muestra.findByPk(id_muestra, { transaction: t });

        if (!muestra) {
          throw new Error(`Muestra con ID ${id_muestra} no encontrada`);
        }

        if (!muestra.tipo_array) {
          throw new Error(
            `La muestra ${id_muestra} no es de tipo array. No se pueden crear registros de array para ella.`
          );
        }
      }

      await MuestraArray.bulkCreate(
        arrays.map((arr) => ({
          ...arr,
          f_creacion: new Date(),
        })),
        { transaction: t }
      );

      if (!transaction) {
        await t.commit();
      }

      // Recargar con relaciones
      return this.findByMuestraId(arrays[0].id_muestra);
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Contar arrays por muestra
   */
  async countByMuestra(id_muestra: number): Promise<number> {
    return MuestraArray.count({
      where: {
        id_muestra,
      },
    });
  }

  /**
   * Obtener arrays por código de placa
   */
  async findByCodigoPlaca(codigo_placa: string): Promise<MuestraArray[]> {
    return MuestraArray.scope('withRefs').findAll({
      where: {
        codigo_placa,
      },
      order: [['id_posicion', 'ASC']],
    });
  }

  /**
   * Obtener arrays por número de serie
   */
  async findByNumSerie(num_serie: string): Promise<MuestraArray[]> {
    return MuestraArray.scope('withRefs').findAll({
      where: {
        num_serie,
      },
      order: [
        ['id_muestra', 'ASC'],
        ['id_posicion', 'ASC'],
      ],
    });
  }

  /**
   * Verificar si una posición específica está ocupada en una muestra
   */
  async isPosicionOcupada(
    id_muestra: number,
    posicion_placa: string
  ): Promise<boolean> {
    const count = await MuestraArray.count({
      where: {
        id_muestra,
        posicion_placa,
      },
    });
    return count > 0;
  }

  /**
   * Obtener arrays pendientes de escanear (sin fecha de envío)
   */
  async findPendientesEscanear(): Promise<MuestraArray[]> {
    return MuestraArray.scope('withRefs').findAll({
      where: {
        f_envio_escanear: {
          [Op.is]: null,
        } as unknown as Date,
      },
      order: [
        ['id_muestra', 'ASC'],
        ['id_posicion', 'ASC'],
      ],
    });
  }

  /**
   * Asignar códigos externos a posiciones de placa por posicion_placa (batch).
   * Sólo actualiza las posiciones que pertenecen a id_muestra.
   * Devuelve el número de registros actualizados.
   */
  async assignCodigosExternosByPosicion(
    id_muestra: number,
    pares: { posicion_placa: string; cod_externo: string }[]
  ): Promise<number> {
    const transaction = await sequelize.transaction();
    let updated = 0;

    try {
      for (const par of pares) {
        const [count] = await MuestraArray.update(
          { codigo_externo: par.cod_externo, update_dt: new Date() },
          {
            where: { id_muestra, posicion_placa: par.posicion_placa },
            transaction,
          }
        );
        updated += count;
      }

      await transaction.commit();
      return updated;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Actualizar fecha de envío a escanear en batch
   */
  async updateFechaEnvioEscanear(
    ids: number[],
    fecha: Date,
    updated_by?: number
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      await MuestraArray.update(
        {
          f_envio_escanear: fecha,
          update_dt: new Date(),
          updated_by,
        },
        {
          where: {
            id_array: ids,
          },
          transaction,
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
