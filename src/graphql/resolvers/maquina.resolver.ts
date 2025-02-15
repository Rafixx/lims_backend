// src/graphql/resolvers/maquina.resolver.ts
import { Maquina } from '../../data/types';
import { maquinas } from '../../data/maquinas';

export const maquinaResolver = {
  Query: {
    maquinas: () => maquinas,
    maquina: (_: any, args: { id: string }): Maquina | undefined =>
      maquinas.find((m) => m.id === args.id),
  },
  Mutation: {
    createMaquina: (
      _: any,
      args: { nombre: string; tipo: string }
    ): Maquina => {
      const newMaquina: Maquina = {
        id: `maq${maquinas.length + 1}`,
        nombre: args.nombre,
        tipo: args.tipo,
      };
      maquinas.push(newMaquina);
      return newMaquina;
    },
    updateMaquina: (
      _: any,
      args: { id: string; nombre?: string; tipo?: string }
    ): Maquina => {
      const maquina = maquinas.find((m) => m.id === args.id);
      if (!maquina) throw new Error('Maquina no encontrada');
      if (args.nombre !== undefined) maquina.nombre = args.nombre;
      if (args.tipo !== undefined) maquina.tipo = args.tipo;
      return maquina;
    },
    deleteMaquina: (_: any, args: { id: string }): boolean => {
      const index = maquinas.findIndex((m) => m.id === args.id);
      if (index === -1) throw new Error('Maquina no encontrada');
      maquinas.splice(index, 1);
      return true;
    },
  },
};
