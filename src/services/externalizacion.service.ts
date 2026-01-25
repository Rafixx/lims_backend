import { ExternalizacionRepository } from '../repositories/externalizacion.repository';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';
import { Tecnica } from '../models/Tecnica';

interface CreateExternalizacionDTO {
  id_tecnica: number;
  volumen?: string;
  concentracion?: string;
  id_centro?: number;
  servicio?: string;
  f_envio?: Date;
  f_recepcion?: Date;
  f_recepcion_datos?: Date;
  agencia?: string;
  id_tecnico_resp?: number;
  observaciones?: string;
  created_by?: number;
}

interface UpdateExternalizacionDTO {
  volumen?: string;
  concentracion?: string;
  id_centro?: number;
  servicio?: string;
  f_envio?: Date;
  f_recepcion?: Date;
  f_recepcion_datos?: Date;
  agencia?: string;
  id_tecnico_resp?: number;
  observaciones?: string;
  updated_by?: number;
}

export class ExternalizacionService {
  constructor(
    private readonly externalizacionRepo = new ExternalizacionRepository()
  ) {}

  /**
   * Obtiene todas las externalizaciones
   * @returns Promise<Externalizacion[]>
   */
  async getAllExternalizaciones() {
    return this.externalizacionRepo.findAll();
  }

  /**
   * Obtiene una externalización por ID
   * @param id ID de la externalización
   * @returns Promise<Externalizacion>
   */
  async getExternalizacionById(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestError('ID de externalización inválido');
    }

