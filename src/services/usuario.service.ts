import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { BadRequestError } from '../errors/BadRequestError';

interface CreateUsuarioDTO {
  nombre: string;
  username: string;
  password: string;
  email: string;
  id_rol: number;
}

export class UsuarioService {
  constructor(private readonly usuarioRepo = new UsuarioRepository()) {}

  async createUsuario(data: CreateUsuarioDTO) {
    const existing = await this.usuarioRepo.findByEmail(data.email);
    if (existing) {
      throw new BadRequestError('El email ya está en uso');
    }

    const passwordhash = await bcrypt.hash(data.password, 10);

    return this.usuarioRepo.create({
      nombre: data.nombre,
      username: data.username,
      email: data.email,
      id_rol: data.id_rol,
      passwordhash,
    });
  }

  async getAllUsuarios() {
    return this.usuarioRepo.findAll();
  }

  async getUsuarioById(id: number) {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  async findByEmail(email: string) {
    const usuario = await this.usuarioRepo.findByEmail(email);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  async updateUsuario(id: number, data: Partial<CreateUsuarioDTO>) {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return this.usuarioRepo.update(usuario, data);
  }

  async deleteUsuario(id: number) {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    await this.usuarioRepo.delete(usuario);
    return { message: 'Usuario eliminado correctamente' };
  }
}
