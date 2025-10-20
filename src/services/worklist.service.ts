import { WorklistRepository } from '../repositories/worklist.repository';

interface CrearWorklistDTO {
  nombre?: string;
  id_tecnica_proc?: number;
  created_by?: number;
  tecnicas?: Array<{ id_tecnica: number }>;
}

export class WorklistService {
  constructor(private readonly workListRepo = new WorklistRepository()) {}

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

  async setTecnicoLab(idWorklist: number, idTecnico: number) {
    // Verificar que la worklist existe
    const worklist = await this.workListRepo.findById(idWorklist);
    if (!worklist) {
      throw new Error('Worklist no encontrada');
    }

    const resultado = await this.workListRepo.setTecnicoLab(
      idWorklist,
      idTecnico
    );

    if (resultado[0] === 0) {
      throw new Error(
        'No se encontraron técnicas para actualizar en esta worklist'
      );
    }

    return {
      message: 'Técnico de laboratorio asignado correctamente',
      tecnicasActualizadas: resultado[0],
    };
  }

  /**
   * Importa datos de resultados para un worklist
   * @param idWorklist ID del worklist
   * @returns Promise con el resultado de la operación
   */
  async importDataResults(idWorklist: number) {
    const resultado = await this.workListRepo.importDataResults(idWorklist);

    if (!resultado.success) {
      throw new Error(resultado.message);
    }

    return {
      success: true,
      message: resultado.message,
      resultadosCreados: resultado.resultadosCreados,
    };
  }
}
