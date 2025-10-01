import { DimEstado } from '../models/DimEstado';

export class EstadoRepository {
  async findById(id: number) {
    return DimEstado.findByPk(id);
  }

  async findAll() {
    return DimEstado.findAll({
      where: { activo: true },
      order: [
        ['entidad', 'ASC'],
        ['orden', 'ASC'],
      ],
    });
  }

  async findByEntidad(entidad: 'MUESTRA' | 'TECNICA') {
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

  async findByEntidadAndEstado(entidad: string, estado: string) {
    return DimEstado.findOne({
      where: {
        entidad,
        estado,
        activo: true,
      },
    });
  }

  async findEstadoInicial(entidad: 'MUESTRA' | 'TECNICA') {
    return DimEstado.findOne({
      where: {
        entidad,
        es_inicial: true,
        activo: true,
      },
    });
  }

  async findEstadosFinales(entidad: 'MUESTRA' | 'TECNICA') {
    return DimEstado.findAll({
      where: {
        entidad,
        es_final: true,
        activo: true,
      },
      order: [['orden', 'ASC']],
    });
  }

  async create(data: Partial<DimEstado>) {
    return DimEstado.create(data);
  }

  async update(estado: DimEstado, data: Partial<DimEstado>) {
    return estado.update(data);
  }

  async delete(estado: DimEstado) {
    // Soft delete - marcar como inactivo
    return estado.update({ activo: false });
  }

  async activate(estado: DimEstado) {
    return estado.update({ activo: true });
  }

  // Validar si un estado puede transicionar a otro
  async canTransition(
    entidad: string,
    estadoOrigenId: number,
    estadoDestinoId: number
  ): Promise<boolean> {
    const [estadoOrigen, estadoDestino] = await Promise.all([
      this.findById(estadoOrigenId),
      this.findById(estadoDestinoId),
    ]);

    if (!estadoOrigen || !estadoDestino) return false;
    if (estadoOrigen.entidad !== entidad || estadoDestino.entidad !== entidad)
      return false;

    // Si el estado origen es final, no puede transicionar
    if (estadoOrigen.es_final) return false;

    // Lógica de transición: solo se puede avanzar o retroceder un nivel
    const ordenOrigen = estadoOrigen.orden || 0;
    const ordenDestino = estadoDestino.orden || 0;

    return Math.abs(ordenDestino - ordenOrigen) <= 1;
  }

  // Obtener estados disponibles para transición desde un estado actual
  async getEstadosDisponibles(entidad: string, estadoActualId?: number) {
    const todosLosEstados = await this.findByEntidad(
      entidad as 'MUESTRA' | 'TECNICA'
    );

    if (!estadoActualId) {
      return todosLosEstados;
    }

    const estadosPermitidos = [];

    for (const estado of todosLosEstados) {
      const puedeTransicionar = await this.canTransition(
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
