// test/utils/initModels.ts

import { Sequelize } from 'sequelize';
import { ModelStatic, Model } from 'sequelize';
import { Solicitud } from '../../models/Solicitud';
import { Muestra } from '../../models/Muestra';
import { Tecnica } from '../../models/Tecnica';

type Models = Record<string, ModelStatic<Model>>;

/**
 * Inicializa todos los modelos sobre la misma instancia de Sequelize
 * y les invoca su método .associate pasándoles el conjunto completo.
 */
export function initModels(sequelize: Sequelize): Models {
  // 1) Lista todos tus modelos aquí
  const models = { Solicitud, Muestra, Tecnica };

  // 2) Inicialízalos
  for (const model of Object.values(models)) {
    model.initModel(sequelize);
  }

  // 3) Llama a associate sobre cada uno, pasándoles el mapa completo
  for (const model of Object.values(models)) {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  }

  return models;
}
