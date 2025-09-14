"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solicitud = void 0;
// src/models/Solicitud.ts
const sequelize_1 = require("sequelize");
class Solicitud extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id_solicitud: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            num_solicitud: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                defaultValue: null,
            },
            id_cliente: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            f_creacion: sequelize_1.DataTypes.DATE,
            f_entrada: sequelize_1.DataTypes.DATE,
            f_compromiso: sequelize_1.DataTypes.DATE,
            f_entrega: sequelize_1.DataTypes.DATE,
            f_resultado: sequelize_1.DataTypes.DATE,
            condiciones_envio: sequelize_1.DataTypes.STRING(50),
            tiempo_hielo: sequelize_1.DataTypes.STRING(20),
            estado_solicitud: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'CREADA',
            },
            delete_dt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            created_by: sequelize_1.DataTypes.INTEGER,
            updated_by: sequelize_1.DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'solicitud',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: 'f_creacion',
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
        });
    }
    static associate(models) {
        this.belongsTo(models.DimCliente, {
            foreignKey: 'id_cliente',
            as: 'cliente',
        });
        this.hasMany(models.Muestra, {
            foreignKey: 'id_solicitud',
            as: 'muestras',
        });
    }
}
exports.Solicitud = Solicitud;
