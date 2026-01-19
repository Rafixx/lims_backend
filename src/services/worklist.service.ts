import { WorklistRepository } from '../repositories/worklist.repository';
import resultadoNanodropService from './resultadoNanodrop.service';
import resultadoQubitService from './resultadoQubit.service';
import {
  ContadorRepository,
  NextCounterValue,
} from '../repositories/contador.repository';

interface CrearWorklistDTO {
  nombre?: string;
  id_tecnica_proc?: number;
  created_by?: number;
  tecnicas?: Array<{ id_tecnica: number }>;
}

export class WorklistService {
  constructor(
    private readonly workListRepo = new WorklistRepository(),
    private readonly contadorRepo = new ContadorRepository()
  ) {}

  async getWorklistById(id: number) {
    const worklist = await this.workListRepo.findById(id);
    if (!worklist) {
      throw new Error('Worklist no encontrada');
    }
    return worklist;
  }

  async getAllWorklists() {
    return this.workListRepo.findAll();
  }

  async getTecnicasById(id_worklist: number) {
    const worklist = await this.workListRepo.findTecnicasById(id_worklist);
    if (!worklist) {
      throw new Error('Técnicas no encontradas');
    }
    return worklist;
  }

  async getPosiblesTecnicaProc() {
    const posiblesTecnicasProc =
      await this.workListRepo.getPosiblesTecnicaProc();
    if (!posiblesTecnicasProc) {
      throw new Error('Técnicas no encontradas');
    }
    return posiblesTecnicasProc;
  }

  async getPosiblesTecnicas(tecnicaProc: string) {
    const posiblesTecnicas =
      await this.workListRepo.getPosiblesTecnicas(tecnicaProc);
    if (!posiblesTecnicas) {
      throw new Error('Técnicas no encontradas');
    }
    return posiblesTecnicas;
  }

  async getTecnicasReactivosById(id_worklist: number) {
    const tecnicasReactivos =
      await this.workListRepo.getTecnicasReactivosById(id_worklist);
    if (!tecnicasReactivos) {
      throw new Error('Técnicas con reactivos no encontradas');
    }
    return tecnicasReactivos;
  }

  async getTecnicasReactivosOptimizado(id_worklist: number) {
    const tecnicas =
      await this.workListRepo.getTecnicasReactivosOptimizado(id_worklist);

    if (!tecnicas || tecnicas.length === 0) {
      return {
        worklistId: id_worklist,
        tecnicas: [],
        estadisticas: {
          totalTecnicas: 0,
          totalReactivos: 0,
          lotesCompletos: 0,
          lotesPendientes: 0,
        },
      };
    }

    // Transformar a estructura optimizada
    let totalReactivos = 0;
    let lotesCompletos = 0;
    let lotesPendientes = 0;

    const tecnicasFormateadas = tecnicas.map((tecnica) => {
      const tecnicaJson = tecnica.toJSON() as {
        id_tecnica: number;
        tecnica_proc?: { id: number; tecnica_proc: string };
        muestra?: {
          id_muestra: number;
          codigo_epi: string;
          codigo_externo: string;
        };
        tecnicasReactivos?: Array<{
          id: number;
          lote?: string;
          volumen?: string;
          id_reactivo: number;
          reactivo?: {
            id: number;
            num_referencia?: string;
            reactivo: string;
            lote?: string;
            volumen_formula?: string;
          };
        }>;
      };

      const reactivos =
        tecnicaJson.tecnicasReactivos?.map((tr) => {
          totalReactivos++;

          const tieneLotelote =
            tr.lote !== null && tr.lote !== undefined && tr.lote.trim() !== '';

          if (tieneLotelote) {
            lotesCompletos++;
          } else {
            lotesPendientes++;
          }

          return {
            id: tr.reactivo?.id,
            idTecnicaReactivo: tr.id,
            nombre: tr.reactivo?.reactivo || 'Sin nombre',
            numReferencia: tr.reactivo?.num_referencia,
            lote: tr.lote,
            volumen: tr.volumen,
            volumenFormula: tr.reactivo?.volumen_formula,
            loteReactivo: tr.reactivo?.lote,
          };
        }) || [];

      return {
        idTecnica: tecnicaJson.id_tecnica,
        nombreTecnica: tecnicaJson.tecnica_proc?.tecnica_proc || 'Sin nombre',
        idTecnicaProc: tecnicaJson.tecnica_proc?.id,
        muestra: {
          id: tecnicaJson.muestra?.id_muestra,
          codigoEpi: tecnicaJson.muestra?.codigo_epi,
          codigoExterno: tecnicaJson.muestra?.codigo_externo,
        },
        reactivos,
      };
    });

    return {
      worklistId: id_worklist,
      tecnicas: tecnicasFormateadas,
      estadisticas: {
        totalTecnicas: tecnicas.length,
        totalReactivos,
        lotesCompletos,
        lotesPendientes,
      },
    };
  }

