import { DimTecnicaProc } from '../models/DimTecnicaProc';

interface CreateDimTecnicaProcDTO {
  tecnica_proc: string;
  orden: number;
  obligatoria?: boolean;
  activa?: boolean;
  created_by?: number;
  id_prueba: number;
  id_plantilla_tecnica: number;
}

export class DimTecnicaProcService {
  async createTecnicaProc(data: CreateDimTecnicaProcDTO) {
    const tecnicaProc = await DimTecnicaProc.create(data);
    return tecnicaProc;
  }

  async getTecnicaProcById(id: number) {
    const tecnicaProc =
      await DimTecnicaProc.scope('withPlantilla').findByPk(id);
    if (!tecnicaProc) {
      throw new Error('Técnica Proc no encontrada');
    }
    return tecnicaProc;
  }

  async getAllTecnicasProc() {
    return DimTecnicaProc.scope('withPlantilla').findAll();
  }

  async updateTecnicaProc(id: number, data: Partial<CreateDimTecnicaProcDTO>) {
    const tecnicaProc = await DimTecnicaProc.findByPk(id);
    if (!tecnicaProc) {
      throw new Error('Técnica Proc no encontrada');
    }
    await tecnicaProc.update(data);
    return tecnicaProc;
  }

  async batchUpdateOrden(items: { id: number; orden: number }[]) {
    await Promise.all(
      items.map(({ id, orden }) => DimTecnicaProc.update({ orden }, { where: { id } }))
    );
    return { updated: items.length };
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
