// src/data/perfiles.ts
import { Perfil } from './types';

export const perfiles: Perfil[] = [
  {
    rol: 'Administrador',
    permisos: ['crear', 'leer', 'actualizar', 'eliminar', 'configurar'],
  },
  {
    rol: 'Analista',
    permisos: ['leer', 'actualizar', 'importar_resultados'],
  },
  {
    rol: 'Lector',
    permisos: ['leer'],
  },
];