    const externalizacion = await this.externalizacionRepo.findById(id);
    if (!externalizacion) {
      throw new NotFoundError('Externalización no encontrada');
    }
    return externalizacion;
  }

  /**
   * Obtiene externalizaciones por ID de técnica
   * @param idTecnica ID de la técnica
   * @returns Promise<Externalizacion[]>
   */
  async getExternalizacionesByTecnicaId(idTecnica: number) {
    if (!idTecnica || idTecnica <= 0) {
      throw new BadRequestError('ID de técnica inválido');
    }

    return this.externalizacionRepo.findByTecnicaId(idTecnica);
  }

  /**
   * Obtiene externalizaciones por centro
   * @param idCentro ID del centro
   * @returns Promise<Externalizacion[]>
   */
  async getExternalizacionesByCentro(idCentro: number) {
    if (!idCentro || idCentro <= 0) {
      throw new BadRequestError('ID de centro inválido');
    }

    return this.externalizacionRepo.findByCentro(idCentro);
  }

  /**
   * Obtiene externalizaciones pendientes
   * @returns Promise<Externalizacion[]>
   */
  async getExternalizacionesPendientes() {
    return this.externalizacionRepo.findPendientes();
  }

  /**
   * Crea una nueva externalización
   * @param data Datos de la externalización
   * @returns Promise<Externalizacion>
   */
  async createExternalizacion(data: CreateExternalizacionDTO) {
    if (!data.id_tecnica) {
      throw new BadRequestError('id_tecnica es requerido');
    }

    // Validar longitud de campos opcionales
    if (data.volumen && data.volumen.length > 50) {
      throw new BadRequestError('El volumen no puede exceder 50 caracteres');
    }

    if (data.concentracion && data.concentracion.length > 50) {
      throw new BadRequestError(
        'La concentración no puede exceder 50 caracteres'
      );
    }

    if (data.servicio && data.servicio.length > 200) {
      throw new BadRequestError('El servicio no puede exceder 200 caracteres');
    }

    if (data.agencia && data.agencia.length > 100) {
      throw new BadRequestError('La agencia no puede exceder 100 caracteres');
    }

    if (data.observaciones && data.observaciones.length > 255) {
      throw new BadRequestError(
        'Las observaciones no pueden exceder 255 caracteres'
      );
    }

    return this.externalizacionRepo.create(data);
  }

  /**
   * Actualiza una externalización
   * @param id ID de la externalización
   * @param data Datos a actualizar
   * @returns Promise<Externalizacion>
   */
  async updateExternalizacion(id: number, data: UpdateExternalizacionDTO) {
    if (!id || id <= 0) {
      throw new BadRequestError('ID de externalización inválido');
    }

    const externalizacion = await this.externalizacionRepo.findById(id);
    if (!externalizacion) {
      throw new NotFoundError('Externalización no encontrada');
    }

    // Validar longitud de campos opcionales
    if (data.volumen && data.volumen.length > 50) {
      throw new BadRequestError('El volumen no puede exceder 50 caracteres');
    }

    if (data.concentracion && data.concentracion.length > 50) {
      throw new BadRequestError(
        'La concentración no puede exceder 50 caracteres'
      );
    }

    if (data.servicio && data.servicio.length > 200) {
      throw new BadRequestError('El servicio no puede exceder 200 caracteres');
    }

    if (data.agencia && data.agencia.length > 100) {
      throw new BadRequestError('La agencia no puede exceder 100 caracteres');
    }

    if (data.observaciones && data.observaciones.length > 255) {
      throw new BadRequestError(
        'Las observaciones no pueden exceder 255 caracteres'
      );
    }

    return this.externalizacionRepo.update(externalizacion, data);
  }

  /**
   * Elimina una externalización (soft delete)
   * @param id ID de la externalización
   * @returns Promise<{message: string}>
   */
  async deleteExternalizacion(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestError('ID de externalización inválido');
    }

    const externalizacion = await this.externalizacionRepo.findById(id);
    if (!externalizacion) {
      throw new NotFoundError('Externalización no encontrada');
    }

    await this.externalizacionRepo.delete(externalizacion);
    return { message: 'Externalización eliminada correctamente' };
  }

  /**
   * Marca externalizaciones como enviadas y actualiza técnicas a estado ENVIADA_EXT
   * @param ids Array de IDs de externalizaciones
   * @param data Datos de envío
   * @returns Promise con resultado de la operación
   */
  async marcarComoEnviadas(data: {
    externalizacion_ids: number[];
    f_envio: string;
    servicio?: string;
    agencia?: string;
    id_centro?: number;
    id_tecnico_resp?: number;
    observaciones?: string;
  }) {
    if (!data.externalizacion_ids || data.externalizacion_ids.length === 0) {
      throw new BadRequestError(
        'Se requiere al menos un ID de externalización'
      );
    }

    if (!data.f_envio) {
      throw new BadRequestError('La fecha de envío es requerida');
    }

    // Validar que todos los IDs sean números válidos
    const idsInvalidos = data.externalizacion_ids.filter(
      (id) => !Number.isInteger(id) || id <= 0
    );
    if (idsInvalidos.length > 0) {
      throw new BadRequestError(
        `IDs de externalización inválidos: ${idsInvalidos.join(', ')}`
      );
    }

    // Validar longitud de campos opcionales
    if (data.servicio && data.servicio.length > 200) {
      throw new BadRequestError('El servicio no puede exceder 200 caracteres');
    }

    if (data.agencia && data.agencia.length > 100) {
      throw new BadRequestError('La agencia no puede exceder 100 caracteres');
    }

    if (data.observaciones && data.observaciones.length > 255) {
      throw new BadRequestError(
        'Las observaciones no pueden exceder 255 caracteres'
      );
    }

    const result = await this.externalizacionRepo.marcarComoEnviadas(
      data.externalizacion_ids,
      {
        f_envio: new Date(data.f_envio),
        servicio: data.servicio,
        agencia: data.agencia,
        id_centro: data.id_centro,
        id_tecnico_resp: data.id_tecnico_resp,
        observaciones: data.observaciones,
      }
    );

    return {
      success: true,
      message: `${result.updated} externalizaciones marcadas como enviadas`,
      data: result.externalizaciones,
    };
  }

  /**
   * Registra la recepción de una externalización y actualiza técnica a estado RECIBIDA_EXT
   * @param id ID de la externalización
   * @param fRecepcion Fecha de recepción (opcional, usa fecha actual por defecto)
   * @param updatedBy ID del usuario que registra la recepción
   * @returns Promise<Externalizacion>
   */
  async registrarRecepcion(
    id: number,
    fRecepcion?: Date,
    updatedBy?: number
  ) {
    if (!id || id <= 0) {
      throw new BadRequestError('ID de externalización inválido');
    }

    const externalizacion = await this.externalizacionRepo.findById(id);
    if (!externalizacion) {
      throw new NotFoundError('Externalización no encontrada');
    }

    if (!externalizacion.f_envio) {
      throw new BadRequestError(
        'No se puede registrar recepción sin fecha de envío'
      );
    }

    if (externalizacion.f_recepcion) {
      throw new BadRequestError('La externalización ya ha sido recibida');
    }

    // Actualizar externalización
    const externalizacionActualizada = await this.externalizacionRepo.update(
      externalizacion,
      {
        f_recepcion: fRecepcion || new Date(),
        updated_by: updatedBy,
      }
    );

    // Actualizar estado de la técnica a RECIBIDA_EXT (id_estado = 18)
    await Tecnica.update(
      {
        id_estado: 18, // RECIBIDA_EXT
        fecha_estado: new Date(),
      },
      {
        where: { id_tecnica: externalizacion.id_tecnica },
      }
    );

    console.log(
      `✅ Técnica ${externalizacion.id_tecnica} marcada como RECIBIDA_EXT (estado 18)`
    );

    return externalizacionActualizada;
  }

  /**
   * Registra la recepción de datos de una externalización
   * @param id ID de la externalización
   * @param fRecepcionDatos Fecha de recepción de datos (opcional, usa fecha actual por defecto)
   * @param updatedBy ID del usuario que registra la recepción de datos
   * @returns Promise<Externalizacion>
   */
  async registrarRecepcionDatos(
    id: number,
    fRecepcionDatos?: Date,
    updatedBy?: number
  ) {
    if (!id || id <= 0) {
      throw new BadRequestError('ID de externalización inválido');
    }

    const externalizacion = await this.externalizacionRepo.findById(id);
    if (!externalizacion) {
      throw new NotFoundError('Externalización no encontrada');
    }

    if (!externalizacion.f_recepcion) {
      throw new BadRequestError(
        'No se pueden registrar datos sin recepción de muestra'
      );
    }

    if (externalizacion.f_recepcion_datos) {
      throw new BadRequestError('Los datos ya han sido recibidos');
    }

    return this.externalizacionRepo.update(externalizacion, {
      f_recepcion_datos: fRecepcionDatos || new Date(),
      updated_by: updatedBy,
    });
  }

  /**
   * Marca una externalización como recibida y actualiza técnica a estado RECIBIDA_EXT
   * @param id ID de la externalización
   * @param data Datos de recepción
   * @returns Promise con resultado de la operación
   */
  async marcarComoRecibida(data: {
    id: number;
    f_recepcion: string;
    observaciones?: string;
  }) {
    if (!data.id || data.id <= 0) {
      throw new BadRequestError('ID de externalización inválido');
    }

    if (!data.f_recepcion) {
      throw new BadRequestError('La fecha de recepción es requerida');
    }

    // Validar longitud de observaciones
    if (data.observaciones && data.observaciones.length > 255) {
      throw new BadRequestError(
        'Las observaciones no pueden exceder 255 caracteres'
      );
    }

    // Verificar que la externalización existe y está pendiente de recepción
    const externalizacion = await this.externalizacionRepo.findById(data.id);
    if (!externalizacion) {
      throw new NotFoundError('Externalización no encontrada');
    }

    if (!externalizacion.f_envio) {
      throw new BadRequestError(
        'No se puede registrar recepción sin fecha de envío'
      );
    }

    if (externalizacion.f_recepcion) {
      throw new BadRequestError('La externalización ya ha sido recibida');
    }

    const result = await this.externalizacionRepo.marcarComoRecibida(data.id, {
      f_recepcion: new Date(data.f_recepcion),
      observaciones: data.observaciones,
    });

    return {
      success: true,
      message: 'Externalización marcada como recibida correctamente',
      data: result,
    };
  }
}
