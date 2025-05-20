// src/services/dimMaquinas.service.ts
import { DimMaquina } from '../models/DimMaquina';

export interface CreateDimMaquinaDTO {
  codigo?: string;
  maquina: string;
  perfil_termico?: string;
  activa?: boolean;
  created_by?: number;
  id_plantilla_tecnica?: number;
}

export class DimMaquinaService {
  async getAllDimMaquinas(): Promise<DimMaquina[]> {
    return DimMaquina.findAll();
  }

  async getDimMaquinaById(id: number): Promise<DimMaquina> {
    const maquina = await DimMaquina.findByPk(id);
    if (!maquina) {
      throw new Error('Máquina no encontrada');
    }
    return maquina;
  }

  async createDimMaquina(data: CreateDimMaquinaDTO): Promise<DimMaquina> {
    return DimMaquina.create(data);
  }

  async updateDimMaquina(
    id: number,
    data: Partial<CreateDimMaquinaDTO>
  ): Promise<DimMaquina> {
    const maquina = await DimMaquina.findByPk(id);
    if (!maquina) {
      throw new Error('Máquina no encontrada');
    }
    return maquina.update(data);
  }

  async deleteDimMaquina(id: number): Promise<void> {
    const maquina = await DimMaquina.findByPk(id);
    if (!maquina) {
      throw new Error('Máquina no encontrada');
    }
    await maquina.destroy();
  }
}
