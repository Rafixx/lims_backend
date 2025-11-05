// src/services/dimPlantillaPasos.service.ts
import { DimPlantillaPasos } from '../models/DimPlantillaPasos';

export interface CreateDimPlantillaPasosDTO {
  codigo?: string;
  descripcion: string;
  orden?: number;
  activa?: boolean;
  created_by?: number;
  id_plantilla_tecnica?: number;
}

export class DimPlantillaPasosService {
  async getAllDimPlantillaPasos(): Promise<DimPlantillaPasos[]> {
    return DimPlantillaPasos.findAll();
  }

  async getDimPlantillaPasosById(id: number): Promise<DimPlantillaPasos> {
    const paso = await DimPlantillaPasos.findByPk(id);
    if (!paso) {
      throw new Error('Paso de plantilla no encontrado');
    }
    return paso;
  }

  async createDimPlantillaPasos(
    data: CreateDimPlantillaPasosDTO
  ): Promise<DimPlantillaPasos> {
    return DimPlantillaPasos.create(data);
  }

  async updateDimPlantillaPasos(
    id: number,
    data: Partial<CreateDimPlantillaPasosDTO>
  ): Promise<DimPlantillaPasos> {
    const paso = await DimPlantillaPasos.findByPk(id);
    if (!paso) {
      throw new Error('Paso de plantilla no encontrado');
    }
    return paso.update(data);
  }

  async deleteDimPlantillaPasos(id: number): Promise<void> {
    const paso = await DimPlantillaPasos.findByPk(id);
    if (!paso) {
      throw new Error('Paso de plantilla no encontrado');
    }
    await paso.destroy();
  }
}
