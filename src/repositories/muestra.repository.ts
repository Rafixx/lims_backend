import { Muestra } from '../models/Muestra';
import { fn, col, literal } from 'sequelize';
import { Tecnica } from '../models/Tecnica';
import { Solicitud } from '../models/Solicitud';
import { sequelize } from '../config/db.config';

interface MuestraStats {
  total: number;
  pendientes: number;
  en_proceso: number;
  completadas: number;
  vencidas: number;
  creadas_hoy: number;
  completadas_hoy: number;
}

interface CrearMuestraData {
  id_muestra?: number;
  codigo_epi?: string;
  codigo_externo?: string;
  f_toma?: string;
  f_recepcion?: string;
  f_destruccion?: string;
  f_devolucion?: string;
  estado_muestra?: string;
  paciente?: {
    id: string | number;
    nombre?: string;
    sip?: string;
    direccion?: string;
  };
  solicitud: {
    id_solicitud?: number;
    f_creacion?: string;
    f_entrada?: string;
    f_compromiso?: string;
    f_entrega?: string;
    f_resultado?: string;
    condiciones_envio?: string;
    tiempo_hielo?: string;
    cliente: {
      id: string | number;
      nombre?: string;
      razon_social?: string;
      nif?: string;
    };
  };
  tecnico_resp?: {
    id_usuario: string | number;
    nombre?: string;
  };
  tipo_muestra?: {
    id: string | number;
    cod_tipo_muestra?: string;
    tipo_muestra?: string;
  };
  centro?: {
    id: string | number;
    codigo?: string;
    descripcion?: string;
  };
  criterio_validacion?: {
    id: number;
    codigo?: string;
    descripcion?: string;
  };
  ubicacion?: {
    id: number;
    codigo?: string;
    ubicacion?: string;
  };
  prueba?: {
    id: string | number;
    cod_prueba?: string;
    prueba?: string;
  };
  tecnicas?: Array<{
    id_tecnica_proc: string | number;
    comentarios?: string;
  }>;
}

export class MuestraRepository {
  async findById(id: number) {
    return Muestra.scope('withRefs').findByPk(id);
  }

  async findAll() {
    return Muestra.scope('withRefs').findAll();
  }

  async findTecnicasById(id_muestra: number) {
    return Muestra.findByPk(id_muestra, {
      attributes: ['id_muestra'],
      include: [
        {
          model: Tecnica.scope('withRefs'),
          as: 'tecnicas',
          separate: true, // <-- evita cartesian explosion
          limit: 100, // defensivo; o pagina si procede
        },
      ],
    });
  }

