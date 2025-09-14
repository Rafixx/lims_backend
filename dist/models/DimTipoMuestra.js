"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimTipoMuestra = void 0;
// src/models/DimTipoMuestra.ts
const sequelize_1 = require("sequelize");
class DimTipoMuestra extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            cod_tipo_muestra: {
                type: sequelize_1.DataTypes.STRING(10),
                allowNull: true,
            },
            tipo_muestra: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
            },
            created_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'dim_tipo_muestra',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
        });
    }
}
exports.DimTipoMuestra = DimTipoMuestra;
