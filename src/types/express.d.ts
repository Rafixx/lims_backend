declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      username: string;
      id_rol: number | null;
      rol_name: string;
    };
  }
}
