"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Muestra = void 0;
// src/models/Muestra.ts
const sequelize_1 = require("sequelize");
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
        });
    }
    static associate(models) {
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
        this.hasMany(models.Tecnica, {
            foreignKey: 'id_muestra',
            as: 'tecnicas',
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
    }
}
exports.Muestra = Muestra;
