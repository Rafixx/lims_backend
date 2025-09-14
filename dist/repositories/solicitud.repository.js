"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudRepository = void 0;
const Solicitud_1 = require("../models/Solicitud");
const DimCliente_1 = require("../models/DimCliente");
const DimPrueba_1 = require("../models/DimPrueba");
const Muestra_1 = require("../models/Muestra");
const Usuario_1 = require("../models/Usuario");
const DimTipoMuestra_1 = require("../models/DimTipoMuestra");
const Tecnica_1 = require("../models/Tecnica");
const DimTecnicaProc_1 = require("../models/DimTecnicaProc");
const DimPaciente_1 = require("../models/DimPaciente");
const DimCentro_1 = require("../models/DimCentro");
class SolicitudRepository {
    async findById(id) {
        return Solicitud_1.Solicitud.findByPk(id, {
            include: [
                {
                    model: Muestra_1.Muestra,
                    as: 'muestras',
                    order: [['id_muestra', 'DESC']],
                    // attributes: [],
                    include: [
                        {
                            model: Usuario_1.Usuario,
                            as: 'tecnico_resp',
                            // attributes: ['id_usuario', 'nombre', 'email'],
                        },
                        {
                            model: DimTipoMuestra_1.DimTipoMuestra,
                            as: 'tipo_muestra',
                            // attributes: ['cod_tipo_muestra', 'tipo_muestra'],
                        },
                        {
                            model: DimPaciente_1.DimPaciente,
                            as: 'paciente',
                            attributes: ['id', 'nombre'],
                        },
                        {
                            model: DimCentro_1.DimCentro,
                            as: 'centro',
                            attributes: ['id', 'codigo', 'descripcion'],
                        },
                        {
                            model: Tecnica_1.Tecnica,
                            as: 'tecnicas',
                            // attributes: [],
                            include: [
                                {
                                    model: DimTecnicaProc_1.DimTecnicaProc,
                                    as: 'tecnica_proc',
                                    // attributes: [],
                                },
                            ],
                        },
                        { model: DimPrueba_1.DimPrueba, as: 'prueba', attributes: ['id', 'prueba'] },
                    ],
                },
                { model: DimCliente_1.DimCliente, as: 'cliente', attributes: ['id', 'nombre'] },
            ],
        });
    }
    async findAll() {
        // return Solicitud.findAll();
        return Solicitud_1.Solicitud.findAll({
            include: [
                {
                    model: Muestra_1.Muestra,
                    as: 'muestras',
                    order: [['id_muestra', 'DESC']],
                    // attributes: [],
                    include: [
                        {
                            model: Usuario_1.Usuario,
                            as: 'tecnico_resp',
                            // attributes: ['id_usuario', 'nombre', 'email'],
                        },
                        {
                            model: DimTipoMuestra_1.DimTipoMuestra,
                            as: 'tipo_muestra',
                            // attributes: ['cod_tipo_muestra', 'tipo_muestra'],
                        },
                        {
                            model: DimPaciente_1.DimPaciente,
                            as: 'paciente',
                            attributes: ['id', 'nombre'],
                        },
                        {
                            model: DimCentro_1.DimCentro,
                            as: 'centro',
                            attributes: ['id', 'codigo', 'descripcion'],
                        },
                        {
                            model: Tecnica_1.Tecnica,
                            as: 'tecnicas',
                            // attributes: [],
                            include: [
                                {
                                    model: DimTecnicaProc_1.DimTecnicaProc,
                                    as: 'tecnica_proc',
                                    // attributes: [],
                                },
                            ],
                        },
                        { model: DimPrueba_1.DimPrueba, as: 'prueba', attributes: ['id', 'prueba'] },
                    ],
                },
                { model: DimCliente_1.DimCliente, as: 'cliente', attributes: ['id', 'nombre'] },
            ],
        });
    }
    async create(data) {
        return Solicitud_1.Solicitud.create(data);
    }
    async update(solicitud, data) {
        return solicitud.update(data);
    }
    async delete(solicitud) {
        return solicitud.destroy();
    }
}
exports.SolicitudRepository = SolicitudRepository;