  async create(data: CrearMuestraData) {
    const transaction = await sequelize.transaction();

    try {
      // Validar y convertir ID de cliente (obligatorio)
      if (!data.solicitud.cliente.id) {
        throw new Error('El ID del cliente es obligatorio');
      }
      const clienteId = Number(data.solicitud.cliente.id);
      if (isNaN(clienteId)) {
        throw new Error('ID de cliente debe ser un número válido');
      }

      // Preparar datos de la solicitud
      const solicitudData = {
        id_cliente: clienteId,
        f_creacion: data.solicitud.f_creacion
          ? new Date(data.solicitud.f_creacion)
          : undefined,
        f_entrada: data.solicitud.f_entrada
          ? new Date(data.solicitud.f_entrada)
          : undefined,
        f_compromiso: data.solicitud.f_compromiso
          ? new Date(data.solicitud.f_compromiso)
          : undefined,
        f_entrega: data.solicitud.f_entrega
          ? new Date(data.solicitud.f_entrega)
          : undefined,
        f_resultado: data.solicitud.f_resultado
          ? new Date(data.solicitud.f_resultado)
          : undefined,
        condiciones_envio: data.solicitud.condiciones_envio,
        tiempo_hielo: data.solicitud.tiempo_hielo,
        estado_solicitud: 'REGISTRADA', // Estado por defecto para nueva solicitud
      };

      // Crear la solicitud dentro de la transacción
      const nuevaSolicitud = await Solicitud.create(solicitudData, {
        transaction,
      });

      // Validar y convertir otros IDs
      const pacienteId = data.paciente?.id
        ? Number(data.paciente.id)
        : undefined;
      const tecnicoRespId = data.tecnico_resp?.id_usuario
        ? Number(data.tecnico_resp.id_usuario)
        : undefined;
      const tipoMuestraId = data.tipo_muestra?.id
        ? Number(data.tipo_muestra.id)
        : undefined;
      const centroId = data.centro?.id ? Number(data.centro.id) : undefined;
      const criterioValidacionId = data.criterio_validacion?.id || undefined;
      const ubicacionId = data.ubicacion?.id || undefined;
      const pruebaId = data.prueba?.id ? Number(data.prueba.id) : undefined;

      // Validar conversiones
      if (data.paciente?.id && isNaN(pacienteId!)) {
        throw new Error('ID de paciente debe ser un número válido');
      }
      if (data.tecnico_resp?.id_usuario && isNaN(tecnicoRespId!)) {
        throw new Error('ID de técnico responsable debe ser un número válido');
      }
      if (data.tipo_muestra?.id && isNaN(tipoMuestraId!)) {
        throw new Error('ID de tipo de muestra debe ser un número válido');
      }
      if (data.centro?.id && isNaN(centroId!)) {
        throw new Error('ID de centro debe ser un número válido');
      }
      if (data.prueba?.id && isNaN(pruebaId!)) {
        throw new Error('ID de prueba debe ser un número válido');
      }

      // Preparar datos de la muestra con el ID de solicitud recién creado
      const muestraData = {
        id_solicitud: nuevaSolicitud.id_solicitud,
        codigo_epi: data.codigo_epi,
        codigo_externo: data.codigo_externo,
        f_toma: data.f_toma ? new Date(data.f_toma) : undefined,
        f_recepcion: data.f_recepcion ? new Date(data.f_recepcion) : undefined,
        f_destruccion: data.f_destruccion
          ? new Date(data.f_destruccion)
          : undefined,
        f_devolucion: data.f_devolucion
          ? new Date(data.f_devolucion)
          : undefined,
        estado_muestra: data.estado_muestra,
        id_paciente: pacienteId,
        id_tecnico_resp: tecnicoRespId,
        id_tipo_muestra: tipoMuestraId,
        id_centro_externo: centroId,
        id_criterio_val: criterioValidacionId,
        id_ubicacion: ubicacionId,
        id_prueba: pruebaId,
      };

      // Crear la muestra dentro de la transacción
      const nuevaMuestra = await Muestra.create(muestraData, { transaction });

      // Si se proporcionaron técnicas, crearlas
      if (data.tecnicas && data.tecnicas.length > 0) {
        const tecnicasData = data.tecnicas.map((tecnica) => {
          // Validar y convertir id_tecnica_proc
          const idTecnicaProc = Number(tecnica.id_tecnica_proc);
          if (isNaN(idTecnicaProc)) {
            throw new Error(
              `ID de técnica proceso debe ser un número válido: ${tecnica.id_tecnica_proc}`
            );
          }

          return {
            id_muestra: nuevaMuestra.id_muestra,
            id_tecnica_proc: idTecnicaProc,
            estado: 'PENDIENTE_TECNICA',
            fecha_estado: new Date(),
            comentarios: tecnica.comentarios || undefined,
            f_creacion: new Date(),
          };
        });

        // Crear todas las técnicas de una vez dentro de la transacción
        await Tecnica.bulkCreate(tecnicasData, { transaction });
      }

      // Confirmar la transacción
      await transaction.commit();

      return nuevaMuestra;
    } catch (error) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  }

  async update(muestra: Muestra, data: Partial<Muestra>) {
    return muestra.update(data);
  }

  async delete(muestra: Muestra) {
    return muestra.destroy();
  }

  async getMuestrasStats(): Promise<MuestraStats> {
    const rows = await Muestra.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'total'],
        [
          fn(
            'SUM',
            literal(`CASE WHEN estado_muestra='PENDIENTE' THEN 1 ELSE 0 END`)
          ),
          'pendientes',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN estado_muestra IN ('EN_PROCESO','PROCESANDO') THEN 1 ELSE 0 END`
            )
          ),
          'en_proceso',
        ],
        [
          fn(
            'SUM',
            literal(`CASE WHEN estado_muestra='COMPLETADA' THEN 1 ELSE 0 END`)
          ),
          'completadas',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN f_compromiso < NOW() AT TIME ZONE 'Europe/Madrid' AND estado_muestra <> 'COMPLETADA' THEN 1 ELSE 0 END`
            )
          ),
          'vencidas',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN DATE(f_creacion AT TIME ZONE 'Europe/Madrid') = CURRENT_DATE AT TIME ZONE 'Europe/Madrid' THEN 1 ELSE 0 END`
            )
          ),
          'creadas_hoy',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN estado_muestra='COMPLETADA' AND DATE(f_resultado AT TIME ZONE 'Europe/Madrid') = CURRENT_DATE AT TIME ZONE 'Europe/Madrid' THEN 1 ELSE 0 END`
            )
          ),
          'completadas_hoy',
        ],
      ],
      include: [
        {
          model: Solicitud,
          as: 'solicitud',
          attributes: [],
          required: false,
        },
      ],
      where: literal('"Muestra"."delete_dt" IS NULL'),
      raw: true,
    });

    const r = rows[0] as unknown as Record<string, string | number>;
    return {
      total: Number(r.total) || 0,
      pendientes: Number(r.pendientes) || 0,
      en_proceso: Number(r.en_proceso) || 0,
      completadas: Number(r.completadas) || 0,
      vencidas: Number(r.vencidas) || 0,
      creadas_hoy: Number(r.creadas_hoy) || 0,
      completadas_hoy: Number(r.completadas_hoy) || 0,
    };
  }
}
