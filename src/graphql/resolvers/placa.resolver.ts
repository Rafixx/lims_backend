// src/graphql/resolvers/placa.resolver.ts
import { Placa } from '../../data/types';
import { placas } from '../../data/placas';

export const placaResolver = {
  Query: {
    placas: () => placas,
    placa: (_: any, args: { id: string }): Placa | undefined =>
      placas.find((p) => p.id === args.id),
  },
  Mutation: {
    createPlaca: (
      _: any,
      args: {
        codigoPlaca: string;
        estado: string;
        numeroMuestras: number;
        muestras: any[];
      }
    ): Placa => {
      const newPlaca: Placa = {
        id: `placa${placas.length + 1}`,
        codigoPlaca: args.codigoPlaca,
        estado: args.estado,
        numeroMuestras: args.numeroMuestras,
        muestras: args.muestras,
      };
      placas.push(newPlaca);
      return newPlaca;
    },
    updatePlaca: (
      _: any,
      args: {
        id: string;
        codigoPlaca?: string;
        estado?: string;
        numeroMuestras?: number;
      }
    ): Placa => {
      const placa = placas.find((p) => p.id === args.id);
      if (!placa) throw new Error('Placa no encontrada');
      if (args.codigoPlaca !== undefined) placa.codigoPlaca = args.codigoPlaca;
      if (args.estado !== undefined) placa.estado = args.estado;
      if (args.numeroMuestras !== undefined)
        placa.numeroMuestras = args.numeroMuestras;
      return placa;
    },
    deletePlaca: (_: any, args: { id: string }): boolean => {
      const index = placas.findIndex((p) => p.id === args.id);
      if (index === -1) throw new Error('Placa no encontrada');
      placas.splice(index, 1);
      return true;
    },
  },
};
