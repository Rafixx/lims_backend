import { Muestra } from '../models/Muestra';
import { fn, col, literal, Transaction } from 'sequelize';
import { Tecnica } from '../models/Tecnica';
import { TecnicaReactivo } from '../models/TecnicaReactivo';
import { Solicitud } from '../models/Solicitud';
import { MuestraArray } from '../models/MuestraArray';
import { sequelize } from '../config/db.config';
import { DimReactivoService } from '../services/dimReactivo.service';
import { DimPruebaService } from '../services/dimPrueba.service';

// Constante para el estado inicial de las técnicas
const ESTADO_TECNICA_INICIAL = 8; // Estado: CREADA

interface MuestraStats {
  total: number;
  pendientes: number;
  en_proceso: number;
  completadas: number;
  vencidas: number;
  creadas_hoy: number;
  completadas_hoy: number;
}

interface CrearMuestraData {
  id_muestra?: number;
  codigo_epi?: string;
  codigo_externo?: string;
  estudio?: string;
  f_toma?: string;
  f_recepcion?: string;
  id_tecnico_recepcion?: number;
  id_tecnico_verifica?: number;
  f_destruccion?: string;
  f_devolucion?: string;
  f_agotada?: string;
  estado_muestra?: string;
  observaciones?: string;
  paciente?: {
    id: string | number;
    nombre?: string;
    sip?: string;
    direccion?: string;
  };
  solicitud: {
    id_solicitud?: number;
    f_creacion?: string;
    f_entrada?: string;
    f_compromiso?: string;
    f_entrega?: string;
    f_resultado?: string;
    condiciones_envio?: string;
    tiempo_hielo?: string;
    cliente: {
      id: string | number;
      nombre?: string;
      razon_social?: string;
      nif?: string;
    };
  };
  tecnico_resp?: {
    id_usuario: string | number;
    nombre?: string;
  };
  tipo_muestra?: {
    id: string | number;
    cod_tipo_muestra?: string;
    tipo_muestra?: string;
  };
  centro?: {
    id: string | number;
    codigo?: string;
    descripcion?: string;
  };
  criterio_validacion?: {
    id: number;
    codigo?: string;
    descripcion?: string;
  };
  ubicacion?: {
    id: number;
    codigo?: string;
    ubicacion?: string;
  };
  prueba?: {
    id: string | number;
    cod_prueba?: string;
    prueba?: string;
  };
  tecnicas?: Array<{
    id_tecnica_proc: string | number;
    comentarios?: string;
  }>;
  array_config?: {
    code: string;
    width: number;
    heightLetter: string;
    height: number;
    totalPositions: number;
  } | null;
}

export class MuestraRepository {
  constructor(private dimReactivoService: DimReactivoService) {}

  /**
   * Helper para parsear y validar el ID del técnico creador
   */
  private parseCreatedBy(
    tecnico_resp?: { id_usuario: string | number }
  ): number | undefined {
    if (!tecnico_resp?.id_usuario) return undefined;

    const tecnicoId =
      typeof tecnico_resp.id_usuario === 'number'
        ? tecnico_resp.id_usuario
        : Number(tecnico_resp.id_usuario);

    return isNaN(tecnicoId) ? undefined : tecnicoId;
  }

  /**
   * Crea registros de MuestraArray con las posiciones del array
   */
  private async createMuestraArray(
    idMuestra: number,
    arrayConfig: { code: string; width: number; heightLetter: string },
    getCodigoEpiFn: () => Promise<{ codigo_epi: string; secuencia: number; year: number }>,
    transaction?: Transaction
  ): Promise<MuestraArray[]> {
    const { code, width, heightLetter } = arrayConfig;
    const arrayPositions = [];

    const maxLetterIndex = heightLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    let positionIndex = 1;

    for (let letterIndex = 0; letterIndex < maxLetterIndex; letterIndex++) {
      const letter = String.fromCharCode('A'.charCodeAt(0) + letterIndex);
      for (let col = 1; col <= width; col++) {
        const colPadded = col < 10 ? `0${col}` : `${col}`;

        // Obtener un código EPI único para esta posición
        const { codigo_epi } = await getCodigoEpiFn();

        arrayPositions.push({
          id_muestra: idMuestra,
          id_posicion: positionIndex,
          codigo_placa: code,
          posicion_placa: `${colPadded}${letter}`,
          codigo_epi,
          f_creacion: new Date(),
        });
        positionIndex++;
      }
    }

    const createdArrays = await MuestraArray.bulkCreate(arrayPositions, {
      transaction,
      returning: true,
    });

    console.log(
      `✅ Creados ${createdArrays.length} registros de MuestraArray con códigos EPI únicos`
    );

    if (createdArrays.length === 0 || !createdArrays[0].id_array) {
      throw new Error('No se pudieron obtener los IDs de los arrays creados');
    }

    return createdArrays;
  }

