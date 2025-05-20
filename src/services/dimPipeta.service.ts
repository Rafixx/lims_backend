// src/services/dimPipetas.service.ts
import { DimPipeta } from '../models/DimPipeta';

export interface CreateDimPipetaDTO {
  codigo?: string;
  modelo: string;
  zona?: string;
  activa?: boolean;
  created_by?: number;
  id_plantilla_tecnica?: number;
}

export class DimPipetaService {
  async getAllDimPipetas(): Promise<DimPipeta[]> {
    return DimPipeta.findAll();
  }

  async getDimPipetaById(id: number): Promise<DimPipeta> {
    const pipeta = await DimPipeta.findByPk(id);
    if (!pipeta) {
      throw new Error('Pipeta no encontrada');
    }
    return pipeta;
  }

  async createDimPipeta(data: CreateDimPipetaDTO): Promise<DimPipeta> {
    return DimPipeta.create(data);
  }

  async updateDimPipeta(
    id: number,
    data: Partial<CreateDimPipetaDTO>
  ): Promise<DimPipeta> {
    const pipeta = await DimPipeta.findByPk(id);
    if (!pipeta) {
      throw new Error('Pipeta no encontrada');
    }
    return pipeta.update(data);
  }

  async deleteDimPipeta(id: number): Promise<void> {
    const pipeta = await DimPipeta.findByPk(id);
    if (!pipeta) {
      throw new Error('Pipeta no encontrada');
    }
    await pipeta.destroy();
  }
}
