import { MuestraRepository } from '../repositories/muestra.repository';
import { MuestraArrayRepository } from '../repositories/muestraArray.repository';
import { DimReactivoService } from './dimReactivo.service';
import {
  ContadorRepository,
  NextCounterValue,
} from '../repositories/contador.repository';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';

interface CreateMuestraDTO {
  id_muestra?: number;
  codigo_epi?: string;
  codigo_externo?: string;
  f_toma?: string;
  f_recepcion?: string;
  f_destruccion?: string;
  f_devolucion?: string;
  estado_muestra?: string;
  /** Número de tubos a crear. Ignorado si tipo_array === true (placas). Rango: 1-9999. */
  cantidad?: number;
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
  array_config?: {
    code: string;
    width: number;
    heightLetter: string;
    height: number;
    totalPositions: number;
  } | null;
}

interface UpdateMuestraDTO {
  codigo_epi?: string;
  codigo_externo?: string;
  estudio?: string;
  observaciones?: string;
  f_toma?: Date;
  f_recepcion?: Date;
  f_destruccion?: Date;
  f_devolucion?: Date;
  f_agotada?: Date;
  estado_muestra?: string;
  id_paciente?: number;
  id_tecnico_resp?: number;
  id_tecnico_recepcion?: number;
  id_tecnico_verifica?: number;
  id_tipo_muestra?: number;
  id_prueba?: number;
  id_centro_externo?: number;
  id_criterio_val?: number;
  id_ubicacion?: number;
}

export class MuestraService {
  private dimReactivoService: DimReactivoService;
  private readonly muestraRepo: MuestraRepository;
  private readonly contadorRepo: ContadorRepository;
  private readonly muestraArrayRepo: MuestraArrayRepository;

  constructor(
    muestraRepo?: MuestraRepository,
    contadorRepo?: ContadorRepository
  ) {
    this.dimReactivoService = new DimReactivoService();
    this.muestraRepo =
      muestraRepo || new MuestraRepository(this.dimReactivoService);
    this.contadorRepo = contadorRepo || new ContadorRepository();
    this.muestraArrayRepo = new MuestraArrayRepository();
  }

  async createMuestra(data: CreateMuestraDTO) {
    // Validar que los datos obligatorios estén presentes
    if (!data.solicitud?.cliente?.id) {
      throw new Error('El cliente es obligatorio para crear una muestra');
    }

    if (!data.f_recepcion || String(data.f_recepcion).trim() === '') {
      throw new BadRequestError('f_recepcion es obligatorio');
    }

    // Validar y normalizar cantidad
    const rawCantidad = data.cantidad !== undefined ? data.cantidad : 1;
    const cantidad = Number(rawCantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 9999) {
      throw new BadRequestError('La cantidad debe ser un número entero entre 1 y 9999');
    }

    // Las placas (tipo_array) tienen su propio mecanismo de posiciones; no admiten cantidad > 1
    if (data.array_config && cantidad > 1) {
      throw new BadRequestError('Las muestras de tipo placa solo se pueden crear de una en una');
    }

    // Crear N muestras secuencialmente (cada una con su propia transacción interna)
    const items: object[] = [];
    for (let i = 0; i < cantidad; i++) {
      const { codigo_epi } = await this.getCodigoEpi();
      // En creación grupal (cantidad > 1) el código externo se omite intencionadamente
      // para ser asignado individualmente con posterioridad a cada muestra
      const muestraData = cantidad > 1
        ? { ...data, codigo_epi, codigo_externo: undefined }
        : { ...data, codigo_epi };
      const resultado = await this.muestraRepo.create(
        muestraData,
        this.getCodigoEpi.bind(this)
      );
      items.push({
        ...resultado.toJSON(),
        tecnicasCreadas: data.tecnicas ? data.tecnicas.length : 0,
      });
    }

    return {
      items,
      createdCount: cantidad,
      mensaje: cantidad > 1
        ? `${cantidad} muestras creadas correctamente`
        : 'Muestra, solicitud y técnicas creadas correctamente',
    };
  }

