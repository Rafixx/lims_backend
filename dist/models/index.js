"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = initModels;
// src/models/index.ts
const Solicitud_1 = require("./Solicitud");
const Muestra_1 = require("./Muestra");
const Tecnica_1 = require("./Tecnica");
const Worklist_1 = require("./Worklist");
const DimCliente_1 = require("./DimCliente");
const DimPrueba_1 = require("./DimPrueba");
const DimTecnicaProc_1 = require("./DimTecnicaProc");
const DimPlantillaTecnica_1 = require("./DimPlantillaTecnica");
const Usuario_1 = require("./Usuario");
const Rol_1 = require("./Rol");
const DimTipoMuestra_1 = require("./DimTipoMuestra");
const DimUbicacion_1 = require("./DimUbicacion");
const DimPaciente_1 = require("./DimPaciente");
const DimPipeta_1 = require("./DimPipeta");
const DimMaquina_1 = require("./DimMaquina");
const DimReactivo_1 = require("./DimReactivo");
const DimCentro_1 = require("./DimCentro");
const DimCriterioValidacion_1 = require("./DimCriterioValidacion");
const DimEstado_1 = require("./DimEstado");
function initModels(sequelize) {
    // 1) Init
    Solicitud_1.Solicitud.initModel(sequelize);
    Muestra_1.Muestra.initModel(sequelize);
    Tecnica_1.Tecnica.initModel(sequelize);
    Worklist_1.Worklist.initModel(sequelize);
    DimCliente_1.DimCliente.initModel(sequelize);
    DimPrueba_1.DimPrueba.initModel(sequelize);
    DimTecnicaProc_1.DimTecnicaProc.initModel(sequelize);
    DimPlantillaTecnica_1.DimPlantillaTecnica.initModel(sequelize);
    Usuario_1.Usuario.initModel(sequelize);
    Rol_1.Rol.initModel(sequelize);
    DimTipoMuestra_1.DimTipoMuestra.initModel(sequelize);
    DimUbicacion_1.DimUbicacion.initModel(sequelize);
    DimPaciente_1.DimPaciente.initModel(sequelize);
    DimPipeta_1.DimPipeta.initModel(sequelize);
    DimMaquina_1.DimMaquina.initModel(sequelize);
    DimReactivo_1.DimReactivo.initModel(sequelize);
    DimCentro_1.DimCentro.initModel(sequelize);
    DimCriterioValidacion_1.DimCriterioValidacion.initModel(sequelize);
    DimEstado_1.DimEstado.initModel(sequelize);
    // 2) Ahora sí construye el map de clases
    const models = {
        Solicitud: Solicitud_1.Solicitud,
        Muestra: Muestra_1.Muestra,
        Tecnica: Tecnica_1.Tecnica,
        Worklist: Worklist_1.Worklist,
        DimCliente: DimCliente_1.DimCliente,
        DimPrueba: DimPrueba_1.DimPrueba,
        DimTecnicaProc: DimTecnicaProc_1.DimTecnicaProc,
        DimPlantillaTecnica: DimPlantillaTecnica_1.DimPlantillaTecnica,
        Usuario: Usuario_1.Usuario,
        Rol: Rol_1.Rol,
        DimTipoMuestra: DimTipoMuestra_1.DimTipoMuestra,
        DimUbicacion: DimUbicacion_1.DimUbicacion,
        DimPaciente: DimPaciente_1.DimPaciente,
        DimPipeta: DimPipeta_1.DimPipeta,
        DimMaquina: DimMaquina_1.DimMaquina,
        DimReactivo: DimReactivo_1.DimReactivo,
        DimCentro: DimCentro_1.DimCentro,
        DimCriterioValidacion: DimCriterioValidacion_1.DimCriterioValidacion,
        DimEstado: DimEstado_1.DimEstado,
    };
    // 3) Asociaciones
    Object.values(models).forEach((m) => {
        if (typeof m.associate === 'function') {
            m.associate(models);
        }
    });
    return models;
}
