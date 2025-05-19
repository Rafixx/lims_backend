import { sequelize } from '../config/db.config';
import { Solicitud } from '../models/Solicitud';
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';
// import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { SolicitudRepository } from '../repositories/solicitud.repository';
import { parseDate } from '../utils/helper';

// interface TecnicaProc {
//   id: number;
//   tecnica_proc: string;
// }

interface CreateSolicitudDTO {
  num_solicitud: string;
  id_cliente: number;
  f_entrada: string;
  condiciones_envio?: string;
  tiempo_hielo?: string;
  f_compromiso?: string;
  f_entrega?: string;
  f_resultado?: string;
  updated_by?: number;
  created_by?: number;
  f_creacion?: string;
  muestra: {
    codigo_epi?: string;
    codigo_externo?: string;
    id_prueba: number;
    id_paciente: number;
    id_tipo_muestra: number;
    id_ubicacion?: number;
    id_centro_externo?: number;
    id_criterio_val?: number;
    id_tecnico_resp?: number;
    f_toma?: string;
    f_recepcion?: string;
    f_destruccion?: string;
    f_devolucion?: string;
    tecnicas?: { id_tecnica_proc: number }[];
    updated_by?: number;
    created_by?: number;
  }[];
}

interface UpdateSolicitudDTO {
  num_solicitud: string;
  id_cliente: number;
  f_entrada: string;
  condiciones_envio?: string;
  tiempo_hielo?: string;
  f_compromiso?: string;
  f_entrega?: string;
  f_resultado?: string;
  updated_by?: number;
  muestra: {
    codigo_epi?: string;
    codigo_externo?: string;
    id_prueba: number;
    id_paciente: number;
    id_tipo_muestra: number;
    id_ubicacion?: number;
    id_centro_externo?: number;
    id_criterio_val?: number;
    id_tecnico_resp?: number;
    f_toma?: string;
    f_recepcion?: string;
    f_destruccion?: string;
    f_devolucion?: string;
    tecnicas?: { id_tecnica_proc: number }[];
    updated_by?: number;
    created_by?: number;
  }[];
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
          num_solicitud: data.num_solicitud,
          id_cliente: data.id_cliente,
          f_entrada: parseDate(data.f_entrada),
          condiciones_envio: data.condiciones_envio,
          tiempo_hielo: data.tiempo_hielo,
          estado_solicitud: 'NUEVA',
          f_compromiso: parseDate(data.f_compromiso),
          f_entrega: parseDate(data.f_entrega),
          f_resultado: parseDate(data.f_resultado),
          // f_creacion: new Date(),
          created_by: data.updated_by,
          updated_by: data.updated_by,
        },
        { transaction: t }
      );

      const tecnicasPromises: Promise<Tecnica>[] = [];

      for (const muestraData of data.muestra ?? []) {
        const nuevaMuestra = await Muestra.create(
          {
            id_solicitud: solicitud.id_solicitud,
            id_prueba: muestraData.id_prueba,
            codigo_epi: muestraData.codigo_epi,
            codigo_externo: muestraData.codigo_externo,
            id_paciente: muestraData.id_paciente,
            id_tipo_muestra: muestraData.id_tipo_muestra,
            id_ubicacion: muestraData.id_ubicacion,
            id_centro_externo: muestraData.id_centro_externo,
            id_criterio_val: muestraData.id_criterio_val,
            id_tecnico_resp: muestraData.id_tecnico_resp,
            f_toma: parseDate(muestraData.f_toma),
            f_recepcion: parseDate(muestraData.f_recepcion),
            f_destruccion: parseDate(muestraData.f_destruccion),
            f_devolucion: parseDate(muestraData.f_devolucion),
            created_by: data.updated_by,
            updated_by: data.updated_by,
          },
          { transaction: t }
        );

        const tecnicas = (muestraData.tecnicas ?? []).map((tp) =>
          Tecnica.create(
            {
              id_muestra: nuevaMuestra.id_muestra,
              id_tecnica_proc: tp.id_tecnica_proc,
              estado: 'PENDIENTE',
              fecha_estado: new Date(),
              created_by: data.updated_by,
              updated_by: data.updated_by,
            },
            { transaction: t }
          )
        );

        tecnicasPromises.push(...tecnicas);
      }

      await Promise.all(tecnicasPromises);

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
      const solicitud = await Solicitud.findByPk(id, { transaction: t });
      if (!solicitud) throw new Error('Solicitud no encontrada');

      // 1. Actualizar datos de la solicitud
      await solicitud.update(
        {
          num_solicitud: data.num_solicitud,
          id_cliente: data.id_cliente,
          f_entrada: parseDate(data.f_entrada),
          condiciones_envio: data.condiciones_envio,
          tiempo_hielo: data.tiempo_hielo,
          updated_by: data.updated_by,
        },
        { transaction: t }
      );

      // 2. Eliminar muestras existentes (cascada eliminará técnicas si está configurado)
      const muestrasAntiguas = await Muestra.findAll({
        where: { id_solicitud: id },
        transaction: t,
      });
      // Marcar muestras como ANULADAS antes de eliminarlas
      for (const m of muestrasAntiguas) {
        await m.update(
          {
            estado_muestra: 'ANULADA',
            updated_by: data.updated_by,
          },
          { transaction: t }
        );
        await Tecnica.destroy({
          where: { id_muestra: m.id_muestra },
          transaction: t,
        });
        await m.destroy({ transaction: t });
      }

      // 3. Crear nuevas muestras y técnicas
      const nuevasTecnicas: Promise<Tecnica>[] = [];

      for (const muestraData of data.muestra ?? []) {
        const nuevaMuestra = await Muestra.create(
          {
            id_solicitud: solicitud.id_solicitud,
            id_prueba: muestraData.id_prueba,
            codigo_epi: muestraData.codigo_epi,
            codigo_externo: muestraData.codigo_externo,
            id_paciente: muestraData.id_paciente,
            id_tipo_muestra: muestraData.id_tipo_muestra,
            id_ubicacion: muestraData.id_ubicacion,
            id_centro_externo: muestraData.id_centro_externo,
            id_criterio_val: muestraData.id_criterio_val,
            id_tecnico_resp: muestraData.id_tecnico_resp,
            f_toma: parseDate(muestraData.f_toma),
            f_recepcion: parseDate(muestraData.f_recepcion),
            f_destruccion: parseDate(muestraData.f_destruccion),
            f_devolucion: parseDate(muestraData.f_devolucion),
            created_by: data.updated_by,
            updated_by: data.updated_by,
          },
          { transaction: t }
        );

        for (const tecnica of muestraData.tecnicas ?? []) {
          nuevasTecnicas.push(
            Tecnica.create(
              {
                id_muestra: nuevaMuestra.id_muestra,
                id_tecnica_proc: tecnica.id_tecnica_proc,
                estado: 'PENDIENTE',
                fecha_estado: new Date(),
                created_by: data.updated_by,
                updated_by: data.updated_by,
              },
              { transaction: t }
            )
          );
        }
      }

      await Promise.all(nuevasTecnicas);

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
