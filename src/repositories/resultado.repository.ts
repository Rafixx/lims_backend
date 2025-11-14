import { Resultado } from '../models/Resultado';
import { sequelize } from '../config/db.config';
import { Transaction } from 'sequelize';
import { parseCSV } from '../utils/csvParser';
import {
  ResRawNanodropRepository,
  CreateResRawNanodropDTO,
} from './resRawNanodrop.repository';
import {
  ResRawQubitRepository,
  CreateResRawQubitDTO,
} from './resRawQubit.repository';

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

type ImportType = 'NANODROP' | 'QUBIT';

export class ResultadoRepository {
  private resRawNanodropRepository: ResRawNanodropRepository;
  private resRawQubitRepository: ResRawQubitRepository;

  constructor() {
    this.resRawNanodropRepository = new ResRawNanodropRepository();
    this.resRawQubitRepository = new ResRawQubitRepository();
  }

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

  /**
   * Detecta el tipo de CSV (Qubit o Nanodrop) analizando las columnas
   * y delega al método de importación correspondiente
   * @param idWorklist ID del worklist
   * @param csvBuffer Buffer del archivo CSV
   * @returns Promise con el resultado de la importación
   */
  async setCSVtoRAW(
    // idWorklist: number,
    csvBuffer: Buffer
  ): Promise<{
    success: boolean;
    message: string;
    resultadosCreados?: number;
    type?: ImportType;
  }> {
    // Intentar parsear el CSV con ambos formatos para detectar el tipo
    let columnasDetectadas: string[] = [];

    // Primero intentar parsear como UTF-8 (Qubit)
    try {
      const registrosQubit = await parseCSV(csvBuffer, {
        delimiter: ',',
        trim: true,
        skipEmptyLines: true,
        relaxColumnCount: true,
        relaxQuotes: true,
        quote: '"',
      });

      if (registrosQubit.length > 0) {
        columnasDetectadas = Object.keys(registrosQubit[0]);

        // Columnas características de Qubit
        const columnasQubit = [
          'Run ID',
          'Assay Name',
          'Test Name',
          'Test Date',
          'Qubit tube conc.',
          'Original sample conc.',
        ];

        const tieneColumnasQubit = columnasQubit.some((col) =>
          columnasDetectadas.includes(col)
        );

        if (tieneColumnasQubit) {
          console.log('✅ CSV detectado como Qubit');
          console.log('Columnas encontradas:', columnasDetectadas);
          return this.importQubitRawDataResults(
            //idWorklist,
            csvBuffer
          );
        }
      }
    } catch {
      // Si falla con formato Qubit, intentar con Nanodrop
      console.log('No es formato Qubit, intentando Nanodrop...');
    }

    // Intentar parsear como UTF-16 LE con tabs (Nanodrop)
    try {
      const registrosNanodrop = await parseCSV(csvBuffer, {
        delimiter: '\t',
        trim: true,
        skipEmptyLines: true,
        relaxColumnCount: true,
        relaxQuotes: true,
        quote: false,
      });

      if (registrosNanodrop.length > 0) {
        columnasDetectadas = Object.keys(registrosNanodrop[0]);

        // Columnas características de Nanodrop
        const columnasNanodrop = [
          'Fecha',
          'Nombre de muestra',
          'Ácido nucleico(ng/uL)',
          'A260/A280',
          'A260/A230',
        ];

        const tieneColumnasNanodrop = columnasNanodrop.some((col) =>
          columnasDetectadas.includes(col)
        );

        if (tieneColumnasNanodrop) {
          console.log('✅ CSV detectado como Nanodrop');
          console.log('Columnas encontradas:', columnasDetectadas);
          return this.importNanoDropRawDataResults(
            // idWorklist,
            csvBuffer
          );
        }
      }
    } catch (error) {
      console.error('Error al parsear como Nanodrop:', error);
    }

    // Si no se pudo detectar el tipo
    return {
      success: false,
      message: `No se pudo determinar el tipo de CSV. Columnas detectadas: ${columnasDetectadas.join(', ')}. 
        Se esperaban columnas de Qubit (Run ID, Assay Name, Test Name...) o Nanodrop (Fecha, Nombre de muestra, Ácido nucleico...)`,
    };
  }

