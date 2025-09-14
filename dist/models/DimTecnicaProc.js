"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimTecnicaProc = void 0;
// src/models/DimTecnicaProc.ts
const sequelize_1 = require("sequelize");
class DimTecnicaProc extends sequelize_1.Model {
    static initModel(sequelize) {
        this.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tecnica_proc: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                validate: {
                    notNull: { msg: 'tecnica_proc es requerido' },
                    notEmpty: { msg: 'tecnica_proc no puede estar vacío' },
                },
            },
            orden: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            obligatoria: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
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
            id_prueba: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            id_plantilla_tecnica: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
        }, {
            sequelize,
            tableName: 'dim_tecnicas_proc',
            schema: process.env.DB_SCHEMA,
            timestamps: false,
        });
    }
    static associate(models) {
        // Relación a DimPrueba
        this.belongsTo(models.DimPrueba, {
            foreignKey: 'id_prueba',
            as: 'dimPrueba',
        });
        // Relación a DimPlantillaTecnica (si existe)
        this.belongsTo(models.DimPlantillaTecnica, {
            foreignKey: 'id_plantilla_tecnica',
            as: 'plantillaTecnica',
        });
        // Asociación inversa: Un proceso puede tener muchas técnicas
        this.hasMany(models.Tecnica, {
            foreignKey: 'id_tecnica_proc',
            as: 'tecnicas',
        });
    }
}
exports.DimTecnicaProc = DimTecnicaProc;
