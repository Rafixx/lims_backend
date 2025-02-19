//src/data/types.ts
export interface Producto {
  id: string;
  nombre: string;
  tecnicas: string[];
}

export interface Tecnica {
  id: string;
  nombre: string;
  productoId: string;
  maquinaId: string | null;
  parametros: any;
}

export interface Resultado {
  id: string;
  valor: string | number;
  unidad: string | null;
  fechaResultado: string;
}

export interface TecnicaMuestra {
  tecnicaId: string;
  resultados: Resultado[];
}

export interface ProductoMuestra {
  productoId: string;
  tecnicas: TecnicaMuestra[];
}

export interface Muestra {
  id: string;
  identificacionExterna: string;
  codigoInterno: string;
  fechaIngreso: string;
  estado: string;
  ubicacion: string;
  productos: ProductoMuestra[];
}

export interface Placa {
  id: string;
  codigoPlaca: string;
  estado: string;
  numeroMuestras: number;
  muestras: { id: string; posicion: string }[];
}

export interface Maquina {
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
