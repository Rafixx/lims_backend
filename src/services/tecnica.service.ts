import { TecnicaRepository } from '../repositories/tecnica.repository';

interface CreateTecnicaDTO {
  id_muestra: number;
  id_tecnica_proc: number;
  id_tecnico_resp: number;
  fecha_inicio_tec?: Date;
  estado?: string;
  comentarios?: string;
}

export class TecnicaService {
  constructor(private readonly tecnicaRepo = new TecnicaRepository()) {}

  async getAllTecnicas() {
    return this.tecnicaRepo.findAll();
  }

  async getTecnicaById(id: number) {
    const tecnica = await this.tecnicaRepo.findById(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    return tecnica;
  }

  async getTecnicaByMuestraId(id_muestra: number) {
    if (!id_muestra) {
      throw new Error('ID de muestra no proporcionado');
    }
    const tecnica = await this.tecnicaRepo.findByMuestraId(id_muestra);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    return tecnica;
  }

  // async getTecnicaBySolicitudId(id_solicitud: number) {
  //   if (!id_solicitud) {
  //     throw new Error('ID de solicitud no proporcionado');
  //   }
  //   const tecnicas = await this.tecnicaRepo.findBySolicitudId(id_solicitud);
  //   if (!tecnicas) {
  //     throw new Error('Técnica no encontrada');
  //   }
  //   return tecnicas.map((tecnica) => ({
  //     id: tecnica_proc?.id,
  //     tecnica_proc: tecnica_proc.tecnica_proc?.tecnica_proc,
  //   }));
  // }
  async getTecnicaBySolicitudId(id_solicitud: number) {
    const tecnicas = await this.tecnicaRepo.findBySolicitudId(id_solicitud);

    return tecnicas.map((tecnica) => ({
      id: tecnica.tecnica_proc?.id,
      tecnica_proc: tecnica.tecnica_proc?.tecnica_proc,
    }));
  }

  async createTecnica(data: CreateTecnicaDTO) {
    return this.tecnicaRepo.create({
      ...data,
      fecha_inicio_tec: data.fecha_inicio_tec ?? new Date(),
      estado: data.estado ?? 'CREADA',
    });
  }

  async updateTecnica(id: number, data: Partial<CreateTecnicaDTO>) {
    const tecnica = await this.tecnicaRepo.findById(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    return this.tecnicaRepo.update(tecnica, data);
  }

  async deleteTecnica(id: number) {
    const tecnica = await this.tecnicaRepo.findById(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    await this.tecnicaRepo.delete(tecnica);
    return { message: 'Técnica eliminada correctamente' };
  }
}
