// src/types/express.d.ts

import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      username: string;
      id_rol: number;
    };
  }
}
