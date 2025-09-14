"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimUbicacion = void 0;
// src/models/DimUbicacion.ts
const sequelize_1 = require("sequelize");
class DimUbicacion extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            codigo: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
            ubicacion: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            activa: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'dim_ubicacion',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
        });
    }
}
exports.DimUbicacion = DimUbicacion;
