// src/services/dimUbicacion.service.ts
import { DimUbicacion } from '../models/DimUbicacion';

interface CreateUbicacionDTO {
  codigo?: string;
  ubicacion: string;
  created_by?: number;
}

export class DimUbicacionService {
  async getAll() {
    return DimUbicacion.findAll();
  }

  async getById(id: number) {
    const ubicacion = await DimUbicacion.findByPk(id);
    if (!ubicacion) throw new Error('Ubicación no encontrada');
    return ubicacion;
  }

  async create(data: CreateUbicacionDTO) {
    return DimUbicacion.create(data);
  }

  async update(id: number, data: Partial<CreateUbicacionDTO>) {
    const ubicacion = await this.getById(id);
    return ubicacion.update(data);
  }

  async delete(id: number) {
    const ubicacion = await this.getById(id);
    return ubicacion.destroy();
  }
}
