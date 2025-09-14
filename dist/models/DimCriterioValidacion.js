"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimCriterioValidacion = void 0;
const sequelize_1 = require("sequelize");
class DimCriterioValidacion extends sequelize_1.Model {
    static initModel(sequelize) {
        DimCriterioValidacion.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
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
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'dim_criterios_validacion',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: false,
        });
    }
    static associate(models) {
        // each Centro puede asociarse con varias muestras
        DimCriterioValidacion.hasMany(models.Muestra, {
            foreignKey: 'id_criterio_val',
            as: 'muestras',
        });
    }
}
exports.DimCriterioValidacion = DimCriterioValidacion;
