"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Muestra = void 0;
// src/models/Muestra.ts
const sequelize_1 = require("sequelize");
const Solicitud_1 = require("./Solicitud");
const DimPaciente_1 = require("./DimPaciente");
const Usuario_1 = require("./Usuario");
const DimTipoMuestra_1 = require("./DimTipoMuestra");
const DimCentro_1 = require("./DimCentro");
const DimCriterioValidacion_1 = require("./DimCriterioValidacion");
const DimUbicacion_1 = require("./DimUbicacion");
const DimCliente_1 = require("./DimCliente");
const DimPrueba_1 = require("./DimPrueba");
const DimEstado_1 = require("./DimEstado");
class Muestra extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id_muestra: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            id_paciente: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            id_solicitud: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { msg: 'id_solicitud es requerido' },
                    isInt: { msg: 'id_solicitud debe ser numérico' },
                },
            },
            id_prueba: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            id_tecnico_resp: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            id_tipo_muestra: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            id_centro_externo: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            id_criterio_val: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            id_ubicacion: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            tipo_array: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            codigo_epi: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                defaultValue: null,
            },
            codigo_externo: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                defaultValue: null,
            },
            f_toma: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            f_recepcion: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            f_destruccion: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            f_devolucion: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            agotada: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            estado_muestra: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                defaultValue: 'CREADA',
            },
            id_estado: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'dim_estados',
                    key: 'id',
                },
            },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            delete_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            created_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            updated_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
        }, {
            sequelize,
            tableName: 'muestra',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
            hooks: {
                beforeCreate: async (muestra) => {
                    // Si no se especifica estado, usar el inicial por defecto
                    if (!muestra.id_estado) {
                        const estadoInicial = await DimEstado_1.DimEstado.findOne({
                            where: {
                                entidad: 'MUESTRA',
                                es_inicial: true,
                                activo: true,
                            },
                        });
                        if (estadoInicial) {
                            muestra.id_estado = estadoInicial.id;
                        }
                    }
                },
            },
        });
        this.addScope('withRefs', {
            attributes: [
                'id_muestra',
                'codigo_epi',
                'codigo_externo',
                'f_toma',
                'f_recepcion',
                'f_destruccion',
                'f_devolucion',
                'estado_muestra',
            ],
            include: [
                {
                    model: DimEstado_1.DimEstado,
                    as: 'estadoInfo',
                    attributes: ['id', 'estado', 'color', 'descripcion'],
                    where: { entidad: 'MUESTRA' },
                    required: false,
                },
                {
                    model: DimPaciente_1.DimPaciente,
                    as: 'paciente',
                    attributes: ['id', 'nombre', 'sip', 'direccion'],
                },
                {
                    model: Solicitud_1.Solicitud,
                    include: [
                        {
                            model: DimCliente_1.DimCliente,
                            as: 'cliente',
                            attributes: ['id', 'nombre', 'razon_social', 'nif'],
                        },
                    ],
                    foreignKey: 'id_solicitud',
                    as: 'solicitud',
                    attributes: [
                        'id_solicitud',
                        'id_cliente',
                        'f_creacion',
                        'f_entrada',
                        'f_compromiso',
                        'f_entrega',
                        'f_resultado',
                        'condiciones_envio',
                        'tiempo_hielo',
                    ],
                },
                {
                    model: Usuario_1.Usuario,
                    as: 'tecnico_resp',
                    attributes: ['id_usuario', 'nombre', 'email'],
                },
                {
                    model: DimTipoMuestra_1.DimTipoMuestra,
                    as: 'tipo_muestra',
                    attributes: ['id', 'cod_tipo_muestra', 'tipo_muestra'],
                },
                {
                    model: DimCentro_1.DimCentro,
                    as: 'centro',
                    attributes: ['id', 'codigo', 'descripcion'],
                },
                {
                    model: DimCriterioValidacion_1.DimCriterioValidacion,
                    as: 'criterio_validacion',
                    attributes: ['id', 'codigo', 'descripcion'],
                },
                {
                    model: DimUbicacion_1.DimUbicacion,
                    as: 'ubicacion',
                    attributes: ['id', 'codigo', 'ubicacion'],
                },
                {
                    model: DimPrueba_1.DimPrueba,
                    as: 'prueba',
                    attributes: ['id', 'cod_prueba', 'prueba'],
                },
            ],
        });
    }
    static associate(models) {
        this.hasMany(models.Tecnica, {
            foreignKey: 'id_muestra',
            as: 'tecnicas',
        });
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_tecnico_resp',
            as: 'tecnico_resp',
        });
        this.belongsTo(models.DimTipoMuestra, {
            foreignKey: 'id_tipo_muestra',
            as: 'tipo_muestra',
        });
        this.belongsTo(models.DimPaciente, {
            foreignKey: 'id_paciente',
            as: 'paciente',
        });
        this.belongsTo(models.DimPrueba, {
            foreignKey: 'id_prueba',
            as: 'prueba',
        });
        this.belongsTo(models.DimCentro, {
            foreignKey: 'id_centro_externo',
            as: 'centro',
        });
        this.belongsTo(models.Solicitud, {
            foreignKey: 'id_solicitud',
            as: 'solicitud',
        });
        this.belongsTo(models.DimCriterioValidacion, {
            foreignKey: 'id_criterio_val',
            as: 'criterio_validacion',
        });
        this.belongsTo(models.DimUbicacion, {
            foreignKey: 'id_ubicacion',
            as: 'ubicacion',
        });
        this.belongsTo(models.DimEstado, {
            foreignKey: 'id_estado',
            as: 'estadoInfo',
            scope: {
                entidad: 'MUESTRA',
            },
        });
    }
}
exports.Muestra = Muestra;
