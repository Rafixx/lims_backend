import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Usuario } from '../models/Usuario';
import { BadRequestError } from '../errors/BadRequestError';
import { UnauthorizedError } from '../errors/UnauthorizedError';

interface CreateUsuarioDTO {
  nombre: string;
  username: string;
  password: string;
  email: string;
  id_rol: number;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validatePasswordComplexity(password: string) {
  if (!PASSWORD_REGEX.test(password)) {
    throw new BadRequestError(
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
    );
  }
}

export class UsuarioService {
  constructor(private readonly usuarioRepo = new UsuarioRepository()) {}

  async createUsuario(data: CreateUsuarioDTO) {
    validatePasswordComplexity(data.password);

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

  async changePassword(id: number, currentPassword: string, newPassword: string) {
    const usuario = await Usuario.scope('authScope').findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (!usuario.passwordhash) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    const valid = await bcrypt.compare(currentPassword, usuario.passwordhash);
    if (!valid) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    validatePasswordComplexity(newPassword);

    const passwordhash = await bcrypt.hash(newPassword, 10);
    await usuario.update({ passwordhash });
    return { message: 'Contraseña actualizada correctamente' };
  }
}
