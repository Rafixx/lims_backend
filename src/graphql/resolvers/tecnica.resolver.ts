// src/graphql/resolvers/tecnica.resolver.ts
import { Tecnica } from '../../data/types';
import { tecnicas } from '../../data/tecnicas';

export const tecnicaResolver = {
  Query: {
    tecnicas: () => tecnicas,
    tecnica: (_: any, args: { id: string }): Tecnica | undefined =>
      tecnicas.find((t) => t.id === args.id),
  },
  Mutation: {
    createTecnica: (
      _: any,
      args: {
        nombre: string;
        productoId: string;
        maquinaId?: string;
        parametros?: any;
      }
    ): Tecnica => {
      const newTecnica: Tecnica = {
        id: `tec${tecnicas.length + 1}`,
        nombre: args.nombre,
        productoId: args.productoId,
        maquinaId: args.maquinaId || null,
        parametros: args.parametros || {},
      };
      tecnicas.push(newTecnica);
      return newTecnica;
    },
    updateTecnica: (
      _: any,
      args: {
        id: string;
        nombre?: string;
        productoId?: string;
        maquinaId?: string;
        parametros?: any;
      }
    ): Tecnica => {
      const tecnica = tecnicas.find((t) => t.id === args.id);
      if (!tecnica) throw new Error('Técnica no encontrada');
      if (args.nombre !== undefined) tecnica.nombre = args.nombre;
      if (args.productoId !== undefined) tecnica.productoId = args.productoId;
      if (args.maquinaId !== undefined) tecnica.maquinaId = args.maquinaId;
      if (args.parametros !== undefined) tecnica.parametros = args.parametros;
      return tecnica;
    },
    deleteTecnica: (_: any, args: { id: string }): boolean => {
      const index = tecnicas.findIndex((t) => t.id === args.id);
      if (index === -1) throw new Error('Técnica no encontrada');
      tecnicas.splice(index, 1);
      return true;
    },
  },
};
