"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TecnicaRepository = void 0;
const sequelize_1 = require("sequelize");
const DimTecnicaProc_1 = require("../models/DimTecnicaProc");
const Muestra_1 = require("../models/Muestra");
const Tecnica_1 = require("../models/Tecnica");
const Usuario_1 = require("../models/Usuario");
const DimTipoMuestra_1 = require("../models/DimTipoMuestra");
const DimEstado_1 = require("../models/DimEstado");
class TecnicaRepository {
    async findById(id) {
        return Tecnica_1.Tecnica.findByPk(id, {
            include: [
                {
                    model: DimEstado_1.DimEstado,
                    as: 'estadoInfo',
                    attributes: ['id', 'estado', 'color', 'descripcion'],
                    where: { entidad: 'TECNICA' },
                    required: false,
                },
                {
                    model: DimTecnicaProc_1.DimTecnicaProc,
                    as: 'tecnica_proc',
                    attributes: ['id', 'tecnica_proc'],
                },
                {
                    model: Muestra_1.Muestra,
                    as: 'muestra',
                    attributes: ['id_muestra', 'codigo_epi', 'codigo_externo'],
                },
            ],
        });
    }
    async findByMuestraId(id_muestra) {
        return Tecnica_1.Tecnica.findAll({
            where: { id_muestra },
            include: [
                {
                    model: DimEstado_1.DimEstado,
                    as: 'estadoInfo',
                    attributes: ['id', 'estado', 'color', 'descripcion'],
                    where: { entidad: 'TECNICA' },
                    required: false,
                },
                {
                    model: DimTecnicaProc_1.DimTecnicaProc,
                    as: 'tecnica_proc',
                    attributes: ['id', 'tecnica_proc'],
                },
            ],
        });
    }
    // async findBySolicitudId(id_solicitud: number) {
    //   return Tecnica.findAll({
    //     attributes: [],
    //     include: [
    //       {
    //         model: DimTecnicaProc,
    //         as: 'tecnica_proc',
    //         attributes: ['id', 'tecnica_proc'],
    //       },
    //       {
    //         model: Muestra,
    //         where: { id_solicitud },
    //         as: 'muestra',
    //         attributes: [],
    //       },
    //     ],
    //   });
    // }
    async findAll() {
        return Tecnica_1.Tecnica.findAll({
            include: [
                {
                    model: DimEstado_1.DimEstado,
                    as: 'estadoInfo',
                    attributes: ['id', 'estado', 'color', 'descripcion'],
                    where: { entidad: 'TECNICA' },
                    required: false,
                },
                {
                    model: DimTecnicaProc_1.DimTecnicaProc,
                    as: 'tecnica_proc',
                    attributes: ['id', 'tecnica_proc'],
                },
                {
                    model: Muestra_1.Muestra,
                    as: 'muestra',
                    attributes: ['id_muestra', 'codigo_epi', 'codigo_externo'],
                },
            ],
        });
    }
    async create(data) {
        return Tecnica_1.Tecnica.create(data);
    }
    async update(tecnica, data) {
        return tecnica.update(data);
    }
    async delete(tecnica) {
        return tecnica.destroy();
    }
    /**
     * Asigna un técnico responsable a una técnica
     * @param idTecnica ID de la técnica
     * @param idTecnicoResp ID del técnico responsable
     * @returns Promise<Tecnica> Técnica actualizada
     */
    async asignarTecnico(idTecnica, idTecnicoResp) {
        try {
            const tecnica = await Tecnica_1.Tecnica.findByPk(idTecnica);
            if (!tecnica) {
                throw new Error('Técnica no encontrada');
            }
            // Verificar que el técnico existe
            const tecnico = await Usuario_1.Usuario.findByPk(idTecnicoResp);
            if (!tecnico) {
                throw new Error('Técnico no encontrado');
            }
            await tecnica.update({
                id_tecnico_resp: idTecnicoResp,
                fecha_estado: new Date(),
            });
            return tecnica;
        }
        catch (error) {
            console.error('Error al asignar técnico:', error);
            throw new Error('Error al asignar técnico a la técnica');
        }
    }
    /**
     * Inicia una técnica (cambia estado a EN_PROGRESO)
     * @param idTecnica ID de la técnica
     * @returns Promise<Tecnica> Técnica actualizada
     */
    async iniciarTecnica(idTecnica) {
        try {
            const tecnica = await Tecnica_1.Tecnica.findByPk(idTecnica);
            if (!tecnica) {
                throw new Error('Técnica no encontrada');
            }
            if (tecnica.estado !== 'PENDIENTE') {
                throw new Error(`No se puede iniciar una técnica en estado ${tecnica.estado}`);
            }
            await tecnica.update({
                estado: 'EN_PROGRESO',
                fecha_inicio_tec: new Date(),
                fecha_estado: new Date(),
            });
            return tecnica;
        }
        catch (error) {
            console.error('Error al iniciar técnica:', error);
            throw new Error('Error al iniciar la técnica');
        }
    }
    /**
     * Completa una técnica (cambia estado a COMPLETADA)
     * @param idTecnica ID de la técnica
     * @param comentarios Comentarios opcionales
     * @returns Promise<Tecnica> Técnica actualizada
     */
    async completarTecnica(idTecnica, comentarios) {
        try {
            const tecnica = await Tecnica_1.Tecnica.findByPk(idTecnica);
            if (!tecnica) {
                throw new Error('Técnica no encontrada');
            }
            if (tecnica.estado !== 'EN_PROGRESO') {
                throw new Error(`No se puede completar una técnica en estado ${tecnica.estado}`);
            }
            const updateData = {
                estado: 'COMPLETADA',
                fecha_estado: new Date(),
            };
            if (comentarios) {
                updateData.comentarios = comentarios;
            }
            await tecnica.update(updateData);
            return tecnica;
        }
        catch (error) {
            console.error('Error al completar técnica:', error);
            throw new Error('Error al completar la técnica');
        }
    }
    /**
     * Obtiene técnicas con información completa de muestra
     * @param idTecnicaProc ID del proceso (opcional)
     * @returns Promise<TecnicaConMuestra[]> Lista de técnicas con información de muestra
     */
    async getTecnicasConMuestra(idTecnicaProc) {
        try {
            const whereCondition = {
                delete_dt: { [sequelize_1.Op.is]: null },
            };
            if (idTecnicaProc) {
                whereCondition.id_tecnica_proc = idTecnicaProc;
                whereCondition.estado = 'PENDIENTE';
            }
            const resultado = await Tecnica_1.Tecnica.findAll({
                attributes: [
                    'id_tecnica',
                    'id_muestra',
                    'id_tecnica_proc',
                    'id_tecnico_resp',
                    'estado',
                    'id_estado',
                    'fecha_inicio_tec',
                    'fecha_estado',
                    'comentarios',
                ],
                include: [
                    {
                        model: DimEstado_1.DimEstado,
                        as: 'estadoInfo',
                        attributes: ['id', 'estado', 'color', 'descripcion'],
                        where: { entidad: 'TECNICA' },
                        required: false,
                    },
                    {
                        model: DimTecnicaProc_1.DimTecnicaProc,
                        as: 'tecnica_proc',
                        attributes: ['tecnica_proc', 'descripcion'],
                        required: true,
                    },
                    {
                        model: Muestra_1.Muestra,
                        as: 'muestra',
                        attributes: ['id', 'codigo_muestra'],
                        required: false,
                        include: [
                            {
                                model: DimTipoMuestra_1.DimTipoMuestra,
                                as: 'tipo_muestra',
                                attributes: ['tipo_muestra'],
                                required: false,
                            },
                        ],
                    },
                    {
                        model: Usuario_1.Usuario,
                        as: 'tecnico',
                        attributes: ['nombre', 'apellido'],
                        required: false,
                    },
                ],
                where: whereCondition,
                order: [['id_tecnica_proc', 'ASC']],
            });
            return resultado.map((tecnica) => ({
                id: tecnica.id_tecnica,
                id_muestra: tecnica.id_muestra,
                id_tecnica_proc: tecnica.id_tecnica_proc,
                id_tecnico_resp: tecnica.id_tecnico_resp,
                estado: tecnica.estado || '',
                fecha_inicio_tec: tecnica.fecha_inicio_tec?.toISOString(),
                fecha_estado: tecnica.fecha_estado?.toISOString(),
                comentarios: tecnica.comentarios,
                proceso_nombre: tecnica.tecnica_proc?.tecnica_proc || '',
                proceso_descripcion: tecnica.tecnica_proc?.descripcion,
                codigo_muestra: tecnica.muestra?.codigo_muestra,
                tipo_muestra: tecnica.muestra?.tipo_muestra?.tipo_muestra,
                tecnico_responsable: tecnica.tecnico
                    ? `${tecnica.tecnico.nombre} ${tecnica.tecnico.apellido}`
                    : undefined,
            }));
        }
        catch (error) {
            console.error('Error al obtener técnicas con muestra:', error);
            throw new Error('Error al obtener técnicas con información de muestra');
        }
    }
    /**
     * Obtiene estadísticas completas del worklist calculadas en backend
     * @returns Promise<WorklistStats> Estadísticas del worklist
     */
    async getWorklistStatsCalculadas() {
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(hoy.getDate() + 1);
            // Consultas paralelas para mejor rendimiento
            const [totalPendientes, totalEnProgreso, totalCompletadasHoy, tecnicasPorProceso, procesosPendientes,] = await Promise.all([
                // Total pendientes
                Tecnica_1.Tecnica.count({
                    where: {
                        estado: 'PENDIENTE',
                        delete_dt: { [sequelize_1.Op.is]: null },
                    },
                }),
                // Total en progreso
                Tecnica_1.Tecnica.count({
                    where: {
                        estado: 'EN_PROGRESO',
                        delete_dt: { [sequelize_1.Op.is]: null },
                    },
                }),
                // Total completadas hoy
                Tecnica_1.Tecnica.count({
                    where: {
                        estado: 'COMPLETADA',
                        fecha_estado: {
                            [sequelize_1.Op.gte]: hoy,
                            [sequelize_1.Op.lt]: mañana,
                        },
                        delete_dt: { [sequelize_1.Op.is]: null },
                    },
                }),
                // Técnicas agrupadas por proceso
                Tecnica_1.Tecnica.findAll({
                    attributes: [
                        'id_tecnica_proc',
                        [(0, sequelize_1.col)('tecnica_proc.tecnica_proc'), 'tecnica_proc'],
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('Tecnica.id_tecnica_proc')), 'count'],
                    ],
                    include: [
                        {
                            model: DimTecnicaProc_1.DimTecnicaProc,
                            as: 'tecnica_proc',
                            attributes: [],
                            required: true,
                        },
                    ],
                    where: {
                        estado: 'PENDIENTE',
                        delete_dt: { [sequelize_1.Op.is]: null },
                    },
                    group: ['Tecnica.id_tecnica_proc', 'tecnica_proc.tecnica_proc'],
                    order: [['id_tecnica_proc', 'ASC']],
                    raw: true,
                }),
                // Procesos únicos con técnicas pendientes
                Tecnica_1.Tecnica.findAll({
                    attributes: [
                        [(0, sequelize_1.fn)('DISTINCT', (0, sequelize_1.col)('id_tecnica_proc')), 'id_tecnica_proc'],
                    ],
                    where: {
                        estado: 'PENDIENTE',
                        delete_dt: { [sequelize_1.Op.is]: null },
                    },
                    raw: true,
                }),
            ]);
            return {
                totalPendientes,
                procesosPendientes: procesosPendientes.length,
                total_tecnicas_en_progreso: totalEnProgreso,
                total_tecnicas_completadas_hoy: totalCompletadasHoy,
                promedio_tiempo_procesamiento: null, // Se puede calcular por separado si es necesario
                tecnicasPorProceso: tecnicasPorProceso.map((item) => {
                    const tecnicaItem = item;
                    return {
                        id_tecnica_proc: tecnicaItem.id_tecnica_proc,
                        tecnica_proc: tecnicaItem.tecnica_proc,
                        count: parseInt(tecnicaItem.count),
                    };
                }),
            };
        }
        catch (error) {
            console.error('Error al calcular estadísticas del worklist:', error);
            throw new Error('Error al calcular estadísticas del worklist');
        }
    }
}
exports.TecnicaRepository = TecnicaRepository;