  /**
   * Crea técnicas asociadas a posiciones de array
   * Para cada posición del array, crea una técnica por cada id_tecnica_proc
   */
  private async createTecnicasArray(
    idMuestra: number,
    arrayRecords: MuestraArray[],
    idsTecnicaProc: number[],
    transaction?: Transaction
  ): Promise<Tecnica[]> {
    const tecnicasArray: Array<{
      id_muestra: number;
      id_array: number;
      id_tecnica_proc: number;
      id_estado: number;
      fecha_estado: Date;
      f_creacion: Date;
    }> = [];

    // Para cada posición del array
    for (const arrayRecord of arrayRecords) {
      if (!arrayRecord.id_array) {
        throw new Error(
          `No se pudo obtener el ID del array para la posición ${arrayRecord.posicion_placa}`
        );
      }

      // Para cada técnica de proceso, crear una técnica
      for (const idTecnicaProc of idsTecnicaProc) {
        tecnicasArray.push({
          id_muestra: idMuestra,
          id_array: arrayRecord.id_array,
          id_tecnica_proc: idTecnicaProc,
          id_estado: ESTADO_TECNICA_INICIAL,
          fecha_estado: new Date(),
          f_creacion: new Date(),
        });
      }
    }

    const tecnicasCreadas = await Tecnica.bulkCreate(tecnicasArray, {
      transaction,
      returning: true,
    });

    console.log(
      `✅ Creadas ${tecnicasCreadas.length} técnicas del array (${arrayRecords.length} posiciones × ${idsTecnicaProc.length} técnicas/proc)`
    );

    return tecnicasCreadas;
  }

  /**
   * Crea técnicas normales (sin array)
   */
  private async createTecnicasNormales(
    idMuestra: number,
    tecnicas: Array<{ id_tecnica_proc: string | number; comentarios?: string }>,
    transaction?: Transaction
  ): Promise<Tecnica[]> {
    const tecnicasData = tecnicas.map((tecnica) => {
      const idTecnicaProc = Number(tecnica.id_tecnica_proc);
      if (isNaN(idTecnicaProc)) {
        throw new Error(
          `ID de técnica proceso debe ser un número válido: ${tecnica.id_tecnica_proc}`
        );
      }

      return {
        id_muestra: idMuestra,
        id_tecnica_proc: idTecnicaProc,
        id_estado: ESTADO_TECNICA_INICIAL,
        fecha_estado: new Date(),
        comentarios: tecnica.comentarios || undefined,
        f_creacion: new Date(),
      };
    });

    const tecnicasCreadas = await Tecnica.bulkCreate(tecnicasData, {
      transaction,
      returning: true,
    });

    console.log(`✅ Creadas ${tecnicasCreadas.length} técnicas normales`);

    return tecnicasCreadas;
  }

