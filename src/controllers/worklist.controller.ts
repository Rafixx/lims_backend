import { Request, Response } from 'express';
import { WorklistService } from '../services/worklist.service';

/**
 * Controlador para manejar las peticiones HTTP relacionadas con worklist
 */
export class WorklistController {
  private worklistService: WorklistService;

  constructor() {
    this.worklistService = new WorklistService();
  }

  /**
   * Obtiene todas las técnicas pendientes
   * GET /api/worklist/tecnicas-pendientes
   */
  async getTecnicasPendientes(req: Request, res: Response): Promise<void> {
    try {
      const tecnicas = await this.worklistService.getTecnicasPendientes();

      res.status(200).json({
        success: true,
        data: tecnicas,
        message: 'Técnicas pendientes obtenidas correctamente',
      });
    } catch (error) {
      console.error(
        'Error en controlador al obtener técnicas pendientes:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener técnicas pendientes',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  /**
   * Obtiene técnicas agrupadas por proceso con conteos
   * GET /api/worklist/tecnicas-agrupadas
   */
  async getTecnicasAgrupadasPorProceso(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tecnicasAgrupadas =
        await this.worklistService.getTecnicasAgrupadasPorProceso();

      res.status(200).json({
        success: true,
        data: tecnicasAgrupadas,
        message: 'Técnicas agrupadas por proceso obtenidas correctamente',
      });
    } catch (error) {
      console.error(
        'Error en controlador al obtener técnicas agrupadas:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener técnicas agrupadas',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  /**
   * Obtiene técnicas pendientes con información del proceso incluida
   * GET /api/worklist/tecnicas-con-proceso
   */
  async getTecnicasPendientesConProceso(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tecnicas =
        await this.worklistService.getTecnicasPendientesConProceso();

      res.status(200).json({
        success: true,
        data: tecnicas,
        message: 'Técnicas pendientes con proceso obtenidas correctamente',
      });
    } catch (error) {
      console.error(
        'Error en controlador al obtener técnicas con proceso:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener técnicas con proceso',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  /**
   * Obtiene técnicas pendientes para un proceso específico
   * GET /api/worklist/proceso/:idTecnicaProc/tecnicas
   */
  async getTecnicasPendientesPorProceso(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { idTecnicaProc } = req.params;
      const id = parseInt(idTecnicaProc, 10);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de proceso de técnica inválido',
        });
        return;
      }

      const tecnicas =
        await this.worklistService.getTecnicasPendientesPorProceso(id);

      res.status(200).json({
        success: true,
        data: tecnicas,
        message: `Técnicas pendientes para proceso ${id} obtenidas correctamente`,
      });
    } catch (error) {
      console.error(
        'Error en controlador al obtener técnicas por proceso:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener técnicas por proceso',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  /**
   * Obtiene estadísticas completas del worklist
   * GET /api/worklist/estadisticas
   */
  async getWorklistStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.worklistService.getWorklistStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas del worklist obtenidas correctamente',
      });
    } catch (error) {
      console.error('Error en controlador al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  /**
   * Obtiene procesos que tienen técnicas pendientes
   * GET /api/worklist/procesos-pendientes
   */
  async getProcesosPendientes(req: Request, res: Response): Promise<void> {
    try {
      const procesos = await this.worklistService.getProcesosPendientes();

      res.status(200).json({
        success: true,
        data: procesos,
        message: 'Procesos pendientes obtenidos correctamente',
      });
    } catch (error) {
      console.error(
        'Error en controlador al obtener procesos pendientes:',
        error
      );
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener procesos pendientes',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  /**
   * Obtiene el conteo total de técnicas pendientes
   * GET /api/worklist/conteo
   */
  async getConteoTecnicasPendientes(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const conteo = await this.worklistService.getConteoTecnicasPendientes();

      res.status(200).json({
        success: true,
        data: { count: conteo },
        message: 'Conteo de técnicas pendientes obtenido correctamente',
      });
    } catch (error) {
      console.error('Error en controlador al obtener conteo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener conteo',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  /**
   * Valida si existe un proceso específico con técnicas pendientes
   * GET /api/worklist/proceso/:idTecnicaProc/existe
   */
  async existeProcesoConTecnicasPendientes(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { idTecnicaProc } = req.params;
      const id = parseInt(idTecnicaProc, 10);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de proceso de técnica inválido',
        });
        return;
      }

      const existe =
        await this.worklistService.existeProcesoConTecnicasPendientes(id);

      res.status(200).json({
        success: true,
        data: { exists: existe },
        message: `Validación de proceso ${id} completada`,
      });
    } catch (error) {
      console.error('Error en controlador al validar proceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al validar proceso',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
}

// Exportar instancia singleton del controlador
export const worklistController = new WorklistController();
