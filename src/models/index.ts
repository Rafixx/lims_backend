// src/models/index.ts
import { Solicitud } from './Solicitud';
import { Muestra } from './Muestra';
import { Tecnica } from './Tecnica';
import { DimCliente } from './DimCliente';
import { DimPrueba } from './DimPrueba';
import { DimTecnicaProc } from './DimTecnicaProc';
import { DimPlantillaTecnica } from './DimPlantillaTecnica';
import { Usuario } from './Usuario';
import { Rol } from './Rol';
import type { Sequelize, ModelStatic, Model } from 'sequelize';
import { DimTipoMuestra } from './DimTipoMuestra';
import { DimUbicacion } from './DimUbicacion';
import { DimPaciente } from './DimPaciente';
import { DimPipeta } from './DimPipeta';
import { DimMaquina } from './DimMaquina';
import { DimReactivo } from './DimReactivo';

type ModelWithAssociate = ModelStatic<Model> & {
  associate?(models: Record<string, ModelStatic<Model>>): void;
};

export function initModels(sequelize: Sequelize) {
  // 1) Init
  Solicitud.initModel(sequelize);
  Muestra.initModel(sequelize);
  Tecnica.initModel(sequelize);
  DimCliente.initModel(sequelize);
  DimPrueba.initModel(sequelize);
  DimTecnicaProc.initModel(sequelize);
  DimPlantillaTecnica.initModel(sequelize);
  Usuario.initModel(sequelize);
  Rol.initModel(sequelize);
  DimTipoMuestra.initModel(sequelize);
  DimUbicacion.initModel(sequelize);
  DimPaciente.initModel(sequelize);
  DimPipeta.initModel(sequelize);
  DimMaquina.initModel(sequelize);
  DimReactivo.initModel(sequelize);

  // 2) Ahora sí construye el map de clases
  const models = {
    Solicitud,
    Muestra,
    Tecnica,
    DimCliente,
    DimPrueba,
    DimTecnicaProc,
    DimPlantillaTecnica,
    Usuario,
    Rol,
    DimTipoMuestra,
    DimUbicacion,
    DimPaciente,
    DimPipeta,
    DimMaquina,
    DimReactivo,
  } as const;

  // 3) Asociaciones
  (Object.values(models) as ModelWithAssociate[]).forEach((m) => {
    if (typeof m.associate === 'function') {
      m.associate(models);
    }
  });

  return models;
}
