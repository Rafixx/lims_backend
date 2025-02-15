// src/graphql/resolvers/usuario.resolver.ts
import { Usuario } from '../../data/types';
import { usuarios } from '../../data/usuarios';

export const usuarioResolver = {
  Query: {
    usuarios: () => usuarios,
    usuario: (_: any, args: { id: string }): Usuario | undefined =>
      usuarios.find((u) => u.id === args.id),
  },
  Mutation: {
    createUsuario: (
      _: any,
      args: {
        nombre: string;
        email: string;
        rol: string;
        fechaCreacion: string;
      }
    ): Usuario => {
      const newUsuario: Usuario = {
        id: `user${usuarios.length + 1}`,
        nombre: args.nombre,
        email: args.email,
        rol: args.rol,
        fechaCreacion: args.fechaCreacion,
      };
      usuarios.push(newUsuario);
      return newUsuario;
    },
    updateUsuario: (
      _: any,
      args: { id: string; nombre?: string; email?: string; rol?: string }
    ): Usuario => {
      const usuario = usuarios.find((u) => u.id === args.id);
      if (!usuario) throw new Error('Usuario no encontrado');
      if (args.nombre !== undefined) usuario.nombre = args.nombre;
      if (args.email !== undefined) usuario.email = args.email;
      if (args.rol !== undefined) usuario.rol = args.rol;
      return usuario;
    },
    deleteUsuario: (_: any, args: { id: string }): boolean => {
      const index = usuarios.findIndex((u) => u.id === args.id);
      if (index === -1) throw new Error('Usuario no encontrado');
      usuarios.splice(index, 1);
      return true;
    },
  },
};