  async getMuestraById(id: number) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    return muestra;
  }

  async getTecnicasById(id_muestra: number) {
    const muestra = await this.muestraRepo.findTecnicasById(id_muestra);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    return muestra;
  }

  async getAllMuestras() {
    return this.muestraRepo.findAll();
  }

  async updateMuestra(id: number, data: Record<string, unknown>) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }

    // El frontend envía objetos anidados (tipo_muestra: { id }, criterio_validacion: { id }…).
    // Los mapeamos a los IDs planos que espera el modelo Sequelize.
    const nested = data as {
      paciente?: { id?: number | string };
      tecnico_resp?: { id_usuario?: number | string };
      tipo_muestra?: { id?: number | string };
      centro?: { id?: number | string };
      criterio_validacion?: { id?: number | string };
      ubicacion?: { id?: number | string };
      solicitud?: {
        condiciones_envio?: string;
        tiempo_hielo?: string;
        f_entrada?: string;
        f_compromiso?: string;
        f_entrega?: string;
        f_resultado?: string;
      };
    };

    const toNum = (v: number | string | undefined): number | undefined =>
      v !== undefined && v !== null && v !== '' ? Number(v) : undefined;

    const updateData: UpdateMuestraDTO = {
      codigo_epi: data.codigo_epi as string | undefined,
      codigo_externo: data.codigo_externo as string | undefined,
      estudio: data.estudio as string | undefined,
      observaciones: data.observaciones as string | undefined,
      f_toma: data.f_toma ? new Date(data.f_toma as string) : undefined,
      f_recepcion: data.f_recepcion ? new Date(data.f_recepcion as string) : undefined,
      f_destruccion: data.f_destruccion ? new Date(data.f_destruccion as string) : undefined,
      f_devolucion: data.f_devolucion ? new Date(data.f_devolucion as string) : undefined,
      f_agotada: data.f_agotada ? new Date(data.f_agotada as string) : undefined,
      id_paciente: toNum(nested.paciente?.id) ?? toNum(data.id_paciente as number | undefined),
      id_tecnico_resp: toNum(nested.tecnico_resp?.id_usuario) ?? toNum(data.id_tecnico_resp as number | undefined),
      id_tipo_muestra: toNum(nested.tipo_muestra?.id) ?? toNum(data.id_tipo_muestra as number | undefined),
      id_prueba: toNum(data.id_prueba as number | undefined),
      // id_centro: nombre plano del frontend; id_centro_externo: nombre de columna en el modelo
      id_centro_externo: toNum(nested.centro?.id) ?? toNum(data.id_centro_externo as number | undefined) ?? toNum(data.id_centro as number | undefined),
      // id_criterio_validacion: nombre plano del frontend; id_criterio_val: nombre de columna en el modelo
      id_criterio_val: toNum(nested.criterio_validacion?.id) ?? toNum(data.id_criterio_val as number | undefined) ?? toNum(data.id_criterio_validacion as number | undefined),
      id_ubicacion: toNum(nested.ubicacion?.id) ?? toNum(data.id_ubicacion as number | undefined),
      id_tecnico_recepcion: toNum(data.id_tecnico_recepcion as number | undefined),
      id_tecnico_verifica: toNum(data.id_tecnico_verifica as number | undefined),
    };

    // Actualizar campos de la solicitud si se proporcionan
    const idSolicitudCliente = toNum(data.id_solicitud_cliente as number | undefined);
    if ((nested.solicitud || idSolicitudCliente !== undefined) && muestra.id_solicitud) {
      const { Solicitud } = await import('../models/Solicitud');
      const solicitud = await Solicitud.findByPk(muestra.id_solicitud);
      if (solicitud) {
        const solicitudUpdate: Record<string, unknown> = {};
        if (nested.solicitud?.condiciones_envio !== undefined) solicitudUpdate.condiciones_envio = nested.solicitud.condiciones_envio;
        if (nested.solicitud?.tiempo_hielo !== undefined) solicitudUpdate.tiempo_hielo = nested.solicitud.tiempo_hielo;
        if (nested.solicitud?.f_entrada) solicitudUpdate.f_entrada = new Date(nested.solicitud.f_entrada);
        if (nested.solicitud?.f_compromiso) solicitudUpdate.f_compromiso = new Date(nested.solicitud.f_compromiso);
        if (nested.solicitud?.f_entrega) solicitudUpdate.f_entrega = new Date(nested.solicitud.f_entrega);
        if (nested.solicitud?.f_resultado) solicitudUpdate.f_resultado = new Date(nested.solicitud.f_resultado);
        if (idSolicitudCliente !== undefined) solicitudUpdate.id_cliente = idSolicitudCliente;
        if (Object.keys(solicitudUpdate).length > 0) await solicitud.update(solicitudUpdate);
      }
    }

    return this.muestraRepo.update(muestra, updateData);
  }

  async deleteMuestra(id: number) {
    const muestra = await this.muestraRepo.findById(id);
    if (!muestra) {
      throw new Error('Muestra no encontrada');
    }
    await this.muestraRepo.delete(muestra);
    return { message: 'Muestra eliminada correctamente' };
  }

  async assignCodigosExternos(
    estudio: string,
    pares: { codigo_epi: string; cod_externo: string; observaciones?: string }[]
  ) {
    const updated = await this.muestraRepo.assignCodigosExternos(estudio, pares);
    if (updated === 0) {
      throw new NotFoundError(
        'No se encontraron muestras para ese estudio con los códigos EPI indicados'
      );
    }
    return { updated, mensaje: `${updated} muestras actualizadas correctamente` };
  }

  async bulkUpdateByEstudio(estudio: string, data: Record<string, unknown>) {
    const muestras = await this.muestraRepo.findAllByEstudio(estudio);
    if (!muestras.length) {
      throw new NotFoundError(`No se encontraron muestras con estudio "${estudio}"`);
    }

    const nested = data as {
      paciente?: { id?: number | string };
      tecnico_resp?: { id_usuario?: number | string };
      tipo_muestra?: { id?: number | string };
      centro?: { id?: number | string };
      criterio_validacion?: { id?: number | string };
      ubicacion?: { id?: number | string };
      solicitud?: {
        condiciones_envio?: string;
        tiempo_hielo?: string;
        f_entrada?: string;
        f_compromiso?: string;
        f_entrega?: string;
        f_resultado?: string;
      };
    };

    const toNum = (v: number | string | undefined): number | undefined =>
      v !== undefined && v !== null && v !== '' ? Number(v) : undefined;

    const updateData: UpdateMuestraDTO = {
      observaciones: data.observaciones as string | undefined,
      estudio: data.estudio as string | undefined,
      f_toma: data.f_toma ? new Date(data.f_toma as string) : undefined,
      f_recepcion: data.f_recepcion ? new Date(data.f_recepcion as string) : undefined,
      id_paciente: toNum(nested.paciente?.id) ?? toNum(data.id_paciente as number | undefined),
      id_tecnico_resp: toNum(nested.tecnico_resp?.id_usuario) ?? toNum(data.id_tecnico_resp as number | undefined),
      id_tipo_muestra: toNum(nested.tipo_muestra?.id) ?? toNum(data.id_tipo_muestra as number | undefined),
      id_centro_externo: toNum(nested.centro?.id) ?? toNum(data.id_centro_externo as number | undefined),
      id_criterio_val: toNum(nested.criterio_validacion?.id) ?? toNum(data.id_criterio_val as number | undefined),
      id_ubicacion: toNum(nested.ubicacion?.id) ?? toNum(data.id_ubicacion as number | undefined),
      id_tecnico_recepcion: toNum(data.id_tecnico_recepcion as number | undefined),
    };

    const solicitudData = nested.solicitud
      ? {
          condiciones_envio: nested.solicitud.condiciones_envio,
          tiempo_hielo: nested.solicitud.tiempo_hielo,
          f_entrada: nested.solicitud.f_entrada ? new Date(nested.solicitud.f_entrada) : undefined,
          f_compromiso: nested.solicitud.f_compromiso ? new Date(nested.solicitud.f_compromiso) : undefined,
          f_entrega: nested.solicitud.f_entrega ? new Date(nested.solicitud.f_entrega) : undefined,
          f_resultado: nested.solicitud.f_resultado ? new Date(nested.solicitud.f_resultado) : undefined,
        }
      : null;

    const { sequelize: db } = await import('../config/db.config');
    const { Solicitud } = await import('../models/Solicitud');
    const transaction = await db.transaction();

    try {
      for (const muestra of muestras) {
        await muestra.update(updateData, { transaction });
        if (solicitudData && muestra.id_solicitud) {
          const solicitud = await Solicitud.findByPk(muestra.id_solicitud);
          if (solicitud) {
            await solicitud.update(solicitudData, { transaction });
          }
        }
      }
      await transaction.commit();
      return { updated: muestras.length, mensaje: `${muestras.length} placas actualizadas` };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async getArrayByMuestra(id_muestra: number) {
    const muestra = await this.muestraRepo.findById(id_muestra);
    if (!muestra) {
      throw new NotFoundError(`Muestra con ID ${id_muestra} no encontrada`);
    }
    if (!muestra.tipo_array) {
      throw new BadRequestError(`La muestra ${id_muestra} no es de tipo placa`);
    }
    return this.muestraArrayRepo.findByMuestraId(id_muestra);
  }

  async assignArrayCodigosExternos(
    id_muestra: number,
    pares: { posicion_placa: string; cod_externo: string; observaciones?: string }[]
  ) {
    const muestra = await this.muestraRepo.findById(id_muestra);
    if (!muestra) {
      throw new NotFoundError(`Muestra con ID ${id_muestra} no encontrada`);
    }
    if (!muestra.tipo_array) {
      throw new BadRequestError(`La muestra ${id_muestra} no es de tipo placa`);
    }
    const updated = await this.muestraArrayRepo.assignCodigosExternosByPosicion(
      id_muestra,
      pares
    );
    if (updated === 0) {
      throw new NotFoundError(
        'No se encontraron posiciones de placa con las posiciones indicadas'
      );
    }
    return { updated, mensaje: `${updated} posiciones actualizadas correctamente` };
  }

  async getMuestrasStats() {
    return this.muestraRepo.getMuestrasStats();
  }

  async getCodigoEpi() {
    const { year, value } = await this.getNextSequenceValue();
    const codigo = this.formatCodigoEpi(year, value);

    return {
      codigo_epi: codigo,
      secuencia: value,
      year,
    };
  }

  private async getNextSequenceValue(): Promise<NextCounterValue> {
    const now = new Date();
    const currentYear = now.getFullYear();
    return this.contadorRepo.getNextValue('muestra', currentYear);
  }

  private formatCodigoEpi(year: number, sequence: number): string {
    const configuredDigits = Number(
      process.env.CODIGO_EPI_SEQUENCE_DIGITS ?? '5'
    );
    const digits =
      Number.isFinite(configuredDigits) && configuredDigits >= 4
        ? Math.min(configuredDigits, 8)
        : 5;
    const yearPrefix = year.toString().slice(-2);
    const paddedSequence = sequence.toString().padStart(digits, '0');

    return `${yearPrefix}.${paddedSequence}`;
  }
}
