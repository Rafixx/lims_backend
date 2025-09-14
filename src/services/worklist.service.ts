import {
  WorklistRepository,
  TecnicasPorProceso,
  CrearWorklistData,
  ActualizarWorklistData,
  WorklistStats,
} from '../repositories/worklist.repository';
import { Worklist } from '../models/Worklist';
import { Tecnica } from '../models/Tecnica';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';

/**
 * Interfaz para los datos de entrada para crear un worklist
 */
export interface CrearWorklistInput {
  nombre?: string;
}

/**
 * Interfaz para los datos de entrada para actualizar un worklist
 */
export interface ActualizarWorklistInput {
  nombre?: string;
}

/**
 * Interfaz para asignar técnicas a un worklist
 */
export interface AsignarTecnicasInput {
  idsTecnicas: number[];
}

/**
 * Servicio para manejar la lógica de negocio de Worklist
 */
export class WorklistService {
  private worklistRepository: WorklistRepository;

  constructor() {
    this.worklistRepository = new WorklistRepository();
  }

  // ==================== OPERACIONES CRUD ====================

  /**
   * Crea un nuevo worklist
   * @param data Datos para crear el worklist
   * @param userId ID del usuario que crea el worklist
   * @returns Promise<Worklist> Worklist creado
   */
  async create(data: CrearWorklistInput, userId?: number): Promise<Worklist> {
    try {
      // Validaciones
      if (data.nombre && data.nombre.length > 20) {
        throw new BadRequestError(
          'El nombre del worklist no puede exceder 20 caracteres'
        );
      }

      const worklistData: CrearWorklistData = {
        nombre: data.nombre,
        created_by: userId,
      };

      return await this.worklistRepository.create(worklistData);
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error en servicio al crear worklist:', error);
      throw new Error('No se pudo crear el worklist');
    }
  }

  /**
   * Obtiene todos los worklists
   * @returns Promise<Worklist[]> Lista de worklists
   */
  async getAll(): Promise<Worklist[]> {
    try {
      return await this.worklistRepository.getAll();
    } catch (error) {
      console.error('Error en servicio al obtener worklists:', error);
      throw new Error('No se pudieron obtener los worklists');
    }
  }

  /**
   * Obtiene un worklist por ID
   * @param id ID del worklist
   * @returns Promise<Worklist> Worklist encontrado
   * @throws NotFoundError si no se encuentra el worklist
   */
  async getById(id: number): Promise<Worklist> {
    try {
      if (!id || id <= 0) {
        throw new BadRequestError('ID de worklist inválido');
      }

      const worklist = await this.worklistRepository.getById(id);
      if (!worklist) {
        throw new NotFoundError('Worklist no encontrado');
      }

      return worklist;
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error en servicio al obtener worklist por ID:', error);
      throw new Error('No se pudo obtener el worklist');
    }
  }

  /**
   * Actualiza un worklist
   * @param id ID del worklist
   * @param data Datos para actualizar
   * @param userId ID del usuario que actualiza
   * @returns Promise<Worklist> Worklist actualizado
   * @throws NotFoundError si no se encuentra el worklist
   */
  async update(
    id: number,
    data: ActualizarWorklistInput,
    userId?: number
  ): Promise<Worklist> {
    try {
      if (!id || id <= 0) {
        throw new BadRequestError('ID de worklist inválido');
      }

      // Validaciones
      if (data.nombre && data.nombre.length > 20) {
        throw new BadRequestError(
          'El nombre del worklist no puede exceder 20 caracteres'
        );
      }

      const worklistData: ActualizarWorklistData = {
        nombre: data.nombre,
        updated_by: userId,
      };

      const worklistActualizado = await this.worklistRepository.update(
        id,
        worklistData
      );
      if (!worklistActualizado) {
        throw new NotFoundError('Worklist no encontrado');
      }

      return worklistActualizado;
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error en servicio al actualizar worklist:', error);
      throw new Error('No se pudo actualizar el worklist');
    }
  }

  /**
   * Elimina un worklist
   * @param id ID del worklist
   * @param userId ID del usuario que elimina
   * @returns Promise<void>
   * @throws NotFoundError si no se encuentra el worklist
   */
  async delete(id: number, userId?: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new BadRequestError('ID de worklist inválido');
      }

      // Verificar que existe antes de eliminar
      await this.getById(id);

