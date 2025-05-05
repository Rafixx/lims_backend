import { Usuario } from '../models/Usuario';
import { CreationAttributes } from 'sequelize';

export class UsuarioRepository {
  async findByEmail(email: string) {
    return Usuario.findOne({
      where: { email },
    });
  }

  async findById(id: number) {
    return Usuario.findByPk(id);
  }

  async findAll() {
    return Usuario.findAll();
  }

  async create(data: CreationAttributes<Usuario>) {
    return Usuario.create(data);
  }

  async update(usuario: Usuario, data: Partial<Usuario>) {
    return usuario.update(data);
  }

  async delete(usuario: Usuario) {
    return usuario.destroy();
  }
}
