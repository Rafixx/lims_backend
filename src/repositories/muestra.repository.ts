import { Muestra } from '../models/Muestra';
import { CreationAttributes } from 'sequelize';

export class MuestraRepository {
  async findById(id: number) {
    return Muestra.findByPk(id);
  }

  async findAll() {
    return Muestra.findAll();
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
