import { Usuario } from '../../models/Usuario';
import { Solicitud } from '../../models/Solicitud';
import { Muestra } from '../../models/Muestra';
import { Rol } from '../../models/Rol';
import { Tecnica } from '../../models/Tecnica';
import { DimCliente } from '../../models/DimCliente';
import { DimPrueba } from '../../models/DimPrueba';

export const createMockUsuario = (overrides: Partial<Usuario> = {}): Usuario =>
  ({
    id_usuario: 1,
    nombre: 'Mock User',
    username: 'mockuser',
    email: 'mock@example.com',
    passwordhash: 'mockhash',
    id_rol: 1,
    created_by: 1,
    updated_by: 1,
    update_dt: new Date(),
    ...overrides,
  }) as Usuario;

export const createMockSolicitud = (
  overrides: Partial<Solicitud> = {}
): Solicitud =>
  ({
    id_solicitud: 1,
    num_solicitud: 'REQ-001',
    id_cliente: 1,
    f_creacion: new Date(),
    f_entrada: new Date(),
    estado_solicitud: 'EN_PROCESO',
    update_dt: new Date(),
    created_by: 1,
    updated_by: 1,
    ...overrides,
  }) as Solicitud;

export const createMockMuestra = (overrides: Partial<Muestra> = {}): Muestra =>
  ({
    id_muestra: 1,
    id_prueba: 1,
    id_solicitud: 1,
    codigo_epi: 'M-001',
    id_tipo_muestra: 1,
    estado_muestra: 'CREADA',
    f_recepcion: new Date(),
    update_dt: new Date(),
    ...overrides,
  }) as Muestra;

export const createMockRol = (overrides: Partial<Rol> = {}): Rol =>
  ({
    id_rol: 1,
    name: 'admin',
    management_users: true,
    read_only: false,
    export: true,
    update_dt: new Date(),
    ...overrides,
  }) as Rol;

export const createMockTecnica = (overrides: Partial<Tecnica> = {}): Tecnica =>
  ({
    id_tecnica: 1,
    id_muestra: 1,
    id_tecnica_proc: 1,
    id_tecnico_resp: 1,
    fecha_inicio_tec: new Date(),
    estado: 'EnProceso',
    fecha_estado: new Date(),
    comentarios: 'mock comentario',
    update_dt: new Date(),
    ...overrides,
  }) as Tecnica;

export const createMockCiente = (
  overrides: Partial<DimCliente> = {}
): DimCliente =>
  ({
    id: 1,
    nombre: 'Mock Cliente',
    razon_social: 'Mock Razon Social',
    nif: '12345678A',
    direccion: 'Mock Direccion',
    activo: true,
    created_by: 1,
    updated_dt: new Date(),
    delete_dt: null,
    ...overrides,
  }) as DimCliente;

export const createMockPrueba = (
  overrides: Partial<DimPrueba> = {}
): DimPrueba =>
  ({
    id: 1,
    cod_prueba: 'Cod Prueba',
    prueba: 'Mock Prueba',
    activa: true,
    created_by: 1,
    updated_dt: new Date(),
    ...overrides,
  }) as DimPrueba;
