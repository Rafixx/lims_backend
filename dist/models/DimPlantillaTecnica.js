"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPlantillaTecnica = void 0;
// src/models/DimPlantillaTecnica.ts
const sequelize_1 = require("sequelize");
class DimPlantillaTecnica extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            cod_plantilla_tecnica: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                validate: {
                    notNull: { msg: 'cod_plantilla_tecnica es requerido' },
                    notEmpty: { msg: 'cod_plantilla_tecnica no puede estar vacío' },
                },
            },
            tecnica: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notNull: { msg: 'tecnica es requerida' },
                    notEmpty: { msg: 'tecnica no puede estar vacía' },
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
            tableName: 'dim_plantilla_tecnica',
            schema: process.env.DB_SCHEMA,
            timestamps: false,
        });
    }
    static associate(models) {
        // Una plantilla puede tener muchas técnicas de proceso
        this.hasMany(models.DimTecnicaProc, {
            foreignKey: 'id_plantilla_tecnica',
            as: 'dimTecnicasProc',
        });
    }
}
exports.DimPlantillaTecnica = DimPlantillaTecnica;
