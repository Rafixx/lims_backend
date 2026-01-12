import { Muestra } from '../models/Muestra';
import { fn, col, literal } from 'sequelize';
import { Tecnica } from '../models/Tecnica';
import { TecnicaReactivo } from '../models/TecnicaReactivo';
import { Solicitud } from '../models/Solicitud';
import { MuestraArray } from '../models/MuestraArray';
import { sequelize } from '../config/db.config';
import { DimReactivoService } from '../services/dimReactivo.service';

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
  f_destruccion?: string;
  f_devolucion?: string;
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

  async create(data: CrearMuestraData) {
    const transaction = await sequelize.transaction();

    try {
      // Validar y convertir ID de cliente (obligatorio)
      if (!data.solicitud.cliente.id) {
        throw new Error('El ID del cliente es obligatorio');
      }
      const clienteId = Number(data.solicitud.cliente.id);
      if (isNaN(clienteId)) {
        throw new Error('ID de cliente debe ser un número válido');
      }
      // console.log('Data: ', data);
      // console.log('Data array_config: ', data.array_config);
      // Preparar datos de la solicitud
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
        estado_solicitud: 'REGISTRADA', // Estado por defecto para nueva solicitud
      };

      // Crear la solicitud dentro de la transacción
      const nuevaSolicitud = await Solicitud.create(solicitudData, {
        transaction,
      });

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

      // Preparar datos de la muestra con el ID de solicitud recién creado
      const muestraData = {
        id_solicitud: nuevaSolicitud.id_solicitud,
        codigo_epi: data.codigo_epi,
        codigo_externo: data.codigo_externo,
        estudio: data.estudio,
        f_toma: data.f_toma ? new Date(data.f_toma) : undefined,
        f_recepcion: data.f_recepcion ? new Date(data.f_recepcion) : undefined,
        id_tecnico_recepcion: data.id_tecnico_recepcion,
        f_destruccion: data.f_destruccion
          ? new Date(data.f_destruccion)
          : undefined,
        f_devolucion: data.f_devolucion
          ? new Date(data.f_devolucion)
          : undefined,
        estado_muestra: data.estado_muestra,
        observaciones: data.observaciones,
        id_paciente: pacienteId,
        id_tecnico_resp: tecnicoRespId,
        id_tipo_muestra: tipoMuestraId,
        id_centro_externo: centroId,
        id_criterio_val: criterioValidacionId,
        id_ubicacion: ubicacionId,
        id_prueba: pruebaId,
        tipo_array: data.array_config ? true : false, // Marcar como array si viene configuración
      };

      // Crear la muestra dentro de la transacción
      const nuevaMuestra = await Muestra.create(muestraData, { transaction });

      // Si se proporcionó configuración de array, crear posiciones y técnicas
      if (data.array_config && data.array_config.totalPositions > 0) {
        const { code, width, heightLetter } = data.array_config;

        // Validar que tengamos la técnica para crear
        if (!data.tecnicas || data.tecnicas.length === 0) {
          throw new Error(
            'Se requiere al menos una técnica para crear un array'
          );
        }

        const idTecnicaProc = Number(data.tecnicas[0].id_tecnica_proc);
        if (isNaN(idTecnicaProc)) {
          throw new Error('ID de técnica proceso debe ser un número válido');
        }

        // Generar todas las posiciones del array
        const arrayPositions = [];
        const tecnicasArray = [];

        // Convertir heightLetter a número (A=1, B=2, ..., Z=26)
        const maxLetterIndex =
          heightLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

        let positionIndex = 1;

        // Generar posiciones: primero por filas (letras), luego por columnas (números)
        for (let letterIndex = 0; letterIndex < maxLetterIndex; letterIndex++) {
          const letter = String.fromCharCode('A'.charCodeAt(0) + letterIndex);

          for (let col = 1; col <= width; col++) {
            const posicion = `${col}${letter}`; // Ejemplo: 1A, 2A, 3A, ... 7A, 1B, 2B, ...

            // Crear el registro de array
            arrayPositions.push({
              id_muestra: nuevaMuestra.id_muestra,
              id_posicion: positionIndex,
              codigo_placa: code,
              posicion_placa: posicion,
              f_creacion: new Date(),
            });

            positionIndex++;
          }
        }

        // Crear todos los registros de MuestraArray en batch
        const createdArrays = await MuestraArray.bulkCreate(arrayPositions, {
          transaction,
          returning: true, // Para obtener los IDs generados
        });

        console.log(
          `✅ Creados ${createdArrays.length} registros de MuestraArray`
        );
        console.log(
          'Primeros 3 IDs generados:',
          createdArrays.slice(0, 3).map((a) => ({
            id_array: a.id_array,
            posicion: a.posicion_placa,
          }))
        );

        // Verificar que se generaron los IDs
        if (createdArrays.length === 0 || !createdArrays[0].id_array) {
          throw new Error(
            'No se pudieron obtener los IDs de los arrays creados'
          );
        }

        // Crear las técnicas asociadas a cada posición del array
        for (const arrayRecord of createdArrays) {
          if (!arrayRecord.id_array) {
            console.error('⚠️ Array sin ID:', arrayRecord);
            throw new Error(
              `No se pudo obtener el ID del array para la posición ${arrayRecord.posicion_placa}`
            );
          }

          tecnicasArray.push({
            id_muestra: nuevaMuestra.id_muestra,
            id_array: arrayRecord.id_array,
            id_tecnica_proc: idTecnicaProc,
            id_estado: 8,
            fecha_estado: new Date(),
            comentarios: data.tecnicas[0].comentarios || undefined,
            f_creacion: new Date(),
          });
        }

        console.log(
          `✅ Preparadas ${tecnicasArray.length} técnicas con id_array`
        );
        console.log(
          'Primeras 3 técnicas:',
          tecnicasArray.slice(0, 3).map((t) => ({
            id_array: t.id_array,
            id_tecnica_proc: t.id_tecnica_proc,
          }))
        );

        // Crear todas las técnicas del array en batch
        const tecnicasCreadas = await Tecnica.bulkCreate(tecnicasArray, {
          transaction,
          returning: true,
        });
        console.log('✅ Técnicas del array creadas exitosamente');

        // Crear TecnicasReactivos para cada técnica creada
        const tecnicasReactivosData: Array<{
          id_tecnica: number;
          id_reactivo: number;
          created_by?: number;
        }> = [];

        // Obtener los id_tecnica_proc únicos
        const uniqueTecnicaProcs = [
          ...new Set(tecnicasArray.map((t) => t.id_tecnica_proc)),
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

              // Solo añadir created_by si es un número válido
              const tecnicoId = data.tecnico_resp?.id_usuario;
              if (tecnicoId && typeof tecnicoId === 'number') {
                registro.created_by = tecnicoId;
              } else if (tecnicoId && typeof tecnicoId === 'string') {
                const parsedId = Number(tecnicoId);
                if (!isNaN(parsedId)) {
                  registro.created_by = parsedId;
                }
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
            `✅ Creados ${tecnicasReactivosData.length} registros de TecnicasReactivos para array`
          );
        }
      } else if (data.tecnicas && data.tecnicas.length > 0) {
        // Si NO es array, crear técnicas normales (lógica original)
        const tecnicasData = data.tecnicas.map((tecnica) => {
          // Validar y convertir id_tecnica_proc
          const idTecnicaProc = Number(tecnica.id_tecnica_proc);
          if (isNaN(idTecnicaProc)) {
            throw new Error(
              `ID de técnica proceso debe ser un número válido: ${tecnica.id_tecnica_proc}`
            );
          }

          return {
            id_muestra: nuevaMuestra.id_muestra,
            id_tecnica_proc: idTecnicaProc,
            id_estado: 8,
            fecha_estado: new Date(),
            comentarios: tecnica.comentarios || undefined,
            f_creacion: new Date(),
          };
        });

        // Crear todas las técnicas de una vez dentro de la transacción
        const tecnicasCreadas = await Tecnica.bulkCreate(tecnicasData, {
          transaction,
          returning: true,
        });

        // Crear TecnicasReactivos para cada técnica creada
        const tecnicasReactivosData: Array<{
          id_tecnica: number;
          id_reactivo: number;
          created_by?: number;
        }> = [];

        // Obtener los id_tecnica_proc únicos
        const uniqueTecnicaProcs = [
          ...new Set(tecnicasData.map((t) => t.id_tecnica_proc)),
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

              // Solo añadir created_by si es un número válido
              const tecnicoId = data.tecnico_resp?.id_usuario;
              if (tecnicoId && typeof tecnicoId === 'number') {
                registro.created_by = tecnicoId;
              } else if (tecnicoId && typeof tecnicoId === 'string') {
                const parsedId = Number(tecnicoId);
                if (!isNaN(parsedId)) {
                  registro.created_by = parsedId;
                }
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
            `✅ Creados ${tecnicasReactivosData.length} registros de TecnicasReactivos para técnicas normales`
          );
        }
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
