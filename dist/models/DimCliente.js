"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimCliente = void 0;
//src/models/Dim_cliente.ts
const sequelize_1 = require("sequelize");
class DimCliente extends sequelize_1.Model {
    // ============== inicialización ============
    static initModel(sequelize) {
        this.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                defaultValue: null,
            },
            razon_social: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                defaultValue: null,
            },
            nif: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                defaultValue: null,
            },
            direccion: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                defaultValue: null,
            },
            activo: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            created_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
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
        }, {
            sequelize,
            tableName: 'dim_clientes',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
        });
    }
    // ============== asociaciones ============
    static associate(models) {
        this.hasMany(models.Solicitud, {
            foreignKey: 'id_cliente',
            as: 'solicitudes',
        });
    }
}
exports.DimCliente = DimCliente;
