import { Rol } from '../models/Rol';
import { CreationAttributes } from 'sequelize';

export class RolRepository {
  async findById(id: number) {
    return Rol.findByPk(id);
  }

  async findAll() {
    return Rol.findAll();
  }

  async findByName(name: string) {
    return Rol.findOne({ where: { name } });
  }

  async create(data: CreationAttributes<Rol>) {
    return Rol.create(data);
  }

  async update(rol: Rol, data: Partial<Rol>) {
    return rol.update(data);
  }

  async delete(rol: Rol) {
    return rol.destroy();
  }
}
