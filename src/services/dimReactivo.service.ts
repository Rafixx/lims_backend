// src/services/dimReactivos.service.ts
import { DimReactivo } from '../models/DimReactivo';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { DimPlantillaTecnica } from '../models/DimPlantillaTecnica';

export interface CreateDimReactivoDTO {
  num_referencia?: string;
  reactivo: string;
  lote?: string;
  volumen_formula?: string;
  activa?: boolean;
  created_by?: number;
  id_plantilla_tecnica?: number;
}

export class DimReactivoService {
  async getAllDimReactivos(): Promise<DimReactivo[]> {
    return DimReactivo.findAll();
  }

  async getDimReactivoById(id: number): Promise<DimReactivo> {
    const reactivo = await DimReactivo.findByPk(id);
    if (!reactivo) {
      throw new Error('Reactivo no encontrado');
    }
    return reactivo;
  }

  async getDimReactivoByIdTecnicaProc(
    id_tecnica_proc: number
  ): Promise<DimReactivo[]> {
    if (!id_tecnica_proc) {
      throw new Error('ID de técnica de proceso no proporcionado');
    }

    // SELECT dr.*
    // FROM lims_pre.dim_tecnicas_proc dtp
    // INNER JOIN dim_plantilla_tecnica dpt ON dtp.id_plantilla_tecnica = dpt.id
    // INNER JOIN dim_reactivos dr ON dpt.id = dr.id_plantilla_tecnica
    // WHERE dtp.id = :id_tecnica_proc

    const tecnicaProc = await DimTecnicaProc.findByPk(id_tecnica_proc, {
      include: [
        {
          model: DimPlantillaTecnica,
          as: 'plantillaTecnica',
          include: [
            {
              model: DimReactivo,
              as: 'dimReactivos',
            },
          ],
        },
      ],
    });

    if (!tecnicaProc) {
      throw new Error(
        `Técnica de proceso con ID ${id_tecnica_proc} no encontrada`
      );
    }

    // Extraer los reactivos de la plantilla técnica
    const plantillaTecnica = (
      tecnicaProc as unknown as {
        plantillaTecnica?: { dimReactivos?: DimReactivo[] };
      }
    ).plantillaTecnica;

    const reactivos = plantillaTecnica?.dimReactivos || [];

    return reactivos;
  }

  async createDimReactivo(data: CreateDimReactivoDTO): Promise<DimReactivo> {
    return DimReactivo.create(data);
  }

  async updateDimReactivo(
    id: number,
    data: Partial<CreateDimReactivoDTO>
  ): Promise<DimReactivo> {
    const reactivo = await DimReactivo.findByPk(id);
    if (!reactivo) {
      throw new Error('Reactivo no encontrado');
    }
    return reactivo.update(data);
  }

  async deleteDimReactivo(id: number): Promise<void> {
    const reactivo = await DimReactivo.findByPk(id);
    if (!reactivo) {
      throw new Error('Reactivo no encontrado');
    }
    await reactivo.destroy();
  }
}
