"use strict";
// src/models/Tecnica.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tecnica = void 0;
const sequelize_1 = require("sequelize");
const DimTecnicaProc_1 = require("./DimTecnicaProc");
const Worklist_1 = require("./Worklist");
const Usuario_1 = require("./Usuario");
const DimEstado_1 = require("./DimEstado");
class Tecnica extends sequelize_1.Model {
    // ============== inicialización ============
    static initModel(sequelize) {
        this.init({
            id_tecnica: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            id_muestra: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { msg: 'id_muestra es requerido' },
                },
            },
            id_tecnica_proc: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { msg: 'id_tecnica_proc es requerido' },
                },
            },
            id_tecnico_resp: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            id_worklist: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            fecha_inicio_tec: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            estado: {
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
            fecha_estado: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            comentarios: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                defaultValue: null,
            },
            delete_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            created_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            updated_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'tecnicas',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
            hooks: {
                beforeCreate: async (tecnica) => {
                    // Si no se especifica estado, usar el inicial por defecto
                    if (!tecnica.id_estado) {
                        const estadoInicial = await DimEstado_1.DimEstado.findOne({
                            where: {
                                entidad: 'TECNICA',
                                es_inicial: true,
                                activo: true,
                            },
                        });
                        if (estadoInicial) {
                            tecnica.id_estado = estadoInicial.id;
                        }
                    }
                },
            },
        });
        this.addScope('withRefs', {
            attributes: [
                'id_tecnica',
                'fecha_inicio_tec',
                'estado',
                'id_estado',
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
                    attributes: ['id', 'tecnica_proc'],
                },
                {
                    model: Worklist_1.Worklist,
                    as: 'worklist',
                    attributes: ['id_worklist', 'nombre'],
                },
                {
                    model: Usuario_1.Usuario,
                    as: 'tecnico_resp',
                    attributes: ['id_usuario', 'nombre'],
                },
            ],
        });
    }
    // ============== asociaciones ============
    static associate(models) {
        // Técnica pertenece a una Muestra
        this.belongsTo(models.Muestra, {
            foreignKey: 'id_muestra',
            as: 'muestra',
        });
        this.belongsTo(models.DimTecnicaProc, {
            foreignKey: 'id_tecnica_proc',
            as: 'tecnica_proc',
        });
        // Técnica pertenece a un Usuario (técnico responsable)
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_tecnico_resp',
            as: 'tecnico_resp',
        });
        //Tecnica puede pertenecer a un Worklist
        this.belongsTo(models.Worklist, {
            foreignKey: 'id_worklist',
            as: 'worklist',
        });
        this.belongsTo(models.DimEstado, {
            foreignKey: 'id_estado',
            as: 'estadoInfo',
            scope: {
                entidad: 'TECNICA',
            },
        });
    }
}
exports.Tecnica = Tecnica;
