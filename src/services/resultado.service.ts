import { Resultado } from '../models/Resultado';
import {
  ResultadoRepository,
  CreateResultadoDTO,
  UpdateResultadoDTO,
} from '../repositories/resultado.repository';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';

export class ResultadoService {
  private resultadoRepository: ResultadoRepository;

  constructor() {
    this.resultadoRepository = new ResultadoRepository();
  }

  /**
   * Obtener todos los resultados
   */
  async getAllResultados(): Promise<Resultado[]> {
    return this.resultadoRepository.findAll();
  }

  /**
   * Obtener un resultado por ID
   */
  async getResultadoById(id: number): Promise<Resultado> {
    const resultado = await this.resultadoRepository.findById(id);

    if (!resultado) {
      throw new NotFoundError(`Resultado con ID ${id} no encontrado`);
    }

    return resultado;
  }

  /**
   * Obtener todos los resultados de una muestra
   */
  async getResultadosByMuestra(id_muestra: number): Promise<Resultado[]> {
    if (!id_muestra || id_muestra <= 0) {
      throw new BadRequestError('ID de muestra inválido');
    }

    return this.resultadoRepository.findByMuestra(id_muestra);
  }

  /**
   * Obtener todos los resultados de una técnica
   */
  async getResultadosByTecnica(id_tecnica: number): Promise<Resultado[]> {
    if (!id_tecnica || id_tecnica <= 0) {
      throw new BadRequestError('ID de técnica inválido');
    }

    return this.resultadoRepository.findByTecnica(id_tecnica);
  }

  /**
   * Crear un nuevo resultado
   */
  async createResultado(data: CreateResultadoDTO): Promise<Resultado> {
    // Validaciones
    if (!data.id_muestra || data.id_muestra <= 0) {
      throw new BadRequestError('ID de muestra es requerido');
    }

    if (!data.id_tecnica || data.id_tecnica <= 0) {
      throw new BadRequestError('ID de técnica es requerido');
    }

    // Validar que al menos uno de los campos de valor esté presente
    if (!data.valor && !data.valor_texto && !data.valor_fecha) {
      throw new BadRequestError(
        'Debe proporcionar al menos un tipo de valor (valor, valor_texto o valor_fecha)'
      );
    }

    return this.resultadoRepository.create(data);
  }

  /**
   * Actualizar un resultado existente
   */
  async updateResultado(
    id: number,
    data: UpdateResultadoDTO
  ): Promise<Resultado> {
    if (!id || id <= 0) {
      throw new BadRequestError('ID de resultado inválido');
    }

    // Verificar que existe
    await this.getResultadoById(id);

    return this.resultadoRepository.update(id, data);
  }

  /**
   * Eliminar un resultado (soft delete)
   */
  async deleteResultado(id: number, updated_by?: number): Promise<void> {
    if (!id || id <= 0) {
      throw new BadRequestError('ID de resultado inválido');
    }

    // Verificar que existe
    await this.getResultadoById(id);

    await this.resultadoRepository.delete(id, updated_by);
  }

  /**
   * Crear múltiples resultados en batch
   */
  async createResultadosBatch(
    resultados: CreateResultadoDTO[]
  ): Promise<Resultado[]> {
    if (!resultados || resultados.length === 0) {
      throw new BadRequestError('Debe proporcionar al menos un resultado');
    }

    // Validar cada resultado
    resultados.forEach((res, index) => {
      if (!res.id_muestra || res.id_muestra <= 0) {
        throw new BadRequestError(
          `Resultado en posición ${index}: ID de muestra requerido`
        );
      }

      if (!res.id_tecnica || res.id_tecnica <= 0) {
        throw new BadRequestError(
          `Resultado en posición ${index}: ID de técnica requerido`
        );
      }

      if (!res.valor && !res.valor_texto && !res.valor_fecha) {
        throw new BadRequestError(
          `Resultado en posición ${index}: Debe tener al menos un valor`
        );
      }
    });

    return this.resultadoRepository.createBatch(resultados);
  }

  // ============ MÉTODOS DE ANÁLISIS Y VALIDACIÓN (SIN IMPLEMENTAR) ============

  /**
   * Validar un resultado
   */
  // async validarResultado(
  //   _id: number,
  //   _validado_by?: number
  // ): Promise<Resultado> {
  //   // TODO: Implementar
  //   // - Verificar que existe
  //   // - Marcar como validado
  //   // - Establecer f_validacion
  //   // - Verificar rango si aplica
  //   throw new Error('Método no implementado');
  // }

  /**
   * Validar múltiples resultados
   */
  // async validarResultadosBatch(
  //   _ids: number[],
  //   _validado_by?: number
  // ): Promise<void> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados pendientes de validación
   */
  // async getResultadosPendientesValidacion(): Promise<Resultado[]> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados fuera de rango
   */
  // async getResultadosFueraDeRango(): Promise<Resultado[]> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Verificar si un resultado está dentro de rango
   */
  // async verificarRango(
  //   _id: number
  // ): Promise<{ dentro_rango: boolean; mensaje?: string }> {
  //   // TODO: Implementar
  //   // - Obtener resultado
  //   // - Obtener criterios de validación de la técnica
  //   // - Comparar valor con rangos
  //   // - Actualizar campo dentro_rango
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener estadísticas de resultados por muestra
   */
  // async getEstadisticasPorMuestra(_id_muestra: number): Promise<{
  //   total: number;
  //   validados: number;
  //   pendientes: number;
  //   fuera_rango: number;
  // }> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener estadísticas de resultados por técnica
   */
  // async getEstadisticasPorTecnica(_id_tecnica: number): Promise<{
  //   total: number;
  //   validados: number;
  //   pendientes: number;
  //   fuera_rango: number;
  // }> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Obtener resultados agrupados por tipo
   */
  // async getResultadosAgrupadosPorTipo(): Promise<Record<string, Resultado[]>> {
  //   // TODO: Implementar
  //   throw new Error('Método no implementado');
  // }

  /**
   * Generar reporte de resultados
   */
  //   async generarReporte(_filtros: {
  //     id_muestra?: number;
  //     id_tecnica?: number;
  //     fecha_inicio?: Date;
  //     fecha_fin?: Date;
  //     solo_validados?: boolean;
  //     solo_fuera_rango?: boolean;
  //   }): Promise<Resultado[]> {
  //     // TODO: Implementar
  //     throw new Error('Método no implementado');
  //   }
}
