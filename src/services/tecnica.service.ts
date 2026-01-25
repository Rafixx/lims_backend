import {
  TecnicaRepository,
  TecnicaConMuestra,
  WorklistStats,
} from '../repositories/tecnica.repository';
import { DimReactivoService } from './dimReactivo.service';
import { TecnicaReactivoService } from './tecnicaReactivo.service';

interface CreateTecnicaDTO {
  id_muestra: number;
  id_tecnica_proc: number;
  id_tecnico_resp: number;
  fecha_inicio_tec?: Date;
  estado?: string;
  comentarios?: string;
}

export class TecnicaService {
  constructor(
    private readonly tecnicaRepo = new TecnicaRepository(),
    private readonly dimReactivoService = new DimReactivoService(),
    private readonly tecnicaReactivoService = new TecnicaReactivoService()
  ) {}

  async getAllTecnicas() {
    return this.tecnicaRepo.findAll();
  }

  async getTecnicaById(id: number) {
    const tecnica = await this.tecnicaRepo.findById(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    return tecnica;
  }

  async getTecnicaByMuestraId(id_muestra: number) {
    if (!id_muestra) {
      throw new Error('ID de muestra no proporcionado');
    }
    const tecnicas = await this.tecnicaRepo.findByMuestraId(id_muestra);
    if (!tecnicas) {
      throw new Error('Técnica no encontrada');
    }
    return tecnicas.map((tecnica) => ({
      id: tecnica.tecnica_proc?.id,
      tecnica_proc: tecnica.tecnica_proc?.tecnica_proc,
    }));
  }

  /**
   * Obtiene técnicas agrupadas por proceso para una muestra
   * Si la muestra es de tipo array, devuelve técnicas agrupadas con resumen de estados
   * Si NO es de tipo array, devuelve todas las técnicas normalmente
   * @param id_muestra ID de la muestra
   * @returns Promise con técnicas agrupadas o normales según el tipo de muestra
   */
  async getTecnicasByMuestraIdAgrupadas(id_muestra: number) {
    if (!id_muestra || id_muestra <= 0) {
      throw new Error('ID de muestra inválido');
    }

    try {
      return await this.tecnicaRepo.findByMuestraIdAgrupadas(id_muestra);
    } catch (error) {
      console.error('Error al obtener técnicas agrupadas:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Error al obtener técnicas de la muestra'
      );
    }
  }

  async createTecnica(data: CreateTecnicaDTO) {
    // 1. Crear la técnica
    const nuevaTecnica = await this.tecnicaRepo.create({
      ...data,
      fecha_inicio_tec: data.fecha_inicio_tec ?? new Date(),
      estado: data.estado ?? 'CREADA',
    });

    // 2. Obtener los reactivos asociados a la técnica de proceso
    try {
      const reactivos =
        await this.dimReactivoService.getDimReactivoByIdTecnicaProc(
          data.id_tecnica_proc
        );

      console.log('Reactivos obtenidos para la técnica de proceso:', reactivos);
      // 3. Crear registros en TecnicasReactivos para cada reactivo
      if (reactivos && reactivos.length > 0) {
        const tecnicasReactivosPromises = reactivos.map((reactivo) =>
          this.tecnicaReactivoService.createTecnicaReactivo({
            id_tecnica: nuevaTecnica.id_tecnica,
            id_reactivo: reactivo.id,
            // volumen: reactivo.volumen_formula || undefined,
            // lote: reactivo.lote || undefined,
            created_by: data.id_tecnico_resp,
          })
        );

        await Promise.all(tecnicasReactivosPromises);
      }
    } catch (error) {
      console.error('Error al crear relaciones técnica-reactivo:', error);
      // No lanzamos error para no interrumpir la creación de la técnica
      // pero registramos el problema
    }

    return nuevaTecnica;
  }

  async updateTecnica(id: number, data: Partial<CreateTecnicaDTO>) {
    const tecnica = await this.tecnicaRepo.findById(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    return this.tecnicaRepo.update(tecnica, data);
  }

  async deleteTecnica(id: number) {
    const tecnica = await this.tecnicaRepo.findById(id);
    if (!tecnica) {
      throw new Error('Técnica no encontrada');
    }
    await this.tecnicaRepo.delete(tecnica);
    return { message: 'Técnica eliminada correctamente' };
  }

  /**
   * Asigna un técnico responsable a una técnica
   * @param idTecnica ID de la técnica
   * @param idTecnicoResp ID del técnico responsable
   * @returns Promise<Tecnica> Técnica actualizada
   */
  async asignarTecnico(idTecnica: number, idTecnicoResp: number) {
    try {
      if (!idTecnica || idTecnica <= 0) {
        throw new Error('ID de técnica inválido');
      }

      if (!idTecnicoResp || idTecnicoResp <= 0) {
        throw new Error('ID de técnico inválido');
      }

      return await this.tecnicaRepo.asignarTecnico(idTecnica, idTecnicoResp);
    } catch (error) {
      console.error('Error en servicio al asignar técnico:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al asignar técnico'
      );
    }
  }

  /**
   * Inicia una técnica (cambia estado a EN_PROGRESO)
   * @param idTecnica ID de la técnica
   * @returns Promise<Tecnica> Técnica actualizada
   */
  async iniciarTecnica(idTecnica: number) {
    try {
      if (!idTecnica || idTecnica <= 0) {
        throw new Error('ID de técnica inválido');
      }

      return await this.tecnicaRepo.iniciarTecnica(idTecnica);
    } catch (error) {
      console.error('Error en servicio al iniciar técnica:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al iniciar técnica'
      );
    }
  }

  /**
   * Completa una técnica (cambia estado a COMPLETADA)
   * @param idTecnica ID de la técnica
   * @param comentarios Comentarios opcionales
   * @returns Promise<Tecnica> Técnica actualizada
   */
  async completarTecnica(idTecnica: number, comentarios?: string) {
    try {
      if (!idTecnica || idTecnica <= 0) {
        throw new Error('ID de técnica inválido');
      }

      // Validar comentarios si se proporcionan
      if (comentarios && comentarios.length > 255) {
        throw new Error('Los comentarios no pueden exceder 255 caracteres');
      }

      return await this.tecnicaRepo.completarTecnica(idTecnica, comentarios);
    } catch (error) {
      console.error('Error en servicio al completar técnica:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al completar técnica'
      );
    }
  }

  /**
   * Obtiene técnicas pendientes para un proceso específico con información de muestra
   * @param idTecnicaProc ID del proceso de técnica
   * @returns Promise<TecnicaConMuestra[]> Lista de técnicas con información de muestra
   */
  async getTecnicasPendientesPorProceso(
    idTecnicaProc: number
  ): Promise<TecnicaConMuestra[]> {
    try {
      if (!idTecnicaProc || idTecnicaProc <= 0) {
        throw new Error('ID de proceso de técnica inválido');
      }

      return await this.tecnicaRepo.getTecnicasConMuestra(idTecnicaProc);
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
   * Obtiene todas las técnicas con información de muestra
   * @returns Promise<TecnicaConMuestra[]> Lista de técnicas con información de muestra
   */
  async getTecnicasConMuestra(): Promise<TecnicaConMuestra[]> {
    try {
      return await this.tecnicaRepo.getTecnicasConMuestra();
    } catch (error) {
      console.error(
        'Error en servicio al obtener técnicas con muestra:',
        error
      );
      throw new Error(
        'No se pudieron obtener las técnicas con información de muestra'
      );
    }
  }

  /**
   * Obtiene estadísticas del worklist calculadas en backend
   * @returns Promise<WorklistStats> Estadísticas del worklist
   */
  async getWorklistStatsCalculadas(): Promise<WorklistStats> {
    try {
      return await this.tecnicaRepo.getWorklistStatsCalculadas();
    } catch (error) {
      console.error('Error en servicio al obtener estadísticas:', error);
      throw new Error('No se pudieron obtener las estadísticas del worklist');
    }
  }

  /**
   * Valida si una técnica existe y está en estado válido para operaciones
   * @param idTecnica ID de la técnica
   * @returns Promise<boolean> true si la técnica existe y es válida
   */
  async validarTecnicaParaOperacion(idTecnica: number): Promise<boolean> {
    try {
      const tecnica = await this.tecnicaRepo.findById(idTecnica);

      if (!tecnica) {
        return false;
      }

      // Verificar que la técnica no esté eliminada
      if (tecnica.delete_dt) {
        return false;
      }

      // Verificar que no esté en estado final
      if (tecnica.estado === 'COMPLETADA' || tecnica.estado === 'CANCELADA') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al validar técnica:', error);
      return false;
    }
  }

  /**
   * Marca técnicas como resultado erróneo para permitir volver a seleccionarlas
   * @param idsTecnicas Array de IDs de técnicas (1..n)
   * @param idWorklist ID del worklist asociado
   * @returns Promise<{ success: boolean; updated: number; errors: string[] }>
   */
  async marcarResultadoErroneo(
    idsTecnicas: number[],
    idWorklist: number
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    if (!idsTecnicas || idsTecnicas.length === 0) {
      return {
        success: false,
        updated: 0,
        errors: ['Se requiere al menos un ID de técnica'],
      };
    }

    if (!idWorklist || idWorklist <= 0) {
      return {
        success: false,
        updated: 0,
        errors: ['Se requiere un ID de worklist válido'],
      };
    }

    // Validar que todos los IDs sean números válidos
    const idsInvalidos = idsTecnicas.filter(
      (id) => !Number.isInteger(id) || id <= 0
    );
    if (idsInvalidos.length > 0) {
      return {
        success: false,
        updated: 0,
        errors: [`IDs de técnica inválidos: ${idsInvalidos.join(', ')}`],
      };
    }

    return this.tecnicaRepo.marcarResultadoErroneo(idsTecnicas, idWorklist);
  }

  /**
   * Obtiene técnicas pendientes de externalización
   * Filtra técnicas que:
   * - No están asignadas a un worklist (id_worklist = NULL)
   * - No están en estado final (COMPLETADA, CANCELADA, etc.)
   * @returns Promise con lista de técnicas pendientes de externalización
   */
  async getTecnicasPendientesExternalizacion() {
    try {
      return await this.tecnicaRepo.findPendientesExternalizacion();
    } catch (error) {
      console.error(
        'Error en servicio al obtener técnicas pendientes de externalización:',
        error
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Error al obtener técnicas pendientes de externalización'
      );
    }
  }
}
