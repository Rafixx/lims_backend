import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: number; username: string; id_rol: number };
    }
  }
}
