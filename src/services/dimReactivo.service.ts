// src/services/dimReactivos.service.ts
import { DimReactivo } from '../models/DimReactivo';

export interface CreateDimReactivoDTO {
  num_referencia?: string;
  reactivo: string;
  lote?: string;
  volumen_formula?: string;
  activa?: boolean;
  created_by?: number;
  id_plantilla_tecnica?: number;
}

export class DimReactivoService {
  async getAllDimReactivos(): Promise<DimReactivo[]> {
    return DimReactivo.findAll();
  }

  async getDimReactivoById(id: number): Promise<DimReactivo> {
    const reactivo = await DimReactivo.findByPk(id);
    if (!reactivo) {
      throw new Error('Reactivo no encontrado');
    }
    return reactivo;
  }

  async createDimReactivo(data: CreateDimReactivoDTO): Promise<DimReactivo> {
    return DimReactivo.create(data);
  }

  async updateDimReactivo(
    id: number,
    data: Partial<CreateDimReactivoDTO>
  ): Promise<DimReactivo> {
    const reactivo = await DimReactivo.findByPk(id);
    if (!reactivo) {
      throw new Error('Reactivo no encontrado');
    }
    return reactivo.update(data);
  }

  async deleteDimReactivo(id: number): Promise<void> {
    const reactivo = await DimReactivo.findByPk(id);
    if (!reactivo) {
      throw new Error('Reactivo no encontrado');
    }
    await reactivo.destroy();
  }
}
