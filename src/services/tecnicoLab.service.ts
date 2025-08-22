//src/services/dimCentro.service.ts
import { Usuario } from '../models/Usuario';

interface TecnicoLab {
  id_usuario: number;
  nombre: string;
}

export class TecnicoLabService {
  async getAllTecnicoLabService(): Promise<TecnicoLab[]> {
    const rows = await Usuario.scope('tecnicosLab').findAll({
      attributes: ['id_usuario', 'nombre'],
      raw: true,
    });
    return rows;
  }
}
