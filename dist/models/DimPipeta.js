"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimPipeta = void 0;
const sequelize_1 = require("sequelize");
class DimPipeta extends sequelize_1.Model {
    static initModel(sequelize) {
        DimPipeta.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            codigo: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
            },
            modelo: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notNull: { msg: 'El campo modelo es requerido' },
                },
            },
            zona: {
                type: sequelize_1.DataTypes.STRING(50),
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
            tableName: 'dim_pipetas',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: false,
        });
    }
    static associate(models) {
        // each pipeta puede vincularse a una plantilla técnica
        DimPipeta.belongsTo(models.DimPlantillaTecnica, {
            foreignKey: 'id_plantilla_tecnica',
            as: 'plantilla_tecnica',
        });
    }
}
exports.DimPipeta = DimPipeta;
