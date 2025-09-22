import { WorklistRepository } from '../repositories/worklist.repository';

interface CrearWorklistDTO {
  nombre?: string;
  id_tecnica_proc?: number;
  created_by?: number;
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

  async createWorklist(data: CrearWorklistDTO) {
    return this.workListRepo.create({
      ...data,
      create_dt: new Date(),
    });
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
}