  /**
   * Importa datos de resultados de Nanodrop para un worklist desde un archivo CSV
   * @param idWorklist ID del worklist
   * @param csvBuffer Buffer del archivo CSV
   * @returns Promise<{ success: boolean; message: string; resultadosCreados: number }>
   */
  async importNanoDropRawDataResults(
    // idWorklist: number,
    csvBuffer: Buffer
  ): Promise<{
    success: boolean;
    message: string;
    resultadosCreados?: number;
    type?: ImportType;
  }> {
    // Validar que el worklist existe
    // const worklist = await Worklist.findByPk(idWorklist);
    // if (!worklist) {
    //   return {
    //     success: false,
    //     message: `Worklist con ID ${idWorklist} no encontrado`,
    //   };
    // }

    // Parsear el CSV
    let registrosCSV;
    try {
      registrosCSV = await parseCSV(csvBuffer, {
        delimiter: '\t', // El CSV usa tabuladores
        trim: true,
        skipEmptyLines: true,
        relaxColumnCount: true, // Permite columnas inconsistentes
        relaxQuotes: true, // Relaja la validación de comillas
      });
    } catch (error) {
      return {
        success: false,
        message: `Error al parsear el archivo CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }

    // TODO: Validar que el CSV tenga las columnas requeridas
    // Comentado temporalmente para debug
    /*
      const columnasRequeridas = [
        'Fecha',
        'Nombre de muestra',
        'Ácido nucleico(ng/uL)',
        'A260/A280',
        'A260/A230',
      ];
  
      try {
        validateCSVColumns(registrosCSV, columnasRequeridas);
      } catch (error) {
        return {
          success: false,
          message: `${error instanceof Error ? error.message : 'Error de validación'}`,
        };
      }
      */

    // Debug: Log de columnas detectadas
    if (registrosCSV.length > 0) {
      console.log('Columnas detectadas en CSV:', Object.keys(registrosCSV[0]));
      console.log('Total de registros:', registrosCSV.length);
    }

    // Mapear los registros del CSV al formato de ResRawNanodrop
    const datosRawNanodrop: CreateResRawNanodropDTO[] = registrosCSV.map(
      (registro) => ({
        fecha: registro['Fecha'] || '',
        sample_code: registro['Nombre de muestra'] || '',
        an_cant: registro['Ácido nucleico(ng/uL)'] || '',
        a260_280: registro['A260/A280'] || '',
        a260_230: registro['A260/A230'] || '',
        a260: registro['A260'] || '',
        a280: registro['A280'] || '',
        an_factor: registro['Factor de ácido nucleico'] || '',
        correcion_lb: registro['Corrección de línea base (nm)'] || '',
        absorbancia_lb: registro['Absorbancia de línea base'] || '',
        corregida: registro[' Corregida (ng/uL)'] || '',
        porc_corregido: registro[' % CV corregido'] || '',
        impureza1: registro['Impureza 1'] || '',
        impureza1_a260: registro['Impureza 1 A260'] || '',
        impureza1_porc: registro['Impureza 1 %CV'] || '',
        impureza1_mm: registro['Impureza 1 mM'] || '',
        impureza2: registro['Impureza 2'] || '',
        impureza2_a260: registro['Impureza 2 A260'] || '',
        impureza2_porc: registro['Impureza 2 %CV'] || '',
        impureza2_mm: registro['Impureza 2 mM'] || '',
        impureza3: registro['Impureza 3'] || '',
        impureza3_a260: registro['Impureza 3 A260'] || '',
        impureza3_porc: registro['Impureza 3 %CV'] || '',
        impureza3_mm: registro['Impureza 3 mM'] || '',
        position: registro['Posición placa'] || null, // ✅ NUEVO CAMPO
      })
    );

    // Guardar los datos raw en ResRawNanodrop (trunca y reemplaza)
    try {
      await this.resRawNanodropRepository.replaceAll(datosRawNanodrop);
    } catch (error) {
      return {
        success: false,
        message: `Error al guardar datos raw: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }

    return {
      success: true,
      message: 'Datos raw de Nanodrop importados correctamente',
      type: 'NANODROP',
    };
  }

  /**
   * Importa datos de resultados desde un CSV de Qubit
   * - Parsea el CSV con encoding UTF-8, separador coma y comillas
   * - Guarda los datos raw en res_raw_qubit (trunca y reemplaza)
   * - Crea registros de Resultado para técnicas sin resultados
   * - Completa las técnicas automáticamente
   */
  async importQubitRawDataResults(
    // idWorklist: number,
    csvBuffer: Buffer
  ): Promise<{
    success: boolean;
    message: string;
    resultadosCreados?: number;
    type?: ImportType;
  }> {
    // Validar que el worklist existe
    // const worklist = await Worklist.findByPk(idWorklist);
    // if (!worklist) {
    //   return {
    //     success: false,
    //     message: `Worklist con ID ${idWorklist} no encontrado`,
    //   };
    // }

    // Parsear el CSV de Qubit
    let registrosCSV;
    try {
      registrosCSV = await parseCSV(csvBuffer, {
        delimiter: ',', // El CSV de Qubit usa comas
        trim: true,
        skipEmptyLines: true,
        relaxColumnCount: true,
        relaxQuotes: true,
        quote: '"', // Procesa comillas dobles
      });
    } catch (error) {
      return {
        success: false,
        message: `Error al parsear el archivo CSV de Qubit: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }

    // Debug: Log de columnas detectadas
    if (registrosCSV.length > 0) {
      console.log(
        'Columnas detectadas en CSV Qubit:',
        Object.keys(registrosCSV[0])
      );
      console.log('Total de registros:', registrosCSV.length);
    }

    // Helper: parsear fecha de Qubit (formato: "08/08/2025 10:29:39 PM")
    const parseFechaQubit = (fechaStr: string): Date | null => {
      if (!fechaStr) return null;
      try {
        // Formato: MM/DD/YYYY HH:MM:SS AM/PM
        const fechaParseada = new Date(fechaStr);
        return !isNaN(fechaParseada.getTime()) ? fechaParseada : null;
      } catch {
        return null;
      }
    };

    // Mapear los registros del CSV al formato de ResRawQubit
    const datosRawQubit: CreateResRawQubitDTO[] = registrosCSV.map(
      (registro) => ({
        run_id: registro['Run ID'] || null,
        assay_name: registro['Assay Name'] || null,
        test_name: registro['Test Name'] || null,
        test_date: registro['Test Date'] || null,
        qubit_tube_conc: registro['Qubit tube conc.'] || null,
        qubit_units: registro['Qubit tube conc. units'] || null,
        orig_conc: registro['Original sample conc.'] || null,
        orig_conc_units: registro['Original sample conc. units'] || null,
        sample_volume_ul: registro['Sample Volume (uL)'] || null,
        dilution_factor: registro['Dilution Factor'] || null,
        std1_rfu: registro['Std 1 RFU'] || null,
        std2_rfu: registro['Std 2 RFU'] || null,
        std3_rfu: registro['Std 3 RFU'] || null,
        excitation: registro['Excitation'] || null,
        emission: registro['Emission'] || null,
        green_rfu: registro['Green RFU'] || null,
        far_red_rfu: registro['Far Red RFU'] || null,
        fecha: parseFechaQubit(registro['Test Date'] || ''),
        position:
          registro['Position'] ||
          registro['Well'] ||
          registro['Posición'] ||
          registro['Pocillo'] ||
          null, // ✅ NUEVO CAMPO con múltiples posibles nombres
      })
    );

    // Guardar los datos raw en ResRawQubit (trunca y reemplaza)
    try {
      await this.resRawQubitRepository.replaceAll(datosRawQubit);
    } catch (error) {
      return {
        success: false,
        message: `Error al guardar datos raw de Qubit: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }

    return {
      success: true,
      message: 'Datos raw de Qubit importados correctamente',
      type: 'QUBIT',
    };
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
