import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UsuarioService } from '../services/usuario.service';

const usuarioService = new UsuarioService();

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await usuarioService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.passwordhash);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id_usuario,
        email: user.email,
        id_rol: user.id_rol,
      },
      process.env.JWT_SECRET || 'secretKey',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        username: user.username,
        id_rol: user.id_rol,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
