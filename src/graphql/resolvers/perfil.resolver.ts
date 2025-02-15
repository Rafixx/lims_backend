// src/graphql/resolvers/perfil.resolver.ts
import { Perfil } from '../../data/types';
import { perfiles } from '../../data/perfiles';

export const perfilResolver = {
  Query: {
    perfiles: () => perfiles,
    perfil: (_: any, args: { rol: string }): Perfil | undefined =>
      perfiles.find((p) => p.rol === args.rol),
  },
  Mutation: {
    createPerfil: (
      _: any,
      args: { rol: string; permisos: string[] }
    ): Perfil => {
      const newPerfil: Perfil = {
        rol: args.rol,
        permisos: args.permisos,
      };
      perfiles.push(newPerfil);
      return newPerfil;
    },
    updatePerfil: (
      _: any,
      args: { rol: string; permisos: string[] }
    ): Perfil => {
      const perfil = perfiles.find((p) => p.rol === args.rol);
      if (!perfil) throw new Error('Perfil no encontrado');
      perfil.permisos = args.permisos;
      return perfil;
    },
    deletePerfil: (_: any, args: { rol: string }): boolean => {
      const index = perfiles.findIndex((p) => p.rol === args.rol);
      if (index === -1) throw new Error('Perfil no encontrado');
      perfiles.splice(index, 1);
      return true;
    },
  },
};
