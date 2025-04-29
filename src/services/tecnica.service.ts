import { Tecnica } from '../models/Tecnica';

interface CreateTecnicaDTO {
  id_muestra: number;
  id_tecnica_proc: number;
  id_tecnico_resp: number;
  fecha_inicio_tec?: Date;
  estado?: string;
  comentarios?: string;
}

export class TecnicaService {
  async createTecnica(data: CreateTecnicaDTO) {
    const tecnica = await Tecnica.create(data);
    return tecnica;
  }

  async getTecnicaById(id: number) {
    const tecnica = await Tecnica.findByPk(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    return tecnica;
  }

  async getAllTecnicas() {
    return Tecnica.findAll();
  }

  async updateTecnica(id: number, data: Partial<CreateTecnicaDTO>) {
    const tecnica = await Tecnica.findByPk(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    await tecnica.update(data);
    return tecnica;
  }

  async deleteTecnica(id: number) {
    const tecnica = await Tecnica.findByPk(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    await tecnica.destroy();
    return { message: 'Técnica eliminada correctamente' };
  }
}
