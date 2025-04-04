//src/data/listaTrabajo.ts
import { ListaTrabajo } from './tipos';

export const listaTrabajo: ListaTrabajo[] = [
  {
    id: 'wl1',
    tipo: 'PCR',
    proceso: {
      id: 'tec1',
      nombre: 'PCR Convencional',
      productoId: 'prod1',
      aparatoId: 'maq1',
      parametros: { volumen: '50µL', ciclos: 35 },
      pipetas: [
        {
          id: 'pip1',
          zona: 'Lab 9- F.CFL2',
          codigo: 'F.PM7',
          modelo: 'Pipeta monocanal ThermoFisher 2-20 µl',
        },
        {
          id: 'pip2',
          zona: 'Lab 9- F.CFL2',
          codigo: 'F.PM8',
          modelo: 'Pipeta monocanal ThermoFisher 0,2-2 µl',
        },
      ],
      reactivos: [
        {
          id: 'reac1',
          nombre: 'Tubos 0,2 Ref: xxxxx',
          volumen: 0,
          lote: '',
        },
        {
          id: 'reac2',
          nombre: 'Placa Ref: xxxxx',
          volumen: 0,
          lote: '',
        },
        {
          id: 'reac3',
          nombre: 'Film óptico. Ref:',
          volumen: 0,
          lote: '',
        },
        {
          id: 'reac4',
          nombre: 'MyTaqTM DNA Polymerase',
          volumen: 1.15,
          lote: '',
        },
        {
          id: 'reac5',
          nombre: '5X MyTaq Reaction Buffer',
          volumen: 11.5,
          lote: '',
        },
        {
          id: 'reac6',
          nombre: 'Agua (ddH2O)',
          volumen: 31.05,
          lote: '',
        },
      ],
    },
    muestras: [],
    fecha: '2025-01-01',
    tecnico: {
      id: 'user1',
      nombre: 'Juan Pérez',
      email: '',
      rol: 'Administrador',
      fechaCreacion: '2025-01-01',
    },
    estado: 'Pendiente',
  },
  {
    id: 'wl2',
    tipo: 'qPCR',
    proceso: {
      id: 'tec2',
      nombre: 'PCR Cuantitativa',
      productoId: 'prod2',
      aparatoId: 'maq2',
      parametros: { volumen: '25µL', ciclos: 40 },
      pipetas: [
        {
          id: 'pip7',
          zona: 'Lab 9- F.CFL3',
          codigo: 'F.PM10',
          modelo: 'Pipeta multicanal ThermoFisher 5-50 µl',
        },
        {
          id: 'pip8',
          zona: 'Lab 9- F.CFL3',
          codigo: 'F.PM11',
          modelo: 'Pipeta monocanal ThermoFisher 10-100 µl',
        },
      ],
      reactivos: [
        {
          id: 'reac7',
          nombre: 'Placas 96 pocillos Ref: yyyyy',
          volumen: 0,
          lote: '',
        },
        {
          id: 'reac8',
          nombre: 'Film óptico. Ref: zzzzz',
          volumen: 0,
          lote: '',
        },
        {
          id: 'reac9',
          nombre: 'TaqMan Master Mix',
          volumen: 12.5,
          lote: '',
        },
        {
          id: 'reac10',
          nombre: 'Sonda TaqMan',
          volumen: 1.25,
          lote: '',
        },
        {
          id: 'reac11',
          nombre: 'Agua libre de RNasas',
          volumen: 6.25,
          lote: '',
        },
      ],
    },
    muestras: [],
    fecha: '2025-01-15',
    tecnico: {
      id: 'user2',
      nombre: 'María García',
      email: '',
      rol: 'Técnico',
      fechaCreacion: '2024-12-10',
    },
    estado: 'Pendiente',
  },
  {
    id: 'wl3',
    tipo: 'SEC',
    proceso: {
      id: 'tec3',
      nombre: 'Secuenciación',
      productoId: 'prod3',
      aparatoId: 'maq3',
      parametros: { volumen: '20µL', lecturas: 'paired-end' },
      pipetas: [
        {
          id: 'pip9',
          zona: 'Lab 10- F.CFL4',
          codigo: 'F.PM15',
          modelo: 'Pipeta monocanal Eppendorf 2-20 µl',
        },
        {
          id: 'pip10',
          zona: 'Lab 10- F.CFL4',
          codigo: 'F.PM16',
          modelo: 'Pipeta monocanal Eppendorf 10-100 µl',
        },
      ],
      reactivos: [
        {
          id: 'reac12',
          nombre: 'Kit preparación librería NGS',
          volumen: 10,
          lote: '',
        },
        {
          id: 'reac13',
          nombre: 'Adaptadores de secuenciación',
          volumen: 2,
          lote: '',
        },
        {
          id: 'reac14',
          nombre: 'Buffer de dilución',
          volumen: 5,
          lote: '',
        },
        {
          id: 'reac15',
          nombre: 'Agua ultrapura',
          volumen: 3,
          lote: '',
        },
      ],
    },
    muestras: [],
    fecha: '2025-02-01',
    tecnico: {
      id: 'user3',
      nombre: 'Carlos Rodríguez',
      email: '',
      rol: 'Técnico',
      fechaCreacion: '2024-11-15',
    },
    estado: 'Pendiente',
  },
  {
    id: 'wl4',
    tipo: 'EXT',
    proceso: {
      id: 'tec4',
      nombre: 'Extracción de ADN',
      productoId: 'prod4',
      aparatoId: 'maq4',
      parametros: { volumen: '200µL', tiempo: '45min' },
      pipetas: [
        {
          id: 'pip11',
          zona: 'Lab 8- F.CFL1',
          codigo: 'F.PM3',
          modelo: 'Pipeta monocanal Gilson 100-1000 µl',
        },
        {
          id: 'pip12',
          zona: 'Lab 8- F.CFL1',
          codigo: 'F.PM4',
          modelo: 'Pipeta monocanal Gilson 20-200 µl',
        },
      ],
      reactivos: [
        {
          id: 'reac16',
          nombre: 'Buffer de lisis',
          volumen: 180,
          lote: '',
        },
        {
          id: 'reac17',
          nombre: 'Proteinasa K',
          volumen: 20,
          lote: '',
        },
        {
          id: 'reac18',
          nombre: 'Buffer de lavado 1',
          volumen: 500,
          lote: '',
        },

        {
          id: 'reac19',
          nombre: 'Buffer de lavado 2',
          volumen: 500,
          lote: '',
        },
        {
          id: 'reac20',
          nombre: 'Buffer de elución',
          volumen: 100,
          lote: '',
        },
      ],
    },
    muestras: [],
    fecha: '2025-01-20',
    tecnico: {
      id: 'user4',
      nombre: 'Ana Martínez',
      email: '',
      rol: 'Técnico',
      fechaCreacion: '2024-12-20',
    },
    estado: 'Pendiente',
  },
];
