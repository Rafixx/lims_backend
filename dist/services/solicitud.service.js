"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudService = void 0;
const db_config_1 = require("../config/db.config");
const Solicitud_1 = require("../models/Solicitud");
const Muestra_1 = require("../models/Muestra");
const Tecnica_1 = require("../models/Tecnica");
// import { DimTecnicaProc } from '../models/DimTecnicaProc';
const solicitud_repository_1 = require("../repositories/solicitud.repository");
const helper_1 = require("../utils/helper");
class SolicitudService {
    constructor(solicitudRepo = new solicitud_repository_1.SolicitudRepository()) {
        this.solicitudRepo = solicitudRepo;
    }
    // async createSolicitud(data: CreateSolicitudDTO) {
    //   return this.solicitudRepo.create({
    //     ...data,
    //     f_creacion: data.f_creacion ?? new Date(),
    //   });
    // }
    // async createSolicitudWithTecnicas(data: CreateSolicitudDTO) {
    async createSolicitud(data) {
        return db_config_1.sequelize.transaction(async (t) => {
            const solicitud = await Solicitud_1.Solicitud.create({
                num_solicitud: data.num_solicitud,
                id_cliente: data.id_cliente,
                f_entrada: (0, helper_1.parseDate)(data.f_entrada),
                condiciones_envio: data.condiciones_envio,
                tiempo_hielo: data.tiempo_hielo,
                estado_solicitud: 'NUEVA',
                f_compromiso: (0, helper_1.parseDate)(data.f_compromiso),
                f_entrega: (0, helper_1.parseDate)(data.f_entrega),
                f_resultado: (0, helper_1.parseDate)(data.f_resultado),
                // f_creacion: new Date(),
                created_by: data.updated_by,
                updated_by: data.updated_by,
            }, { transaction: t });
            const tecnicasPromises = [];
            for (const muestraData of data.muestra ?? []) {
                const nuevaMuestra = await Muestra_1.Muestra.create({
                    id_solicitud: solicitud.id_solicitud,
                    id_prueba: muestraData.id_prueba,
                    codigo_epi: muestraData.codigo_epi,
                    codigo_externo: muestraData.codigo_externo,
                    id_paciente: muestraData.id_paciente,
                    id_tipo_muestra: muestraData.id_tipo_muestra,
                    id_ubicacion: muestraData.id_ubicacion,
                    id_centro_externo: muestraData.id_centro_externo,
                    id_criterio_val: muestraData.id_criterio_val,
                    id_tecnico_resp: muestraData.id_tecnico_resp,
                    f_toma: (0, helper_1.parseDate)(muestraData.f_toma),
                    f_recepcion: (0, helper_1.parseDate)(muestraData.f_recepcion),
                    f_destruccion: (0, helper_1.parseDate)(muestraData.f_destruccion),
                    f_devolucion: (0, helper_1.parseDate)(muestraData.f_devolucion),
                    created_by: data.updated_by,
                    updated_by: data.updated_by,
                }, { transaction: t });
                const tecnicas = (muestraData.tecnicas ?? []).map((tp) => Tecnica_1.Tecnica.create({
                    id_muestra: nuevaMuestra.id_muestra,
                    id_tecnica_proc: tp.id_tecnica_proc,
                    estado: 'PENDIENTE',
                    fecha_estado: new Date(),
                    created_by: data.updated_by,
                    updated_by: data.updated_by,
                }, { transaction: t }));
                tecnicasPromises.push(...tecnicas);
            }
            await Promise.all(tecnicasPromises);
            return solicitud;
        });
    }
    async getSolicitudById(id) {
        const solicitud = await this.solicitudRepo.findById(id);
        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }
        return solicitud;
    }
    async getAllSolicitudes() {
        return this.solicitudRepo.findAll();
    }
    async updateSolicitud(id, data) {
        return db_config_1.sequelize.transaction(async (t) => {
            const solicitud = await Solicitud_1.Solicitud.findByPk(id, { transaction: t });
            if (!solicitud)
                throw new Error('Solicitud no encontrada');
            // 1. Actualizar datos de la solicitud
            await solicitud.update({
                num_solicitud: data.num_solicitud,
                id_cliente: data.id_cliente,
                f_entrada: (0, helper_1.parseDate)(data.f_entrada),
                condiciones_envio: data.condiciones_envio,
                tiempo_hielo: data.tiempo_hielo,
                updated_by: data.updated_by,
            }, { transaction: t });
            // 2. Eliminar muestras existentes (cascada eliminará técnicas si está configurado)
            const muestrasAntiguas = await Muestra_1.Muestra.findAll({
                where: { id_solicitud: id },
                transaction: t,
            });
            // Marcar muestras como ANULADAS antes de eliminarlas
            for (const m of muestrasAntiguas) {
                await m.update({
                    estado_muestra: 'ANULADA',
                    updated_by: data.updated_by,
                }, { transaction: t });
                await Tecnica_1.Tecnica.destroy({
                    where: { id_muestra: m.id_muestra },
                    transaction: t,
                });
                await m.destroy({ transaction: t });
            }
            // 3. Crear nuevas muestras y técnicas
            const nuevasTecnicas = [];
            for (const muestraData of data.muestra ?? []) {
                const nuevaMuestra = await Muestra_1.Muestra.create({
                    id_solicitud: solicitud.id_solicitud,
                    id_prueba: muestraData.id_prueba,
                    codigo_epi: muestraData.codigo_epi,
                    codigo_externo: muestraData.codigo_externo,
                    id_paciente: muestraData.id_paciente,
                    id_tipo_muestra: muestraData.id_tipo_muestra,
                    id_ubicacion: muestraData.id_ubicacion,
                    id_centro_externo: muestraData.id_centro_externo,
                    id_criterio_val: muestraData.id_criterio_val,
                    id_tecnico_resp: muestraData.id_tecnico_resp,
                    f_toma: (0, helper_1.parseDate)(muestraData.f_toma),
                    f_recepcion: (0, helper_1.parseDate)(muestraData.f_recepcion),
                    f_destruccion: (0, helper_1.parseDate)(muestraData.f_destruccion),
                    f_devolucion: (0, helper_1.parseDate)(muestraData.f_devolucion),
                    created_by: data.updated_by,
                    updated_by: data.updated_by,
                }, { transaction: t });
                for (const tecnica of muestraData.tecnicas ?? []) {
                    nuevasTecnicas.push(Tecnica_1.Tecnica.create({
                        id_muestra: nuevaMuestra.id_muestra,
                        id_tecnica_proc: tecnica.id_tecnica_proc,
                        estado: 'PENDIENTE',
                        fecha_estado: new Date(),
                        created_by: data.updated_by,
                        updated_by: data.updated_by,
                    }, { transaction: t }));
                }
            }
            await Promise.all(nuevasTecnicas);
            return solicitud;
        });
    }
    async deleteSolicitud(id) {
        const solicitud = await this.solicitudRepo.findById(id);
        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }
        await this.solicitudRepo.delete(solicitud);
        return { message: 'Solicitud eliminada correctamente' };
    }
}
exports.SolicitudService = SolicitudService;
