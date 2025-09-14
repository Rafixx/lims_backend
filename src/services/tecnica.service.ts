import {
  TecnicaRepository,
  TecnicaConMuestra,
  WorklistStats,
} from '../repositories/tecnica.repository';

interface CreateTecnicaDTO {
  id_muestra: number;
  id_tecnica_proc: number;
  id_tecnico_resp: number;
  fecha_inicio_tec?: Date;
  estado?: string;
  comentarios?: string;
}

export class TecnicaService {
  constructor(private readonly tecnicaRepo = new TecnicaRepository()) {}

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

  // async getTecnicaBySolicitudId(id_solicitud: number) {
  //   if (!id_solicitud) {
  //     throw new Error('ID de solicitud no proporcionado');
  //   }
  //   const tecnicas = await this.tecnicaRepo.findBySolicitudId(id_solicitud);
  //   if (!tecnicas) {
  //     throw new Error('Técnica no encontrada');
  //   }
  //   return tecnicas.map((tecnica) => ({
  //     id: tecnica_proc?.id,
  //     tecnica_proc: tecnica_proc.tecnica_proc?.tecnica_proc,
  //   }));
  // }
  // async getTecnicaBySolicitudId(id_solicitud: number) {
  //   const tecnicas = await this.tecnicaRepo.findBySolicitudId(id_solicitud);

  //   return tecnicas.map((tecnica) => ({
  //     id: tecnica.tecnica_proc?.id,
  //     tecnica_proc: tecnica.tecnica_proc?.tecnica_proc,
  //   }));
  // }

  async createTecnica(data: CreateTecnicaDTO) {
    return this.tecnicaRepo.create({
      ...data,
      fecha_inicio_tec: data.fecha_inicio_tec ?? new Date(),
      estado: data.estado ?? 'CREADA',
    });
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
}
