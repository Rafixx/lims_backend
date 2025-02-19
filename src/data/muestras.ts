// src/data/muestras.ts
import { Muestra } from './tipos';

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
        tecnicas: [
          {
            tecnicaId: 'tec1',
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
        tecnicas: [
          {
            tecnicaId: 'tec4',
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
