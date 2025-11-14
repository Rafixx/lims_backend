// src/repositories/resRawNanodrop.repository.ts
import { ResRawNanodrop } from '../models/ResRawNanodrop';
import { Transaction } from 'sequelize';

export interface CreateResRawNanodropDTO {
  fecha: string;
  sample_code: string;
  an_cant: string;
  a260_280: string;
  a260_230: string;
  a260: string;
  a280: string;
  an_factor: string;
  correcion_lb: string;
  absorbancia_lb: string;
  corregida: string;
  porc_corregido: string;
  impureza1: string;
  impureza1_a260: string;
  impureza1_porc: string;
  impureza1_mm: string;
  impureza2: string;
  impureza2_a260: string;
  impureza2_porc: string;
  impureza2_mm: string;
  impureza3: string;
  impureza3_a260: string;
  impureza3_porc: string;
  impureza3_mm: string;
  position?: string | null; // ✅ NUEVO CAMPO
}

export class ResRawNanodropRepository {
  /**
   * Obtiene todos los registros de la tabla res_raw_nanodrop
   */
  async findAll(): Promise<ResRawNanodrop[]> {
    return ResRawNanodrop.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Obtiene un registro por ID
   */
  async findById(id: number): Promise<ResRawNanodrop | null> {
    return ResRawNanodrop.findByPk(id);
  }

  /**
   * Trunca (elimina todos los registros) de la tabla
   * Se usa antes de cada importación para mantener solo la última
   */
  async truncate(transaction?: Transaction): Promise<void> {
    await ResRawNanodrop.destroy({
      where: {},
      truncate: true,
      cascade: false,
      transaction,
    });
  }

  /**
   * Crea un nuevo registro
   */
  async create(
    data: CreateResRawNanodropDTO,
    transaction?: Transaction
  ): Promise<ResRawNanodrop> {
    return ResRawNanodrop.create(data, { transaction });
  }

  /**
   * Crea múltiples registros en batch
   */
  async createBatch(
    dataArray: CreateResRawNanodropDTO[],
    transaction?: Transaction
  ): Promise<ResRawNanodrop[]> {
    return ResRawNanodrop.bulkCreate(dataArray, { transaction });
  }

  /**
   * Reemplaza todos los datos con una nueva importación
   * Primero trunca la tabla y luego inserta los nuevos datos
   * Todo en una transacción para asegurar atomicidad
   */
  async replaceAll(
    dataArray: CreateResRawNanodropDTO[],
    transaction?: Transaction
  ): Promise<{
    success: boolean;
    message: string;
    registrosCreados: number;
  }> {
    const useTransaction =
      transaction || (await ResRawNanodrop.sequelize!.transaction());

    try {
      // 1. Truncar tabla (eliminar todos los registros anteriores)
      await this.truncate(useTransaction);

      // 2. Insertar nuevos registros
      const nuevosRegistros = await this.createBatch(dataArray, useTransaction);

      // Si no se pasó una transacción externa, hacer commit
      if (!transaction) {
        await useTransaction.commit();
      }

      return {
        success: true,
        message: `Importación completada. ${nuevosRegistros.length} registros creados`,
        registrosCreados: nuevosRegistros.length,
      };
    } catch (error) {
      // Si no se pasó una transacción externa, hacer rollback
      if (!transaction) {
        await useTransaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Cuenta el número total de registros
   */
  async count(): Promise<number> {
    return ResRawNanodrop.count();
  }

  /**
   * Obtiene registros por código de muestra
   */
  async findBySampleCode(sampleCode: string): Promise<ResRawNanodrop[]> {
    return ResRawNanodrop.findAll({
      where: { sample_code: sampleCode },
      order: [['createdAt', 'DESC']],
    });
  }
}
