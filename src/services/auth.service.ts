import { Usuario } from '../models/Usuario';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface LoginDTO {
  username: string;
  password: string;
}

export class AuthService {
  async login(data: LoginDTO) {
    const usuario = await Usuario.findOne({
      where: { username: data.username },
    });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const passwordValid = await bcrypt.compare(
      data.password,
      usuario.passwordhash
    );
    if (!passwordValid) {
      throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        username: usuario.username,
        id_rol: usuario.id_rol,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    return { token };
  }
}
