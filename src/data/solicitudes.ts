//src/data/productos.ts
import { Solicitud } from './tipos';

export const solicitudes: Solicitud[] = [
  {
    id: 'SOL_001',
    fechaSolicitud: '2025-02-15 08:00',
    solicitante: 'Dr. Pérez',
    estado: 'Pendiente',
    muestras: [
      {
        id: 'MUE_001',
        idSolicitud: 'SOL_001',
        identificacionExterna: 'EX -001',
        codigoInterno: 'IN -001',
        fechaIngreso: '2025-02-15 09:00',
        estado: 'En Proceso',
        ubicacion: 'Laboratorio A',
        estudios: [
          {
            estudioId: 'ES _001',
            nombre: 'Estudio de Sangre',
            estado: 'En Proceso',
            procesos: [
              {
                procesoId: 'PROC_001',
                nombre: 'Hemograma',
                estado: 'En Proceso',
                resultados: [
                  {
                    id: 'RES_001',
                    valor: '4.5',
                    unidad: 'millones/µL',
                    fechaResultado: '2025-02-15 11:00',
                  },
                  {
                    id: 'RES_002',
                    valor: '13.2',
                    unidad: 'g/dL',
                    fechaResultado: '2025-02-15 11:05',
                  },
                ],
              },
              {
                procesoId: 'PROC_002',
                nombre: 'Coagulograma',
                estado: 'Pendiente',
                resultados: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'SOL_002',
    fechaSolicitud: '2025-02-16 08:00',
    solicitante: 'Dr. Martínez',
    estado: 'En Proceso',
    muestras: [
      {
        id: 'MUE_002',
        idSolicitud: 'SOL_002',
        identificacionExterna: 'EX -002',
        codigoInterno: 'IN -002',
        fechaIngreso: '2025-02-16 09:30',
        estado: 'En Proceso',
        ubicacion: 'Laboratorio B',
        estudios: [
          {
            estudioId: 'ES _002',
            nombre: 'Estudio de Química',
            estado: 'En Proceso',
            procesos: [
              {
                procesoId: 'PROC_003',
                nombre: 'Perfil Hepático',
                estado: 'En Proceso',
                resultados: [
                  {
                    id: 'RES_003',
                    valor: '35',
                    unidad: 'U/L',
                    fechaResultado: '2025-02-16 11:30',
                  },
                ],
              },
            ],
          },
          {
            estudioId: 'ES _003',
            nombre: 'Estudio de Hormonas',
            estado: 'Pendiente',
            procesos: [],
          },
        ],
      },
    ],
  },
  {
    id: 'SOL_003',
    fechaSolicitud: '2025-02-17 10:00',
    solicitante: 'Dr. González',
    estado: 'Finalizada',
    muestras: [
      {
        id: 'MUE_003',
        idSolicitud: 'SOL_003',
        identificacionExterna: 'EX -003',
        codigoInterno: 'IN -003',
        fechaIngreso: '2025-02-17 10:30',
        estado: 'Finalizada',
        ubicacion: 'Laboratorio A',
        estudios: [
          {
            estudioId: 'ES _004',
            nombre: 'Estudio de Orina',
            estado: 'Finalizada',
            procesos: [
              {
                procesoId: 'PROC_004',
                nombre: 'Análisis de Orina',
                estado: 'Finalizada',
                resultados: [
                  {
                    id: 'RES_004',
                    valor: 'Normal',
                    unidad: '',
                    fechaResultado: '2025-02-17 12:00',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'SOL_004',
    fechaSolicitud: '2025-02-18 09:00',
    solicitante: 'Dra. López',
    estado: 'Pendiente',
    muestras: [
      {
        id: 'MUE_004',
        idSolicitud: 'SOL_004',
        identificacionExterna: 'EX -004',
        codigoInterno: 'IN -004',
        fechaIngreso: '2025-02-18 09:30',
        estado: 'Pendiente',
        ubicacion: 'Laboratorio C',
        estudios: [
          {
            estudioId: 'ES _005',
            nombre: 'Estudio de Infecciones',
            estado: 'Pendiente',
            procesos: [],
          },
        ],
      },
    ],
  },
  {
    id: 'SOL_005',
    fechaSolicitud: '2025-02-19 11:00',
    solicitante: 'Dr. Ramírez',
    estado: 'En Proceso',
    muestras: [
      {
        id: 'MUE_005',
        idSolicitud: 'SOL_005',
        identificacionExterna: 'EX -005',
        codigoInterno: 'IN -005',
        fechaIngreso: '2025-02-19 11:30',
        estado: 'En Proceso',
        ubicacion: 'Laboratorio B',
        estudios: [
          {
            estudioId: 'ES _006',
            nombre: 'Estudio de Biometría',
            estado: 'En Proceso',
            procesos: [
              {
                procesoId: 'PROC_005',
                nombre: 'Conteo de Células',
                estado: 'En Proceso',
                resultados: [
                  {
                    id: 'RES_005',
                    valor: '7.8',
                    unidad: 'millones/µL',
                    fechaResultado: '2025-02-19 12:00',
                  },
                  {
                    id: 'RES_006',
                    valor: '14.1',
                    unidad: 'g/dL',
                    fechaResultado: '2025-02-19 12:05',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