  /**
   * Crea los registros de TecnicasReactivos para las técnicas dadas
   * Este método elimina la duplicación entre la rama array y no-array
   */
  private async createTecnicasReactivos(
    tecnicasCreadas: Tecnica[],
    created_by?: number,
    transaction?: Transaction
  ): Promise<void> {
    const tecnicasReactivosData: Array<{
      id_tecnica: number;
      id_reactivo: number;
      created_by?: number;
    }> = [];

    // Obtener los id_tecnica_proc únicos
    const uniqueTecnicaProcs = [
      ...new Set(tecnicasCreadas.map((t) => t.id_tecnica_proc)),
    ];

    // Para cada id_tecnica_proc, obtener sus reactivos
    for (const idTecnicaProc of uniqueTecnicaProcs) {
      const reactivos =
        await this.dimReactivoService.getDimReactivoByIdTecnicaProc(
          idTecnicaProc
        );

      // Para cada técnica que tenga este id_tecnica_proc
      const tecnicasConEsteProc = tecnicasCreadas.filter(
        (t) => t.id_tecnica_proc === idTecnicaProc
      );

      // Para cada técnica, crear un registro por cada reactivo
      for (const tecnica of tecnicasConEsteProc) {
        for (const reactivo of reactivos) {
          const registro: {
            id_tecnica: number;
            id_reactivo: number;
            created_by?: number;
          } = {
            id_tecnica: tecnica.id_tecnica,
            id_reactivo: reactivo.id,
          };

          if (created_by) {
            registro.created_by = created_by;
          }

          tecnicasReactivosData.push(registro);
        }
      }
    }

    // Crear todos los TecnicasReactivos en batch
    if (tecnicasReactivosData.length > 0) {
      await TecnicaReactivo.bulkCreate(tecnicasReactivosData, {
        transaction,
      });
      console.log(
        `✅ Creados ${tecnicasReactivosData.length} registros de TecnicasReactivos`
      );
    }
  }

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

  async create(
    data: CrearMuestraData,
    getCodigoEpiFn?: () => Promise<{ codigo_epi: string; secuencia: number; year: number }>
  ) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Crear Solicitud
      // Validar y convertir ID de cliente (obligatorio)
      if (!data.solicitud.cliente.id) {
        throw new Error('El ID del cliente es obligatorio');
      }
      const clienteId = Number(data.solicitud.cliente.id);
      if (isNaN(clienteId)) {
        throw new Error('ID de cliente debe ser un número válido');
      }

      const solicitudData = {
        id_cliente: clienteId,
        f_creacion: data.solicitud.f_creacion
          ? new Date(data.solicitud.f_creacion)
          : undefined,
        f_entrada: data.solicitud.f_entrada
          ? new Date(data.solicitud.f_entrada)
          : undefined,
        f_compromiso: data.solicitud.f_compromiso
          ? new Date(data.solicitud.f_compromiso)
          : undefined,
        f_entrega: data.solicitud.f_entrega
          ? new Date(data.solicitud.f_entrega)
          : undefined,
        f_resultado: data.solicitud.f_resultado
          ? new Date(data.solicitud.f_resultado)
          : undefined,
        condiciones_envio: data.solicitud.condiciones_envio,
        tiempo_hielo: data.solicitud.tiempo_hielo,
        estado_solicitud: 'REGISTRADA',
      };

      const nuevaSolicitud = await Solicitud.create(solicitudData, {
        transaction,
      });

      // 2. Crear Muestra
      // Validar y convertir otros IDs
      const pacienteId = data.paciente?.id
        ? Number(data.paciente.id)
        : undefined;
      const tecnicoRespId = data.tecnico_resp?.id_usuario
        ? Number(data.tecnico_resp.id_usuario)
        : undefined;
      const tipoMuestraId = data.tipo_muestra?.id
        ? Number(data.tipo_muestra.id)
        : undefined;
      const centroId = data.centro?.id ? Number(data.centro.id) : undefined;
      const criterioValidacionId = data.criterio_validacion?.id || undefined;
      const ubicacionId = data.ubicacion?.id || undefined;
      const pruebaId = data.prueba?.id ? Number(data.prueba.id) : undefined;

      // Validar conversiones
      if (data.paciente?.id && isNaN(pacienteId!)) {
        throw new Error('ID de paciente debe ser un número válido');
      }
      if (data.tecnico_resp?.id_usuario && isNaN(tecnicoRespId!)) {
        throw new Error('ID de técnico responsable debe ser un número válido');
      }
      if (data.tipo_muestra?.id && isNaN(tipoMuestraId!)) {
        throw new Error('ID de tipo de muestra debe ser un número válido');
      }
      if (data.centro?.id && isNaN(centroId!)) {
        throw new Error('ID de centro debe ser un número válido');
      }
      if (data.prueba?.id && isNaN(pruebaId!)) {
        throw new Error('ID de prueba debe ser un número válido');
      }