  async createWorklist(data: CrearWorklistDTO) {
    // Validar que si se proporcionan técnicas, no estén vacías
    if (data.tecnicas && data.tecnicas.length === 0) {
      throw new Error(
        'Si se proporcionan técnicas, el array no puede estar vacío'
      );
    }
    const nuevaWorklist = await this.workListRepo.create({
      ...data,
      create_dt: new Date(),
    });

    return {
      ...nuevaWorklist.toJSON(),
      tecnicasAsignadas: data.tecnicas ? data.tecnicas.length : 0,
      mensaje: data.tecnicas
        ? `Worklist creada con ${data.tecnicas.length} técnicas asignadas`
        : 'Worklist creada sin técnicas asignadas',
    };
  }

  async updateWorklist(id: number, data: Partial<CrearWorklistDTO>) {
    const worklist = await this.workListRepo.findById(id);
    if (!worklist) {
      throw new Error('Worklist no encontrada');
    }
    return this.workListRepo.update(worklist, data);
  }

  async deleteWorklist(id: number) {
    const worklist = await this.workListRepo.findById(id);
    if (!worklist) {
      throw new Error('Worklist no encontrada');
    }
    await this.workListRepo.delete(worklist);
    return { message: 'Worklist eliminada correctamente' };
  }

  /**
   * Asigna un técnico responsable al worklist
   * Actualiza el campo id_tecnico_resp del worklist
   */
  async asignarTecnico(idWorklist: number, idTecnico: number) {
    const worklistActualizada = await this.workListRepo.asignarTecnico(
      idWorklist,
      idTecnico
    );

    return {
      success: true,
      message: 'Técnico asignado al worklist correctamente',
      data: worklistActualizada,
    };
  }

  async setTecnicoLab(idWorklist: number, idTecnico: number) {
    // Verificar que la worklist existe
    const worklist = await this.workListRepo.findById(idWorklist);
    if (!worklist) {
      throw new Error('Worklist no encontrada');
    }

    // Asignar el técnico a todas las técnicas del worklist
    await this.workListRepo.setTecnicoLab(idWorklist, idTecnico);

    return {
      message: 'Técnico de laboratorio asignado correctamente',
    };
  }

  /**
   * Importa datos de resultados para un worklist usando mapeo de filas
   * RAW → FINAL → RESULTADO
   * @param idWorklist ID del worklist
   * @param mapping Record<number, number> - Índice de fila RAW → id_tecnica
   * @param tipo 'NANODROP' | 'QUBIT'
   * @returns Promise con el resultado de la operación
   */
  async importDataResults(
    idWorklist: number,
    mapping: Record<number, number>,
    tipo: 'NANODROP' | 'QUBIT'
  ) {
    // Verificar que la worklist existe
    const worklist = await this.workListRepo.findById(idWorklist);
    if (!worklist) {
      throw new Error('Worklist no encontrada');
    }

    // Delegar al servicio correspondiente
    let resultado;
    if (tipo === 'NANODROP') {
      resultado = await resultadoNanodropService.processWithMapping(
        idWorklist,
        mapping,
        0 // TODO: Obtener ID del usuario autenticado
      );
    } else {
      resultado = await resultadoQubitService.processWithMapping(
        idWorklist,
        mapping,
        0 // TODO: Obtener ID del usuario autenticado
      );
    }

    if (!resultado.success) {
      throw new Error(resultado.message);
    }

    return {
      success: true,
      message: resultado.message,
      recordsProcessed: resultado.recordsProcessed,
      resultsCreated: resultado.resultsCreated,
      errors: resultado.errors,
    };
  }

  async startTecnicasInWorklist(idWorklist: number) {
    // Verificar que la worklist existe
    const worklist = await this.workListRepo.findById(idWorklist);
    if (!worklist) {
      throw new Error('Worklist no encontrada');
    }

    // Iniciar todas las técnicas del worklist
    await this.workListRepo.startTecnicasInWorklist(idWorklist);

    return {
      message: 'Técnicas del worklist iniciadas correctamente',
    };
  }

  async getWorklistCode() {
    const { year, value } = await this.getNextSequenceValue();
    const codigo = this.formatWorklistCode(year, value);

    return {
      codigo_worklist: codigo,
      secuencia: value,
      year,
    };
  }

  private async getNextSequenceValue(): Promise<NextCounterValue> {
    const year = new Date().getFullYear();
    return this.contadorRepo.getNextValue('worklist', year);
  }

  private formatWorklistCode(year: number, sequence: number): string {
    const configuredDigits = Number(process.env.WORKLIST_CODE_DIGITS ?? '5');
    const digits =
      Number.isFinite(configuredDigits) && configuredDigits >= 4
        ? Math.min(configuredDigits, 8)
        : 5;
    const yearPrefix = year.toString().slice(-2);
    const paddedSequence = sequence.toString().padStart(digits, '0');

    return `L${yearPrefix}.${paddedSequence}`;
  }
}
