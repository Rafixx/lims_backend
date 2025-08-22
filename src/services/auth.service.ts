import { Usuario } from '../models/Usuario';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { Rol } from '../models/Rol';

interface LoginDTO {
  username: string;
  password: string;
}

interface LoginResponseDTO {
  token: string;
  user: {
    id_usuario: number;
    username: string;
    nombre: string | null;
    email: string;
    rol_name?: string;
  };
}

export class AuthService {
  async login(data: LoginDTO): Promise<LoginResponseDTO> {
    const usuario = await Usuario.scope('authScope').findOne({
      where: { username: data.username },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['name'],
        },
      ],
    });

    if (!usuario) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    // Protección extra: que exista hash
    if (!usuario.passwordhash || typeof usuario.passwordhash !== 'string') {
      throw new UnauthorizedError('El usuario no tiene credenciales válidas');
    }

    // Protección extra: que haya password en input
    if (!data.password || typeof data.password !== 'string') {
      throw new UnauthorizedError('Contraseña no proporcionada');
    }

    const passwordValid = await bcrypt.compare(
      data.password,
      usuario.passwordhash
    );

    if (!passwordValid) {
      throw new UnauthorizedError('Contraseña incorrecta');
    }

    const rolName = usuario.rol?.name || 'desconocido';

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        username: usuario.username,
        rol_name: rolName,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    return {
      token,
      user: {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_name: rolName,
      },
    };
  }
}
