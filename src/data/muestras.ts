// src/data/muestras.ts
import { Muestra } from './tipos';
import { updateMuestraEstado } from '../controllers/muestras.controller';

export const muestras: Muestra[] = [
  {
    id: 'muestra1',
    identificacionExterna: 'EXT-001',
    codigoInterno: 'INT-001',
    fechaIngreso: '2025-02-15T08:30:00Z',
    estado: 'Pendiente',
    ubicacion: 'Congelador A',
    productos: [
      {
        productoId: 'prod1',
        nombre: 'Producto 1',
        estado: 'En Curso',
        tecnicas: [
          {
            tecnicaId: 'tec1',
            nombre: 'Técnica 1',
            estado: 'En Curso',
            resultados: [
              {
                id: 'res1',
                valor: 'positivo',
                unidad: null,
                fechaResultado: '2025-02-15T10:00:00Z',
              },
            ],
          },
          {
            tecnicaId: 'tec2',
            nombre: 'Técnica 2',
            estado: 'En Curso',
            resultados: [
              {
                id: 'res2',
                valor: 'negativo',
                unidad: null,
                fechaResultado: '2025-02-15T10:30:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'muestra2',
    identificacionExterna: 'EXT-002',
    codigoInterno: 'INT-002',
    fechaIngreso: '2025-02-15T09:00:00Z',
    estado: 'En Curso',
    ubicacion: 'Máquina maq3',
    productos: [
      {
        productoId: 'prod3',
        nombre: 'Producto 3',
        estado: 'En Curso',
        tecnicas: [
          {
            tecnicaId: 'tec4',
            nombre: 'Técnica 4',
            estado: 'En Curso',
            resultados: [
              {
                id: 'res3',
                valor: 25.6,
                unidad: 'ng/µL',
                fechaResultado: '2025-02-15T11:00:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
];
