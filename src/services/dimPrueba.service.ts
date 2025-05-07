import { DimPrueba } from '../models/DimPrueba';
import { DimTecnicaProc } from '../models/DimTecnicaProc';

interface CreateDimPruebaDTO {
  cod_prueba: string;
  prueba: string;
  activa?: boolean;
}

export class DimPruebaService {
  async createPrueba(data: CreateDimPruebaDTO) {
    const prueba = await DimPrueba.create(data);
    return prueba;
  }

  async getPruebaById(id: number) {
    const prueba = await DimPrueba.findByPk(id);
    if (!prueba) {
      throw new Error('Prueba no encontrada');
    }
    return prueba;
  }

  //obtener dim_tecnica_proc por prueba
  async getTecnicasByPrueba(id: number) {
    const prueba = await DimPrueba.findByPk(id, {
      include: [
        {
          model: DimTecnicaProc,
          as: 'tecnicas',
          attributes: ['id', 'tecnica_proc'],
        },
      ],
    });
    if (!prueba) {
      throw new Error('Prueba no encontrada');
    }
    return prueba.tecnicas;
  }

  async getAllPruebas() {
    return DimPrueba.findAll();
  }

  async updatePrueba(id: number, data: Partial<CreateDimPruebaDTO>) {
    const prueba = await DimPrueba.findByPk(id);
    if (!prueba) {
      throw new Error('Prueba no encontrada');
    }
    await prueba.update(data);
    return prueba;
  }

  async deletePrueba(id: number) {
    const prueba = await DimPrueba.findByPk(id);
    if (!prueba) {
      throw new Error('Prueba no encontrada');
    }
    await prueba.destroy();
    return { message: 'Prueba eliminada correctamente' };
  }
}
