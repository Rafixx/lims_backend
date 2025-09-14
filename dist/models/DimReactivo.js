"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimReactivo = void 0;
const sequelize_1 = require("sequelize");
class DimReactivo extends sequelize_1.Model {
    static initModel(sequelize) {
        DimReactivo.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            num_referencia: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
            },
            reactivo: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notNull: { msg: 'El campo reactivo es requerido' },
                },
            },
            lote: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
            },
            volumen_formula: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
            },
            activa: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
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
            id_plantilla_tecnica: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'dim_reactivos',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: false,
        });
    }
    static associate(models) {
        // cada reactivo puede vincularse a una plantilla técnica
        DimReactivo.belongsTo(models.DimPlantillaTecnica, {
            foreignKey: 'id_plantilla_tecnica',
            as: 'plantilla_tecnica',
        });
    }
}
exports.DimReactivo = DimReactivo;
