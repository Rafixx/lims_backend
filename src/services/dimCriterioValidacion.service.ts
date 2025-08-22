import { DimCriterioValidacion } from '../models/DimCriterioValidacion';

export interface CreateCriterioValidacionDTO {
  codigo: string;
  descripcion: string;
  created_by?: number;
}

export class DimCriterioValidacionService {
  async getAllDimCriteriosValidacion(): Promise<DimCriterioValidacion[]> {
    return DimCriterioValidacion.findAll();
  }

  async getDimCriterioValidacionById(
    id: number
  ): Promise<DimCriterioValidacion> {
    const criterio = await DimCriterioValidacion.findByPk(id);
    if (!criterio) throw new Error('Criterio no encontrado');
    return criterio;
  }

  async createDimCriterioValidacion(
    data: CreateCriterioValidacionDTO
  ): Promise<DimCriterioValidacion> {
    return DimCriterioValidacion.create(data);
  }

  async updateDimCriterioValidacion(
    id: number,
    data: Partial<CreateCriterioValidacionDTO>
  ): Promise<DimCriterioValidacion> {
    const criterio = await DimCriterioValidacion.findByPk(id);
    if (!criterio) throw new Error('Criterio no encontrado');
    return criterio.update(data);
  }

  async deleteDimCriterioValidacion(id: number): Promise<void> {
    const criterio = await DimCriterioValidacion.findByPk(id);
    if (!criterio) throw new Error('Criterio no encontrado');
    await criterio.destroy();
  }
}
