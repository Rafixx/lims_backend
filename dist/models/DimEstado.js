"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimEstado = void 0;
//src/models/DimCentro.ts
const sequelize_1 = require("sequelize");
class DimEstado extends sequelize_1.Model {
    static initModel(sequelize) {
        DimEstado.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            estado: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            entidad: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            descripcion: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
            },
            orden: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            activo: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            color: {
                type: sequelize_1.DataTypes.STRING(7), // #FFFFFF
                allowNull: true,
            },
            es_inicial: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            es_final: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        }, {
            sequelize,
            tableName: 'dim_estados',
            schema: process.env.DB_SCHEMA,
            timestamps: false,
            // indexes: [
            //   {
            //     unique: true,
            //     fields: ['entidad', 'estado'],
            //   },
            // ],
        });
    }
}
exports.DimEstado = DimEstado;
