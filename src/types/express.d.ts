// src/types/express.d.ts
// Extensión de tipos para Express Request

declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      username: string;
      id_rol: number;
    };
  }
}
