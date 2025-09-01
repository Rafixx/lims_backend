import {
  WorklistRepository,
  TecnicasPorProceso,
} from '../repositories/worklist.repository';
import { Tecnica } from '../models/Tecnica';
import { DimTecnicaProc } from '../models/DimTecnicaProc';

/**
 * Interfaz para estadísticas del worklist
 */
export interface WorklistStats {
  totalPendientes: number;
  procesosPendientes: number;
  tecnicasPorProceso: TecnicasPorProceso[];
}

/**
 * Servicio para manejar la lógica de negocio del worklist
 */
export class WorklistService {
  private worklistRepository: WorklistRepository;

  constructor() {
    this.worklistRepository = new WorklistRepository();
  }

  /**
   * Obtiene todas las técnicas pendientes
   * @returns Promise<Tecnica[]> Lista de técnicas pendientes
   */
  async getTecnicasPendientes(): Promise<Tecnica[]> {
    try {
      return await this.worklistRepository.getTecnicasPendientes();
    } catch (error) {
      console.error('Error en servicio al obtener técnicas pendientes:', error);
      throw new Error('No se pudieron obtener las técnicas pendientes');
    }
  }

  /**
   * Obtiene técnicas agrupadas por proceso con conteos
   * @returns Promise<TecnicasPorProceso[]> Lista de técnicas agrupadas por proceso
   */
  async getTecnicasAgrupadasPorProceso(): Promise<TecnicasPorProceso[]> {
    try {
      return await this.worklistRepository.getTecnicasAgrupadasPorProceso();
    } catch (error) {
      console.error('Error en servicio al obtener técnicas agrupadas:', error);
      throw new Error(
        'No se pudieron obtener las técnicas agrupadas por proceso'
      );
    }
  }

  /**
   * Obtiene técnicas pendientes con información del proceso incluida
   * @returns Promise<Tecnica[]> Lista de técnicas pendientes con datos del proceso
   */
  async getTecnicasPendientesConProceso(): Promise<Tecnica[]> {
    try {
      return await this.worklistRepository.getTecnicasPendientesConProceso();
    } catch (error) {
      console.error(
        'Error en servicio al obtener técnicas con proceso:',
        error
      );
      throw new Error(
        'No se pudieron obtener las técnicas con información del proceso'
      );
    }
  }

  /**
   * Obtiene técnicas pendientes para un proceso específico
   * @param idTecnicaProc ID del proceso de técnica
   * @returns Promise<Tecnica[]> Lista de técnicas pendientes para el proceso
   */
  async getTecnicasPendientesPorProceso(
    idTecnicaProc: number
  ): Promise<Tecnica[]> {
    try {
      if (!idTecnicaProc || idTecnicaProc <= 0) {
        throw new Error('ID de proceso de técnica inválido');
      }

      return await this.worklistRepository.getTecnicasPendientesPorProceso(
        idTecnicaProc
      );
    } catch (error) {
      console.error(
        `Error en servicio al obtener técnicas para proceso ${idTecnicaProc}:`,
        error
      );
      throw new Error(
        `No se pudieron obtener las técnicas para el proceso ${idTecnicaProc}`
      );
    }
  }

  /**
   * Obtiene estadísticas completas del worklist
   * @returns Promise<WorklistStats> Estadísticas del worklist
   */
  async getWorklistStats(): Promise<WorklistStats> {
    try {
      const [totalPendientes, procesosPendientes, tecnicasPorProceso] =
        await Promise.all([
          this.worklistRepository.getConteoTecnicasPendientes(),
          this.worklistRepository.getProcesosPendientes(),
          this.worklistRepository.getTecnicasAgrupadasPorProceso(),
        ]);

      return {
        totalPendientes,
        procesosPendientes: procesosPendientes.length,
        tecnicasPorProceso,
      };
    } catch (error) {
      console.error(
        'Error en servicio al obtener estadísticas del worklist:',
        error
      );
      throw new Error('No se pudieron obtener las estadísticas del worklist');
    }
  }

  /**
   * Obtiene procesos que tienen técnicas pendientes
   * @returns Promise<DimTecnicaProc[]> Lista de procesos con técnicas pendientes
   */
  async getProcesosPendientes(): Promise<DimTecnicaProc[]> {
    try {
      return await this.worklistRepository.getProcesosPendientes();
    } catch (error) {
      console.error('Error en servicio al obtener procesos pendientes:', error);
      throw new Error('No se pudieron obtener los procesos pendientes');
    }
  }

  /**
   * Obtiene el conteo total de técnicas pendientes
   * @returns Promise<number> Número total de técnicas pendientes
   */
  async getConteoTecnicasPendientes(): Promise<number> {
    try {
      return await this.worklistRepository.getConteoTecnicasPendientes();
    } catch (error) {
      console.error(
        'Error en servicio al obtener conteo de técnicas pendientes:',
        error
      );
      throw new Error('No se pudo obtener el conteo de técnicas pendientes');
    }
  }

  /**
   * Valida si existe un proceso específico con técnicas pendientes
   * @param idTecnicaProc ID del proceso de técnica
   * @returns Promise<boolean> true si el proceso tiene técnicas pendientes
   */
  async existeProcesoConTecnicasPendientes(
    idTecnicaProc: number
  ): Promise<boolean> {
    try {
      const tecnicas =
        await this.worklistRepository.getTecnicasPendientesPorProceso(
          idTecnicaProc
        );
      return tecnicas.length > 0;
    } catch (error) {
      console.error(
        `Error en servicio al validar proceso ${idTecnicaProc}:`,
        error
      );
      return false;
    }
  }
}

// Exportar instancia singleton del servicio
export const worklistService = new WorklistService();
