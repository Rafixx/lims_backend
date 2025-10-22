import { literal } from 'sequelize';
import { Worklist } from '../models/Worklist';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';
import { DimEstado } from '../models/DimEstado';
import { ResultadoRepository } from './resultado.repository';
import { Resultado } from '../models/Resultado';
import { TecnicaRepository } from './tecnica.repository';
import { parseCSV } from '../utils/csvParser';
import {
  ResRawNanodropRepository,
  CreateResRawNanodropDTO,
} from './resRawNanodrop.repository';
import {
  ResRawQubitRepository,
  CreateResRawQubitDTO,
} from './resRawQubit.repository';

interface CrearWorklistData extends Partial<Worklist> {
  tecnicas?: Array<{ id_tecnica: number }>;
}

// Interfaz para Tecnica con resultados cargados
interface TecnicaConResultados extends Tecnica {
  resultados?: Resultado[];
}

export class WorklistRepository {
  private resultadoRepository: ResultadoRepository;
  private tecnicaRepository: TecnicaRepository;
  private resRawNanodropRepository: ResRawNanodropRepository;
  private resRawQubitRepository: ResRawQubitRepository;

  constructor() {
    this.resultadoRepository = new ResultadoRepository();
    this.tecnicaRepository = new TecnicaRepository();
    this.resRawNanodropRepository = new ResRawNanodropRepository();
    this.resRawQubitRepository = new ResRawQubitRepository();
  }

  async findById(id: number) {
    return Worklist.scope('withRefs').findByPk(id);
  }

  async findAll() {
    return Worklist.scope('withRefs').findAll();
  }

  async findTecnicasById(id_worklist: number) {
    return Tecnica.scope('withRefs').findAll({
      where: { id_worklist },
    });
  }

  /**
   * Obtiene las técnicas_proc únicas que tienen técnicas disponibles
   * (no completadas, no canceladas, sin worklist asignado)
   */
  async getPosiblesTecnicaProc() {
    // Obtener IDs de estados finales para TECNICA
    const estadosFinales = await DimEstado.findAll({
      where: {
        entidad: 'TECNICA',
        es_final: true,
        activo: true,
      },
      attributes: ['id'],
      raw: true,
    });

    const idsEstadosFinales = estadosFinales.map((e) => e.id);

    return DimTecnicaProc.findAll({
      attributes: ['tecnica_proc'],
      include: [
        {
          model: Tecnica,
          as: 'tecnicas',
          where: literal(`
            "tecnicas"."delete_dt" IS NULL
            AND "tecnicas"."id_worklist" IS NULL
            ${idsEstadosFinales.length > 0 ? `AND ("tecnicas"."id_estado" IS NULL OR "tecnicas"."id_estado" NOT IN (${idsEstadosFinales.join(',')}))` : ''}
          `),
          attributes: [],
          required: true,
        },
      ],
      group: ['DimTecnicaProc.tecnica_proc'],
      raw: true,
    });
  }

  /**
   * Obtiene técnicas disponibles para un proceso específico
   * (no completadas, no canceladas, sin worklist asignado)
   */
  async getPosiblesTecnicas(tecnicaProc: string) {
    // Obtener IDs de estados finales para TECNICA
    const estadosFinales = await DimEstado.findAll({
      where: {
        entidad: 'TECNICA',
        es_final: true,
        activo: true,
      },
      attributes: ['id'],
      raw: true,
    });

    const idsEstadosFinales = estadosFinales.map((e) => e.id);

    return Tecnica.findAll({
      attributes: ['id_tecnica', 'id_estado'],
      include: [
        {
          model: DimEstado,
          as: 'estadoInfo',
          attributes: ['id', 'estado', 'color', 'descripcion'],
          where: { entidad: 'TECNICA' },
          required: false,
        },
        {
          model: DimTecnicaProc,
          as: 'tecnica_proc',
          where: { tecnica_proc: tecnicaProc },
          attributes: [],
          required: true,
        },
        {
          model: Muestra,
          as: 'muestra',
          attributes: ['codigo_epi', 'codigo_externo'],
        },
      ],
      where: literal(`
        "Tecnica"."delete_dt" IS NULL
        AND "Tecnica"."id_worklist" IS NULL
        ${idsEstadosFinales.length > 0 ? `AND ("Tecnica"."id_estado" IS NULL OR "Tecnica"."id_estado" NOT IN (${idsEstadosFinales.join(',')}))` : ''}
      `),
    });
  }

