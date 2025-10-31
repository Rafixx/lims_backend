// src/services/resultadoNanodrop.service.ts
import { Transaction } from 'sequelize';
import { ResRawNanodrop } from '../models/ResRawNanodrop';
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';
import { ResFinalNanodropRepository } from '../repositories/resFinalNanodrop.repository';
import { ResultadoRepository } from '../repositories/resultado.repository';
import { sequelize } from '../config/db.config';
import { ESTADO_TECNICA } from '../constants/estados.constants';

interface ProcessNanodropResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
  resultsCreated: number;
  errors: string[];
}

// Tipo para Tecnica con Muestra incluida
interface TecnicaConMuestra extends Tecnica {
  muestra?: Muestra | null;
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

  /**
   * PASO 2 CON MAPEO: Procesa registros de ResRaw → ResFinal → Resultado
   * Usa el worklist para obtener técnicas y un mapeo por índice de fila
   *
   * @param idWorklist ID del worklist para obtener técnicas
   * @param mapeo Record<number, number> - Índice de fila RAW → id_tecnica
   * @param createdBy ID del usuario que ejecuta el proceso
   * @returns Resultado del procesamiento
   */
  async processWithMapping(
    idWorklist: number,
    mapeo: Record<number, number>,
    createdBy: number
  ): Promise<ProcessNanodropResult> {
    const transaction: Transaction = await sequelize.transaction();
    const errors: string[] = [];
    let recordsProcessed = 0;
    let resultsCreated = 0;

    try {
      // 1. Obtener todos los registros raw
      const rawRecords = await ResRawNanodrop.findAll({ transaction });

      if (rawRecords.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          message: 'No hay datos en la tabla res_raw_nanodrop',
          recordsProcessed: 0,
          resultsCreated: 0,
          errors: [],
        };
      }

      console.log(
        `📊 [PROCESO CON MAPEO] Procesando ${rawRecords.length} registros raw con worklist ${idWorklist}...`
      );

      // 2. Obtener técnicas del worklist
      const tecnicas = (await Tecnica.findAll({
        where: { id_worklist: idWorklist },
        include: [
          {
            model: Muestra,
            as: 'muestra',
            attributes: ['id_muestra', 'codigo_epi'],
          },
        ],
        transaction,
      })) as unknown as TecnicaConMuestra[];

      if (tecnicas.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          message: `No se encontraron técnicas para el worklist ${idWorklist}`,
          recordsProcessed: 0,
          resultsCreated: 0,
          errors: [],
        };
      }

      console.log(`✅ Encontradas ${tecnicas.length} técnicas en el worklist`);

      // 3. Procesar cada registro raw usando el mapeo por índice
      for (let index = 0; index < rawRecords.length; index++) {
        const raw = rawRecords[index];

        try {
          if (!raw.sample_code) {
            errors.push(`Registro raw índice ${index}: sample_code vacío`);
            continue;
          }

          // 3.1 Transformar y guardar en res_final_nanodrop
          const parseFloat = (value: string | null): number | null => {
            if (!value) return null;
            const numStr = value.replace(',', '.');
            const num = Number(numStr);
            return !isNaN(num) ? num : null;
          };

          await this.resFinalNanodropRepository.create(
            {
              codigo_epi: raw.sample_code,
              valor_conc_nucleico: parseFloat(raw.an_cant),
              valor_uds: 'ng/uL',
              ratio260_280: parseFloat(raw.a260_280),
              ratio260_230: parseFloat(raw.a260_230),
              abs_260: parseFloat(raw.a260),
              abs_280: parseFloat(raw.a280),
              analizador: 'NanoDrop',
              valor_fecha: raw.fecha || null,
              procesado: false,
              created_by: createdBy,
              updated_by: null,
            },
            transaction
          );

          recordsProcessed++;

          // 3.2 Buscar id_tecnica usando el mapeo por índice
          const idTecnicaMapeado = mapeo[index];
          if (!idTecnicaMapeado) {
            errors.push(
              `Registro raw índice ${index}: No hay mapeo para este índice`
            );
            continue;
          }

          // 3.3 Buscar la técnica por id_tecnica
          const tecnicaMatch = tecnicas.find(
            (t) => t.id_tecnica === idTecnicaMapeado
          );

          if (!tecnicaMatch || !tecnicaMatch.muestra) {
            errors.push(
              `Registro raw índice ${index}: No se encontró técnica con id_tecnica=${idTecnicaMapeado}`
            );
            continue;
          }

          // 3.4 Crear resultado
          await this.resultadoRepository.create(
            {
              id_muestra: tecnicaMatch.muestra.id_muestra,
              id_tecnica: tecnicaMatch.id_tecnica,
              tipo_res: 'ESPECTROFOTOMETRIA',
              valor: raw.an_cant || undefined,
              valor_texto: `A260/280: ${raw.a260_280 || 'N/A'} | A260/230: ${raw.a260_230 || 'N/A'}`,
              unidades: 'ng/uL',
              f_resultado: new Date(),
              validado: false,
              created_by: createdBy,
            },
            transaction
          );

          // 3.5 Cambiar el estado de la técnica a COMPLETADA
          await Tecnica.update(
            {
              id_estado: ESTADO_TECNICA.COMPLETADA_TECNICA,
              fecha_estado: new Date(),
            },
            {
              where: { id_tecnica: tecnicaMatch.id_tecnica },
              transaction,
            }
          );

          resultsCreated++;
        } catch (error) {
          const errorMsg = `Error procesando registro raw índice ${index}: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      await transaction.commit();
      console.log(
        `✅ [PROCESO CON MAPEO] Completado: ${recordsProcessed} registros → Final, ${resultsCreated} resultados creados`
      );

      return {
        success: resultsCreated > 0,
        message: `Proceso completado: ${recordsProcessed} registros procesados, ${resultsCreated} resultados creados`,
        recordsProcessed,
        resultsCreated,
        errors,
      };
    } catch (error) {
      await transaction.rollback();
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en processWithMapping:', errorMsg);

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
