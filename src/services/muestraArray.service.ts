import {
  MuestraArrayRepository,
  CreateMuestraArrayDTO,
  UpdateMuestraArrayDTO,
} from '../repositories/muestraArray.repository';
import { MuestraArray } from '../models/MuestraArray';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';

export class MuestraArrayService {
  private repository: MuestraArrayRepository;

  constructor() {
    this.repository = new MuestraArrayRepository();
  }

  /**
   * Obtener todos los arrays
   */
  async getAllArrays(): Promise<MuestraArray[]> {
    return this.repository.findAll();
  }

  /**
   * Obtener un array por ID
   */
  async getArrayById(id: number): Promise<MuestraArray> {
    if (!id || isNaN(id)) {
      throw new BadRequestError('ID de array inválido');
    }

    const array = await this.repository.findById(id);
    if (!array) {
      throw new NotFoundError(`Array con ID ${id} no encontrado`);
    }

    return array;
  }

  /**
   * Obtener todos los arrays de una muestra específica
   */
  async getArraysByMuestra(id_muestra: number): Promise<MuestraArray[]> {
    if (!id_muestra || isNaN(id_muestra)) {
      throw new BadRequestError('ID de muestra inválido');
    }

    return this.repository.findByMuestraId(id_muestra);
  }

  /**
   * Crear un nuevo array
   */
  async createArray(data: CreateMuestraArrayDTO): Promise<MuestraArray> {
    // Validar datos requeridos
    if (!data.id_muestra) {
      throw new BadRequestError('El ID de muestra es requerido');
    }

    // Validar posición si se proporciona
    if (data.posicion_placa) {
      const ocupada = await this.repository.isPosicionOcupada(
        data.id_muestra,
        data.posicion_placa
      );
      if (ocupada) {
        throw new BadRequestError(
          `La posición ${data.posicion_placa} ya está ocupada en la muestra ${data.id_muestra}`
        );
      }
    }

    return this.repository.create(data);
  }

  /**
   * Crear múltiples arrays en batch
   */
  async createArraysBatch(
    arrays: CreateMuestraArrayDTO[]
  ): Promise<MuestraArray[]> {
    if (!arrays || arrays.length === 0) {
      throw new BadRequestError('No se proporcionaron arrays para crear');
    }

    // Validar que todos tengan id_muestra
    const invalidArrays = arrays.filter((arr) => !arr.id_muestra);
    if (invalidArrays.length > 0) {
      throw new BadRequestError(
        'Todos los arrays deben tener un ID de muestra'
      );
    }

    // Validar que todos los arrays sean de la misma muestra
    const id_muestra = arrays[0].id_muestra;
    const differentMuestra = arrays.some(
      (arr) => arr.id_muestra !== id_muestra
    );
    if (differentMuestra) {
      throw new BadRequestError(
        'Todos los arrays en el batch deben pertenecer a la misma muestra'
      );
    }

    // Validar posiciones duplicadas en el batch
    const posiciones = arrays
      .filter((arr) => arr.posicion_placa)
      .map((arr) => arr.posicion_placa);
    const posicionesDuplicadas = posiciones.filter(
      (pos, index) => posiciones.indexOf(pos) !== index
    );
    if (posicionesDuplicadas.length > 0) {
      throw new BadRequestError(
        `Posiciones duplicadas en el batch: ${posicionesDuplicadas.join(', ')}`
      );
    }

    return this.repository.createBatch(arrays);
  }

