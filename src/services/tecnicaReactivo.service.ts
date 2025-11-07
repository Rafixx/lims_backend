import { TecnicaReactivo } from '../models/TecnicaReactivo';

export interface CreateTecnicaReactivoDTO {
  id_tecnica?: number;
  id_reactivo?: number;
  volumen?: string;
  lote?: string;
  created_by?: number;
}

export class TecnicaReactivoService {
  async getAllTecnicaReactivos(): Promise<TecnicaReactivo[]> {
    return TecnicaReactivo.findAll({
      where: { delete_dt: null },
    });
  }

  async getTecnicaReactivoById(id: number): Promise<TecnicaReactivo> {
    const tecnicaReactivo = await TecnicaReactivo.findByPk(id);
    if (!tecnicaReactivo) {
      throw new Error('Técnica-Reactivo no encontrada');
    }
    return tecnicaReactivo;
  }

  async createTecnicaReactivo(
    data: CreateTecnicaReactivoDTO
  ): Promise<TecnicaReactivo> {
    return TecnicaReactivo.create(data);
  }

  async updateTecnicaReactivo(
    id: number,
    data: Partial<CreateTecnicaReactivoDTO>
  ): Promise<TecnicaReactivo> {
    const tecnicaReactivo = await TecnicaReactivo.findByPk(id);
    if (!tecnicaReactivo) {
      throw new Error('Técnica-Reactivo no encontrada');
    }
    return tecnicaReactivo.update(data);
  }

  async deleteTecnicaReactivo(id: number): Promise<void> {
    const tecnicaReactivo = await TecnicaReactivo.findByPk(id);
    if (!tecnicaReactivo) {
      throw new Error('Técnica-Reactivo no encontrada');
    }
    await tecnicaReactivo.destroy();
  }
}
