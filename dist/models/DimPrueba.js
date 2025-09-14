"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPrueba = void 0;
// src/models/DimPrueba.ts
const sequelize_1 = require("sequelize");
class DimPrueba extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            cod_prueba: {
                type: sequelize_1.DataTypes.STRING(10),
                allowNull: true,
                defaultValue: null,
            },
            prueba: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                validate: {
                    notNull: { msg: 'prueba es requerida' },
                    notEmpty: { msg: 'prueba no puede estar vacía' },
                },
            },
            activa: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
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
        }, {
            sequelize,
            tableName: 'dim_pruebas',
            schema: process.env.DB_SCHEMA,
            timestamps: false,
        });
    }
    static associate(models) {
        // Un DimPrueba puede tener muchas Solicitudes
        this.hasMany(models.Muestra, {
            foreignKey: 'id_prueba',
            as: 'muestras',
        });
        // Un DimPrueba puede tener muchas dim_Tecnicas_proc
        this.hasMany(models.DimTecnicaProc, {
            foreignKey: 'id_prueba',
            as: 'tecnicas',
        });
    }
}
exports.DimPrueba = DimPrueba;
