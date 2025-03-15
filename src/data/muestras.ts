// src/data/muestras.ts
import { Muestra } from './tipos';

export const muestras: Muestra[] = [
  {
    id: '1',
    idSolicitud: 'SOL_001',
    identificacionExterna: 'EXT-001',
    codigoInterno: 'INT-001',
    fechaIngreso: '2025-02-15',
    estado: 'Pendiente',
    ubicacion: 'Congelador A',
    estudios: [
      {
        estudioId: 'prod1',
        nombre: 'Producto 1',
        estado: 'En Curso',
        procesos: [
          {
            procesoId: 'tec1',
            nombre: 'Técnica 1',
            estado: 'En Curso',
            resultados: [
              {
                id: 'res1',
                valor: 'positivo',
                unidad: null,
                fechaResultado: '2025-02-15',
              },
            ],
          },
          {
            procesoId: 'tec2',
            nombre: 'Técnica 2',
            estado: 'En Curso',
            resultados: [
              {
                id: 'res2',
                valor: 'negativo',
                unidad: null,
                fechaResultado: '2025-02-15',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    idSolicitud: 'SOL_002',
    identificacionExterna: 'EXT-002',
    codigoInterno: 'INT-002',
    fechaIngreso: '2025-02-15',
    estado: 'En Curso',
    ubicacion: 'Máquina maq3',
    estudios: [
      {
        estudioId: 'prod3',
        nombre: 'Producto 3',
        estado: 'En Curso',
        procesos: [
          {
            procesoId: 'tec4',
            nombre: 'Técnica 4',
            estado: 'En Curso',
            resultados: [
              {
                id: 'res3',
                valor: 25.6,
                unidad: 'ng/µL',
                fechaResultado: '2025-02-15',
              },
            ],
          },
        ],
      },
    ],
  },
];