      const muestraData = {
        id_solicitud: nuevaSolicitud.id_solicitud,
        codigo_epi: data.codigo_epi,
        codigo_externo: data.codigo_externo,
        estudio: data.estudio,
        f_toma: data.f_toma ? new Date(data.f_toma) : undefined,
        f_recepcion: data.f_recepcion ? new Date(data.f_recepcion) : undefined,
        id_tecnico_recepcion: data.id_tecnico_recepcion,
        id_tecnico_verifica: data.id_tecnico_verifica,
        f_destruccion: data.f_destruccion
          ? new Date(data.f_destruccion)
          : undefined,
        f_devolucion: data.f_devolucion
          ? new Date(data.f_devolucion)
          : undefined,
        f_agotada: data.f_agotada ? new Date(data.f_agotada) : undefined,
        estado_muestra: data.estado_muestra,
        observaciones: data.observaciones,
        id_paciente: pacienteId,
        id_tecnico_resp: tecnicoRespId,
        id_tipo_muestra: tipoMuestraId,
        id_centro_externo: centroId,
        id_criterio_val: criterioValidacionId,
        id_ubicacion: ubicacionId,
        id_prueba: pruebaId,
        tipo_array: data.array_config ? true : false,
      };

      const nuevaMuestra = await Muestra.create(muestraData, { transaction });

      // 3. Crear Técnicas (array o normales) y TecnicasReactivos
      let tecnicasCreadas: Tecnica[] = [];

      if (data.array_config && data.array_config.totalPositions > 0) {
        // Rama A: Crear técnicas para array
        // Verificar que la muestra tenga una prueba asociada
        if (!pruebaId) {
          throw new Error(
            'Se requiere una prueba asociada para crear un array'
          );
        }

        // Verificar que se haya proporcionado la función para generar códigos EPI
        if (!getCodigoEpiFn) {
          throw new Error(
            'Se requiere la función getCodigoEpi para crear arrays con códigos EPI únicos'
          );
        }

        // 3.1. Crear posiciones del array
        const createdArrays = await this.createMuestraArray(
          nuevaMuestra.id_muestra,
          data.array_config,
          getCodigoEpiFn,
          transaction
        );

        // 3.2. Obtener las técnicas de proceso de la prueba
        const dimPruebaService = new DimPruebaService();
        const tecnicasProc = await dimPruebaService.getTecnicasByPrueba(
          pruebaId
        );

        if (!tecnicasProc || tecnicasProc.length === 0) {
          throw new Error(
            `No se encontraron técnicas de proceso para la prueba con ID ${pruebaId}`
          );
        }

        const idsTecnicaProc = tecnicasProc.map((t) => t.id);

        console.log(
          `📋 Se crearán técnicas para ${idsTecnicaProc.length} procesos: ${tecnicasProc.map((t) => t.tecnica_proc).join(', ')}`
        );

        // 3.3. Crear técnicas asociadas a cada posición × cada técnica de proceso
        tecnicasCreadas = await this.createTecnicasArray(
          nuevaMuestra.id_muestra,
          createdArrays,
          idsTecnicaProc,
          transaction
        );
      } else if (data.tecnicas && data.tecnicas.length > 0) {
        // Rama B: Crear técnicas normales
        tecnicasCreadas = await this.createTecnicasNormales(
          nuevaMuestra.id_muestra,
          data.tecnicas,
          transaction
        );
      }

      // 4. Crear TecnicasReactivos (si hay técnicas creadas)
      if (tecnicasCreadas.length > 0) {
        const created_by = this.parseCreatedBy(data.tecnico_resp);
        await this.createTecnicasReactivos(
          tecnicasCreadas,
          created_by,
          transaction
        );
      }

      // Confirmar la transacción
      await transaction.commit();

      return nuevaMuestra;
    } catch (error) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  }

  async update(muestra: Muestra, data: Partial<Muestra>) {
    return muestra.update(data);
  }

  async delete(muestra: Muestra) {
    const transaction = await sequelize.transaction();

    try {
      // Si la muestra es de tipo array, eliminar lógicamente los registros de MuestraArray
      if (muestra.tipo_array) {
        await MuestraArray.destroy({
          where: { id_muestra: muestra.id_muestra },
          transaction,
        });
      }

      // Eliminar lógicamente todas las técnicas asociadas a esta muestra
      await Tecnica.destroy({
        where: { id_muestra: muestra.id_muestra },
        transaction,
      });

      // Finalmente, eliminar lógicamente la muestra
      await muestra.destroy({ transaction });

      // Confirmar la transacción
      await transaction.commit();

      return muestra;
    } catch (error) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      throw error;
    }
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
