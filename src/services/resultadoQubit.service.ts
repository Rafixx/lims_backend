// src/services/resultadoQubit.service.ts
import { Transaction } from 'sequelize';
import ResRawQubit from '../models/ResRawQubit';
import { Muestra } from '../models/Muestra';
import { ResFinalQubitRepository } from '../repositories/resFinalQubit.repository';
import { ResultadoRepository } from '../repositories/resultado.repository';
import { sequelize } from '../config/db.config';

interface ProcessQubitResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
  resultsCreated: number;
  errors: string[];
}

/**
 * Servicio para procesar datos de Qubit
 * Transforma datos desde res_raw_qubit → res_final_qubit → resultado
 */
export class ResultadoQubitService {
  private resFinalQubitRepository: ResFinalQubitRepository;
  private resultadoRepository: ResultadoRepository;

  constructor() {
    this.resFinalQubitRepository = new ResFinalQubitRepository();
    this.resultadoRepository = new ResultadoRepository();
  }

  async findAllRaw(): Promise<ResRawQubit[]> {
    return ResRawQubit.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * PASO 1: Procesa registros de ResRawQubit → ResFinalQubit
   * Solo transforma y guarda en la tabla final, NO crea resultados
   *
   * @param createdBy ID del usuario que ejecuta el proceso
   * @returns Resultado del procesamiento
   */
  async processRawToFinal(createdBy: number): Promise<ProcessQubitResult> {
    const transaction: Transaction = await sequelize.transaction();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      // 1. Obtener todos los registros raw
      const rawRecords = await ResRawQubit.findAll({ transaction });

      if (rawRecords.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          message: 'No hay registros en res_raw_qubit para procesar',
          recordsProcessed: 0,
          resultsCreated: 0,
          errors: [],
        };
      }

      console.log(
        `📊 [PASO 1] Procesando ${rawRecords.length} registros Raw → Final...`
      );

      // 2. Transformar e insertar en ResFinalQubit
      for (const raw of rawRecords) {
        try {
          // Helper: parsear fecha de Qubit (formato: "08/08/2025 10:29:39 PM")
          const parseDate = (value: string | null): string | null => {
            if (!value) return null;
            try {
              const parsed = new Date(value);
              return !isNaN(parsed.getTime()) ? value : null;
            } catch {
              return null;
            }
          };

          // Insertar en ResFinalQubit
          await this.resFinalQubitRepository.create(
            {
              codigo_epi: raw.test_name, // El test_name es el código epidemiológico
              valor: raw.orig_conc,
              valor_uds: raw.orig_conc_units,
              valor_fecha: parseDate(raw.test_date),
              tipo_ensayo: raw.assay_name, // dsDNA, RNA, etc.
              qubit_valor: raw.qubit_tube_conc,
              qubit_uds: raw.qubit_units,
              analizador: 'Qubit',
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
          `✅ [PASO 1] Completado: ${recordsProcessed} registros guardados en res_final_qubit`
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
   * PASO 2: Procesa registros de ResFinalQubit → Resultado
   * Crea registros en la tabla resultado relacionando con Muestra y Técnica
   * Solo procesa registros con procesado=false
   *
   * @param createdBy ID del usuario que ejecuta el proceso
   * @returns Resultado del procesamiento
   */
  async processFinalToResultado(
    createdBy: number
  ): Promise<ProcessQubitResult> {
    const transaction: Transaction = await sequelize.transaction();
    const errors: string[] = [];
    let resultsCreated = 0;

    try {
      // Obtener registros finales no procesados
      const unprocessedRecords =
        await this.resFinalQubitRepository.findUnprocessed();

      if (unprocessedRecords.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          message: 'No hay registros sin procesar en res_final_qubit',
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
              tipo_res: 'FLUOROMETRIA',
              valor: finalRecord.valor || undefined,
              valor_texto: `${finalRecord.tipo_ensayo || 'N/A'} | Qubit: ${finalRecord.qubit_valor || 'N/A'} ${finalRecord.qubit_uds || ''}`,
              unidades: finalRecord.valor_uds || 'ng/uL',
              f_resultado: fechaResultado,
              validado: false,
              created_by: createdBy,
            },
            transaction
          );

          resultsCreated++;

          // Marcar como procesado
          await this.resFinalQubitRepository.markAsProcessed(
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
        `✅ ${resultsCreated} resultados creados desde registros finales`
      );

      return {
        success: resultsCreated > 0,
        message: `${resultsCreated} resultados creados desde registros finales`,
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

export default new ResultadoQubitService();
