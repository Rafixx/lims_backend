import { DimEstado } from '../models/DimEstado';
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';

// Tipos para los modelos que pueden cambiar de estado
type ModeloConEstado = Muestra | Tecnica;

// Interface para los datos de actualización
interface DatosActualizacionEstado {
  id_estado: number;
  fecha_estado: Date;
  comentarios?: string;
}

// Interface genérica para modelos con estado
interface ModeloConIdEstado {
  id_estado?: number;
  update(values: Partial<DatosActualizacionEstado>): Promise<ModeloConIdEstado>;
}

export class EstadoService {
  // Obtener estados por entidad
  async getEstadosPorEntidad(
    entidad: 'MUESTRA' | 'TECNICA'
  ): Promise<DimEstado[]> {
    return DimEstado.findAll({
      where: {
        entidad,
        activo: true,
      },
      order: [
        ['orden', 'ASC'],
        ['estado', 'ASC'],
      ],
    });
  }

  // Obtener estado inicial de una entidad
  async getEstadoInicial(
    entidad: 'MUESTRA' | 'TECNICA'
  ): Promise<DimEstado | null> {
    return DimEstado.findOne({
      where: {
        entidad,
        es_inicial: true,
        activo: true,
      },
    });
  }

  // Validar transición de estado
  async validarTransicion(
    entidad: string,
    estadoOrigenId: number,
    estadoDestinoId: number
  ): Promise<boolean> {
    const [estadoOrigen, estadoDestino] = await Promise.all([
      DimEstado.findOne({ where: { id: estadoOrigenId, entidad } }),
      DimEstado.findOne({ where: { id: estadoDestinoId, entidad } }),
    ]);

    if (!estadoOrigen || !estadoDestino) return false;

    // Lógica de transición: solo se puede avanzar o retroceder un nivel
    const ordenOrigen = estadoOrigen.orden || 0;
    const ordenDestino = estadoDestino.orden || 0;

    return Math.abs(ordenDestino - ordenOrigen) <= 1;
  }

  // Cambiar estado de una entidad
  private async cambiarEstadoGenerico<T extends ModeloConIdEstado>(
    modelo: { findByPk(id: number): Promise<T | null> },
    id: number,
    nuevoEstadoId: number,
    entidad: 'MUESTRA' | 'TECNICA',
    comentario?: string
  ): Promise<T> {
    const registro = await modelo.findByPk(id);
    if (!registro) {
      throw new Error(`${entidad} no encontrada`);
    }

    // Validar que el nuevo estado existe y está activo
    const nuevoEstado = await DimEstado.findOne({
      where: {
        id: nuevoEstadoId,
        entidad,
        activo: true,
      },
    });

    if (!nuevoEstado) {
      throw new Error(
        `Estado con ID ${nuevoEstadoId} no válido para ${entidad}`
      );
    }

    // Validar transición si hay estado actual
    if (registro.id_estado) {
      const puedeTransicionar = await this.validarTransicion(
        entidad,
        registro.id_estado,
        nuevoEstadoId
      );
      if (!puedeTransicionar) {
        throw new Error(
          `Transición no permitida desde estado actual a ${nuevoEstado.estado || 'estado desconocido'}`
        );
      }
    }

    // Preparar datos de actualización con tipado fuerte
    const datosActualizacion: DatosActualizacionEstado = {
      id_estado: nuevoEstadoId,
      fecha_estado: new Date(),
    };

    // Añadir comentario solo si el modelo lo soporta y se proporciona
    if (comentario && 'comentarios' in registro) {
      datosActualizacion.comentarios = comentario;
    }

    await registro.update(datosActualizacion);
    return registro;
  }

  // Type guard para verificar si el modelo tiene comentarios
  private tieneComentarios(
    registro: ModeloConEstado
  ): registro is Muestra | Tecnica {
    return 'comentarios' in registro;
  }

  // Método público para cambiar estado de muestra
  async cambiarEstadoMuestra(
    id: number,
    nuevoEstadoId: number,
    comentario?: string
  ): Promise<Muestra> {
    return this.cambiarEstadoGenerico<Muestra>(
      Muestra,
      id,
      nuevoEstadoId,
      'MUESTRA',
      comentario
    );
  }

  // Método público para cambiar estado de técnica
  async cambiarEstadoTecnica(
    id: number,
    nuevoEstadoId: number,
    comentario?: string
  ): Promise<Tecnica> {
    return this.cambiarEstadoGenerico<Tecnica>(
      Tecnica,
      id,
      nuevoEstadoId,
      'TECNICA',
      comentario
    );
  }

  // Obtener estados disponibles para transición
  async getEstadosDisponibles(
    entidad: 'MUESTRA' | 'TECNICA',
    estadoActualId?: number
  ): Promise<DimEstado[]> {
    const todosLosEstados = await this.getEstadosPorEntidad(entidad);

    if (!estadoActualId) {
      return todosLosEstados;
    }

    // Filtrar estados a los que se puede transicionar
    const estadosPermitidos: DimEstado[] = [];

    for (const estado of todosLosEstados) {
      const puedeTransicionar = await this.validarTransicion(
        entidad,
        estadoActualId,
        estado.id
      );
      if (puedeTransicionar || estado.id === estadoActualId) {
        estadosPermitidos.push(estado);
      }
    }

    return estadosPermitidos;
  }
}
