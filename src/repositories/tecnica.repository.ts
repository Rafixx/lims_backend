import { CreationAttributes } from 'sequelize';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';

export class TecnicaRepository {
  async findById(id: number) {
    return Tecnica.findByPk(id, {
      include: [
        {
          model: DimTecnicaProc,
          as: 'tecnica_proc',
          attributes: ['id', 'tecnica_proc'],
        },
        {
          model: Muestra,
          as: 'muestra',
          attributes: ['id_muestra', 'codigo_epi', 'codigo_externo'],
        },
      ],
    });
  }
  async findByMuestraId(id_muestra: number) {
    return Tecnica.findAll({
      where: { id_muestra },
      include: [
        {
          model: DimTecnicaProc,
          as: 'tecnica_proc',
          attributes: ['id', 'tecnica_proc'],
        },
      ],
    });
  }
  // async findBySolicitudId(id_solicitud: number) {
  //   return Tecnica.findAll({
  //     attributes: [],
  //     include: [
  //       {
  //         model: DimTecnicaProc,
  //         as: 'tecnica_proc',
  //         attributes: ['id', 'tecnica_proc'],
  //       },
  //       {
  //         model: Muestra,
  //         where: { id_solicitud },
  //         as: 'muestra',
  //         attributes: [],
  //       },
  //     ],
  //   });
  // }

  async findAll() {
    return Tecnica.findAll({
      include: [
        {
          model: DimTecnicaProc,
          as: 'tecnica_proc',
          attributes: ['id', 'tecnica_proc'],
        },
        {
          model: Muestra,
          as: 'muestra',
          attributes: ['id_muestra', 'codigo_epi', 'codigo_externo'],
        },
      ],
    });
  }
  async create(data: CreationAttributes<Tecnica>) {
    return Tecnica.create(data);
  }
  async update(tecnica: Tecnica, data: Partial<Tecnica>) {
    return tecnica.update(data);
  }
  async delete(tecnica: Tecnica) {
    return tecnica.destroy();
  }
}
