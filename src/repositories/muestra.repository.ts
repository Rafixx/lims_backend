import { Muestra } from '../models/Muestra';
import { CreationAttributes } from 'sequelize';
import { Usuario } from '../models/Usuario';

export class MuestraRepository {
  async findById(id: number) {
    return Muestra.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'tecnico_resp',
          attributes: ['id_usuario', 'nombre', 'email'],
        },
      ],
    });
  }

  async findAll() {
    return Muestra.findAll({
      include: [
        {
          model: Usuario,
          as: 'tecnico_resp',
          attributes: ['id_usuario', 'nombre', 'email'],
        },
      ],
    });
  }

  async create(data: CreationAttributes<Muestra>) {
    return Muestra.create(data);
  }

  async update(muestra: Muestra, data: Partial<Muestra>) {
    return muestra.update(data);
  }

  async delete(muestra: Muestra) {
    return muestra.destroy();
  }
}
