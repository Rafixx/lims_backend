import { Resultado } from '../models/Resultado';
import { sequelize } from '../config/db.config';
import { Transaction } from 'sequelize';

export interface CreateResultadoDTO {
  id_muestra: number;
  id_tecnica: number;
  tipo_res?: string;
  valor?: string;
  valor_texto?: string;
  valor_fecha?: Date;
  unidades?: string;
  f_resultado?: Date;
  validado?: boolean;
  dentro_rango?: boolean;
  created_by?: number;
}

export interface UpdateResultadoDTO {
  tipo_res?: string;
  valor?: string;
  valor_texto?: string;
  valor_fecha?: Date;
  unidades?: string;
  f_resultado?: Date;
  f_validacion?: Date;
  validado?: boolean;
  dentro_rango?: boolean;
  updated_by?: number;
}

export class ResultadoRepository {
  /**
   * Obtener todos los resultados con sus relaciones
   */
  async findAll(): Promise<Resultado[]> {
    return Resultado.scope('withRefs').findAll({
      order: [
        ['id_muestra', 'ASC'],
        ['id_tecnica', 'ASC'],
        ['id_resultado', 'ASC'],
      ],
    });
  }

  /**
   * Obtener un resultado por ID
   */
  async findById(id: number): Promise<Resultado | null> {
    return Resultado.scope('withRefs').findOne({
      where: {
        id_resultado: id,
      },
    });
  }

  /**
   * Obtener todos los resultados de una muestra
   */
  async findByMuestra(id_muestra: number): Promise<Resultado[]> {
    return Resultado.scope('withRefs').findAll({
      where: {
        id_muestra,
      },
      order: [['id_tecnica', 'ASC']],
    });
  }

  /**
   * Obtener todos los resultados de una técnica
   */
  async findByTecnica(id_tecnica: number): Promise<Resultado[]> {
    return Resultado.scope('withRefs').findAll({
      where: {
        id_tecnica,
      },
      order: [['id_resultado', 'ASC']],
    });
  }

  /**
   * Crear un nuevo resultado
   */
  async create(
    data: CreateResultadoDTO,
    transaction?: Transaction
  ): Promise<Resultado> {
    const t = transaction || (await sequelize.transaction());
    try {
      const nuevoResultado = await Resultado.create(
        {
          ...data,
          f_resultado: data.f_resultado || new Date(),
        },
        { transaction: t }
      );

      if (!transaction) {
        await t.commit();
      }

      // Recargar con relaciones
      return (await this.findById(nuevoResultado.id_resultado))!;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Actualizar un resultado existente
   */
  async update(
    id: number,
    data: UpdateResultadoDTO,
    transaction?: Transaction
  ): Promise<Resultado> {
    const t = transaction || (await sequelize.transaction());

    try {
      const resultado = await Resultado.findOne({
        where: { id_resultado: id },
        transaction: t,
      });

      if (!resultado) {
        throw new Error(`Resultado con ID ${id} no encontrado`);
      }

      await resultado.update(
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
   * Soft delete de un resultado
   */
  async delete(id: number, updated_by?: number): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const resultado = await Resultado.findOne({
        where: { id_resultado: id },
        transaction,
      });

      if (!resultado) {
        throw new Error(`Resultado con ID ${id} no encontrado`);
      }

      await resultado.update(
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
   * Crear múltiples resultados en batch
   */
  async createBatch(
    resultados: CreateResultadoDTO[],
    transaction?: Transaction
  ): Promise<Resultado[]> {
    const t = transaction || (await sequelize.transaction());

    try {
      const nuevosResultados = await Resultado.bulkCreate(
        resultados.map((res) => ({
          ...res,
          f_resultado: res.f_resultado || new Date(),
        })),
        { transaction: t }
      );

      if (!transaction) {
        await t.commit();
      }

      // Recargar con relaciones
      const ids = nuevosResultados.map((r) => r.id_resultado);
      return Resultado.scope('withRefs').findAll({
        where: {
          id_resultado: ids,
        },
      });
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  // ============ MÉTODOS AUXILIARES (SIN IMPLEMENTAR) ============

  /**
   * Contar resultados por muestra
   */
  // async countByMuestra(_id_muestra: number): Promise<number> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Contar resultados por técnica
   */
  // async countByTecnica(_id_tecnica: number): Promise<number> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados validados
   */
  // async findValidados(): Promise<Resultado[]> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados pendientes de validación
   */
  // async findPendientesValidacion(): Promise<Resultado[]> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados fuera de rango
   */
  // async findFueraDeRango(): Promise<Resultado[]> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Validar un resultado
   */
  // async validar(_id: number, _validado_by?: number): Promise<Resultado> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Validar múltiples resultados en batch
   */
  // async validarBatch(_ids: number[], _validado_by?: number): Promise<void> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados por tipo
   */
  // async findByTipo(_tipo_res: string): Promise<Resultado[]> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados por rango de fechas
   */
  // async findByFechaResultado(
  //   _fecha_inicio: Date,
  //   _fecha_fin: Date
  // ): Promise<Resultado[]> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }
}
