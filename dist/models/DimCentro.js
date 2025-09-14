"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimCentro = void 0;
//src/models/DimCentro.ts
const sequelize_1 = require("sequelize");
class DimCentro extends sequelize_1.Model {
    static initModel(sequelize) {
        DimCentro.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            codigo: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            descripcion: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            created_by: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            update_dt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'dim_centros',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: false,
        });
    }
    static associate(models) {
        // each Centro puede asociarse con varias muestras
        DimCentro.hasMany(models.Muestra, {
            foreignKey: 'id_centro_externo',
            as: 'muestras',
        });
    }
}
exports.DimCentro = DimCentro;
