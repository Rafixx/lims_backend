import { DimPlantillaTecnica } from '../models/DimPlantillaTecnica';

interface CreateDimPlantillaTecnicaDTO {
  cod_plantilla_tecnica: string;
  tecnica: string;
  activa?: boolean;
}

export class DimPlantillaTecnicaService {
  async createPlantillaTecnica(data: CreateDimPlantillaTecnicaDTO) {
    const plantilla = await DimPlantillaTecnica.create(data);
    return plantilla;
  }

  async getPlantillaTecnicaById(id: number) {
    const plantilla = await DimPlantillaTecnica.scope('withRefs').findByPk(id);
    if (!plantilla) {
      throw new Error('Plantilla Técnica no encontrada');
    }
    return plantilla;
  }

  async getAllPlantillasTecnicas() {
    return DimPlantillaTecnica.scope('withRefs').findAll();
  }

  async updatePlantillaTecnica(
    id: number,
    data: Partial<CreateDimPlantillaTecnicaDTO>
  ) {
    const plantilla = await DimPlantillaTecnica.findByPk(id);
    if (!plantilla) {
      throw new Error('Plantilla Técnica no encontrada');
    }
    await plantilla.update(data);
    return plantilla;
  }

  async deletePlantillaTecnica(id: number) {
    const plantilla = await DimPlantillaTecnica.findByPk(id);
    if (!plantilla) {
      throw new Error('Plantilla Técnica no encontrada');
    }
    await plantilla.destroy();
    return { message: 'Plantilla Técnica eliminada correctamente' };
  }
}
