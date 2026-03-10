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

    const GENERIC_AUTH_ERROR = 'Credenciales incorrectas';

    if (!usuario) {
      throw new UnauthorizedError(GENERIC_AUTH_ERROR);
    }

    if (!usuario.passwordhash || typeof usuario.passwordhash !== 'string') {
      throw new UnauthorizedError(GENERIC_AUTH_ERROR);
    }

    if (!data.password || typeof data.password !== 'string') {
      throw new UnauthorizedError(GENERIC_AUTH_ERROR);
    }

    const passwordValid = await bcrypt.compare(
      data.password,
      usuario.passwordhash
    );

    if (!passwordValid) {
      throw new UnauthorizedError(GENERIC_AUTH_ERROR);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const rolName = usuario.rol?.name || 'desconocido';

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        username: usuario.username,
        id_rol: usuario.id_rol ?? null,
        rol_name: rolName,
      },
      jwtSecret,
      { expiresIn: '1h', algorithm: 'HS256' }
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
