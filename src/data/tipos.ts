//src/data/types.ts
export interface Estudio {
  id: string;
  nombre: string;
  estado: string;
  procesos: Proceso[];
}

export interface Proceso {
  id: string;
  nombre: string;
  productoId: string;
  aparatoId: string | null;
  parametros: any;
  resultados: TipoResultado[];
}

export interface Resultado {
  id: string;
  valor: string | number;
  unidad: string | null;
  fechaResultado: string;
}

export interface ProcesoMuestra {
  procesoId: string;
  nombre: string;
  estado: string;
  resultados: Resultado[];
}

export interface EstudioMuestra {
  estudioId: string;
  nombre: string;
  estado: string;
  procesos: ProcesoMuestra[];
}

export interface Muestra {
  id: string;
  idSolicitud: string;
  identificacionExterna: string;
  codigoInterno: string;
  fechaIngreso: string;
  estado: string;
  ubicacion: string;
  estudios: EstudioMuestra[];
}
export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  FINALIZADA = 'finalizada',
}

export interface Solicitud {
  id: string;
  fechaSolicitud: string;
  solicitante: string;
  estado: string;
  muestras: Muestra[];
}

export interface Placa {
  id: string;
  codigoPlaca: string;
  estado: string;
  numeroMuestras: number;
  muestras: { id: string; posicion: string }[];
}

export interface Aparato {
  id: string;
  nombre: string;
  tipo: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  fechaCreacion: string;
}

export interface Perfil {
  rol: string;
  permisos: string[];
}

export interface TipoResultado {
  id: string;
  nombre: string;
  tipo: string;
  // tipo: TipoResultadoEnum;
  unidad: string | null;
  decimales: number | null;
  min: number | null;
  max: number | null;
}

export enum TipoResultadoEnum {
  NUMERO = 'numero',
  TEXTO = 'texto',
  BOOLEANO = 'booleano',
}
