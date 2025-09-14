"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimMaquina = void 0;
const sequelize_1 = require("sequelize");
class DimMaquina extends sequelize_1.Model {
    static initModel(sequelize) {
        DimMaquina.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            codigo: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
            },
            maquina: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notNull: { msg: 'El campo maquina es requerido' },
                },
            },
            perfil_termico: {
                type: sequelize_1.DataTypes.STRING(255),
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
            tableName: 'dim_maquinas',
            schema: process.env.DB_SCHEMA,
            timestamps: true,
            createdAt: false,
            updatedAt: 'update_dt',
            paranoid: false,
        });
    }
    static associate(models) {
        // cada máquina puede vincularse a una plantilla técnica
        DimMaquina.belongsTo(models.DimPlantillaTecnica, {
            foreignKey: 'id_plantilla_tecnica',
            as: 'plantilla_tecnica',
        });
    }
}
exports.DimMaquina = DimMaquina;
