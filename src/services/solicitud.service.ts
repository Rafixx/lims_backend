import { sequelize } from '../config/db.config';
import { Solicitud } from '../models/Solicitud';
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { SolicitudRepository } from '../repositories/solicitud.repository';

interface CreateSolicitudDTO {
  num_solicitud: string;
  id_cliente: number;
  id_prueba: number;
  f_entrada: Date;
  f_compromiso?: Date;
  f_creacion?: Date;
  estado_solicitud: string;
  created_by: number;
}

interface UpdateSolicitudDTO {
  num_solicitud?: string;
  id_cliente?: number;
  id_prueba?: number;
  f_entrada?: Date;
  id_tipo_muestra?: number;
  updated_by: number;
}

export class SolicitudService {
  constructor(private readonly solicitudRepo = new SolicitudRepository()) {}

  // async createSolicitud(data: CreateSolicitudDTO) {
  //   return this.solicitudRepo.create({
  //     ...data,
  //     f_creacion: data.f_creacion ?? new Date(),
  //   });
  // }

  // async createSolicitudWithTecnicas(data: CreateSolicitudDTO) {
  async createSolicitud(data: CreateSolicitudDTO) {
    return sequelize.transaction(async (t) => {
      const solicitud = await Solicitud.create(
        {
          ...data,
          f_creacion: data.f_creacion ?? new Date(),
        },
        { transaction: t }
      );

      // Crea al menos una muestra asociada (esto se podría parametrizar)
      const muestra = await Muestra.create(
        {
          id_solicitud: solicitud.id_solicitud,
          created_by: data.created_by,
          // updated_by: data.updated_by,
        },
        { transaction: t }
      );

      // Busca las técnicas definidas para esa prueba
      const tecnicasProc = await DimTecnicaProc.findAll({
        where: { id_prueba: data.id_prueba },
        transaction: t,
      });

      // Crea una Técnica por cada DimTecnicaProc encontrada
      const tecnicas = tecnicasProc.map((tp) =>
        Tecnica.create(
          {
            id_muestra: muestra.id_muestra,
            id_tecnica_proc: tp.id,
            estado: 'PENDIENTE',
            fecha_estado: new Date(),
            created_by: data.created_by,
            // updated_by: data.updated_by,
          },
          { transaction: t }
        )
      );

      await Promise.all(tecnicas);

      return solicitud;
    });
  }

  async getSolicitudById(id: number) {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }
    return solicitud;
  }

  async getAllSolicitudes() {
    return this.solicitudRepo.findAll();
  }

  async updateSolicitud(id: number, data: UpdateSolicitudDTO) {
    return sequelize.transaction(async (t) => {
      // 1. Obtener la solicitud existente
      const solicitud = await Solicitud.findByPk(id, { transaction: t });
      if (!solicitud) throw new Error('Solicitud no encontrada');

      // 2. Actualizar la solicitud
      await solicitud.update(data, { transaction: t });

      // 3. Obtener la muestra asociada
      const muestra = await Muestra.findOne({
        where: { id_solicitud: id },
        transaction: t,
      });

      if (muestra) {
        // 4. Actualizar la muestra con el nuevo tipo
        await muestra.update(
          {
            id_tipo_muestra: data.id_tipo_muestra,
            updated_by: data.updated_by,
          },
          { transaction: t }
        );

        // 5. Eliminar técnicas existentes asociadas a la muestra
        // TODOLIST: comprobar si se ha realizado alguna acción con la/s tecnica/s i advertir al usuario
        await Tecnica.destroy({
          where: { id_muestra: muestra.id_muestra },
          transaction: t,
        });

        // 6. Obtener nuevas técnicas según la nueva prueba
        const nuevasTecnicas = await DimTecnicaProc.findAll({
          where: { id_prueba: data.id_prueba },
          transaction: t,
        });

        // 7. Crear nuevas técnicas asociadas a la muestra
        const tecnicas = nuevasTecnicas.map((tec) =>
          Tecnica.create(
            {
              id_muestra: muestra.id_muestra,
              id_tecnica_proc: tec.id,
              estado: 'PENDIENTE',
              created_by: data.updated_by,
            },
            { transaction: t }
          )
        );

        await Promise.all(tecnicas);
      }

      return solicitud;
    });
  }

  async deleteSolicitud(id: number) {
    const solicitud = await this.solicitudRepo.findById(id);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }
    await this.solicitudRepo.delete(solicitud);
    return { message: 'Solicitud eliminada correctamente' };
  }
}
