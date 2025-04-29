import { Solicitud } from '../models/Solicitud';
import { CreationAttributes } from 'sequelize';

export class SolicitudRepository {
  async findById(id: number) {
    return Solicitud.findByPk(id);
  }

  async findAll() {
    return Solicitud.findAll();
  }

  async create(data: CreationAttributes<Solicitud>) {
    return Solicitud.create(data);
  }

  async update(solicitud: Solicitud, data: Partial<Solicitud>) {
    return solicitud.update(data);
  }

  async delete(solicitud: Solicitud) {
    return solicitud.destroy();
  }
}