  /**
   * Actualizar un array existente
   */
  async updateArray(
    id: number,
    data: UpdateMuestraArrayDTO
  ): Promise<MuestraArray> {
    if (!id || isNaN(id)) {
      throw new BadRequestError('ID de array inválido');
    }

    // Verificar que el array existe
    await this.getArrayById(id);

    // Si se está actualizando la posición, validar que no esté ocupada
    if (data.posicion_placa) {
      const arrayActual = await this.repository.findById(id);
      if (arrayActual && arrayActual.id_muestra) {
        // Solo validar si la posición cambió
        if (arrayActual.posicion_placa !== data.posicion_placa) {
          const ocupada = await this.repository.isPosicionOcupada(
            arrayActual.id_muestra,
            data.posicion_placa
          );
          if (ocupada) {
            throw new BadRequestError(
              `La posición ${data.posicion_placa} ya está ocupada en la muestra ${arrayActual.id_muestra}`
            );
          }
        }
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Eliminar un array (soft delete)
   */
  async deleteArray(id: number, updated_by?: number): Promise<void> {
    if (!id || isNaN(id)) {
      throw new BadRequestError('ID de array inválido');
    }

    // Verificar que el array existe
    await this.getArrayById(id);

    await this.repository.delete(id, updated_by);
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Contar arrays por muestra
   */
  async countByMuestra(id_muestra: number): Promise<number> {
    if (!id_muestra || isNaN(id_muestra)) {
      throw new BadRequestError('ID de muestra inválido');
    }

    return this.repository.countByMuestra(id_muestra);
  }

  /**
   * Obtener arrays por código de placa
   */
  async getArraysByCodigoPlaca(codigo_placa: string): Promise<MuestraArray[]> {
    if (!codigo_placa || codigo_placa.trim() === '') {
      throw new BadRequestError('Código de placa inválido');
    }

    return this.repository.findByCodigoPlaca(codigo_placa);
  }

  /**
   * Obtener arrays por número de serie
   */
  async getArraysByNumSerie(num_serie: string): Promise<MuestraArray[]> {
    if (!num_serie || num_serie.trim() === '') {
      throw new BadRequestError('Número de serie inválido');
    }

    return this.repository.findByNumSerie(num_serie);
  }

  /**
   * Verificar si una posición está ocupada
   */
  async isPosicionOcupada(
    id_muestra: number,
    posicion_placa: string
  ): Promise<boolean> {
    if (!id_muestra || isNaN(id_muestra)) {
      throw new BadRequestError('ID de muestra inválido');
    }

    if (!posicion_placa || posicion_placa.trim() === '') {
      throw new BadRequestError('Posición de placa inválida');
    }

    return this.repository.isPosicionOcupada(id_muestra, posicion_placa);
  }

  /**
   * Obtener arrays pendientes de escanear
   */
  async getPendientesEscanear(): Promise<MuestraArray[]> {
    return this.repository.findPendientesEscanear();
  }

  /**
   * Marcar arrays como enviados a escanear
   */
  async marcarEnviadosEscanear(
    ids: number[],
    updated_by?: number
  ): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestError('No se proporcionaron IDs de arrays');
    }

    // Validar que todos los IDs son válidos
    const invalidIds = ids.filter((id) => !id || isNaN(id));
    if (invalidIds.length > 0) {
      throw new BadRequestError('Algunos IDs de arrays son inválidos');
    }

    // Verificar que todos los arrays existen
    const verificaciones = await Promise.all(
      ids.map(async (id) => {
        try {
          await this.getArrayById(id);
          return { id, exists: true };
        } catch {
          return { id, exists: false };
        }
      })
    );

    const noExistentes = verificaciones
      .filter((v) => !v.exists)
      .map((v) => v.id);
    if (noExistentes.length > 0) {
      throw new NotFoundError(
        `Arrays no encontrados: ${noExistentes.join(', ')}`
      );
    }

    const fecha = new Date();
    await this.repository.updateFechaEnvioEscanear(ids, fecha, updated_by);
  }

  /**
   * Obtener estadísticas de arrays por muestra
   */
  async getEstadisticasPorMuestra(id_muestra: number): Promise<{
    total: number;
    con_codigo_placa: number;
    sin_codigo_placa: number;
    enviados_escanear: number;
    pendientes_escanear: number;
    arrays: MuestraArray[];
  }> {
    if (!id_muestra || isNaN(id_muestra)) {
      throw new BadRequestError('ID de muestra inválido');
    }

    const arrays = await this.repository.findByMuestraId(id_muestra);

    const con_codigo_placa = arrays.filter(
      (arr) => arr.codigo_placa && arr.codigo_placa.trim() !== ''
    ).length;

    const enviados_escanear = arrays.filter(
      (arr) => arr.f_envio_escanear !== null
    ).length;

    return {
      total: arrays.length,
      con_codigo_placa,
      sin_codigo_placa: arrays.length - con_codigo_placa,
      enviados_escanear,
      pendientes_escanear: arrays.length - enviados_escanear,
      arrays,
    };
  }

  /**
   * Validar estructura de placa (ejemplo: verificar que todas las posiciones estén completas)
   */
  async validarPlacaCompleta(
    id_muestra: number,
    posiciones_esperadas: string[]
  ): Promise<{
    completa: boolean;
    posiciones_faltantes: string[];
    posiciones_existentes: string[];
  }> {
    if (!id_muestra || isNaN(id_muestra)) {
      throw new BadRequestError('ID de muestra inválido');
    }

    if (!posiciones_esperadas || posiciones_esperadas.length === 0) {
      throw new BadRequestError('Se requieren las posiciones esperadas');
    }

    const arrays = await this.repository.findByMuestraId(id_muestra);
    const posiciones_existentes = arrays
      .filter((arr) => arr.posicion_placa)
      .map((arr) => arr.posicion_placa as string);

    const posiciones_faltantes = posiciones_esperadas.filter(
      (pos) => !posiciones_existentes.includes(pos)
    );

    return {
      completa: posiciones_faltantes.length === 0,
      posiciones_faltantes,
      posiciones_existentes,
    };
  }

  /**
   * Obtener arrays agrupados por código de placa
   */
  async getArraysAgrupadosPorPlaca(): Promise<Record<string, MuestraArray[]>> {
    const arrays = await this.repository.findAll();

    return arrays.reduce(
      (acc, array) => {
        const codigo = array.codigo_placa || 'SIN_CODIGO';
        if (!acc[codigo]) {
          acc[codigo] = [];
        }
        acc[codigo].push(array);
        return acc;
      },
      {} as Record<string, MuestraArray[]>
    );
  }
}