  async create(data: CrearWorklistData) {
    // Extraer las técnicas del objeto de datos
    const { tecnicas, ...worklistData } = data;

    // Crear la worklist
    const nuevaWorklist = await Worklist.create(worklistData);

    // Si se proporcionaron técnicas, asignarlas a la worklist
    if (tecnicas && tecnicas.length > 0) {
      // Validar y filtrar IDs válidos
      // const idsToUpdate = tecnicas
      //   .map((t) => t.id_tecnica)
      //   .filter((id) => id !== undefined && id !== null && !isNaN(Number(id)))
      //   .map(Number);

      // Solo ejecutar UPDATE si hay IDs válidos
      if (tecnicas.length > 0) {
        await Tecnica.update(
          { id_worklist: nuevaWorklist.id_worklist },
          {
            where: literal(`
            id_tecnica IN (${tecnicas.join(',')}) 
            AND id_worklist IS NULL
          `),
          }
        );
      }
    }

    return nuevaWorklist;
  }

  async update(worklist: Worklist, data: Partial<Worklist>) {
    return worklist.update(data);
  }

  async delete(worklist: Worklist) {
    return worklist.destroy();
  }

  async setTecnicoLab(idWorklist: number, idTecnico: number) {
    // Obtener todas las técnicas del worklist
    const tecnicas = await this.findTecnicasById(idWorklist);

    if (!tecnicas || tecnicas.length === 0) {
      throw new Error(
        `No se encontraron técnicas para el worklist ${idWorklist}`
      );
    }

    // Asignar el técnico a cada técnica del worklist
    for (const tecnica of tecnicas) {
      await this.tecnicaRepository.asignarTecnico(
        tecnica.id_tecnica,
        idTecnico
      );
    }
  }

  async startTecnicasInWorklist(idWorklist: number) {
    // Obtener todas las técnicas del worklist
    const tecnicas = await this.findTecnicasById(idWorklist);

    if (!tecnicas || tecnicas.length === 0) {
      throw new Error(
        `No se encontraron técnicas para el worklist ${idWorklist}`
      );
    }

    // Iniciar cada técnica del worklist
    for (const tecnica of tecnicas) {
      await this.tecnicaRepository.iniciarTecnica(tecnica.id_tecnica);
    }
  }

