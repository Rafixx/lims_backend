// src/data/usuarios.ts
import { Usuario } from './tipos';

export const usuarios: Usuario[] = [
  {
    id: 'user1',
    nombre: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    rol: 'Administrador',
    fechaCreacion: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user2',
    nombre: 'María López',
    email: 'maria.lopez@empresa.com',
    rol: 'Analista',
    fechaCreacion: '2025-01-10T00:00:00Z',
  },
  {
    id: 'user3',
    nombre: 'Carlos García',
    email: 'carlos.garcia@empresa.com',
    rol: 'Lector',
    fechaCreacion: '2025-01-15T00:00:00Z',
  },
];