      const eliminado = await this.worklistRepository.delete(id, userId);
      if (!eliminado) {
        throw new NotFoundError('Worklist no encontrado');
      }
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error en servicio al eliminar worklist:', error);
      throw new Error('No se pudo eliminar el worklist');
    }
  }

  // ==================== OPERACIONES ESPECÍFICAS DE WORKLIST ====================

  /**
   * Asigna técnicas a un worklist
   * @param idWorklist ID del worklist
   * @param data Datos con los IDs de las técnicas
   * @param userId ID del usuario que realiza la operación
   * @returns Promise<number> Número de técnicas asignadas
   */
  async setTecnicas(
    idWorklist: number,
    data: AsignarTecnicasInput,
    userId?: number
  ): Promise<number> {
    try {
      if (!idWorklist || idWorklist <= 0) {
        throw new BadRequestError('ID de worklist inválido');
      }

      if (
        !data.idsTecnicas ||
        !Array.isArray(data.idsTecnicas) ||
        data.idsTecnicas.length === 0
      ) {
        throw new BadRequestError(
          'Debe proporcionar al menos una técnica para asignar'
        );
      }

      // Validar que todos los IDs sean números válidos
      const idsInvalidos = data.idsTecnicas.filter((id) => !id || id <= 0);
      if (idsInvalidos.length > 0) {
        throw new BadRequestError('Algunos IDs de técnicas son inválidos');
      }

      // Verificar que el worklist existe
      await this.getById(idWorklist);

      const tecnicasAsignadas = await this.worklistRepository.setTecnicas(
        idWorklist,
        data.idsTecnicas,
        userId
      );

      return tecnicasAsignadas;
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error en servicio al asignar técnicas:', error);
      throw new Error('No se pudieron asignar las técnicas al worklist');
    }
  }

  /**
   * Remueve técnicas de un worklist
   * @param idWorklist ID del worklist
   * @param idsTecnicas IDs de las técnicas a remover (opcional)
   * @param userId ID del usuario que realiza la operación
   * @returns Promise<number> Número de técnicas removidas
   */
  async removeTecnicas(
    idWorklist: number,
    idsTecnicas?: number[],
    userId?: number
  ): Promise<number> {
    try {
      if (!idWorklist || idWorklist <= 0) {
        throw new BadRequestError('ID de worklist inválido');
      }

      // Si se proporcionan IDs específicos, validarlos
      if (idsTecnicas && Array.isArray(idsTecnicas)) {
        const idsInvalidos = idsTecnicas.filter((id) => !id || id <= 0);
        if (idsInvalidos.length > 0) {
          throw new BadRequestError('Algunos IDs de técnicas son inválidos');
        }
      }

      // Verificar que el worklist existe
      await this.getById(idWorklist);

      const tecnicasRemovidas = await this.worklistRepository.removeTecnicas(
        idWorklist,
        idsTecnicas,
        userId
      );

      return tecnicasRemovidas;
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error en servicio al remover técnicas:', error);
      throw new Error('No se pudieron remover las técnicas del worklist');
    }
  }

  /**
   * Obtiene estadísticas de un worklist
   * @param idWorklist ID del worklist
   * @returns Promise<WorklistStats> Estadísticas del worklist
   */
  async getStats(idWorklist: number): Promise<WorklistStats> {
    try {
      if (!idWorklist || idWorklist <= 0) {
        throw new BadRequestError('ID de worklist inválido');
      }

      // Verificar que el worklist existe
      await this.getById(idWorklist);

      return await this.worklistRepository.getStats(idWorklist);
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error en servicio al obtener estadísticas:', error);
      throw new Error('No se pudieron obtener las estadísticas del worklist');
    }
  }

  /**
   * Obtiene técnicas agrupadas por proceso de un worklist
   * @param idWorklist ID del worklist
   * @returns Promise<TecnicasPorProceso[]> Lista de técnicas agrupadas por proceso
   */
  async getTecnicasAgrupadasPorProceso(
    idWorklist: number
  ): Promise<TecnicasPorProceso[]> {
    try {
      if (!idWorklist || idWorklist <= 0) {
        throw new BadRequestError('ID de worklist inválido');
      }

      return await this.worklistRepository.getTecnicasAgrupadasPorProceso(
        idWorklist
      );
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error(
        'Error en servicio al obtener técnicas agrupadas por proceso:',
        error
      );
      throw new Error(
        'No se pudieron obtener las técnicas agrupadas por proceso'
      );
    }
  }

  /**
   * Obtiene técnicas sin asignar a ningún worklist
   * @returns Promise<Tecnica[]> Lista de técnicas sin asignar
   */
  async getTecnicasSinAsignar(): Promise<Tecnica[]> {
    try {
      return await this.worklistRepository.getTecnicasSinAsignar();
    } catch (error) {
      console.error(
        'Error en servicio al obtener técnicas sin asignar:',
        error
      );
      throw new Error('No se pudieron obtener las técnicas sin asignar');
    }
  }

  /**
   * Obtiene todos los procesos de técnicas disponibles
   * @returns Promise<DimTecnicaProc[]> Lista de procesos disponibles
   */
  async getProcesosDisponibles() {
    try {
      return await this.worklistRepository.getProcesosDisponibles();
    } catch (error) {
      console.error(
        'Error en servicio al obtener procesos disponibles:',
        error
      );
      throw new Error('No se pudieron obtener los procesos disponibles');
    }
  }
}

// Exportar instancia singleton del servicio
export const worklistService = new WorklistService();
