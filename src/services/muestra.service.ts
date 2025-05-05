import { MuestraRepository } from '../repositories/muestra.repository';

interface CreateMuestraDTO {
  id_solicitud: number;
  id_paciente?: number;
  id_tecnico_resp?: number;
  id_tipo_muestra?: number;
  codigo_epi?: string;
  codigo_externo?: string;
  estado_muestra: string;
  f_toma?: Date;
  f_recepcion?: Date;
}

export class MuestraService {
  constructor(private readonly muestraRepo = new MuestraRepository()) {}

  async createMuestra(data: CreateMuestraDTO) {
    return this.muestraRepo.create({
      ...data,
      f_recepcion: data.f_recepcion ?? new Date(),
    });
  }

  async getMuestraById(id: number) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    return muestra;
  }

  async getAllMuestras() {
    return this.muestraRepo.findAll();
  }

  async updateMuestra(id: number, data: Partial<CreateMuestraDTO>) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    return this.muestraRepo.update(muestra, data);
  }

  async deleteMuestra(id: number) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    await this.muestraRepo.delete(muestra);
    return { message: 'Muestra eliminada correctamente' };
  }
}
