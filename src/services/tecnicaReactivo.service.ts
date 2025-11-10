import { TecnicaReactivo } from '../models/TecnicaReactivo';
import { sequelize } from '../config/db.config';

export interface CreateTecnicaReactivoDTO {
  id_tecnica?: number;
  id_reactivo?: number;
  volumen?: string;
  lote?: string;
  created_by?: number;
}

export interface BatchUpdateItem {
  id?: number; // ID de tecnicas_reactivos (si existe)
  id_tecnica?: number; // ID de la técnica (si es creación)
  id_reactivo?: number; // ID del reactivo (si es creación)
  lote?: string;
  volumen?: string;
  created_by?: number;
  updated_by?: number;
}

export interface BatchUpdateResult {
  success: boolean;
  updated: number;
  created: number;
  failed: number;
  results: Array<{
    id?: number;
    status: 'updated' | 'created' | 'error';
    error?: string;
  }>;
}

export class TecnicaReactivoService {
  async getAllTecnicaReactivos(): Promise<TecnicaReactivo[]> {
    return TecnicaReactivo.findAll({
      where: { delete_dt: null },
    });
  }

  async getTecnicaReactivoById(id: number): Promise<TecnicaReactivo> {
    const tecnicaReactivo = await TecnicaReactivo.findByPk(id);
    if (!tecnicaReactivo) {
      throw new Error('Técnica-Reactivo no encontrada');
    }
    return tecnicaReactivo;
  }

  async createTecnicaReactivo(
    data: CreateTecnicaReactivoDTO
  ): Promise<TecnicaReactivo> {
    return TecnicaReactivo.create(data);
  }

  async updateTecnicaReactivo(
    id: number,
    data: Partial<CreateTecnicaReactivoDTO>
  ): Promise<TecnicaReactivo> {
    const tecnicaReactivo = await TecnicaReactivo.findByPk(id);
    if (!tecnicaReactivo) {
      throw new Error('Técnica-Reactivo no encontrada');
    }
    return tecnicaReactivo.update(data);
  }

  async deleteTecnicaReactivo(id: number): Promise<void> {
    const tecnicaReactivo = await TecnicaReactivo.findByPk(id);
    if (!tecnicaReactivo) {
      throw new Error('Técnica-Reactivo no encontrada');
    }
    await tecnicaReactivo.destroy();
  }

  /**
   * Actualiza o crea múltiples registros de TecnicaReactivo en una sola transacción
   * @param updates Array de registros a actualizar o crear
   * @returns Resultado del batch update con estadísticas
   */
  async batchUpdateTecnicasReactivos(
    updates: BatchUpdateItem[]
  ): Promise<BatchUpdateResult> {
    const transaction = await sequelize.transaction();

    const result: BatchUpdateResult = {
      success: false,
      updated: 0,
      created: 0,
      failed: 0,
      results: [],
    };

    try {
      for (const item of updates) {
        try {
          // Si tiene ID, es una actualización
          if (item.id) {
            const tecnicaReactivo = await TecnicaReactivo.findByPk(item.id, {
              transaction,
            });

            if (tecnicaReactivo) {
              await tecnicaReactivo.update(
                {
                  lote: item.lote,
                  volumen: item.volumen,
                  updated_by: item.updated_by,
                },
                { transaction }
              );

              result.updated++;
              result.results.push({
                id: item.id,
                status: 'updated',
              });
            } else {
              throw new Error(
                `TecnicaReactivo con ID ${item.id} no encontrada`
              );
            }
          }
          // Si no tiene ID pero tiene id_tecnica e id_reactivo, es una creación
          else if (item.id_tecnica && item.id_reactivo) {
            // Verificar si ya existe la relación
            const existing = await TecnicaReactivo.findOne({
              where: {
                id_tecnica: item.id_tecnica,
                id_reactivo: item.id_reactivo,
                delete_dt: null,
              },
              transaction,
            });

            if (existing) {
              // Si existe, actualizarlo
              await existing.update(
                {
                  lote: item.lote,
                  volumen: item.volumen,
                  updated_by: item.updated_by,
                },
                { transaction }
              );

              result.updated++;
              result.results.push({
                id: existing.id,
                status: 'updated',
              });
            } else {
              // Si no existe, crearlo
              const newRecord = await TecnicaReactivo.create(
                {
                  id_tecnica: item.id_tecnica,
                  id_reactivo: item.id_reactivo,
                  lote: item.lote,
                  volumen: item.volumen,
                  created_by: item.created_by,
                },
                { transaction }
              );

              result.created++;
              result.results.push({
                id: newRecord.id,
                status: 'created',
              });
            }
          } else {
            throw new Error(
              'Se requiere id o (id_tecnica + id_reactivo) para cada registro'
            );
          }
        } catch (error) {
          result.failed++;
          result.results.push({
            id: item.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }

      // Si todas las operaciones fallaron, hacer rollback
      if (result.failed === updates.length) {
        await transaction.rollback();
        result.success = false;
        return result;
      }

      // Si al menos una operación tuvo éxito, hacer commit
      await transaction.commit();
      result.success = true;

      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
