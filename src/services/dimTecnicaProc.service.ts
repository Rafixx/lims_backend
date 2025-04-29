import { DimTecnicaProc } from '../models/DimTecnicaProc';

interface CreateDimTecnicaProcDTO {
  tecnica_proc: string;
  orden: number;
  obligatoria?: boolean;
  activa?: boolean;
  id_prueba: number;
  id_plantilla_tecnica: number;
}

export class DimTecnicaProcService {
  async createTecnicaProc(data: CreateDimTecnicaProcDTO) {
    const tecnicaProc = await DimTecnicaProc.create(data);
    return tecnicaProc;
  }

  async getTecnicaProcById(id: number) {
    const tecnicaProc = await DimTecnicaProc.findByPk(id);
    if (!tecnicaProc) {
      throw new Error('Técnica Proc no encontrada');
    }
    return tecnicaProc;
  }

  async getAllTecnicasProc() {
    return DimTecnicaProc.findAll();
  }

  async updateTecnicaProc(id: number, data: Partial<CreateDimTecnicaProcDTO>) {
    const tecnicaProc = await DimTecnicaProc.findByPk(id);
    if (!tecnicaProc) {
      throw new Error('Técnica Proc no encontrada');
    }
    await tecnicaProc.update(data);
    return tecnicaProc;
  }

  async deleteTecnicaProc(id: number) {
    const tecnicaProc = await DimTecnicaProc.findByPk(id);
    if (!tecnicaProc) {
      throw new Error('Técnica Proc no encontrada');
    }
    await tecnicaProc.destroy();
    return { message: 'Técnica Proc eliminada correctamente' };
  }
}
