//src/services/dimCentro.service.ts
import { DimCentro } from '../models/DimCentro';

export interface CreateDimCentroDTO {
  codigo: string;
  descripcion: string;
  created_by?: number;
}

export class DimCentroService {
  async getAllDimCentros(): Promise<DimCentro[]> {
    return DimCentro.findAll();
  }

  async getDimCentroById(id: number): Promise<DimCentro> {
    const centro = await DimCentro.findByPk(id);
    if (!centro) throw new Error('Centro no encontrado');
    return centro;
  }

  async createDimCentro(data: CreateDimCentroDTO): Promise<DimCentro> {
    return DimCentro.create(data);
  }

  async updateDimCentro(
    id: number,
    data: Partial<CreateDimCentroDTO>
  ): Promise<DimCentro> {
    const centro = await DimCentro.findByPk(id);
    if (!centro) throw new Error('Centro no encontrado');
    return centro.update(data);
  }

  async deleteDimCentro(id: number): Promise<void> {
    const centro = await DimCentro.findByPk(id);
    if (!centro) throw new Error('Centro no encontrado');
    await centro.destroy();
  }
}
