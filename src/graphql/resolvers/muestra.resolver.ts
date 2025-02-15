// src/graphql/resolvers/muestra.resolver.ts
import { Muestra } from '../../data/types';
import { muestras } from '../../data/muestras';

export const muestraResolver = {
  Query: {
    muestras: () => muestras,
    muestra: (_: any, args: { id: string }): Muestra | undefined =>
      muestras.find((m) => m.id === args.id),
  },
  Mutation: {
    createMuestra: (
      _: any,
      args: {
        identificacionExterna: string;
        codigoInterno: string;
        fechaIngreso: string;
        estado: string;
        ubicacion: string;
        productos: any[];
      }
    ): Muestra => {
      const newMuestra: Muestra = {
        id: `muestra${muestras.length + 1}`,
        identificacionExterna: args.identificacionExterna,
        codigoInterno: args.codigoInterno,
        fechaIngreso: args.fechaIngreso,
        estado: args.estado,
        ubicacion: args.ubicacion,
        productos: args.productos,
      };
      muestras.push(newMuestra);
      return newMuestra;
    },
    updateMuestra: (
      _: any,
      args: {
        id: string;
        identificacionExterna?: string;
        codigoInterno?: string;
        fechaIngreso?: string;
        estado?: string;
        ubicacion?: string;
      }
    ): Muestra => {
      const muestra = muestras.find((m) => m.id === args.id);
      if (!muestra) throw new Error('Muestra no encontrada');
      if (args.identificacionExterna !== undefined)
        muestra.identificacionExterna = args.identificacionExterna;
      if (args.codigoInterno !== undefined)
        muestra.codigoInterno = args.codigoInterno;
      if (args.fechaIngreso !== undefined)
        muestra.fechaIngreso = args.fechaIngreso;
      if (args.estado !== undefined) muestra.estado = args.estado;
      if (args.ubicacion !== undefined) muestra.ubicacion = args.ubicacion;
      return muestra;
    },
    deleteMuestra: (_: any, args: { id: string }): boolean => {
      const index = muestras.findIndex((m) => m.id === args.id);
      if (index === -1) throw new Error('Muestra no encontrada');
      muestras.splice(index, 1);
      return true;
    },
  },
};
