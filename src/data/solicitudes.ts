//src/data/productos.ts
import { Solicitud, EstadoSolicitud } from './tipos';

export const solicitudes: Solicitud[] = [
  {
    id: 'SOL_001',
    fechaSolicitud: '2021-06-01',
    solicitante: 'Cliente 1',
    estado: EstadoSolicitud.PENDIENTE,
  },
  {
    id: 'SOL_002',
    fechaSolicitud: '2024-04-11',
    solicitante: 'Cliente 2',
    estado: EstadoSolicitud.EN_PROCESO,
  },
  {
    id: 'SOL_003',
    fechaSolicitud: '2025-12-21',
    solicitante: 'Cliente 1',
    estado: EstadoSolicitud.FINALIZADA,
  },
];