  /**
   * Detecta el tipo de CSV (Qubit o Nanodrop) analizando las columnas
   * y delega al método de importación correspondiente
   * @param idWorklist ID del worklist
   * @param csvBuffer Buffer del archivo CSV
   * @returns Promise con el resultado de la importación
   */
  async importDataResults(
    idWorklist: number,
    csvBuffer: Buffer
  ): Promise<{
    success: boolean;
    message: string;
    resultadosCreados?: number;
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
          return this.importQubitDataResults(idWorklist, csvBuffer);
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
          return this.importNanoDropDataResults(idWorklist, csvBuffer);
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
  async importNanoDropDataResults(
    idWorklist: number,
    csvBuffer: Buffer
  ): Promise<{
    success: boolean;
    message: string;
    resultadosCreados?: number;
  }> {
    // Validar que el worklist existe
    const worklist = await Worklist.findByPk(idWorklist);
    if (!worklist) {
      return {
        success: false,
        message: `Worklist con ID ${idWorklist} no encontrado`,
      };
    }

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

    // Obtener todas las técnicas del worklist que no tienen resultados
    const tecnicas = await this.findTecnicasById(idWorklist);

    // Filtrar solo las técnicas que NO tienen resultados asociados
    const tecnicasSinResultados = (tecnicas as TecnicaConResultados[]).filter(
      (tecnica) => !tecnica.resultados || tecnica.resultados.length === 0
    );

    if (!tecnicasSinResultados || tecnicasSinResultados.length === 0) {
      return {
        success: false,
        message: `Las Tecnicas ya tienen resultados en el worklist ${idWorklist}`,
      };
    }

    // Crear resultados para cada técnica usando los datos del CSV
    // TODO: Implementar la relación entre nombre de muestra del CSV y las técnicas
    const resultadosCreados = [];
    const errores: string[] = [];

    for (
      let i = 0;
      i < tecnicasSinResultados.length && i < registrosCSV.length;
      i++
    ) {
      const tecnica = tecnicasSinResultados[i];
      // const registroCSV = registrosCSV[i];

      try {
        // Parsear la fecha del CSV
        // let fechaResultado = new Date();
        // if (registroCSV['Fecha']) {
        //   const fechaParseada = new Date(registroCSV['Fecha']);
        //   if (!isNaN(fechaParseada.getTime())) {
        //     fechaResultado = fechaParseada;
        //   }
        // }
        // Crear el resultado con los datos del CSV
        // const acidoNucleico = registroCSV['Ácido nucleico(ng/uL)'] || '';
        // const a260_280 = registroCSV['A260/A280'] || '';
        // const a260_230 = registroCSV['A260/A230'] || '';
        // const valorTexto = `Ácido nucleico: ${acidoNucleico} ng/uL | A260/A280: ${a260_280} | A260/A230: ${a260_230}`;
        // const resultado = await this.resultadoRepository.create({
        //   id_tecnica: tecnica.id_tecnica,
        //   id_muestra: tecnica.id_muestra,
        //   valor: acidoNucleico, // Valor principal
        //   valor_texto: valorTexto, // Información completa
        //   tipo_res: 'ESPECTROFOTOMETRIA',
        //   unidades: 'ng/uL',
        //   f_resultado: fechaResultado,
        // });
        // resultadosCreados.push(resultado);
        // await this.tecnicaRepository.completarTecnica(tecnica.id_tecnica);
      } catch (error) {
        const errorMsg = `Técnica ${tecnica.id_tecnica}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        console.error(`Error al crear resultado:`, errorMsg);
        errores.push(errorMsg);
      }
    }

    const mensajeBase = `Importación completada. ${resultadosCreados.length} resultados creados`;
    const mensajeErrores =
      errores.length > 0
        ? `. Errores: ${errores.length} (${errores.slice(0, 3).join('; ')}${errores.length > 3 ? '...' : ''})`
        : '';

    return {
      success: resultadosCreados.length > 0,
      message: mensajeBase + mensajeErrores,
      resultadosCreados: resultadosCreados.length,
    };
  }

  /**
   * Importa datos de resultados desde un CSV de Qubit
   * - Parsea el CSV con encoding UTF-8, separador coma y comillas
   * - Guarda los datos raw en res_raw_qubit (trunca y reemplaza)
   * - Crea registros de Resultado para técnicas sin resultados
   * - Completa las técnicas automáticamente
   */
  async importQubitDataResults(
    idWorklist: number,
    csvBuffer: Buffer
  ): Promise<{
    success: boolean;
    message: string;
    resultadosCreados?: number;
  }> {
    // Validar que el worklist existe
    const worklist = await Worklist.findByPk(idWorklist);
    if (!worklist) {
      return {
        success: false,
        message: `Worklist con ID ${idWorklist} no encontrado`,
      };
    }

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

    // Obtener todas las técnicas del worklist que no tienen resultados
    const tecnicas = await this.findTecnicasById(idWorklist);

    // Filtrar solo las técnicas que NO tienen resultados asociados
    const tecnicasSinResultados = (tecnicas as TecnicaConResultados[]).filter(
      (tecnica) => !tecnica.resultados || tecnica.resultados.length === 0
    );

    if (!tecnicasSinResultados || tecnicasSinResultados.length === 0) {
      return {
        success: false,
        message: `Las Tecnicas ya tienen resultados en el worklist ${idWorklist}`,
      };
    }

    // Crear resultados para cada técnica usando los datos del CSV
    // TODO: Implementar la relación entre test_name del CSV y las técnicas
    const resultadosCreados = [];
    const errores: string[] = [];

    for (
      let i = 0;
      i < tecnicasSinResultados.length && i < registrosCSV.length;
      i++
    ) {
      const tecnica = tecnicasSinResultados[i];
      //   const registroCSV = registrosCSV[i];

      try {
        //     // Parsear la fecha del CSV
        //     const fechaResultado =
        //       parseFechaQubit(registroCSV['Test Date']) || new Date();
        //     // Extraer datos principales
        //     const origConc = registroCSV['Original sample conc.'] || '';
        //     const origConcUnits = registroCSV['Original sample conc. units'] || '';
        //     const qubitTubeConc = registroCSV['Qubit tube conc.'] || '';
        //     const qubitUnits = registroCSV['Qubit tube conc. units'] || '';
        //     const valorTexto = `Concentración original: ${origConc} ${origConcUnits} | Qubit tubo: ${qubitTubeConc} ${qubitUnits}`;
        //     const resultado = await this.resultadoRepository.create({
        //       id_tecnica: tecnica.id_tecnica,
        //       id_muestra: tecnica.id_muestra,
        //       valor: origConc, // Concentración original como valor principal
        //       valor_texto: valorTexto, // Información completa
        //       tipo_res: 'FLUOROMETRIA',
        //       unidades: origConcUnits || 'ng/uL',
        //       f_resultado: fechaResultado,
        //     });
        //     resultadosCreados.push(resultado);
        //     await this.tecnicaRepository.completarTecnica(tecnica.id_tecnica);
      } catch (error) {
        const errorMsg = `Técnica ${tecnica.id_tecnica}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        console.error(`Error al crear resultado:`, errorMsg);
        errores.push(errorMsg);
      }
    }

    const mensajeBase = `Importación de Qubit completada. ${resultadosCreados.length} resultados creados`;
    const mensajeErrores =
      errores.length > 0
        ? `. Errores: ${errores.length} (${errores.slice(0, 3).join('; ')}${errores.length > 3 ? '...' : ''})`
        : '';

    return {
      success: resultadosCreados.length > 0,
      message: mensajeBase + mensajeErrores,
      resultadosCreados: resultadosCreados.length,
    };
  }
}
