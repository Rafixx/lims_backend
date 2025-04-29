import { SolicitudRepository } from '../repositories/solicitud.repository';

interface CreateSolicitudDTO {
  num_solicitud: string;
  id_cliente: number;
  id_prueba: number;
  f_entrada: Date;
  f_compromiso?: Date;
  f_creacion?: Date;
  estado_solicitud: string;
}

export class SolicitudService {
  constructor(private readonly solicitudRepo = new SolicitudRepository()) {}

  async createSolicitud(data: CreateSolicitudDTO) {
    return this.solicitudRepo.create({
      ...data,
      f_creacion: data.f_creacion ?? new Date(),
    });
  }

  async getSolicitudById(id: number) {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }
    return solicitud;
  }

  async getAllSolicitudes() {
    return this.solicitudRepo.findAll();
  }

  async updateSolicitud(id: number, data: Partial<CreateSolicitudDTO>) {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }
    return this.solicitudRepo.update(solicitud, data);
  }

  async deleteSolicitud(id: number) {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }
    await this.solicitudRepo.delete(solicitud);
    return { message: 'Solicitud eliminada correctamente' };
  }
}
