import { Muestra } from '../models/Muestra';
import { CreationAttributes, fn, col, literal } from 'sequelize';
import { Tecnica } from '../models/Tecnica';
import { Solicitud } from '../models/Solicitud';

interface MuestraStats {
  total: number;
  pendientes: number;
  en_proceso: number;
  completadas: number;
  vencidas: number;
  creadas_hoy: number;
  completadas_hoy: number;
}

export class MuestraRepository {
  async findById(id: number) {
    return Muestra.scope('withRefs').findByPk(id);
  }

  async findAll() {
    return Muestra.scope('withRefs').findAll();
  }

  async findTecnicasById(id_muestra: number) {
    return Muestra.findByPk(id_muestra, {
      attributes: ['id_muestra'],
      include: [
        {
          model: Tecnica.scope('withRefs'),
          as: 'tecnicas',
          separate: true, // <-- evita cartesian explosion
          limit: 100, // defensivo; o pagina si procede
        },
      ],
    });
  }

  async create(data: CreationAttributes<Muestra>) {
    return Muestra.create(data);
  }

  async update(muestra: Muestra, data: Partial<Muestra>) {
    return muestra.update(data);
  }

  async delete(muestra: Muestra) {
    return muestra.destroy();
  }

  async getMuestrasStats(): Promise<MuestraStats> {
    const rows = await Muestra.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'total'],
        [
          fn(
            'SUM',
            literal(`CASE WHEN estado_muestra='PENDIENTE' THEN 1 ELSE 0 END`)
          ),
          'pendientes',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN estado_muestra IN ('EN_PROCESO','PROCESANDO') THEN 1 ELSE 0 END`
            )
          ),
          'en_proceso',
        ],
        [
          fn(
            'SUM',
            literal(`CASE WHEN estado_muestra='COMPLETADA' THEN 1 ELSE 0 END`)
          ),
          'completadas',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN f_compromiso < NOW() AT TIME ZONE 'Europe/Madrid' AND estado_muestra <> 'COMPLETADA' THEN 1 ELSE 0 END`
            )
          ),
          'vencidas',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN DATE(f_creacion AT TIME ZONE 'Europe/Madrid') = CURRENT_DATE AT TIME ZONE 'Europe/Madrid' THEN 1 ELSE 0 END`
            )
          ),
          'creadas_hoy',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN estado_muestra='COMPLETADA' AND DATE(f_resultado AT TIME ZONE 'Europe/Madrid') = CURRENT_DATE AT TIME ZONE 'Europe/Madrid' THEN 1 ELSE 0 END`
            )
          ),
          'completadas_hoy',
        ],
      ],
      include: [
        {
          model: Solicitud,
          as: 'solicitud',
          attributes: [],
          required: false,
        },
      ],
      where: literal('"Muestra"."delete_dt" IS NULL'),
      raw: true,
    });

    const r = rows[0] as unknown as Record<string, string | number>;
    return {
      total: Number(r.total) || 0,
      pendientes: Number(r.pendientes) || 0,
      en_proceso: Number(r.en_proceso) || 0,
      completadas: Number(r.completadas) || 0,
      vencidas: Number(r.vencidas) || 0,
      creadas_hoy: Number(r.creadas_hoy) || 0,
      completadas_hoy: Number(r.completadas_hoy) || 0,
    };
  }
}
