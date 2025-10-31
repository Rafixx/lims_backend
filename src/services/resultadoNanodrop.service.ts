// src/services/resultadoNanodrop.service.ts
import { Transaction } from 'sequelize';
import { ResRawNanodrop } from '../models/ResRawNanodrop';
import { Muestra } from '../models/Muestra';
import { ResFinalNanodropRepository } from '../repositories/resFinalNanodrop.repository';
import { ResultadoRepository } from '../repositories/resultado.repository';
import { sequelize } from '../config/db.config';

interface ProcessNanodropResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
  resultsCreated: number;
  errors: string[];
}

/**
 * Servicio para procesar datos de Nanodrop
 * Transforma datos desde res_raw_nanodrop → res_final_nanodrop → resultado
 */
export class ResultadoNanodropService {
  private resFinalNanodropRepository: ResFinalNanodropRepository;
  private resultadoRepository: ResultadoRepository;

  constructor() {
    this.resFinalNanodropRepository = new ResFinalNanodropRepository();
    this.resultadoRepository = new ResultadoRepository();
  }

  async findAllRaw(): Promise<ResRawNanodrop[]> {
    return ResRawNanodrop.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * PASO 1: Procesa registros de ResRawNanodrop → ResFinalNanodrop
   * Solo transforma y guarda en la tabla final, NO crea resultados
   *
   * @param createdBy ID del usuario que ejecuta el proceso
   * @returns Resultado del procesamiento
   */
  async processRawToFinal(createdBy: number): Promise<ProcessNanodropResult> {
    const transaction: Transaction = await sequelize.transaction();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      // 1. Obtener todos los registros raw
      const rawRecords = await ResRawNanodrop.findAll({ transaction });

      if (rawRecords.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          message: 'No hay registros en res_raw_nanodrop para procesar',
          recordsProcessed: 0,
          resultsCreated: 0,
          errors: [],
        };
      }

      console.log(
        `📊 [PASO 1] Procesando ${rawRecords.length} registros Raw → Final...`
      );

      // 2. Transformar e insertar en ResFinalNanodrop
      for (const raw of rawRecords) {
        try {
          // Helper: reemplazar comas por puntos y convertir a número
          const parseNumeric = (value: string | null): number | null => {
            if (!value || value.trim() === '') return null;
            const cleaned = value.replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? null : parsed;
          };

          // Insertar en ResFinalNanodrop
          await this.resFinalNanodropRepository.create(
            {
              codigo_epi: raw.sample_code,
              valor_conc_nucleico: parseNumeric(raw.an_cant),
              valor_uds: 'ng/uL',
              valor_fecha: raw.fecha, // Mantener como string según el modelo
              ratio260_280: parseNumeric(raw.a260_280),
              ratio260_230: parseNumeric(raw.a260_230),
              abs_260: parseNumeric(raw.a260),
              abs_280: parseNumeric(raw.a280),
              analizador: 'NanoDrop',
              procesado: false,
              created_by: createdBy,
              updated_by: createdBy,
            },
            transaction
          );

          recordsProcessed++;
        } catch (error) {
          const errorMsg = `Error procesando registro raw ID ${raw.id}: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Commit si hay al menos un registro procesado
      if (recordsProcessed > 0) {
        await transaction.commit();
        console.log(
          `✅ [PASO 1] Completado: ${recordsProcessed} registros guardados en res_final_nanodrop`
        );

        return {
          success: true,
          message: `Paso 1 completado: ${recordsProcessed} registros transformados y guardados en tabla final`,
          recordsProcessed,
          resultsCreated: 0, // En paso 1 no se crean resultados
          errors,
        };
      } else {
        await transaction.rollback();
        return {
          success: false,
          message: 'No se pudo procesar ningún registro',
          recordsProcessed: 0,
          resultsCreated: 0,
          errors,
        };
      }
    } catch (error) {
      await transaction.rollback();
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en processRawToFinal:', errorMsg);

      return {
        success: false,
        message: `Error durante el procesamiento: ${errorMsg}`,
        recordsProcessed,
        resultsCreated: 0,
        errors: [...errors, errorMsg],
      };
    }
  }

  /**
   * PASO 2: Procesa registros de ResFinalNanodrop → Resultado
   * Crea registros en la tabla resultado relacionando con Muestra y Técnica
   * Solo procesa registros con procesado=false
   *
   * @param createdBy ID del usuario que ejecuta el proceso
   * @returns Resultado del procesamiento
   */
  async processFinalToResultado(
    createdBy: number
  ): Promise<ProcessNanodropResult> {
    const transaction: Transaction = await sequelize.transaction();
    const errors: string[] = [];
    let resultsCreated = 0;

    try {
      // Obtener registros finales no procesados
      const unprocessedRecords =
        await this.resFinalNanodropRepository.findUnprocessed();

      if (unprocessedRecords.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          message: 'No hay registros sin procesar en res_final_nanodrop',
          recordsProcessed: 0,
          resultsCreated: 0,
          errors: [],
        };
      }

      console.log(
        `📊 [PASO 2] Procesando ${unprocessedRecords.length} registros finales → resultados...`
      );

      for (const finalRecord of unprocessedRecords) {
        try {
          if (!finalRecord.codigo_epi) {
            errors.push(
              `Registro final ID ${finalRecord.id}: codigo_epi vacío`
            );
            continue;
          }

          // Buscar muestra
          const muestra = await Muestra.findOne({
            where: { codigo_epi: finalRecord.codigo_epi },
            transaction,
          });

          if (!muestra) {
            errors.push(
              `Registro final ID ${finalRecord.id}: No se encontró Muestra con codigo_epi="${finalRecord.codigo_epi}"`
            );
            continue;
          }

          // Crear resultado
          const fechaResultado = finalRecord.valor_fecha
            ? new Date(finalRecord.valor_fecha)
            : new Date();

          await this.resultadoRepository.create(
            {
              id_muestra: muestra.id_muestra,
              id_tecnica: 0, // TODO: Implementar relación con técnica
              tipo_res: 'ESPECTROFOTOMETRIA',
              valor: finalRecord.valor_conc_nucleico?.toString() || undefined,
              valor_texto: `A260/280: ${finalRecord.ratio260_280 || 'N/A'} | A260/230: ${finalRecord.ratio260_230 || 'N/A'}`,
              unidades: finalRecord.valor_uds || 'ng/uL',
              f_resultado: fechaResultado,
              validado: false,
              created_by: createdBy,
            },
            transaction
          );

          resultsCreated++;

          // Marcar como procesado
          await this.resFinalNanodropRepository.markAsProcessed(
            finalRecord.id,
            createdBy,
            transaction
          );
        } catch (error) {
          const errorMsg = `Error procesando registro final ID ${finalRecord.id}: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      await transaction.commit();
      console.log(
        `✅ [PASO 2] Completado: ${resultsCreated} resultados creados en tabla resultado`
      );

      return {
        success: resultsCreated > 0,
        message: `Paso 2 completado: ${resultsCreated} resultados creados en tabla resultado`,
        recordsProcessed: unprocessedRecords.length,
        resultsCreated,
        errors,
      };
    } catch (error) {
      await transaction.rollback();
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en processUnprocessedFinal:', errorMsg);

      return {
        success: false,
        message: `Error durante el procesamiento: ${errorMsg}`,
        recordsProcessed: 0,
        resultsCreated: 0,
        errors: [...errors, errorMsg],
      };
    }
  }
}

export default new ResultadoNanodropService();
