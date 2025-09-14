"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPaciente = void 0;
// src/models/DimPaciente.ts
const sequelize_1 = require("sequelize");
class DimPaciente extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            nombre: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
            sip: { type: sequelize_1.DataTypes.STRING(10), allowNull: true },
            direccion: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
            activo: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            delete_dt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
        }, {
            sequelize,
            tableName: 'dim_pacientes',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: true,
            deletedAt: 'delete_dt',
        });
    }
}
exports.DimPaciente = DimPaciente;
